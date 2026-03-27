# ADR-002: Routing, CORS y Variables de Entorno en Producción

- **Estado**: Aprobado
- **Fecha**: 2026-03-27
- **Deciders**: Facundo (Dev), Alex (Arch)

---

## Contexto

En producción toda la infraestructura corre en un único VPS con nginx como único
punto de entrada público. Hay tres servicios internos:

| Servicio | Puerto interno | Descripción |
|---|---|---|
| Next.js | `127.0.0.1:3000` | Frontend SSR |
| FastAPI (uvicorn) | `127.0.0.1:8000` | API REST |
| Nginx | `:80` / `:443` | Reverse proxy público |

**Dominios:**
- Frontend: `https://alexis.iwebtecnology.com`
- API pública: `https://alexis.iwebtecnology.com/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Alexis/api`
- Imágenes: `https://alexis.iwebtecnology.com/media/images/`

---

## Decisión

### Routing

Nginx mapea el path ofuscado del API al prefijo interno `/api/v1/`:

```
Público:  /MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Alexis/api/auth/login
Interno:  http://127.0.0.1:8000/api/v1/auth/login
```

El frontend en producción setea:
```
NEXT_PUBLIC_API_URL=https://alexis.iwebtecnology.com/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Alexis/api
```

El `fetchApi` de `lib/api.ts` ya concatena el endpoint (ej: `/auth/login`) al final,
por lo que no requiere cambios en el código.

### CORS

FastAPI debe aceptar requests del dominio de producción. El origen en CORS es la URL del
**frontend** (lo que el browser manda en `Origin:`), no la URL del API:

```python
# backend/app/main.py
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

```env
# backend/.env (producción)
ALLOWED_ORIGINS=https://alexis.iwebtecnology.com
```

---

## Configuración Nginx Completa

Guardar en `/etc/nginx/sites-available/alexisevt` y hacer symlink a `sites-enabled/`.
**Nota:** el bloque SSL lo completás vos con `certbot --nginx`.

```nginx
# /etc/nginx/sites-available/alexisevt

# Redirect HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name alexis.iwebtecnology.com;

    # Certbot challenge (necesario para obtener el certificado)
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name alexis.iwebtecnology.com;

    # ─── SSL (certbot lo completa automáticamente) ────────────────────────────
    # ssl_certificate     /etc/letsencrypt/live/alexis.iwebtecnology.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/alexis.iwebtecnology.com/privkey.pem;
    # include             /etc/letsencrypt/options-ssl-nginx.conf;
    # ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # ─── Seguridad headers ────────────────────────────────────────────────────
    add_header X-Frame-Options           "SAMEORIGIN"   always;
    add_header X-Content-Type-Options    "nosniff"      always;
    add_header X-XSS-Protection          "1; mode=block" always;
    add_header Referrer-Policy           "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # ─── Imágenes (nginx sirve directo, sin tocar Python) ─────────────────────
    location /media/images/ {
        alias /home/iweb/alexisevt/data/images/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;

        # Seguridad: solo imágenes
        location ~* \.(jpg|jpeg|png|webp|gif|svg)$ {
            # permitido
        }
        location / {
            return 403;
        }
    }

    # ─── API (path ofuscado → FastAPI interno) ────────────────────────────────
    location /MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Alexis/api/ {
        # Strips el prefijo ofuscado y reescribe a /api/v1/
        rewrite ^/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Alexis/api/(.*)$ /api/v1/$1 break;
        proxy_pass         http://127.0.0.1:8000;

        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        # Subida de imágenes: aumentar límite
        client_max_body_size 15M;

        # Timeouts
        proxy_connect_timeout 30s;
        proxy_read_timeout    60s;
        proxy_send_timeout    60s;
    }

    # ─── Frontend Next.js ─────────────────────────────────────────────────────
    location / {
        proxy_pass         http://127.0.0.1:3000;

        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        # WebSocket support (Next.js HMR en dev, no necesario en prod pero no molesta)
        proxy_http_version 1.1;
        proxy_set_header   Upgrade    $http_upgrade;
        proxy_set_header   Connection "upgrade";

        proxy_read_timeout 60s;
    }

    # ─── Assets estáticos Next.js (caché agresivo) ────────────────────────────
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000/_next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # ─── Bloquear acceso directo al backend ───────────────────────────────────
    # El puerto 8000 no debe ser accesible desde fuera (firewall: ufw deny 8000)
    # Esta regla es extra por si acaso
    location /api/ {
        return 404;
    }

    # ─── Logs ─────────────────────────────────────────────────────────────────
    access_log /var/log/nginx/alexisevt.access.log;
    error_log  /var/log/nginx/alexisevt.error.log warn;
}
```

**Activar la config:**
```bash
ln -s /etc/nginx/sites-available/alexisevt /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Obtener certificado SSL
certbot --nginx -d alexis.iwebtecnology.com
```

---

## Variables de Entorno Completas

### `backend/.env` (producción)
```env
# Base de datos
DATABASE_URL=mysql+pymysql://alexisevt_user:PASSWORD@localhost/alexisevt_db

# JWT — CAMBIAR por un valor aleatorio de 64 chars
SECRET_KEY=REEMPLAZAR_CON_SECRETO_SEGURO_64_CHARS
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS — solo el dominio del frontend
ALLOWED_ORIGINS=https://alexis.iwebtecnology.com

# Imágenes
IMAGES_BASE_URL=https://alexis.iwebtecnology.com/media/images
UPLOAD_DIR=/home/iweb/alexisevt/data/images
SERVE_STATIC_LOCALLY=false

# SMTP (si se usa)
SMTP_HOST=smtp.tuproveedor.com
SMTP_PORT=587
SMTP_USER=noreply@alexisevt.com
SMTP_PASSWORD=TU_PASSWORD_SMTP
SMTP_FROM=noreply@alexisevt.com
SMTP_TLS=true
```

### `frontend/.env.production`
```env
NEXT_PUBLIC_API_URL=https://alexis.iwebtecnology.com/MdpuF8KsXiRArNIHtI6pXO2XyLSJMTQ8_Alexis/api
```

---

## Firewall (ufw)

```bash
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP (redirect)
ufw allow 443/tcp    # HTTPS
ufw deny 3000/tcp    # Next.js: solo acceso via nginx
ufw deny 8000/tcp    # FastAPI: solo acceso via nginx
ufw enable
```

---

## Alternativas Descartadas

| Opción | Razón de descarte |
|---|---|
| Exponer el API en `/api/` sin ofuscar | Path predecible = superficie de ataque mayor |
| Usar subdomain `api.alexis.iwebtecnology.com` | Requiere segundo registro DNS y certificado wildcard |
| Proxy en Next.js `rewrites` | Añade latencia (Next → nginx → uvicorn) y complejidad |

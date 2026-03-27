# ADR-001: Almacenamiento de Imágenes en VPS con Nginx

- **Estado**: Aprobado
- **Fecha**: 2026-03-27
- **Deciders**: Facundo (Dev), Alex (Arch)

---

## Contexto

En desarrollo, el backend FastAPI sirve las imágenes como archivos estáticos mediante
`StaticFiles` montado en `/uploads/images`. El endpoint de upload devuelve URLs relativas
como `/uploads/images/{filename}`.

En producción esto es ineficiente: FastAPI (Python/async) no debería servir assets
estáticos — nginx lo hace 10x más rápido sin tocar el worker pool de uvicorn.

**Rutas en el VPS:**
- Proyecto: `/home/iweb/alexisevt/project`
- Imágenes: `/home/iweb/alexisevt/data/images`

---

## Decisión

**Nginx sirve las imágenes directamente desde el filesystem. FastAPI solo escribe.**

1. El endpoint `/api/v1/uploads/image` sigue guardando el archivo en disco en
   `/home/iweb/alexisevt/data/images/`
2. La URL devuelta por el endpoint cambia de relativa a **absoluta y configurable**
   via env var `IMAGES_BASE_URL`
3. La ruta pública de imágenes será: `https://alexis.iwebtecnology.com/media/images/{filename}`
4. Se elimina el `StaticFiles` mount de `main.py` en producción
5. En la base de datos se almacena la URL completa

---

## Consecuencias

### Cambios en el Backend

#### `backend/app/core/config.py` — agregar variable:
```python
IMAGES_BASE_URL: str = "http://localhost:8000/uploads/images"
```

#### `backend/app/api/routers/uploads.py` — usar la variable:
```python
# Reemplazar la línea de return con:
return JSONResponse({"url": f"{settings.IMAGES_BASE_URL}/{filename}"})
```

#### `backend/app/main.py` — hacer el StaticFiles condicional:
```python
# Solo en dev se sirven desde FastAPI. En prod nginx lo hace.
import os
if os.getenv("SERVE_STATIC_LOCALLY", "true").lower() == "true":
    IMAGES_DIR = os.path.join(os.path.dirname(__file__), "../../data/images")
    os.makedirs(IMAGES_DIR, exist_ok=True)
    app.mount("/uploads/images", StaticFiles(directory=IMAGES_DIR), name="images")
```

#### `backend/.env` (producción):
```env
IMAGES_BASE_URL=https://alexis.iwebtecnology.com/media/images
SERVE_STATIC_LOCALLY=false
UPLOAD_DIR=/home/iweb/alexisevt/data/images
```

### Cambios en el Upload Router

El `UPLOAD_DIR` también debe ser configurable para que en producción apunte al
path absoluto del VPS, no a un path relativo al código:

```python
# backend/app/api/routers/uploads.py
UPLOAD_DIR = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(__file__), "../../../../data/images"))
```

### Config Nginx (ver ADR-002 para el bloque completo)

```nginx
# Imágenes servidas directamente por nginx
location /media/images/ {
    alias /home/iweb/alexisevt/data/images/;
    expires 30d;
    add_header Cache-Control "public, immutable";
    access_log off;
}
```

### Permisos en el VPS

```bash
# Crear directorio con permisos correctos
mkdir -p /home/iweb/alexisevt/data/images
chown -R www-data:www-data /home/iweb/alexisevt/data/
chmod -R 755 /home/iweb/alexisevt/data/
# El usuario que corre uvicorn necesita write en /data/images
usermod -aG www-data <usuario_uvicorn>
```

---

## Alternativas Descartadas

| Opción | Razón de descarte |
|---|---|
| Mantener StaticFiles en FastAPI | Bloquea workers async para servir bytes, no escala |
| Subir a S3/Cloudflare R2 | Costo y complejidad innecesarios para este volumen de tráfico |
| Usar un CDN externo | Overkill; nginx con `Cache-Control: immutable` es suficiente |

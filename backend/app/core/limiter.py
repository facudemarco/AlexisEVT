from slowapi import Limiter
from fastapi import Request


def _get_client_ip(request: Request) -> str:
    """
    Resuelve la IP real del cliente.

    En producción, nginx setea X-Real-IP = $remote_addr (la IP que llegó
    al proxy, no spoofeable por el cliente). En dev/tests, cae a
    request.client.host directamente.
    """
    return (
        request.headers.get("X-Real-IP")
        or (request.client.host if request.client else "127.0.0.1")
    )


# Singleton: se importa en main.py (registro en app.state) y en los routers
# que necesiten aplicar límites.
# Storage en memoria (MemoryStorage por defecto) — suficiente para un VPS
# de un solo proceso. Si se escala a múltiples workers, migrar a RedisStorage.
limiter = Limiter(key_func=_get_client_ip)

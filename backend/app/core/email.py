import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


def send_email(to: str, subject: str, body_html: str) -> None:
    """Envía un email HTML. Si SMTP no está configurado, loguea y no falla."""
    if not settings.SMTP_HOST:
        print(f"[email] SMTP no configurado. Email no enviado a {to}: {subject}")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.SMTP_FROM
        msg["To"] = to
        msg.attach(MIMEText(body_html, "html"))
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USER:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM, [to], msg.as_string())
        print(f"[email] Enviado a {to}: {subject}")
    except Exception as e:
        print(f"[email] Error: {e}")

import logging
from typing import Literal
from urllib.parse import urlencode

from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import SecretStr

from app.core.config import settings

logger = logging.getLogger(__name__)

Locale = Literal["de", "en"]


_connection_config = ConnectionConfig(
    MAIL_USERNAME=settings.SMTP_USER,
    MAIL_PASSWORD=SecretStr(settings.SMTP_PASSWORD),
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_PORT=settings.SMTP_PORT,
    MAIL_SERVER=settings.SMTP_HOST,
    MAIL_STARTTLS=settings.SMTP_STARTTLS,
    MAIL_SSL_TLS=settings.SMTP_SSL,
    USE_CREDENTIALS=bool(settings.SMTP_USER),
    VALIDATE_CERTS=settings.SMTP_SSL or settings.SMTP_STARTTLS,
)

_mailer = FastMail(_connection_config)


_VERIFY_SUBJECT = {
    "de": "Bestätige deine Study Buddy E-Mail",
    "en": "Confirm your Study Buddy email",
}


def _verify_email_html(setup_url: str, locale: Locale) -> str:
    if locale == "de":
        return f"""\
<!doctype html>
<html><body style="font-family: system-ui, sans-serif; color: #111;">
  <h2>Willkommen bei Study Buddy</h2>
  <p>Klicke auf den folgenden Link, um dein Konto einzurichten:</p>
  <p><a href="{setup_url}" style="background:#0a0a0a;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px;">Konto einrichten</a></p>
  <p style="font-size:12px;color:#666;">Wenn der Button nicht funktioniert, kopiere diese URL in deinen Browser:<br>{setup_url}</p>
  <p style="font-size:12px;color:#666;">Der Link ist 24 Stunden gültig.</p>
</body></html>
"""
    return f"""\
<!doctype html>
<html><body style="font-family: system-ui, sans-serif; color: #111;">
  <h2>Welcome to Study Buddy</h2>
  <p>Click the link below to finish setting up your account:</p>
  <p><a href="{setup_url}" style="background:#0a0a0a;color:#fff;padding:10px 16px;text-decoration:none;border-radius:6px;">Set up account</a></p>
  <p style="font-size:12px;color:#666;">If the button doesn't work, copy this URL into your browser:<br>{setup_url}</p>
  <p style="font-size:12px;color:#666;">The link is valid for 24 hours.</p>
</body></html>
"""


async def send_verify_email(to_email: str, verify_token: str, locale: Locale = "en") -> None:
    """Send the account-setup link to the given address. Failures are logged but
    not raised — the user-facing endpoint must not leak SMTP errors."""
    query = urlencode({"token": verify_token})
    setup_url = f"{settings.FRONTEND_BASE_URL}/setup?{query}"

    message = MessageSchema(
        subject=_VERIFY_SUBJECT[locale],
        recipients=[to_email],
        body=_verify_email_html(setup_url, locale),
        subtype=MessageType.html,
    )

    try:
        await _mailer.send_message(message)
    except Exception:
        logger.exception("Failed to send verify email to %s", to_email)

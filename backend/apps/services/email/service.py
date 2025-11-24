from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from apps.core.config import settings
from pathlib import Path

# Configure FastMail
conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME or "",
    MAIL_PASSWORD=settings.MAIL_PASSWORD or "",
    MAIL_FROM=settings.MAIL_FROM or "noreply@example.com",
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER or "smtp.gmail.com",
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_welcome_email(email: str, name: str, password: str, login_url: str):
    """
    Send a welcome email to a new dealer with their credentials.
    """
    if not settings.MAIL_USERNAME or not settings.MAIL_PASSWORD:
        print(f"⚠️ SMTP not configured. Mocking email to {email}")
        print(f"   Password: {password}")
        return

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to AutoServe360! 🚀</h2>
        <p>Hello {name},</p>
        <p>Your dealer account has been successfully created.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Login URL:</strong> <a href="{login_url}">{login_url}</a></p>
            <p><strong>Username:</strong> {email}</p>
            <p><strong>Password:</strong> {password}</p>
        </div>
        
        <p>Please login and change your password immediately.</p>
        <p>Best regards,<br>The AutoServe360 Team</p>
    </div>
    """

    message = MessageSchema(
        subject="Welcome to AutoServe360 - Your Credentials",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        print(f"✅ Welcome email sent to {email}")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.utils.logger import logger

MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', MAIL_USERNAME)

def send_otp_email(to_email: str, otp_code: str, purpose: str = "Password Reset") -> bool:
    """
    Sends a 6-digit OTP to the user's email address via Gmail SMTP.
    Returns True if sent successfully, or False if SMTP is unconfigured/fails (failsafe logging).
    """
    subject = f"noteX AI — Your {purpose} Verification Code: {otp_code}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 20px; }}
        .card {{ max-width: 480px; margin: 0 auto; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 16px; padding: 30px; box-shadow: 0 10px 25px rgba(15,23,42,0.08); }}
        .brand {{ text-align: center; font-size: 28px; font-weight: 800; color: #0EA5E9; margin-bottom: 10px; }}
        .otp-box {{ background: #F0F9FF; border: 2px dashed #0EA5E9; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0EA5E9; text-align: center; padding: 15px; margin: 20px 0; }}
        .footer {{ font-size: 12px; color: #64748B; text-align: center; margin-top: 20px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="brand">𝝌 noteX AI</div>
        <h2 style="text-align:center; font-size: 20px; margin-bottom: 10px;">{purpose} Code</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">You requested a verification code for your noteX AI account. Use the 6-digit OTP below to proceed:</p>
        <div class="otp-box">{otp_code}</div>
        <p style="color: #64748B; font-size: 13px;">This code will expire in <strong>10 minutes</strong>. If you did not request this code, please ignore this email.</p>
        <div class="footer">&copy; noteX AI Study Platform — Empowering Intelligent Education</div>
      </div>
    </body>
    </html>
    """

    if not MAIL_USERNAME or not MAIL_PASSWORD:
        logger.warning(f"SMTP Credentials not configured in .env. Failsafe OTP for {to_email}: {otp_code}")
        return False

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = MAIL_DEFAULT_SENDER or MAIL_USERNAME
        msg['To'] = to_email

        part = MIMEText(html_content, 'html')
        msg.attach(part)

        server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.sendmail(msg['From'], [to_email], msg.as_string())
        server.quit()

        logger.info(f"OTP Email successfully sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send OTP email to {to_email}: {str(e)}")
        return False

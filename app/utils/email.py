import os
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.utils.logger import logger

MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
MAIL_USERNAME = os.getenv('MAIL_USERNAME', '')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', '')
MAIL_DEFAULT_SENDER = os.getenv('MAIL_DEFAULT_SENDER', MAIL_USERNAME)

def send_email_with_retry(to_email: str, subject: str, html_content: str, max_retries: int = 3) -> bool:
    """
    Core function to send an email via Gmail SMTP with robust retry logic.
    """
    if not MAIL_USERNAME or not MAIL_PASSWORD:
        logger.warning(f"SMTP Credentials not configured in .env. Failsafe mode for {to_email}. Subject: {subject}")
        return False

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = MAIL_DEFAULT_SENDER or MAIL_USERNAME
    msg['To'] = to_email

    part = MIMEText(html_content, 'html')
    msg.attach(part)

    for attempt in range(1, max_retries + 1):
        try:
            server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT, timeout=10)
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            server.sendmail(msg['From'], [to_email], msg.as_string())
            server.quit()
            logger.info(f"Email successfully delivered to {to_email} (Subject: {subject})")
            return True
        except Exception as e:
            logger.error(f"Attempt {attempt}/{max_retries} failed to send email to {to_email}: {str(e)}")
            if attempt < max_retries:
                time.sleep(2 ** attempt)  # Exponential backoff

    logger.error(f"All {max_retries} attempts failed to deliver email to {to_email}")
    return False

def get_base_html(title: str, content: str) -> str:
    """
    Returns the base responsive HTML email template with noteX AI branding.
    """
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8FAFC; color: #0F172A; margin: 0; padding: 20px; -webkit-font-smoothing: antialiased; }}
        .card {{ max-width: 500px; margin: 0 auto; background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 16px; padding: 40px 30px; box-shadow: 0 10px 25px rgba(15,23,42,0.08); }}
        .brand {{ text-align: center; font-size: 32px; font-weight: 800; color: #0EA5E9; margin-bottom: 5px; }}
        .tagline {{ text-align: center; font-size: 13px; color: #64748B; margin-bottom: 30px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }}
        h2 {{ text-align: center; font-size: 22px; margin-bottom: 20px; color: #1E293B; }}
        p {{ color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }}
        .otp-box {{ background: #F0F9FF; border: 2px dashed #0EA5E9; border-radius: 12px; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0EA5E9; text-align: center; padding: 20px; margin: 30px 0; }}
        .btn {{ display: inline-block; background-color: #0EA5E9; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-align: center; margin: 20px 0; }}
        .footer {{ font-size: 13px; color: #94A3B8; text-align: center; margin-top: 40px; border-top: 1px solid #E2E8F0; padding-top: 20px; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="brand">𝝌 noteX AI</div>
        <div class="tagline">Intelligent Education Platform</div>
        <h2>{title}</h2>
        {content}
        <div class="footer">&copy; noteX AI Study Platform — Empowering Students Worldwide</div>
      </div>
    </body>
    </html>
    """

def send_otp_email(to_email: str, otp_code: str, purpose: str = "Password Reset") -> bool:
    """
    Sends a 6-digit OTP for Email Verification or Password Reset.
    """
    subject = f"noteX AI — Your {purpose} Verification Code: {otp_code}"
    
    content = f"""
    <p>You requested a verification code for your noteX AI account. Use the 6-digit OTP below to proceed with your {purpose.lower()}:</p>
    <div class="otp-box">{otp_code}</div>
    <p style="font-size: 13px; color: #64748B; text-align: center;">This code will expire in <strong>10 minutes</strong>. If you did not request this code, please ignore this email securely.</p>
    """
    
    html_template = get_base_html(title=f"{purpose} Code", content=content)
    return send_email_with_retry(to_email, subject, html_template)

def send_welcome_email(to_email: str, student_name: str) -> bool:
    """
    Sends a beautifully formatted welcome email to newly verified students.
    """
    subject = f"Welcome to noteX AI, {student_name}! 🚀"
    
    content = f"""
    <p>Hi <strong>{student_name}</strong>,</p>
    <p>We're thrilled to welcome you to <strong>noteX AI</strong>! Your account has been successfully verified, and you're now ready to supercharge your study sessions.</p>
    <p>With noteX AI, you can:</p>
    <ul style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
        <li>Chat intelligently with your PDF textbooks.</li>
        <li>Generate instant study notes, flashcards, and quizzes.</li>
        <li>Track your predicted scores with ML analytics.</li>
    </ul>
    <div style="text-align: center;">
        <a href="http://localhost:5000/#dashboard" class="btn">Go to your Dashboard</a>
    </div>
    <p>Happy studying,<br><strong>The noteX AI Team</strong></p>
    """
    
    html_template = get_base_html(title="Account Verified Successfully", content=content)
    return send_email_with_retry(to_email, subject, html_template)

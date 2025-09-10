import secrets
from django.core.mail import send_mail

def generate_otp(self):
    otp = str(secrets.randbelow(10 ** 6)).zfill(6)
    return otp

def send_otp_email(email, otp):
    subject = "Your OTP Code"
    message = f"Your OTP code is: {otp}. It will expire in 5 minutes."
    send_mail(subject, message, None, [email])

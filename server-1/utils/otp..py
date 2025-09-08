import random
from django.core.mail import send_mail

def generate_otp(length=6):
    return str(random.randint(10**(length-1), (10**length)-1))

def send_otp_email(email, otp):
    subject = "Your OTP Code"
    message = f"Your OTP code is: {otp}. It will expire in 5 minutes."
    send_mail(subject, message, None, [email])

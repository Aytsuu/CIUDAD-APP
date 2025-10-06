from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

def send_email(subject, context, recipient_email, from_email=None):
    try:
        html_message = render_to_string("emails/announcement_email.html", context)
        email = EmailMultiAlternatives(
            subject=subject,
            body=html_message,
            from_email=from_email or settings.EMAIL_HOST_USER,  # ✅ fallback here
            to=[recipient_email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()
        print(f"[EMAIL] Sent to {recipient_email} from {from_email or settings.EMAIL_HOST_USER}")
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")

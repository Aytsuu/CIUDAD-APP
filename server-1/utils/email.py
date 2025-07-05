from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings


def send_email(subject, context, recipient_email, template):
    try:
        html_message = render_to_string(f'template/email/{template}', context)
        email = EmailMultiAlternatives(
            subject=subject,
            body=html_message,
            from_email=settings.EMAIL_HOST_USER,
            to=[recipient_email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()
        print(f"[EMAIL] Sent to {recipient_email}")
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
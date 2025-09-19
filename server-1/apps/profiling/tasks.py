from django.utils import timezone
from datetime import timedelta
from .models import RequestRegistration
from decouple import config
import requests

def update_expired_requests():
    print(f"[{timezone.now()}] Checking expired requests...") 
    now = timezone.now()
    RequestRegistration.objects.filter(
        req_date__range=(
            now - timedelta(days=7, minutes=15),  # 7 days 15 mins ago
            now - timedelta(days=7)               # 7 days ago
        ),
        req_is_archive=False
    ).update(req_is_archive=True)

# Class that holds double query functions
class DoubleQueries:
    def __init__(self):
        self.client = config("CLIENT", default="http://127.0.0.1:8001")
    
    def personal(self, data):
        response = requests.post(
            f"{self.client}/health-profiling/personal/create/",
            json=data
        )
        return response
    
    def address(self, data):
        response = requests.post(
            f"{self.client}/health-profiling/address/create/",
            json=data
        )
        return response
    
    def complete_profile(self, data):
        response = requests.post(
            f"{self.client}/health-profiling/complete/registration/",
            json=data
        )
        return response

    def family(self, data):
        response = requests.post(
            f"{self.client}/health-profiling/family/create/",
            json=data
        )
        return response

    def family_composition(self, data):
        response = requests.post(
            f"{self.client}/health-profiling/family/composition/bulk/create/",
            json=data
        )
        return response
    
    def household(self, data):
        response = requests.post(
            f"{self.client}/health-profiling/household/create/",
            json=data
        )
        return response
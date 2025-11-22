from decouple import config
import requests

# Class that holds double query functions
class PostQueries:
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
    
    def personal_address(self, data):
        response = requests.post(
            f"{self.client}/health-profiling/per_address/create/",
            json=data
        )
        return response
    
    def resident_personal(self, data):
        response = requests.post(
            f"{self.client}/health-profiling/resident/create/combined",
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
    
    def sitio(self, data):
        response = requests.post(
            f"{self.client}/health-profiling/sitio/create/",
            json=data
        )
        return response
    
class DeleteQueries:
    def __init__(self):
        self.client = config("CLIENT", default="http://127.0.0.1:8001")

    def sitio(self, sitio_id):
        response = requests.delete(
            f"{self.client}/health-profiling/sitio/{sitio_id}/delete/"
        )
        return response

class UpdateQueries:
    def __init__(self):
        self.client = config("CLIENT", default="http://127.0.0.1:8001")

    def personal(self, data, per_id):
        response = requests.patch(
            f"{self.client}/health-profiling/personal/update/{per_id}/",
            json=data
        )
        return response
        
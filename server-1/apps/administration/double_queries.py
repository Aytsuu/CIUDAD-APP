from decouple import config
import requests

class PostQueries:
  def __init__(self):
    self.client = config("CLIENT", default="http://127.0.0.1:8001")
  
  def staff(self, data):
    response = requests.post(
      f"{self.client}/administration/staff/",
      json=data
    )
    return response
  
  def position(self, data):
    response = requests.post(
      f"{self.client}/administration/position/",
      json=data
    )
    return response
  
  def assignment(self, data):
    response = requests.post(
      f"{self.client}/administration/assignment/create/",
      json=data
    )
    return response
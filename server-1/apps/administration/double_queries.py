from decouple import config
import requests

# ADD QUERIES
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
  
# UPDATE QUERIES
class UpdateQueries:
  def __init__(self):
    self.client = config("CLIENT", default="http://127.0.0.1:8001")
  
  def staff(self, data, staff_id):
    response = requests.put(
      f"{self.client}/administration/staff/{staff_id}/update/",
      json=data
    )
    return response
  
  def position(self, data, pos_id):
    response = requests.post(
      f"{self.client}/administration/position/update/{pos_id}/",
      json=data
    )
    return response
  
  def group_position(self, data):
    response = requests.patch(''
      f"{self.client}/administration/position/update/group/",
      json=data
    )

    return response

  
# DELETE QUERIES
class DeleteQueries:
  def __init__(self):
    self.client = config("CLIENT", default="http://127.0.0.1:8001")
  
  def staff(self, staff_id):
    response = requests.delete(
      f"{self.client}/administration/staff/{staff_id}/delete/"
    )
    return response
  
  def assignment(self, feat_id, pos_id):
    response = requests.delete(
      f"{self.client}/administration/assignment/delete/{feat_id}/{pos_id}/"
    )
    return response

  def position(self, pos_id):
    response = requests.delete(
      f"{self.client}/administration/position/delete/{pos_id}/"
    )
    return response
from .models import Family, ResidentProfile, Household, Business, BusinessRespondent
from datetime import datetime

def generate_resident_no():
  next_val = ResidentProfile.objects.count() + 1
  date = datetime.now()
  year = str(date.year - 2000)
  month = str(date.month).zfill(2)
  day = str(date.day).zfill(2)
  resident_id = f"{year}{month}{day}{next_val}"
  
  return resident_id

def generate_busrespondent_no():
  next_val = BusinessRespondent.objects.count() + 1
  date = datetime.now()
  year = str(date.year - 2000)
  month = str(date.month).zfill(2)
  day = str(date.day).zfill(2)

  resident_id = f"BR-{year}{month}{day}-{next_val}"
  
  return resident_id

def generate_business_no():
  next_val = Business.objects.count() + 1
  date = datetime.now()
  year = str(date.year - 2000)
  month = str(date.month).zfill(2)
  return f"BUS-{year}{month}-{next_val}"

def generate_hh_no():
  next_val = Household.objects.count() + 1
  date = datetime.now()
  year = str(date.year - 2000)
  month = str(date.month).zfill(2)
  house_no = f"HH-{year}{month}-{next_val}"
  return house_no

def generate_fam_no(building_type):
  type = {'owner' : 'O', 'renter' : 'R', 'sharer' : 'S'}
  next_val = Family.objects.count() + 1
  date = datetime.now()
  year = str(date.year - 2000)
  month = str(date.month).zfill(2)
  day = str(date.day).zfill(2)
  
  family_id = f"{year}{month}{day}{next_val}-{type[building_type.lower()]}"
  
  return family_id
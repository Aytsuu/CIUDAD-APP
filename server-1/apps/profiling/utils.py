from .models import Family, ResidentProfile, Household
from datetime import datetime

def generate_resident_no():
  next_val = ResidentProfile.objects.count() + 1
  date = datetime.now()
  year = str(date.year - 2000)
  month = str(date.month).zfill(2)
  day = str(date.day).zfill(2)

  formatted = f"{next_val:05d}"
  resident_id = f"{formatted}{year}{month}{day}"
  
  return resident_id

def generate_hh_no():
  next_val = Household.objects.count() + 1
  house_no = f"HH-{next_val:05d}"
  return house_no

def generate_fam_no(building_type):
  type = {'owner' : 'O', 'renter' : 'R', 'sharer' : 'S'}
  next_val = Family.objects.count() + 1
  date = datetime.now()
  year = str(date.year - 2000)
  month = str(date.month).zfill(2)
  day = str(date.day).zfill(2)
  
  formatted = f"{next_val:04d}"
  family_id = f"{year}{month}{day}00{formatted}-{type[building_type]}"
  
  return family_id
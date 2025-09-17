from django.test import TestCase

import requests

response = requests.post(
  "http://127.0.0.1:8001/health-profiling/personal/create/",
  json={
    "per_lname": "TESTER",
    "per_fname": "TESTER",
    "per_dob": "2003-02-03",
    "per_sex": "MALE",
    "per_status": "MARRIED",
    "per_religion" : "ROMAN CATHOLIC",
    "per_contact": "09262355926"
  }
)
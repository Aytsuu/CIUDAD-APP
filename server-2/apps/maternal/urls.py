from django.urls import path
from .views import *

urlpatterns=[
    path("prenatal/", PrenatalFormView.as_view(), name="prenatallist"),
]
from django.urls import path
from .views import *

urlpatterns=[
    path("prenatal_record/", PrenatalFormView.as_view(), name="prenatallist"),
    path("obstretical_history/", )
]
from django.urls import path
from .views import *


urlpatterns=[
    path("event/", View.as_view(), name="council-event"),
]
from django.urls import path
from . import views

urlpatterns = [
    path("personal/", views.PersonalView.as_view(), name="personal-details-list")
]
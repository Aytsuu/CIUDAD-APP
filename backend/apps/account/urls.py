from django.urls import path
from . import views

urlpatterns = [
    path("account/", views.AccountView.as_view(), name="")
]
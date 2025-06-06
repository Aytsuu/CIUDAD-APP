from django import views
from django.urls import path
from .views import *

urlpatterns = [
    path('details/',AnimalbiteDetailsView.as_view()),
    path('referral/',AnimalbiteReferralView.as_view()),
    path('bite_animal/', AnimalbiteBitingAnimalView.as_view()),
    path('exposure_site/', AnimalbiteExposureSiteView.as_view()),
    
]
from django.urls import path
from .views import *

urlpatterns = [
    
    # Personal Urls

    path("personal/", PersonalView.as_view(), name="personal-details-list"),

    # Mother Urls

    path("mother/", MotherView.as_view(), name="mother-details"),

    # Father Urls

    path("father/", FatherView.as_view(), name="father-details"),

    # Dependent Urls

    path("dependent/", DependentView.as_view(), name="dependent-details"),

    # Family Urls

    path("family/", FamilyView.as_view(), name="family-details"),

    # Family Composition Urls

    path("family-composition/", FamilyCompositionView.as_view(), name="family-composition-details"),

    # Sitio Urls

    path("sitio/", SitioView.as_view(), name="sitio-list"),

    # Househould Urls
    
    path("household/", HouseholdView.as_view(), name="household-details"),

    # Building Urls

    path("building/", BuildingView.as_view(), name="building-details"),

    # Registered Urls

    path("registered/", RegisteredView.as_view(), name="registered-details"),

]
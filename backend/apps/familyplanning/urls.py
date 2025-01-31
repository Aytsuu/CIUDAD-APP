from .views import *
from django.urls import path

urlpatterns = [
    path('obstetrical/', ObstetricalView.as_view(), name='obstetrical'),
    path('risk_sti/', RiskStiView.as_view(), name='RiskSti')
]
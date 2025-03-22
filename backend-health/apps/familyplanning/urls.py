<<<<<<< HEAD
from .views import *
from django.urls import path

urlpatterns = [
    path('obstetrical/', ObstetricalView.as_view(), name='obstetrical'),
    path('risk_sti/', RiskStiView.as_view(), name='RiskSti'),
    path('risk_vaw/', RiskVawView.as_view(), name='RiskVaw'),
    path('physical_exam/',PhysicalExamView.as_view(), name="PhysicalExam"),
    path('acknowledgement/',AcknowledgementView.as_view(),name="Acknowledgement")
=======
urlpatterns=[
     path('acknowledgement/', AcknowledgementView.as_view(), name='acknowledgement-list-create'),
>>>>>>> eac5b29bec182701333af109425eb1c2c4d6e7d9
]
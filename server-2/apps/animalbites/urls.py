from django.urls import path
from .views import *

urlpatterns = [
    # path('records/',AnimalbiteRecordsView.as_view()),
    path('details/',AnimalbiteDetailsView.as_view()),
    path('referral/',AnimalbiteReferralView.as_view()),
    path('count/<str:pat_id>/',AnimalBiteReferralCountView.as_view()),
     
]
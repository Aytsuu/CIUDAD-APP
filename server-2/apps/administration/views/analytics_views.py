from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import *

class CardAnalyticsView(APIView):
  def get(self, request, *args, **kwargs):
    total_staff = Staff.objects.count()

    card_data = [
      total_staff
    ]
    
    return Response(card_data)
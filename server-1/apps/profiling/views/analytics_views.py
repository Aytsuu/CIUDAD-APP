from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import *
from ..serializers.request_registration_serializers import RequestTableSerializer
from datetime import date, timedelta

class CardAnalyticsView(APIView):
  def get(self, request, *args, **kwargs):
    total_residents = ResidentProfile.objects.count()
    total_families = Family.objects.count()
    total_households = Household.objects.count()
    total_businesses = Business.objects.count()

    card_data = {
      "residents": total_residents, 
      "families": total_families,
      "households": total_households,
      "businesses": total_businesses
    }

    return Response(card_data)

class SidebarAnalyticsView(APIView):
  def get(self, request, *args, **kwargs):
    today = date.today()
    three_days_ago = today-timedelta(days=3)
    queryset = RequestRegistration.objects.filter(
      req_created_at__date__gte=three_days_ago, 
      req_created_at__date__lte=today
    )
    
    return Response(RequestTableSerializer(queryset, many=True).data)
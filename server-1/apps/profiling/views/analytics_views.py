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

    card_data = [
      total_residents, 
      total_families,
      total_households,
      total_businesses
    ]

    return Response(card_data)

class SidebarAnalyticsView(APIView):
  def get(self, request, *args, **kwargs):
    period = request.query_params.get('period', None)

    if period:
      if period == "today":
        queryset = RequestRegistration.objects.filter(req_date=date.today())
      else:
        today = date.today()
        start_of_week = today-timedelta(days=today.weekday())
        queryset = RequestRegistration.objects.filter(req_date__gte=start_of_week, req_date__lte=today)
    
    return Response(RequestTableSerializer(queryset, many=True).data)
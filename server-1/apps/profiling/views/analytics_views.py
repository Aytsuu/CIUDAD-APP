from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count
from ..models import *
from ..serializers.request_registration_serializers import RequestTableSerializer
from datetime import date, timedelta

class CardAnalyticsView(APIView):
  def get(self, request, *args, **kwargs):
    total_residents = ResidentProfile.objects.count()
    # Only count families that have at least 1 family member
    total_families = Family.objects.annotate(
      members_count=Count('family_compositions')
    ).filter(members_count__gte=1).count()
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
    queryset = RequestRegistration.objects.all().order_by('req_created_at')    
    return Response({
      'count': queryset.count(),
      'data': RequestTableSerializer(queryset[:3], many=True).data
    })
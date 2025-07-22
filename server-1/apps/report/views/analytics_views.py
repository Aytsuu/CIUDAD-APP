from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import *
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from ..serializers.incident_report_serializers import IRTableSerializer

class CardAnalyticsView(APIView):
  def get(self, request, *args, **kwargs):
    total_ir = IncidentReport.objects.count()
    total_ar = AcknowledgementReport.objects.count()
    total_war = WeeklyAccomplishmentReport.objects.count()
    
    card_data = [
      total_ir,
      total_ar,
      total_war
    ]

    return Response(card_data)
  
class SidebarAnalyticsView(APIView):
  def get(self, request, *args, **kwargs):
    period = request.query_params.get('period', None)

    if period:
      if period == "today":
        queryset = IncidentReport.objects.filter(ir_date=date.today()) 
      else:
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())
        queryset = IncidentReport.objects.filter(ir_date__gte=start_of_week, ir_date__lte=today)
    
    return Response(IRTableSerializer(queryset, many=True).data)
  
class ChartAnalyticsView(APIView):
  def get(self, request, *args, **kwargs):
    today = date.today()
    three_months_ago = today - relativedelta(month=3)
    queryset = IncidentReport.objects.filter(
      ir_date__gte=three_months_ago, 
      ir_date__lte=today
    ).values('ir_date')

    formatted_queryset = [
      {
        'date': item.ir_date,
        'report': IncidentReport.objects.filter(ir_date=item.ir_date).count()
      }
      for item in queryset
    ]

    return Response(formatted_queryset)
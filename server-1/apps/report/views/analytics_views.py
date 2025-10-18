from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Count
from ..models import *
from datetime import date, timedelta
from django.db.models.functions import TruncDate
from dateutil.relativedelta import relativedelta
from ..serializers.incident_report_serializers import IRTableSerializer

class CardAnalyticsView(APIView):
    def get(self, request, *args, **kwargs):
        total_ir = IncidentReport.objects.count()
        total_ar = AcknowledgementReport.objects.count()
        total_war = WeeklyAccomplishmentReport.objects.count()
        
        card_data = {
            "incidentReports": total_ir,
            "acknowledgementReports": total_ar,
            "weeklyARs": total_war
        }

        return Response(card_data)
  
class SidebarAnalyticsView(APIView):
    def get(self, request, *args, **kwargs):
        today = date.today()
        three_days_ago = today - timedelta(days=3)
        queryset = IncidentReport.objects.all()
        
        return Response(IRTableSerializer(queryset, many=True).data)
  
class ChartAnalyticsView(APIView):
    def get(self, request, *args, **kwargs):
        today = date.today()
        three_months_ago = today - relativedelta(months=3)  # Fixed: 'months' not 'month'
        
        queryset = IncidentReport.objects.filter(
            ir_created_at__date__gte=three_months_ago, 
            ir_created_at__date__lte=today
        ).annotate(
            date=TruncDate('ir_created_at')
        ).values('date').annotate(
            report=Count('ir_id')
        ).order_by('date')

        formatted_queryset = list(queryset)

        return Response(formatted_queryset)
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from .models import GAD_Budget_Year, GAD_Budget_Tracker
from .serializers import GADBudgetYearSerializer, GAD_Budget_TrackerSerializer
from apps.treasurer.models import Budget_Plan, Budget_Plan_Detail
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import date

@api_view(['POST'])
def get_gad_budget(request):
    # try:
    #     # New approach using GAD_Budget_Year
    #     gad_year = get_object_or_404(
    #         GAD_Budget_Year, 
    #         budget_plan__plan_year=year
    #     )
        
    #     # Calculate totals from related entries
    #     income = gad_year.total_income
    #     expenses = gad_year.total_expenses
        
    #     return Response({
    #         'year': year,
    #         'budget': float(gad_year.gad_budget_total),
    #         'income': float(income),
    #         'expenses': float(expenses),
    #         'remainingBal': float(gad_year.remaining_balance)
    #     })
        
    # except Exception as e:
    #     return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # try:
    #     years_data = GAD_Budget_Year.objects.annotate(
    #         income=Sum('entries__gbud_amount', filter=Q(entries__gbud_type='Income')),
    #         expenses=Sum('entries__gbud_amount', filter=Q(entries__gbud_type='Expense'))
    #     ).values('budget_plan__plan_year', 'gad_budget_total', 'income', 'expenses')
        
    #     return Response([{
    #         'year': y['budget_plan__plan_year'],  # Access via the foreign key
    #         'budget': float(y['gad_budget_total']),
    #         'income': float(y['income'] or 0),
    #         'expenses': float(y['expenses'] or 0),
    #         'remainingBal': float(y['gad_budget_total']) - float(y['expenses'] or 0) + float(y['income'] or 0)
    #     } for y in years_data])
    # except Exception as e:
    #     return Response({"error": str(e)}, status=500)

    current_year = str(date.today().year)
    
    try:
        # Check if Budget_Plan exists for current year
        budget_plan = Budget_Plan.objects.get(plan_year=current_year)
        
        # Check if GAD entry already exists
        if GAD_Budget_Year.objects.filter(budget_plan=budget_plan).exists():
            return Response({
                'exists': True,
                'year': current_year,
                'message': f'GAD budget for {current_year} already exists'
            }, status=status.HTTP_200_OK)
            
        # Create new GAD budget
        GAD_Budget_Year.objects.create(
            budget_plan=budget_plan,
            gad_budget_total=0
        )
        
        return Response({
            'exists': False,
            'year': current_year,
            'message': f'GAD budget for {current_year} created'
        }, status=status.HTTP_201_CREATED)
        
    except Budget_Plan.DoesNotExist:
        return Response({
            'error': f'Main budget for {current_year} does not exist'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GADBudgetYearListView(generics.ListAPIView):
    """New view for listing all GAD budget years"""
    queryset = GAD_Budget_Year.objects.all().order_by('-budget_plan__plan_year')
    serializer_class = GADBudgetYearSerializer


class GAD_Budget_TrackerView(generics.ListCreateAPIView):
    serializer_class = GAD_Budget_TrackerSerializer
    
    def get_queryset(self):
        # Filter by year if provided
        year = self.request.query_params.get('year')
        if year:
            return GAD_Budget_Tracker.objects.filter(
                budget_year__budget_plan__plan_year=year
            )
        return GAD_Budget_Tracker.objects.all()


class GAD_Budget_TrackerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = GAD_Budget_Tracker.objects.all()
    serializer_class = GAD_Budget_TrackerSerializer
    lookup_field = 'gbud_num'
    
    def perform_destroy(self, instance):
        # Store year reference before deletion
        budget_year = instance.budget_year
        instance.delete()
        # Recalculate year totals
        budget_year.save(force_recalculate=True)
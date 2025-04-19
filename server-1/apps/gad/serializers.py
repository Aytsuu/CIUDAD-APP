#KANI 2ND

from rest_framework import serializers
from .models import GAD_Budget_Tracker
from .models import GAD_Budget_Year

class GAD_Budget_TrackerSerializer(serializers.ModelSerializer):
    class Meta:
        model = GAD_Budget_Tracker
        fields = '__all__'
        extra_kwargs = {
            'gbud_num': {'read_only': True}  # Prevent ID updates
        }

class GADBudgetYearSerializer(serializers.ModelSerializer):
    year = serializers.CharField(source='budget_plan.plan_year')
    
    class Meta:
        model = GAD_Budget_Year
        fields = ['year', 'gad_budget_total', 'last_updated']
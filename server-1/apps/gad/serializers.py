#KANI 2ND

from rest_framework import serializers
from .models import GAD_Budget_Tracker

class GAD_Budget_TrackerSerializer(serializers.ModelSerializer):
    class Meta:
        model = GAD_Budget_Tracker
        fields = '__all__'
        extra_kwargs = {
            'gbud_num': {'read_only': True}  # Prevent ID updates
        }
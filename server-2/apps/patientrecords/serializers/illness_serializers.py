from rest_framework import serializers
from ..models import *

class IllnessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Illness
        fields= '__all__'
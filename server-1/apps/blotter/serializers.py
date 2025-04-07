
from rest_framework import serializers
from .models import Blotter

class BlotterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blotter
        fields = '__all__'
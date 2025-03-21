#KANI 2ND

from rest_framework import serializers
from .models import *

class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'

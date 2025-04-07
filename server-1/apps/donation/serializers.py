#KANI 2ND

from rest_framework import serializers
from .models import Donation

class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'
        extra_kwargs = {
            'don_num': {'read_only': True}  # Prevent ID updates
        }

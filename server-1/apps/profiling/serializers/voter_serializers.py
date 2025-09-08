from rest_framework import serializers
from ..models import Voter

class VoterBaseSerialzer(serializers.ModelSerializer):
  class Meta:
    model = Voter
    fields = '__all__'


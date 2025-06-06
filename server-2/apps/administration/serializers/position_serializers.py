from rest_framework import serializers
from ..models import Position

class PositionBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Position
    fields = '__all__'

  
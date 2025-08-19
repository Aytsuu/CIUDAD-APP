from rest_framework import serializers
from ..models import Position

class PositionBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Position
    fields = '__all__'

class PositionListSerializer(serializers.ModelSerializer):
  creator_staff_type = serializers.CharField(source='staff.staff_type', read_only=True)
  staff = serializers.CharField(source='staff.staff_id', read_only=True)

  class Meta:
    model = Position
    fields = ['pos_id', 'pos_title', 'pos_group', 'pos_max', 'pos_is_predefined', 
              'staff', 'creator_staff_type']

  
from rest_framework import serializers
from ..models import Position, Staff

class PositionBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Position
    fields = '__all__'

class PositionListSerializer(serializers.ModelSerializer):
  creator_staff_type = serializers.CharField(source='staff.staff_type', read_only=True)
  staff = serializers.CharField(source='staff.staff_id', read_only=True)
  total_holders = serializers.SerializerMethodField()
  is_maxed = serializers.SerializerMethodField()

  class Meta:
    model = Position
    fields = ['pos_id', 'pos_title', 'pos_group', 'pos_max', 'total_holders', 'pos_is_predefined', 
              'staff', 'creator_staff_type', 'is_maxed']

  def get_is_maxed(self, obj):
    current_holders = Staff.objects.filter(pos=obj.pos_id).count()
    return True if current_holders == obj.pos_max else False
  
  def get_total_holders(self, obj):
    return Staff.objects.filter(pos=obj.pos_id).count()
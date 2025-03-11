from rest_framework import serializers
from .models import Position, Feature, Assignment

class PositionSerializer(serializers.ModelSerializer):  
    class Meta: 
        model = Position
        fields = ['pos_id', 'pos_title']

class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = ['feat_id', 'feat_name', 'feat_category']
    
class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['assi_id', 'assi_date', 'feat', 'pos']

from rest_framework import serializers
from .models import *

class SitioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sitio
        fields = '__all__'

class MotherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mother
        fields = '__all__'

class FatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Father
        fields = '__all__'

class DependentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dependent
        fields = '__all__'

class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = '__all__'

class FamilyCompositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FamilyComposition
        fields = '__all__'

class BuildingSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Building
        fields = '__all__'

class HouseholdSerializer(serializers.ModelSerializer):
    class Meta:
        model = Household
        fields = '__all__'

        
class PersonalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
        fields = '__all__'


    
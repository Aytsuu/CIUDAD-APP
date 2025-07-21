# from rest_framework import serializers
# from .models import *

# class HealthRelatedDetailsSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = HealthRelatedDetails
#         fields = '_all_'

# class DependentsOverFiveSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Dependents_Over_Five
#         fields = '_all_'
        
# class DependentsUnderFiveSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Dependents_Under_Five
#         fields = '_all_'

# class WaterSupplySerializer(serializers.ModelSerializer):
#     class meta:
#         model = WaterSupply
#         fields = '_all_'

# class SanitaryFacilitySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = SanitaryFacility
#         fields = '_all_'

from rest_framework import serializers
from .models import Personal, ResidentProfile, HealthRelatedDetails, Household, Sitio, Address, PersonalAddress

class PersonalInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
        fields = '__all__'

class ResidentProfileSerializer(serializers.ModelSerializer):
    personal = PersonalInfoSerializer(source='per', read_only=True) # Assuming 'per' is the related_name
    class Meta:
        model = ResidentProfile
        fields = '__all__'

class HealthRelatedDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthRelatedDetails
        fields = '__all__'

# Add other serializers for Household, Address, Sitio, PersonalAddress if needed
class SitioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sitio
        fields = '__all__'

class AddressSerializer(serializers.ModelSerializer):
    sitio = SitioSerializer(read_only=True)
    class Meta:
        model = Address
        fields = '__all__'

class PersonalAddressSerializer(serializers.ModelSerializer):
    add = AddressSerializer(read_only=True)
    class Meta:
        model = PersonalAddress
        fields = '__all__'

class HouseholdSerializer(serializers.ModelSerializer):
    address = AddressSerializer(source='add', read_only=True) # Assuming 'add' is the related_name
    class Meta:
        model = Household
        fields = '__all__'

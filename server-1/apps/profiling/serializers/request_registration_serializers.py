from rest_framework import serializers
from ..models import *
from django.db import transaction
from apps.profiling.serializers.personal_serializers import PersonalBaseSerializer
from apps.account.models import Account
from utils.supabase_client import supabase

class RequestBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = RequestRegistration
    fields = '__all__'

class RequestTableSerializer(serializers.ModelSerializer):
  compositions = serializers.SerializerMethodField()
  class Meta:
    model = RequestRegistration
    fields = ['req_id', 'req_date', 'compositions']

  def get_compositions(self, obj):
    compositions = obj.request_composition.all()
    result = []
    for comp in compositions:
      if comp.per:  # Check if personal info exists
        instance = PersonalBaseSerializer(comp.per).data
        person_data = {
          'role': comp.rrc_fam_role,
          'acc': comp.acc_id if comp.acc else None,
          'per_id': instance['per_id'],
          'per_lname': instance['per_lname'],
          'per_fname': instance['per_fname'],
          'per_mname': instance['per_mname'],
          'per_suffix': instance['per_suffix'],
          'per_dob': instance['per_dob'],
          'per_sex': instance['per_sex'],
          'per_status': instance['per_status'],
          'per_edAttainment': instance['per_edAttainment'],
          'per_religion': instance['per_religion'],
          'per_contact': instance['per_contact'],
          'per_disability': instance['per_disability'],
          'per_addresses': instance['per_addresses']
        }
        result.append(person_data)
    return result
  
class FamilyRequestTableSerializer(serializers.ModelSerializer):

  class Meta:
    model = RequestRegistration
    fields = ['']

class AccountInputSerializer(serializers.Serializer):
  email = serializers.EmailField(write_only=True, required=False)
  phone = serializers.CharField(write_only=True, required=False)
  username = serializers.CharField(write_only=True)
  password = serializers.CharField(write_only=True)

class CompositionSerializer(serializers.Serializer):
  per = PersonalBaseSerializer(write_only=True)
  role = serializers.CharField(write_only=True)
  acc = AccountInputSerializer(write_only=True, required=False)

# class RequestCreateSerializer(serializers.ModelSerializer):
#   comp = CompositionSerializer(write_only=True, many=True)
#   class Meta:
#     model = RequestRegistration
#     fields = ['comp']
  
#   @transaction.atomic
#   def create(self, validated_data):
#     comp = validated_data.get('comp', None)
      
#     if not comp or len(comp) == 0: 
#         raise serializers.ValidationError("'comp' field is required")
    
#     request = RequestRegistration.objects.create()
#     new_comp = []
  
#     for data in comp:
#       try: 
#         new_data = { 
#           'rrc_fam_role': data['role'],
#           'per': self.create_personal_info(data['per']),
#           'req': request
#         } 
        
#         # if 'acc' in data:  
#         #   acc = data['acc']  
#         #   account = Account.objects.create_user(
#         #       email=acc.get('email', None),
#         #       phone=acc.get('phone', None),
#         #       username=acc.get('username', None),
#         #       password=acc.get('password', None)
#         #   )

#         #   new_data['acc'] = account

#       except Exception as e:
#         print(f"Error processing composition: {str(e)}")
#         raise serializers.ValidationError(str(e))
      
#       new_comp.append(
#         RequestRegistrationComposition(**new_data)
#       )
    
#     if len(new_comp) > 0:
#       RequestRegistrationComposition.objects.bulk_create(new_comp)
    
#     return request

  def create_personal_info(self, personal, staff=None):
    addresses = personal.pop("per_addresses", None)
    add_instances = [
      Address.objects.get_or_create(
        add_province=add["add_province"],
        add_city=add["add_city"],
        add_barangay = add["add_barangay"],
        sitio=Sitio.objects.filter(sitio_id=add["sitio"]).first(),
        add_external_sitio=add["add_external_sitio"],
        add_street=add["add_street"]
      )[0]
      for add in addresses
    ]

    # Create Personal record
    per_instance = Personal(**personal)
    per_instance._history_user = staff
    per_instance.save()

    try:
      latest_history = per_instance.history.latest()
      history_id = latest_history.history_id
    except per_instance.history.model.DoesNotExist:
      history_id = None  

    for add in add_instances:
      PersonalAddress.objects.create(add=add, per=per_instance) 
      history = PersonalAddressHistory(add=add, per=per_instance)
      history.history_id=history_id
      history.save()
    
    return per_instance

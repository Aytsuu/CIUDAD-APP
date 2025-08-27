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
          'per_addresses': instance['per_addresses']
        }
        result.append(person_data)
    return result
  
class FamilyRequestTableSerializer(serializers.ModelSerializer):

  class Meta:
    model = RequestRegistration
    fields = ['']

class AccountInputSerializer(serializers.Serializer):
  email = serializers.EmailField()
  username = serializers.CharField()
  password = serializers.CharField()

class CompositionSerializer(serializers.Serializer):
  per = serializers.PrimaryKeyRelatedField(
      queryset=Personal.objects.all(),
      write_only=True
  )
  role = serializers.CharField(write_only=True)
  acc = AccountInputSerializer(write_only=True, required=False)

class RequestCreateSerializer(serializers.ModelSerializer):
  comp = CompositionSerializer(write_only=True, many=True)
  class Meta:
    model = RequestRegistration
    fields = ['comp']
  
  @transaction.atomic
  def create(self, validated_data):
    comp = validated_data.get('comp', None)
        
    if not comp or len(comp) == 0:
        raise serializers.ValidationError("'comp' field is required")
    
    request = RequestRegistration.objects.create()
    new_comp = []
  
    for data in comp:
      try: 
        new_data = { 
          'rrc_fam_role': data['role'],
          'per': data['per'],
          'req': request
        } 
        
        if 'acc' in data:  
          acc = data['acc']  
          supabase_response = supabase.auth.sign_up({
              "email": acc['email'],
              "password": acc['password'],
              "options": {
                  "data": {
                      "username": acc['username'] or acc['email'].split('@')[0],
                  }
              }
          })
                                
          # Create account in local database
          account = Account.objects.create(
              email=acc['email'],
              username=acc['username'] or acc['email'].split('@')[0],
              supabase_id=supabase_response.user.id,  # Store Supabase ID
          )

          new_data['acc'] = account

      except Exception as e:
        print(f"Error processing composition: {str(e)}")
        raise serializers.ValidationError(str(e))
      
      new_comp.append(
        RequestRegistrationComposition(**new_data)
      )
    
    if len(new_comp) > 0:
      RequestRegistrationComposition.objects.bulk_create(new_comp)
    
    return request


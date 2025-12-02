from rest_framework import serializers
from ..models import *
from ..serializers.address_serializers import AddressBaseSerializer
from apps.administration.models import Staff
from ..double_queries import *
from django.db import transaction

class PersonalHistoryBaseSerializer(serializers.ModelSerializer):
    history_user_name = serializers.SerializerMethodField()
    history_date = serializers.DateTimeField(format='%Y-%m-%d %I:%M:%S %p')
    current_addresses = serializers.SerializerMethodField()

    class Meta:
        model = Personal.history.model
        fields = '__all__'
    
    def get_history_user_name(self, obj):
        if obj.history_user and hasattr(obj.history_user, 'rp'):
            per = obj.history_user.rp.per
            return f"{per.per_lname}, {per.per_fname}" + \
                   (f" {per.per_mname}" if per.per_mname else "")
        return None

    def get_current_addresses(self, obj):
        """Get addresses as they were at this historical point"""
        if not obj.history_date:
            return []
        
        address_history = PersonalAddressHistory.objects.filter(
                                                    per_id=obj.per_id,
                                                    history_id=obj.history_id
                                                ).select_related('add')
        return [
            {
                'street': pa.add.add_street,
                'sitio': pa.add.sitio.sitio_name if pa.add.sitio else pa.add.add_external_sitio,
                'barangay': pa.add.add_barangay,
                'city': pa.add.add_city,
                'province': pa.add.add_province
            }
            for pa in address_history
        ]

class PersonalBaseSerializer(serializers.ModelSerializer):
    per_addresses = serializers.SerializerMethodField()

    class Meta:
        model = Personal
        fields = ['per_id','per_lname', 'per_fname', 'per_mname', 'per_suffix', 'per_dob', 
                  'per_sex', 'per_status', 'per_edAttainment', 'per_religion', 
                  'per_contact', 'per_disability', 'per_addresses']
        extra_kwargs = {
            'per_lname': {'required': False, 'allow_null': True},
            'per_fname': {'required': False, 'allow_null': True},
            'per_mname': {'required': False, 'allow_null': True},
            'per_suffix': {'required': False, 'allow_null': True},
            'per_sex': {'required': False, 'allow_null': True},
            'per_dob': {'required': False, 'allow_null': True},
            'per_status': {'required': False, 'allow_null': True},
            'per_contact': {'required': False, 'allow_null': True},
            'per_edAttainment': {'required': False, 'allow_null': True},
            'per_religion': {'required': False, 'allow_null': True},
            'per_disability': {'required': False, 'allow_null': True},
        }
        
    def get_per_addresses(Self, obj):
        per_addresses = PersonalAddress.objects.filter(per=obj.per_id)
        addresses = [pa.add for pa in per_addresses.select_related('add')]
        return AddressBaseSerializer(addresses, many=True).data

class PersonalWithHistorySerializer(PersonalBaseSerializer):
    history = serializers.SerializerMethodField()
    
    class Meta(PersonalBaseSerializer.Meta):
        fields = PersonalBaseSerializer.Meta.fields + ['history']
    
    def get_history(self, obj):
        history = obj.history.first()
        if history:
            return history.history_id
        return None

class PersonalUpdateSerializer(serializers.ModelSerializer):
    per_addresses = serializers.ListField(child=AddressBaseSerializer(), required=False)
    staff_id = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = Personal
        fields = '__all__'
        extra_kwargs = {
            'per_mname': {'required': False, 'allow_null': True},
            'per_suffix': {'required': False, 'allow_null': True},
            'per_edAttainment': {'required': False, 'allow_null': True},
            'per_disability': {'required': False, 'allow_null': True},
        }

    @transaction.atomic
    def update(self, instance, validated_data): 
        staff_id = validated_data.pop('staff_id', None)

        try:
            staff = Staff.objects.get(staff_id=staff_id)
        except Staff.DoesNotExist:
            raise serializers.ValidationError({"staff_id": "Invalid staff ID"})

        instance._history_user = staff
        addresses_data = validated_data.pop('per_addresses', None)

        # Update personal data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save(
            update_fields=list(validated_data.keys()) if validated_data else None
        )

        if addresses_data:
            personal_addresses = instance.personal_addresses.all()
            add_ids = [a['add_id'] for a in addresses_data if 'add_id' in a]
            for add in personal_addresses:
                if not add.add_id in add_ids:
                    add.delete()
                    
        pk = instance.pk
        request = self.context.get("request")
        response = UpdateQueries().personal(request.data, pk)
        if not response.ok:
            try:
                error_details = response.json()
            except ValueError:
                error_details = response.text
            raise serializers.ValidationError({'error': error_details})

        return instance

# class PersonalAddressModifSerializer(serializers.ModelSerializer):
#     address = serializers.SerializerMethodField()
#     class Meta:
#         model = PersonalAddressModification
#         fields = ['address']
    
#     def get_address(self, obj):
#         return AddressBaseSerializer(Address.objects.filter(add_id=obj.add.add_id).first()).data

# class PersonalModificationBaseSerializer(serializers.ModelSerializer):
#     modified_addresses = serializers.SerializerMethodField()
#     current_details = serializers.SerializerMethodField()
#     rp_id = serializers.SerializerMethodField()
#     fam_id = serializers.SerializerMethodField()
#     class Meta:
#         model = PersonalModification
#         fields = '__all__'
    
#     def get_modified_addresses(self, obj):
#         instances = PersonalAddressModification.objects.filter(pm=obj.pm_id)
#         return PersonalAddressModifSerializer(instances, many=True).data
    
#     def get_current_details(self, obj):
#         return PersonalBaseSerializer(Personal.objects.filter(per_id=obj.per.per_id).first()).data
    
#     def get_rp_id(self, obj):
#         return ResidentProfile.objects.filter(per=obj.per).first().rp_id
    
#     def get_fam_id(self, obj):
#         rp = ResidentProfile.objects.filter(per=obj.per).first().rp_id
#         fam = FamilyComposition.objects.filter(rp=rp).first()
#         if fam:
#             fam = fam.fam
#         return fam
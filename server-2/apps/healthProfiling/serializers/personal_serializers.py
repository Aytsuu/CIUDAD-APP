from rest_framework import serializers
from ..models import *
from ..serializers.address_serializers import AddressBaseSerializer
from apps.administration.models import Staff

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
                'sitio': pa.add.sitio.sitio_name,
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

    def update(self, instance, validated_data): 
        staff_id = validated_data.pop('staff_id', None)
        
        try:
            staff = Staff.objects.get(staff_id=staff_id)
        except Staff.DoesNotExist:
            raise serializers.ValidationError({"staff_id" : "Invalid staff ID"})

        instance._history_user = staff
        addresses_data = validated_data.pop('per_addresses', None)

        # Update personal data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save(
            update_fields=list(validated_data.keys()) if validated_data else None
        )


        if addresses_data is not None:
            # Get existing addresses for this person
            existing_addresses = {
                pa.add.add_id: pa 
                for pa in PersonalAddress.objects.filter(per=instance)
            }
   
            # Track which addresses to keep
            keep_address_ids = set()
            
            # Process each address in the request
            for address_data in addresses_data: 
                address_id = address_data.get('add_id', None)
                
                if address_id and (address_id in existing_addresses):
                    personal_address = existing_addresses[address_id]
                    
                    def get_field_value(obj, field, value):
                    # Special handling for sitio
                        if field == "sitio":
                            # Compare by sitio_name or id if value is a string/int
                            if hasattr(obj.sitio, "sitio_name") and isinstance(value, str):
                                return obj.sitio.sitio_name
                            elif hasattr(obj.sitio, "pk") and isinstance(value, int):
                                return obj.sitio.pk
                            return obj.sitio
                        return getattr(obj, field, None)

                    # Compare only relevant fields
                    has_changes = False
                    for field, value in address_data.items():
                        if field == "add_id":
                            continue
                        current_value = get_field_value(personal_address.add, field, value)
                        if current_value != value:
                            has_changes = True
                            break

                    if has_changes:
                        # Create new address
                        data = address_data.copy()
                        data.pop('add_id')

                        # Ensure sitio is passed as a primary key (not an object)
                        if 'sitio' in data and hasattr(data['sitio'], 'pk'):
                            data['sitio'] = data['sitio'].pk

                        # Get similar addresses according to the changes
                        existing_changes = Address.objects.filter(
                            add_province=data['add_province'],
                            add_city=data['add_city'],
                            add_barangay=data['add_barangay'],
                            add_external_sitio=data['add_external_sitio'],
                            sitio=data.get('sitio'),
                            add_street=data['add_street']
                        ).first()

                        if existing_changes:
                            personal_address.add = existing_changes
                            personal_address.save()

                            PersonalAddressHistory.objects.create(
                                per=instance, 
                                add=existing_changes,
                                history_id = instance.history.latest().history_id
                            )
                        else:
                            address_serializer = AddressBaseSerializer(data=data)
                            if address_serializer.is_valid():
                                address = address_serializer.save()        
                                PersonalAddress.objects.create(per=instance, add=address)
                                PersonalAddress.objects.get(add=address_id).delete()
                                PersonalAddressHistory.objects.create(
                                    per=instance, 
                                    add=address,
                                    history_id = instance.history.latest().history_id
                                )
                            else:
                                raise serializers.ValidationError(address_serializer.errors)
                    
                    else: 
                        PersonalAddressHistory.objects.create(
                            per=instance, 
                            add=Address.objects.filter(add_id=address_id).first(),
                            history_id = instance.history.latest().history_id
                        )
                    keep_address_ids.add(address_id)
                    

            # Delete addresses that are not in the request
            addresses_to_delete = set(existing_addresses.keys()) - keep_address_ids
            if addresses_to_delete:
                PersonalAddress.objects.filter(
                    per=instance,
                    add_id__in=addresses_to_delete
                ).delete()
        
        return instance
    
class PersonalModificationBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PersonalModification
        fields = '__all__'

class HealthRelatedDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthRelatedDetails
        fields = '__all__'
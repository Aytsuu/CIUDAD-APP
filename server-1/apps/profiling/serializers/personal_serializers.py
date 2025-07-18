from rest_framework import serializers
from ..models import *
from ..serializers.address_serializers import AddressBaseSerializer

class PersonalBaseSerializer(serializers.ModelSerializer):
    addresses = serializers.SerializerMethodField()

    class Meta:
        model = Personal
        fields = ['per_id','per_lname', 'per_fname', 'per_mname', 'per_suffix', 'per_dob', 
                  'per_sex', 'per_status', 'per_edAttainment', 'per_religion', 
                  'per_contact', 'addresses']
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
        }
        
    def get_addresses(Self, obj):
        per_addresses = PersonalAddress.objects.filter(per=obj.per_id)
        addresses = [pa.add for pa in per_addresses.select_related('add')]
        return AddressBaseSerializer(addresses, many=True).data

class PersonalUpdateSerializer(serializers.ModelSerializer):
    per_addresses = serializers.ListField(child=AddressBaseSerializer(), required=False)
    class Meta:
        model = Personal
        fields = '__all__'
        extra_kwargs = {
            'per_mname': {'required': False, 'allow_null': True},
            'per_suffix': {'required': False, 'allow_null': True},
            'per_edAttainment': {'required': False, 'allow_null': True},
        }

    def update(self, instance, validated_data): 
        # Handle address data if provided
        addresses_data = validated_data.pop('per_addresses', None)

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

                    has_changes = (
                        getattr(personal_address.add, field) != value
                        for field, value in address_data.items()
                    )

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
                        else:
                            print("data", data)
                            address_serializer = AddressBaseSerializer(data=data)
                            print(address_serializer)
                            print(address_serializer.is_valid())
                            if address_serializer.is_valid():
                                address = address_serializer.save()        
                                PersonalAddress.objects.create(per=instance, add=address)
                                PersonalAddress.objects.get(add=address).delete()
                            else:
                                raise serializers.ValidationError(address_serializer.errors)

                        keep_address_ids.add(address_id)

            # Delete addresses that are not in the request
            addresses_to_delete = set(existing_addresses.keys()) - keep_address_ids
            if addresses_to_delete:
                PersonalAddress.objects.filter(
                    per=instance,
                    add_id__in=addresses_to_delete
                ).delete()

        # Update personal data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
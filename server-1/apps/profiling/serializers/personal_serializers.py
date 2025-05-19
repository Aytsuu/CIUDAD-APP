from rest_framework import serializers
from ..models import *
from ..serializers.address_serializers import AddressBaseSerializer

class PersonalBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personal
        fields = '__all__'
        extra_kwargs = {
            'per_mname': {'required': False, 'allow_null': True},
            'per_suffix': {'required': False, 'allow_null': True},
            'per_edAttainment': {'required': False, 'allow_null': True},
        }

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

            
            # Track which addresses we're keeping
            kept_address_ids = set()
            
            # Process each address in the request
            for address_data in addresses_data:
                address_id = address_data.get('add_id', None)
                print(f"Processing address data: {address_data}")

                if address_id and address_id in existing_addresses:
                    # Update existing address
                    personal_address = existing_addresses[address_id]
                    address_serializer = AddressBaseSerializer(
                        personal_address.add,
                        data=address_data,
                        partial=True
                    )
                    kept_address_ids.add(address_id)
                else:
                    # Create new address
                    address_serializer = AddressBaseSerializer(data=address_data)
                
                if address_serializer.is_valid():
                    address = address_serializer.save()
                    if not (address_id and address_id in existing_addresses):
                        PersonalAddress.objects.create(per=instance, add=address)
                        kept_address_ids.add(address.add_id)
                else:
                    raise serializers.ValidationError({'per_addresses': address_serializer.errors})
            
            # Delete addresses that weren't included in the request
            addresses_to_delete = set(existing_addresses.keys()) - kept_address_ids
            if addresses_to_delete:
                PersonalAddress.objects.filter(
                    per=instance,
                    add_id__in=addresses_to_delete
                ).delete()
                Address.objects.filter(add_id__in=addresses_to_delete).delete()

        # Update personal data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
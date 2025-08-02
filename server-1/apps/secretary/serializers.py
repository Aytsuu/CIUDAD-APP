from rest_framework import serializers
from .models import Ordinance, OrdinanceSupplementaryDoc, OrdinanceTemplate
from apps.file.serializers.base import FileSerializer
from apps.administration.serializers.staff_serializers import StaffMinimalSerializer

class OrdinanceSupplementaryDocSerializer(serializers.ModelSerializer):
    file = FileSerializer(read_only=True)
    
    class Meta:
        model = OrdinanceSupplementaryDoc
        fields = ['osd_id', 'osd_title', 'osd_is_archive', 'ordinance', 'file']

class OrdinanceTemplateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = OrdinanceTemplate
        fields = ['template_id', 'title', 'template_body', 'with_seal', 'with_signature', 
                 'pdf_url', 'created_at', 'updated_at', 'is_active']
        extra_kwargs = {
            'template_id': {'read_only': True},
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }

class OrdinanceSerializer(serializers.ModelSerializer):
    file = FileSerializer(read_only=True)
    staff = StaffMinimalSerializer(read_only=True)
    supplementary_docs = OrdinanceSupplementaryDocSerializer(many=True, read_only=True)
    
    class Meta:
        model = Ordinance
        fields = ['ord_num', 'ord_title', 'ord_date_created', 'ord_category', 
                 'ord_details', 'ord_year', 'ord_is_archive', 'file', 'staff', 
                 'supplementary_docs']
        extra_kwargs = {
            'ord_num': {'required': False}  # Make it optional for creation
        }
        
    def validate_ord_num(self, value):
        """
        Check that the ordinance number is unique
        """
        if value and Ordinance.objects.filter(ord_num=value).exists():
            raise serializers.ValidationError("An ordinance with this number already exists.")
        return value
        
    def create(self, validated_data):
        """
        Auto-generate ord_num if not provided
        """
        if 'ord_num' not in validated_data or not validated_data['ord_num']:
            # Generate ordinance number: ORD-YYYY-XXXX
            year = validated_data.get('ord_year', 2024)
            import random
            import string
            
            # Generate a unique number
            while True:
                # Generate 4 random digits
                random_digits = ''.join(random.choices(string.digits, k=4))
                ord_num = f"ORD-{year}-{random_digits}"
                
                # Check if it's unique
                if not Ordinance.objects.filter(ord_num=ord_num).exists():
                    validated_data['ord_num'] = ord_num
                    break
        
        return super().create(validated_data) 
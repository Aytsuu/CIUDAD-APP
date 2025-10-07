from rest_framework import serializers
from ..models import *
from datetime import date


class PESectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PESection
        fields = '__all__'
        
class PEOptionSerializer(serializers.ModelSerializer):
    pe_section_details = PESectionSerializer(source="pe_section", read_only=True)
    
    class Meta:
        model=PEOption
        fields='__all__'
        

        
class PEResultSerializer(serializers.ModelSerializer):
    pe_option_details = PEOptionSerializer(source="pe_option", read_only=True) 
    

    class Meta:  
        model = PEResult  
        fields = '__all__'

         

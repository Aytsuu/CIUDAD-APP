from rest_framework import serializers
from .models import BlotterReport, Complainant, Accused, SupportingDocument

class ComplainantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complainant
        fields = '__all__'

class AccusedSerializer(serializers.ModelSerializer):
    class Meta:
        model =Accused
        fields = '__all__'
        
class SupportingDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportingDocument
        fields = '__all__'
        
class BlotterReportSerializer(serializers.ModelSerializer):
    complainant = serializers.PrimaryKeyRelatedField(queryset=Complainant.objects.all())
    accused = serializers.PrimaryKeyRelatedField(queryset=Accused.objects.all())
    supporting_documents = SupportingDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = BlotterReport
        fields = '__all__'
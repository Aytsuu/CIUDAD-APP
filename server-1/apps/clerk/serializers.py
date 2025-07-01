from rest_framework import serializers
from .models import ClerkCertificate
from .models import ClerkBusinessPermit
from .models import DocumentsPDF

class ClerkCertificateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClerkCertificate
        fields = '__all__'  

class ClerkBusinessPermitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClerkBusinessPermit
        fields = '__all__' 

class ClerkDocumentPDFSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentsPDF
        fields = ['id', 'pdf_url']  # Removed 'pdf_file'
        extra_kwargs = {
            'pdf_url': {'read_only': False}
        }
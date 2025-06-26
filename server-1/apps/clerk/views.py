from rest_framework import generics
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import ClerkCertificate, ClerkBusinessPermit, DocumentsPDF
from .serializers import ClerkCertificateSerializer, ClerkBusinessPermitSerializer, ClerkDocumentPDFSerializer
from supabase import create_client, Client 

from django.conf import settings

import tempfile
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import logging

# Define logger
logger = logging.getLogger(__name__)

class CertificateListView(generics.ListCreateAPIView):
    queryset = ClerkCertificate.objects.all()
    serializer_class = ClerkCertificateSerializer

class CertificateDetailView(generics.RetrieveAPIView):
    queryset = ClerkCertificate.objects.all()
    serializer_class = ClerkCertificateSerializer
    lookup_field = 'cert_req_no'

class BusinessPermitListView(generics.ListCreateAPIView):
    queryset = ClerkBusinessPermit.objects.all()
    serializer_class = ClerkBusinessPermitSerializer

class BusinessPermitView(generics.RetrieveAPIView):
    queryset = ClerkBusinessPermit.objects.all()
    serializer_class = ClerkBusinessPermitSerializer
    lookup_field = 'busi_req_no'

class DocumentPDFListView(generics.ListCreateAPIView):
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = ClerkDocumentPDFSerializer
    queryset = DocumentsPDF.objects.all()
    BUCKET_NAME = "clerk-documents"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

    def list(self, request, *args, **kwargs):
        try:
            # Get database records
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            
            # Get bucket files
            try:
                response = self.supabase.storage.from_(self.BUCKET_NAME).list()
                bucket_files = []
                
                if hasattr(response, 'data') and response.data:
                    bucket_files = [
                        {
                            'name': file.get('name'),
                            'created_at': file.get('created_at'),
                            'url': f"{settings.SUPABASE_URL}/storage/v1/object/public/{self.BUCKET_NAME}/{file.get('name')}"
                        }
                        for file in response.data
                        if file.get('name', '').lower().endswith('.pdf')
                    ]
            except Exception as e:
                logger.error(f"Error listing bucket files: {str(e)}")
                bucket_files = []
            
            # Prepare response with both database records and bucket files
            response_data = {
                'database_records': serializer.data,
                'bucket_files': bucket_files
            }
            
            return Response(response_data)
            
        except Exception as e:
            logger.error(f"Document list error: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to retrieve documents", "details": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        file = request.FILES.get('pdf_file')
        
        if not file:
            return Response(
                {"error": "No file provided"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if not file.name.lower().endswith('.pdf'):
            return Response(
                {"error": "Only PDF files are allowed"},
                status=status.HTTP_400_BAD_REQUEST
            )

        temp_file_path = None
        try:
            # Use original filename
            original_filename = file.name
            stored_filename = original_filename
            
            # Check for existing files with the same name and handle duplicates if needed
            try:
                response = self.supabase.storage.from_(self.BUCKET_NAME).list()
                existing_files = []
                if hasattr(response, 'data') and response.data:
                    existing_files = [file.get('name') for file in response.data]
                
                # If filename already exists, add a suffix
                if original_filename in existing_files:
                    base, ext = os.path.splitext(original_filename)
                    counter = 1
                    while True:
                        new_filename = f"{base}_{counter}{ext}"
                        if new_filename not in existing_files:
                            stored_filename = new_filename
                            break
                        counter += 1
            except Exception as e:
                logger.warning(f"Could not check for duplicate filenames: {str(e)}")
            
            logger.info(f"Uploading file: {original_filename} as {stored_filename}")
            
            # Save to temp file
            temp_file_path = os.path.join(tempfile.gettempdir(), stored_filename)
            with open(temp_file_path, 'wb+') as temp_file:
                for chunk in file.chunks():
                    temp_file.write(chunk)

            # Upload to Supabase with original filename (or modified if duplicate)
            with open(temp_file_path, 'rb') as f:
                upload_res = self.supabase.storage.from_(self.BUCKET_NAME).upload(
                    stored_filename,
                    f.read(),
                    file_options={"content-type": "application/pdf"}
                )
                
                logger.info(f"Supabase upload response: {upload_res}")
                
                if hasattr(upload_res, 'error') and upload_res.error:
                    raise Exception(f"Supabase upload error: {upload_res.error}")

            # Construct public URL
            public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{self.BUCKET_NAME}/{stored_filename}"
            logger.info(f"Generated public URL: {public_url}")

            # Save to database directly
            document = DocumentsPDF(
                pdf_file=file,  # Django will handle storing the file
                pdf_url=public_url  # Store the Supabase URL
            )
            document.save()
            
            # Return the serialized data
            serializer = self.get_serializer(document)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Upload failed: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        finally:
            # Clean up temporary file
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.remove(temp_file_path)
                except Exception as e:
                    logger.error(f"Temp file cleanup failed: {str(e)}")
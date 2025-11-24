from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.files.base import ContentFile
from ..verification import KYCVerificationProcessor
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

class KYCDocumentMatchingView(APIView):
  permission_classes = [AllowAny]
  def post(self, request):
    id_image = request.FILES.get('image', None)
    fname = request.data.get('fname', None)
    lname = request.data.get('lname', None)
    mname = request.data.get('mname', None)
    dob = request.data.get('dob', None)

    if(id_image): 
      data = {
        'lname': lname,
        'fname': fname,
        'dob': dob 
      }
      if mname: data['mname'] = mname

      #Process verification
      processor = KYCVerificationProcessor()
      processed_data = processor.process_kyc_document_matching(
        user_data=data,
        id_image=id_image
      )

      if processed_data:
        return Response(data=processed_data,status=status.HTTP_200_OK)  
    return Response(status=status.HTTP_400_BAD_REQUEST)

class KYCFaceMatchingView(APIView):
  permission_classes = [AllowAny]
  def post(self, request):
    face_image = request.FILES.get('image', None)
    fname = request.data.get('fname', None)
    lname = request.data.get('lname', None)

    key = f'{lname}{fname}'

    if face_image and key:
      # Retrieve cached ID face embedding
      id_embedding_np = cache.get(key)
      
      if id_embedding_np is None:
          logger.error(f"No cached ID face embedding for key: {key}")
          return Response(
              {'error': 'No previous document verification found. Please verify document first.'},
              status=status.HTTP_404_NOT_FOUND
          )

      processor = KYCVerificationProcessor()
      processed_data = processor.process_kyc_face_matching(
        face_img=face_image,
        id_img=id_embedding_np
      )

      if processed_data:
        cache.delete(key)
        return Response(data=processed_data,status=status.HTTP_200_OK)
    return Response(status=status.HTTP_400_BAD_REQUEST)

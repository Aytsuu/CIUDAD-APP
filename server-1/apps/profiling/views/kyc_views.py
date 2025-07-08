from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from django.core.files.base import ContentFile
import base64
from ..verification import KYCVerificationProcessor
from ..models import KYCRecord

class KYCDocumentMatchingView(APIView):
  def post(self, request):
    id_image = request.data.get('image', None)
    kyc_id = request.data.get('kyc_id', None)
    fname = request.data.get('fname', None)
    lname = request.data.get('lname', None)
    dob = request.data.get('dob', None)

    if(id_image): 
      format, imgstr = id_image.split(';base64,')
      ext = format.split('/')[-1]
      validated_img = ContentFile(base64.b64decode(imgstr), name=f'{'id_document_front.jpg'}')

      #Process verification
      processor = KYCVerificationProcessor()
      processor.process_kyc_document_matching(
        user_data={
          'lname': lname,
          'fname': fname,
          'dob': dob 
        },
        id_image=validated_img,
        kyc_id=kyc_id
      )
      return Response(status=status.HTTP_200_OK)
    
    return None

class KYCFaceMatchingView(APIView):
  def post(self, request):
    kyc_id = request.data.get('kyc_id', None)
    face_image = request.data.get('image', None)

    return

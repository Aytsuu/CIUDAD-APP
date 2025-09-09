from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.files.base import ContentFile
from ..verification import KYCVerificationProcessor
from ..models import KYCRecord

class KYCDocumentMatchingView(APIView):
  permission_classes = [AllowAny]
  def post(self, request):
    id_image = request.data.get('image', None)
    kyc_id = request.data.get('kyc_id', None)
    fname = request.data.get('fname', None)
    lname = request.data.get('lname', None)
    mname = request.data.get('mname', None)
    dob = request.data.get('dob', None)

    if(id_image): 
      imgstr = id_image.split(';base64,')[1]
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
        id_image=imgstr,
        kyc_id=kyc_id
      )

      if 'info_match' in processed_data:
        return Response(data=processed_data,status=status.HTTP_200_OK)
      
    return Response(status=status.HTTP_400_BAD_REQUEST)

class KYCFaceMatchingView(APIView):
  permission_classes = [AllowAny]
  def post(self, request):
    kyc_id = request.data.get('kyc_id', None)
    face_image = request.data.get('image', None)
    id_image = KYCRecord.objects.get(kyc_id=kyc_id)

    if face_image and id_image:
      face_imgstr = face_image.split(';base64,')[1]
      id_imgstr = id_image.id_face_embedding

      processor = KYCVerificationProcessor()
      processed_data = processor.process_kyc_face_matching(
        face_img=face_imgstr,
        id_img=id_imgstr,
        kyc_id=kyc_id
      )

      if 'match' in processed_data:
        return Response(data=processed_data,status=status.HTTP_200_OK)
      
    return Response(status=status.HTTP_400_BAD_REQUEST)

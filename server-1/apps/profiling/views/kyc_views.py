from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.core.files.base import ContentFile
from ..verification import KYCVerificationProcessor
from django.core.cache import cache

class KYCDocumentMatchingView(APIView):
  permission_classes = [AllowAny]
  def post(self, request):
    id_image = request.data.get('image', None)
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
        id_image=imgstr
      )

      if processed_data:
        return Response(data=processed_data,status=status.HTTP_200_OK)
      
    return Response(status=status.HTTP_400_BAD_REQUEST)

class KYCFaceMatchingView(APIView):
  permission_classes = [AllowAny]
  def post(self, request):
    face_image = request.data.get('image', None)
    fname = request.data.get('fname', None)
    lname = request.data.get('lname', None)
    mname = request.data.get('mname', None)
    dob = request.data.get('dob', None)

    key = f'{lname}{fname}' \
          f'{mname}' if mname else ''

    if face_image and key:
      face_imgstr = face_image.split(';base64,')[1]
      id_img = cache.get(key)
      
      if face_imgstr:
        processor = KYCVerificationProcessor()
        processed_data = processor.process_kyc_face_matching(
          face_img=face_imgstr,
          id_img=id_img
        )

        if processed_data:
          return Response(data=processed_data,status=status.HTTP_200_OK)
      
    return Response(status=status.HTTP_400_BAD_REQUEST)

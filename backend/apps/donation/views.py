from django.shortcuts import render
from rest_framework import generics
from .serializers import DonationSerializer
from .models import Donation

# Create your views here.
#KANI 3RD

class DonationView(generics.ListCreateAPIView):
    serializer_class = DonationSerializer
    queryset = Donation.objects.all()

# import logging
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from .models import Donation
# from .serializers import DonationSerializer

# logger = logging.getLogger(__name__)

# class DonationView(APIView):
#     def post(self, request):
#         logger.info("Received data: %s", request.data)
#         serializer = DonationSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         logger.error("Validation errors: %s", serializer.errors)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
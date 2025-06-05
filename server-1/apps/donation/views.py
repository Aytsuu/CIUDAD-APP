# # from django.shortcuts import render
# # from rest_framework import generics
# # from .serializers import DonationSerializer
# # from .models import Donation

# # # Create your views here.
# # #KANI 3RD

# # class DonationView(generics.ListCreateAPIView):
# #     serializer_class = DonationSerializer
# #     queryset = Donation.objects.all()

# # import logging
# # from rest_framework.views import APIView
# # from rest_framework.response import Response
# # from rest_framework import status
# # from .models import Donation
# # from .serializers import DonationSerializer

# # logger = logging.getLogger(__name__)

# # class DonationView(APIView):
# #     def post(self, request):
# #         logger.info("Received data: %s", request.data)
# #         serializer = DonationSerializer(data=request.data)
# #         if serializer.is_valid():
# #             serializer.save()
# #             return Response(serializer.data, status=status.HTTP_201_CREATED)
# #         logger.error("Validation errors: %s", serializer.errors)
# #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# import logging
# from rest_framework import generics, status
# from rest_framework.response import Response
# from .models import Donation
# from .serializers import DonationSerializer

# logger = logging.getLogger(__name__)

# class DonationView(generics.ListCreateAPIView):
#     serializer_class = DonationSerializer
#     queryset = Donation.objects.all()

#     def post(self, request, *args, **kwargs):
#         logger.info("Creating new donation with data: %s", request.data)
#         return super().post(request, *args, **kwargs)

# class UpdateDonationView(generics.RetrieveUpdateAPIView):
#     serializer_class = DonationSerializer
#     queryset = Donation.objects.all()
#     lookup_field = 'don_num'

#     def get_object(self):
#         don_num = self.kwargs.get('don_num')
#         return generics.get_object_or_404(Donation, don_num=don_num)

#     def update(self, request, *args, **kwargs):
#         logger.info("Updating donation %s with data: %s", kwargs.get('don_num'), request.data)
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         logger.error("Update validation errors: %s", serializer.errors)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class DeleteDonationView(generics.DestroyAPIView):
#     serializer_class = DonationSerializer
#     queryset = Donation.objects.all()
#     lookup_field = 'don_num'

#     def get_object(self):
#         don_num = self.kwargs.get('don_num')
#         return generics.get_object_or_404(Donation, don_num=don_num)

#     def delete(self, request, *args, **kwargs):
#         logger.info("Deleting donation %s", kwargs.get('don_num'))
#         instance = self.get_object()
#         self.perform_destroy(instance)
#         return Response(
#             {"message": "Donation deleted successfully"},
#             status=status.HTTP_204_NO_CONTENT
#         )

# views.py
from rest_framework import generics
from .models import Donation
from .serializers import DonationSerializer

class DonationView(generics.ListCreateAPIView):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer

class DonationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    lookup_field = 'don_num' 
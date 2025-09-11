from rest_framework import generics
from .models import *
from .serializers import *
from django.apps import apps
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum 
from rest_framework.permissions import AllowAny

Personal = apps.get_model('profiling', 'Personal')

class DonationView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer

class DonationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    lookup_field = 'don_num'
    permission_classes = [AllowAny]

class PersonalListView(generics.ListAPIView):
    queryset = Personal.objects.only('per_id', 'per_fname', 'per_lname')
    serializer_class = PersonalSerializer
    permission_classes = [AllowAny]

class MonetaryDonationTotalView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        # Sum all donations where category is "Monetary Donations"
        total = Donation.objects.filter(
            don_category="Monetary Donations"
        ).aggregate(total=Sum('don_qty'))['total'] or 0
        
        return Response({'total_monetary_donations': total})

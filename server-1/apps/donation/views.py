from rest_framework import generics
from .models import *
from .serializers import *
from django.apps import apps
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum 
from rest_framework.permissions import AllowAny
from apps.pagination import StandardResultsPagination
from django.db.models import Q
from rest_framework import status

Personal = apps.get_model('profiling', 'Personal')

class DonationView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = DonationSerializer
    pagination_class = StandardResultsPagination
    
    def get_queryset(self):
        queryset = Donation.objects.all()
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(don_num__icontains=search) |
                Q(don_donor__icontains=search) |
                Q(don_item_name__icontains=search) |
                Q(don_category__icontains=search)
            )
        
        # Category filter
        category = self.request.query_params.get('category', None)
        if category and category != 'all':
            queryset = queryset.filter(don_category=category)
        
        # Status filter
        status = self.request.query_params.get('status', None)
        if status and status != 'all':
            queryset = queryset.filter(don_status=status)
        
        return queryset.order_by('-don_num')

class DonationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    lookup_field = 'don_num'
    permission_classes = [AllowAny]

    def get(self, request, don_num):
        try:
            donation = Donation.objects.get(don_num=don_num)
            serializer = self.get_serializer(donation)
            return Response(serializer.data)
        except Donation.DoesNotExist:
            return Response(
                {"error": "Donation not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
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

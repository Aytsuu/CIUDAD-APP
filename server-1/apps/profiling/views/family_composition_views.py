from rest_framework import generics, status
from rest_framework.response import Response
from django.db import transaction
from ..serializers.family_composition_serializers import *
from ..models import *
from ..pagination import *

class FamilyCompositionCreateView(generics.CreateAPIView):
    serializer_class = FamilyCompositionBaseSerializer
    queryset = FamilyComposition.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        response_serialzier = FamilyCompositionExtendedSerializer(instance)
        return Response(response_serialzier.data, status=status.HTTP_201_CREATED)
    

class FamilyMembersListView(generics.ListCreateAPIView):
    serializer_class = FamilyCompositionExtendedSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        fam_id = self.kwargs['fam_id']
        return FamilyComposition.objects.filter(
          fam_id=fam_id
        ).select_related(
            'rp',
            'fam__hh',
        ).only(
            'rp__rp_id',
            'rp__per__per_lname',
            'rp__per__per_fname',
            'rp__per__per_mname',
            'rp__per__per_sex',
            'rp__per__per_dob',
            'rp__per__per_status',
            'fam__hh__hh_id',
            'fam__hh__sitio__sitio_name',
        ).distinct()

class FamilyCompositionBulkCreateView(generics.CreateAPIView):
    serializer_class = FamilyCompositionBulkCreateSerializer
    queryset = FamilyComposition.objects.all()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        # Prepare model instances
        instances = [
            FamilyComposition(**item)
            for item in serializer.validated_data
        ]

        created_instances = FamilyComposition.objects.bulk_create(instances)

        if len(created_instances) > 0 and created_instances[0].pk is not None:
            response_serializer = self.get_serializer(created_instances, many=True)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response({"detail": "Bulk create successful", "count": len(instances)},
            status=status.HTTP_201_CREATED
        )
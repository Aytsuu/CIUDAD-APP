from rest_framework.generics import UpdateAPIView, get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from apps.complaint.models import Complaint
from apps.complaint.serializers import *
from django.db import transaction

class ComplaintUpdateView(UpdateAPIView):
    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    lookup_field = 'comp_id'

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        complaint = get_object_or_404(Complaint, comp_id=kwargs['comp_id'])
        serializer = self.get_serializer(complaint, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
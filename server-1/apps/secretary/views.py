from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from .models import Ordinance, OrdinanceSupplementaryDoc, OrdinanceTemplate
from .serializers import OrdinanceSerializer, OrdinanceSupplementaryDocSerializer, OrdinanceTemplateSerializer
from apps.file.models import File
from apps.file.serializers.base import FileSerializer

class OrdinanceListView(generics.ListCreateAPIView):
    queryset = Ordinance.objects.all()
    serializer_class = OrdinanceSerializer

    def get_queryset(self):
        return Ordinance.objects.filter(ord_is_archive=False)

class OrdinanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ordinance.objects.all()
    serializer_class = OrdinanceSerializer
    lookup_field = 'ord_num'

class OrdinanceArchiveView(generics.UpdateAPIView):
    queryset = Ordinance.objects.all()
    serializer_class = OrdinanceSerializer
    lookup_field = 'ord_num'

    def update(self, request, *args, **kwargs):
        ordinance = self.get_object()
        ordinance.ord_is_archive = True
        ordinance.save()
        return Response({'message': 'Ordinance archived successfully'})

class OrdinanceSupplementaryDocListView(generics.ListCreateAPIView):
    queryset = OrdinanceSupplementaryDoc.objects.all()
    serializer_class = OrdinanceSupplementaryDocSerializer

    def get_queryset(self):
        return OrdinanceSupplementaryDoc.objects.filter(osd_is_archive=False)

class OrdinanceSupplementaryDocDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OrdinanceSupplementaryDoc.objects.all()
    serializer_class = OrdinanceSupplementaryDocSerializer

class OrdinanceSupplementaryDocArchiveView(generics.UpdateAPIView):
    queryset = OrdinanceSupplementaryDoc.objects.all()
    serializer_class = OrdinanceSupplementaryDocSerializer

    def update(self, request, *args, **kwargs):
        doc = self.get_object()
        doc.osd_is_archive = True
        doc.save()
        return Response({'message': 'Supplementary document archived successfully'})

# Template Views
class OrdinanceTemplateListView(generics.ListCreateAPIView):
    queryset = OrdinanceTemplate.objects.all()
    serializer_class = OrdinanceTemplateSerializer

    def get_queryset(self):
        return OrdinanceTemplate.objects.filter(is_active=True)

    def create(self, request, *args, **kwargs):
        # Create template data
        template_data = {
            'title': request.data.get('title'),
            'template_body': request.data.get('template_body'),
            'with_seal': request.data.get('with_seal', 'false').lower() == 'true',
            'with_signature': request.data.get('with_signature', 'false').lower() == 'true',
            'pdf_url': request.data.get('pdf_url'),
        }

        serializer = self.get_serializer(data=template_data)
        serializer.is_valid(raise_exception=True)
        template = serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class OrdinanceTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = OrdinanceTemplate.objects.all()
    serializer_class = OrdinanceTemplateSerializer

class OrdinanceTemplateArchiveView(generics.UpdateAPIView):
    queryset = OrdinanceTemplate.objects.all()
    serializer_class = OrdinanceTemplateSerializer

    def update(self, request, *args, **kwargs):
        template = self.get_object()
        template.is_active = False
        template.save()
        return Response({'message': 'Template archived successfully'}) 
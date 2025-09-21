from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
from ..models import AcknowledgementReport
from ..serializers.ar_serializers import *
from apps.pagination import StandardResultsPagination

class ARCreateView(generics.CreateAPIView):
  serializer_class = ARCreateSerializer
  queryset = AcknowledgementReport.objects.all()

class ARTableView(generics.ListAPIView):
  serializer_class = ARTableSerializer
  pagination_class = StandardResultsPagination

  def get_queryset(self):
    queryset = AcknowledgementReport.objects.all()

    search = self.request.query_params.get('search', '').strip()
    if search:
      queryset = queryset.filter(
          Q(ar_id__icontains=search) |
          Q(ar_title__icontains=search) | 
          Q(ar_created_at__icontains=search) |
          Q(ar_status__icontains=search)
      ).distinct()

    return queryset


class ARFileCreateView(generics.CreateAPIView):
  serializer_class = ARFileCreateSerializer
  queryset = ARFile.objects.all()

  @transaction.atomic
  def create(self, request, *args, **kwargs):
      files = request.data.get('files', [])
      ar_id = request.data.get('ar_id', None)

      if ar_id:
        ar = AcknowledgementReport.objects.filter(ar_id=ar_id).first()

      if files and ar:
        instances = []
        for file_data in files:
          file = ARFile(
            ar=ar,
            arf_name=file_data['name'],
            arf_type=file_data['type'],
          arf_path=f"ar/{file_data['name']}"
          )
          url = upload_to_storage(file_data, 'report-bucket', 'ar')
          file.arf_url = url
          instances.append(file)

        ARFile.objects.bulk_create(instances)
        ar.ar_status = "Signed"
        ar.save()
    
        return Response(data=ARFileBaseSerializer(instances, many=True).data,status=status.HTTP_201_CREATED)
      
      return Response(status=status.HTTP_400_BAD_REQUEST)

class ARInfoView(generics.RetrieveAPIView):
   serializer_class = ARTableSerializer
   queryset = AcknowledgementReport.objects.all()
   lookup_field = 'ar_id'

class ARByDateView(APIView):
  def get(self, request, *args, **kwargs):
    year = request.query_params.get('year')
    month = request.query_params.get('month')
    start_day = request.query_params.get('start_day')
    end_day = request.query_params.get('end_day')
    ar_reports = AcknowledgementReport.objects.filter(ar_status='SIGNED')

    if year and month:
        ar_reports = ar_reports.filter(
            ar_created_at__year=year,
            ar_created_at__month=month,
            ar_created_at__day__gte=start_day,
            ar_created_at__day__lte=end_day
        ).distinct()

    return Response(ARTableSerializer(ar_reports, many=True).data, status=status.HTTP_200_OK)

class ARFileDeleteView(generics.DestroyAPIView):
  serializer_class = ARFileBaseSerializer
  queryset = ARFile.objects.all()
  lookup_field = 'arf_id'

class ARUpdateView(generics.UpdateAPIView):
  serializer_class = ARBaseSerializer
  queryset = AcknowledgementReport.objects.all()
  lookup_field = 'ar_id'

  def update(self, request, *args, **kwargs):
    instance = self.get_object()
    serializer = self.get_serializer(instance, data=request.data, partial=True)
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(status=status.HTTP_400_BAD_REQUEST)

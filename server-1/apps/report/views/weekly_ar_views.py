from rest_framework import generics, status
from rest_framework.response import Response
from django.db import transaction
from ..models import WeeklyAccomplishmentReport, WeeklyARComposition, WARFile
from ..serializers.weekly_ar_serializers import *
from utils.supabase_client import upload_to_storage


class WARCreateView(generics.CreateAPIView):
    serializer_class = WARBaseSerializer
    queryset = WeeklyAccomplishmentReport.objects.all()


class WARCompCreateView(generics.CreateAPIView):
    serializer_class = WARCompBaseSerializer
    queryset = WeeklyARComposition

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        instances = [
            WeeklyARComposition(**item) for item in serializer.validated_data
        ]

        created_instances = WeeklyARComposition.objects.bulk_create(instances)

        if len(created_instances) > 0 and created_instances[0].pk is not None:
            response_serializer = self.get_serializer(created_instances, many=True)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response({
            "detail": "Bulk create successful",
            "count": len(instances)
        }, status=status.HTTP_201_CREATED)


class WARListView(generics.ListAPIView):
    serializer_class = WARListSerializer
    queryset = WeeklyAccomplishmentReport.objects.all().order_by('war_created_at')


class WARInfoView(generics.RetrieveAPIView):
    serializer_class = WARListSerializer
    queryset = WeeklyAccomplishmentReport.objects.all()
    lookup_field = 'war_id'


class WARFileCreateView(generics.CreateAPIView):
    serializer_class = WARFileCreateSerializer
    queryset = WARFile.objects.all()

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        files = request.data.get('files', [])
        war_id = request.data.get('war_id', None)

        if war_id:
            war = WeeklyAccomplishmentReport.objects.filter(war_id=war_id).first()

        if files and war:
            instances = []
            for file_data in files:
                file = WARFile(
                    war=war,
                    warf_name=file_data['name'],
                    warf_type=file_data['type'],
                    warf_path=f"ar/{file_data['name']}"
                )
                url = upload_to_storage(file_data, 'report-bucket', 'war')
                file.warf_url = url
                instances.append(file)


class WARFileDeleteView(generics.DestroyAPIView):
    serializer_class = WARFileBaseSerializer
    queryset = WARFile.objects.all()
    lookup_field = 'warf_id'


class WARUpdateView(generics.UpdateAPIView):
    serializer_class = WARBaseSerializer
    queryset = WeeklyAccomplishmentReport.objects.all()
    lookup_field = 'war_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)

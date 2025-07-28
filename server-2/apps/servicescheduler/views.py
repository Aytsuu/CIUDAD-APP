from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import ServiceSchedulerCreateSerializer
from .models import ServiceScheduler


# Create your views here.
class ServiceSchedulerCreateView(generics.ListCreateAPIView):
   serializer_class = ServiceSchedulerCreateSerializer
   queryset = ServiceScheduler.objects.all()

   def create(self, request, *args, **kwargs):
      serializer = self.get_serializer(data=request.data)
      serializer.is_valid(raise_exception=True)
      instance = serializer.save()
      
      return Response({
         'ss_id': instance.ss_id
      }, status=status.HTTP_201_CREATED)
   

# class ServiceSchedulerDetailView(generics.RetrieveUpdateDestroyAPIView):
#    serializer_class = ServiceSchedulerCreateSerializer
#    queryset = ServiceScheduler.objects.all()
#    lookup_field = 'ss_id'
   

class ServiceSchedulerListView(generics.ListAPIView):
   serializer_class = ServiceSchedulerCreateSerializer
   queryset = ServiceScheduler.objects.all()
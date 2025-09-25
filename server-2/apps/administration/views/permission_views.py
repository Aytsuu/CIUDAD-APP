# from rest_framework import generics, status
# from rest_framework.response import Response
# from ..models import Permission
# from ..serializers.permission_serializers import *

# class PermissionView(generics.ListCreateAPIView):
#     serializer_class = PermissionBaseSerializer
#     queryset = Permission.objects.all()

# class PermissionUpdateView(generics.RetrieveUpdateAPIView):
#     serializer_class = PermissionBaseSerializer
#     queryset = Permission.objects.all()
#     lookup_field = 'assi'
    
#     def update(self, request, *args, **kwargs):
#         instance = self.get_object()
#         serializer = self.get_serializer(instance, data=request.data, partial=True)
#         if serializer.is_valid():
#             serializer.save()   
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

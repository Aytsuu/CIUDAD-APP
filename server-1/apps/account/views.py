from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import UserAccountSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Account

class UserAccountListView(generics.ListAPIView):
    queryset = Account.objects.all()
    serializer_class = UserAccountSerializer

class UserAccountDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Account.objects.all()
    serializer_class = UserAccountSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class ListOfExistingEmail(APIView):
    def get(self, request, *args, **kwargs):
        accounts = Account.objects.all()
        return  Response([acc.email for acc in accounts])
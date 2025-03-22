from rest_framework import generics
from .models import UserAccount
from .serializers import UserAccountSerializer

# View for listing and creating UserAccount objects
class UserAccountListCreateView(generics.ListCreateAPIView):
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountSerializer

# View for retrieving, updating, and deleting UserAccount objects
class UserAccountRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = UserAccount.objects.all()
    serializer_class = UserAccountSerializer
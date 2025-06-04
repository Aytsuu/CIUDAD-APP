from rest_framework import generics, permissions
from .models import Complaint
from .serializers import ComplaintSerializer

class ComplaintCreateView(generics.CreateAPIView):

    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        complaint = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ComplaintListView(generics.ListAPIView):

    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Complaint.objects.all().order_by('-comp_created_at')

class ComplaintDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Complaint.objects.all()
    serializer_class = ComplaintSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'comp_id'

    def perform_update(self, serializer):
        serializer.save()
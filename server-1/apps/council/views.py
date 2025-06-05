# council/views.py (unchanged)
from rest_framework import generics
from .serializers import *

class CouncilSchedulingView(generics.ListCreateAPIView):
    serializer_class = CouncilSchedulingSerializer
    queryset = CouncilScheduling.objects.all()

class CouncilSchedulingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouncilSchedulingSerializer
    queryset = CouncilScheduling.objects.all()
    lookup_field = 'ce_id'

class AttendeesView(generics.ListCreateAPIView):
    serializer_class = CouncilAttendeesSerializer
    queryset = CouncilAttendees.objects.all()

class AttendeesDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouncilAttendeesSerializer
    queryset = CouncilAttendees.objects.all()
    lookup_field = 'atn_id'

class AttendanceView(generics.ListCreateAPIView):
    serializer_class = CouncilAttendanceSerializer
    queryset = CouncilAttendance.objects.all()

class AttendanceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CouncilAttendanceSerializer
    queryset = CouncilAttendance.objects.all()
    lookup_field = 'att_id'

Staff = apps.get_model('administration', 'Staff')
class StaffListView(generics.ListAPIView):
    queryset = Staff.objects.select_related('rp__per').only(
        'staff_id',
        'rp__per__per_fname',
        'rp__per__per_lname'
    )
    serializer_class = StaffSerializer
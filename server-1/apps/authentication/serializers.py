from rest_framework import serializers
from apps.account.models import Account
from apps.profiling.serializers.resident_profile_serializers import ResidentProfileFullSerializer
from apps.administration.serializers.staff_serializers import StaffFullSerializer
from apps.administration.serializers.assignment_serializers import AssignmentBaseSerializer
from apps.administration.models import Staff, Assignment


class UserAccountSerializer(serializers.ModelSerializer):
    resident = ResidentProfileFullSerializer(source='rp', read_only=True)
    staff = serializers.SerializerMethodField()
    # assignment = serializers.SerializerMethodField()
    
    class Meta:
        model = Account
        fields = [
            'acc_id',
            'supabase_id',
            'username',
            'email',
            'profile_image',
            'resident',
            'staff',
            'br_id',
        ]
        read_only_fields = ['acc_id', 'supabase_id']

    def get_staff(self, obj):
        # Check if account has a resident profile
        rp = getattr(obj, 'rp', None)
        if not rp:
            return None

        # Check if resident profile is associated with any staff record
        staff_record = Staff.objects.filter(staff_id=rp.rp_id).first()
        if not staff_record:
            return None

        # Check if staff has assignments
        has_assignments = Assignment.objects.filter(staff=staff_record).exists()
        # Check if staff has a position
        has_position = staff_record.pos is not None

        if has_assignments and has_position:
            return StaffFullSerializer(staff_record).data

        return None

        
class AuthResponseSerializer(serializers.Serializer):
    acc_id = serializers.IntegerField()
    supabase_id = serializers.CharField()
    username = serializers.CharField()
    email = serializers.EmailField()
    profile_image = serializers.URLField(
        allow_null=True,
        required=False,
        default=None
    )
    resident = ResidentProfileFullSerializer(
        required=False,
        allow_null=True
    )
    staff = serializers.DictField(
        required=False,
        allow_null=True
    )
from rest_framework import serializers
from apps.account.models import Account
from apps.administration.models import *
from apps.profiling.serializers.full import ResidentProfileFullSerializer
from apps.administration.serializers.staff_serializers import StaffFullSerializer, StaffBaseSerializer
from apps.administration.models import Staff

class UserAccountSerializer(serializers.ModelSerializer):
    resident = ResidentProfileFullSerializer(source='rp', read_only=True)
    staff = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = [
            'acc_id',
            'supabase_id',
            'username',
            'email',
            'profile_image',
            'resident',
            'staff'
        ]
        read_only_fields = ['acc_id', 'supabase_id']

    def get_staff(self, obj):
        """
        Get staff profile information through the resident profile.
        """

        # Check if account has a resident profile
        if hasattr(obj, 'rp') or obj.rp:
            # Check if resident profile has staff relationship
            is_staff = Staff.objects.filter(staff_id=obj.rp.rp_id).first()

            if is_staff:
                return StaffFullSerializer(is_staff).data
        
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
    resident_profile = ResidentProfileFullSerializer(
        required=False,
        allow_null=True
    )
    staff_profile = serializers.DictField(
        required=False,
        allow_null=True
    )
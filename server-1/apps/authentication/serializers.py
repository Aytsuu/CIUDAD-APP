from rest_framework import serializers
from apps.account.models import Account
from apps.profiling.serializers.full import ResidentProfileFullSerializer
from apps.administration.serializers.staff_serializers import StaffFullSerializer
from apps.administration.models import Staff

class UserAccountSerializer(serializers.ModelSerializer):
    resident_profile = ResidentProfileFullSerializer(source='rp', read_only=True)
    staff_profile = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = [
            'acc_id',
            'supabase_id',
            'username',
            'email',
            'profile_image',
            'resident_profile',
            'staff_profile'
        ]
        read_only_fields = ['acc_id', 'supabase_id']

    def get_staff_profile(self, obj):
        # Check if account has a resident profile
        if hasattr(obj, 'rp') or obj.rp:
            is_staff = Staff.object.filter(staff_id=obj.rp.staff_id).first()
            if is_staff:
                return is_staff
            return None
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
    resident_profile = ResidentProfileFullSerializer(
        required=False,
        allow_null=True
    )
    staff_profile = serializers.DictField(
        required=False,
        allow_null=True
    )
from rest_framework import serializers
from apps.account.models import Account
from apps.profiling.serializers.full import ResidentProfileFullSerializer
from apps.administration.serializers.staff_serializers import StaffFullSerializer

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
        """
        Get staff profile information through the resident profile.
        This assumes your ResidentProfile model has a ForeignKey or OneToOneField to Staff.
        """
        # Check if account has a resident profile
        if not hasattr(obj, 'rp') or not obj.rp:
            return None
            
        # Check if resident profile has staff relationship
        if hasattr(obj.rp, 'staff') and obj.rp.staff:
            return StaffFullSerializer(obj.rp.staff).data
            
        # If using a direct staff_id field (alternative approach)
        if hasattr(obj.rp, 'staff_id') and obj.rp.staff_id:
            from apps.administration.models import Staff
            try:
                staff = Staff.objects.get(id=obj.rp.staff_id)
                return StaffFullSerializer(staff).data
            except Staff.DoesNotExist:
                pass
                
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
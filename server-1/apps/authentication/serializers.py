from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
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
        Safely get staff profile information through the resident profile.
        Uses the actual staff relationship field name from your model.
        """
        # First check if the account has a resident profile
        if not hasattr(obj, 'rp') or not obj.rp:
            return None
            
        # Now check for staff relationship - using the correct field name
        if hasattr(obj.rp, 'staff') and obj.rp.staff:
            return StaffFullSerializer(obj.rp.staff).data
            
        # Alternative lookup if staff is not directly related
        try:
            from apps.administration.models import Staff
            # Use the correct lookup field - change 'staff_id' to your actual field name
            staff = Staff.objects.filter(id=obj.rp.staff_id).first()
            if staff:
                return StaffFullSerializer(staff).data
        except Exception:
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
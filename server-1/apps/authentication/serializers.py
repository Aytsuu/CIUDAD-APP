from rest_framework import serializers
from apps.account.models import Account
from apps.profiling.serializers.resident_profile_serializers import ResidentProfileFullSerializer
from apps.administration.serializers.staff_serializers import StaffFullSerializer
from apps.administration.serializers.assignment_serializers import AssignmentBaseSerializer
from apps.administration.serializers.feature_serializers import FeatureBaseSerializer
from apps.administration.models import Staff, Assignment, Feature, Position

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
            'staff',
            'br_id',
        ]
        read_only_fields = ['acc_id', 'supabase_id']

    def get_staff(self, obj):
        rp = getattr(obj, 'rp', None)
        if not rp:
            return None

        # Check if resident profile is associated with any staff record
        staff_record = Staff.objects.filter(staff_id=rp.rp_id).first()
        if not staff_record:
            return None

        # Get staff position
        staff_position = staff_record.pos
        if not staff_position:
            return None

        # Check if the staff position is admin
        if staff_position.pos_title == 'Admin':
            # Admin gets all features
            features = Feature.objects.all()
        else:
            # For non-admin, check assignments based on position
            # First, check if there are direct staff assignments
            staff_assignments = Assignment.objects.filter(staff=staff_record)
            
            if staff_assignments.exists():
                # Use staff-specific assignments
                feature_ids = staff_assignments.values_list('feat_id', flat=True)
                features = Feature.objects.filter(feat_id__in=feature_ids)
            else:
                # Check position-based assignments
                position_assignments = Assignment.objects.filter(pos=staff_position)
                if position_assignments.exists():
                    feature_ids = position_assignments.values_list('feat_id', flat=True)
                    features = Feature.objects.filter(feat_id__in=feature_ids)
                else:
                    # No assignments found
                    features = Feature.objects.none()

        # Serialize staff data
        staff_data = StaffFullSerializer(staff_record).data
        
        # Add features to staff data
        staff_data['features'] = FeatureBaseSerializer(features, many=True).data
        
        return staff_data

        
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
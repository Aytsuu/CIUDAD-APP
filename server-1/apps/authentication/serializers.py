from rest_framework import serializers
from apps.account.models import Account
from django.contrib.auth import authenticate
from apps.profiling.serializers.resident_profile_serializers import ResidentProfileFullSerializer
from apps.administration.serializers.staff_serializers import StaffAccountSerializer
from apps.administration.models import Staff
from apps.profiling.models import RequestRegistrationComposition
from apps.profiling.serializers.personal_serializers import PersonalBaseSerializer
from apps.profiling.serializers.business_serializers import BusinessRespondentBaseSerializer
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer  
from django.http import JsonResponse

User = get_user_model()

class UserAccountSerializer(serializers.ModelSerializer):
    staff = serializers.SerializerMethodField()
    personal = serializers.SerializerMethodField()
    req = serializers.SerializerMethodField()
    
    class Meta:
        model = Account
        fields = [
            'acc_id',
            'email',
            'phone',
            'profile_image',
            'personal',
            'rp',
            'br',
            'staff',
            'req',
        ]


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

        # Serialize staff data
        staff_data = StaffAccountSerializer(staff_record).data
        return staff_data

    def get_personal(self, obj):
        personal = None
        if obj.rp :
            personal = PersonalBaseSerializer(obj.rp.per).data
        elif obj.br:
            personal = BusinessRespondentBaseSerializer(obj.br).data
        else:
            req = RequestRegistrationComposition.objects.filter(acc=obj.acc_id).first()
            personal = PersonalBaseSerializer(req.per).data
        return personal

    def get_req(self, obj):
        request = RequestRegistrationComposition.objects.filter(acc=obj.acc_id).first()
        return request.req.req_id if request and request.req else None
        
class AuthResponseSerializer(serializers.Serializer):
    acc_id = serializers.IntegerField()
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
    
    
class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"  # tell JWT to use email

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if email and password:
            user = authenticate(request=self.context.get("request"), email=email, password=password)

            if not user:
                raise serializers.ValidationError("Invalid email or password")

        refresh = self.get_token(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.acc_id,
                "email": user.email,
                "username": user.username,
            }
        }
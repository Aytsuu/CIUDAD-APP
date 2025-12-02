from rest_framework import serializers
from .models import ActivityLog
from apps.account.models import Account

class ActivityLogSerializer(serializers.ModelSerializer):
    staff_name = serializers.SerializerMethodField()
    staff_profile_image = serializers.SerializerMethodField()
    
    class Meta:
        model = ActivityLog
        fields = '__all__'
    
    def get_staff_name(self, obj):
        """Get the full name of the staff member"""
        if obj.staff and obj.staff.rp and obj.staff.rp.per:
            personal = obj.staff.rp.per
            name_parts = [personal.per_lname, personal.per_fname]
            if personal.per_mname:
                name_parts.append(personal.per_mname)
            if personal.per_suffix:
                name_parts.append(personal.per_suffix)
            return ', '.join(name_parts)
        return f"Staff #{obj.staff.staff_id if obj.staff else 'Unknown'}"
    
    def get_staff_profile_image(self, obj):
        """Get the profile image of the staff member"""
        if obj.staff and obj.staff.rp:
            account = Account.objects.filter(rp=obj.staff.rp).first()
            return account.profile_image if account and account.profile_image else None
        return None 
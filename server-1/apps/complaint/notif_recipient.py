from django.db.models import Q
from apps.administration.models import Assignment, Staff, Position, Feature

def general_recipients(is_brgy_staff, staff_id):
    # General recipients for notification - staff assigned to COMPLAINT feature
    recipients = []
    
    # Get staff assigned to COMPLAINT feature with BARANGAY STAFF type
    assignments = Assignment.objects.filter(
        Q(feat__feat_name="COMPLAINT") & 
        Q(staff__staff_type='BARANGAY STAFF') & 
        ~Q(staff=staff_id)
    ).select_related('staff', 'staff__rp')
    
    for assignment in assignments:
        if assignment.staff.rp:  # Ensure staff has resident profile
            recipients.append(assignment.staff.rp)
    
    # Get ADMIN staff with BARANGAY STAFF type
    admins = Staff.objects.filter(
        Q(pos__pos_title="ADMIN") & 
        Q(staff_type='BARANGAY STAFF') & 
        ~Q(staff_id=staff_id)
    ).select_related('rp')
    
    for admin in admins:
        if admin.rp and admin.rp not in recipients:  # Avoid duplicates
            recipients.append(admin.rp)
    
    return recipients

def specific_position_recipients(position_title, staff_category='BARANGAY STAFF'):
    # Specific group of staff with a particular position
    staff_members = Staff.objects.filter(
        Q(pos__pos_title=position_title) & 
        Q(staff_type=staff_category)
    ).select_related('rp')
    
    return [staff.rp for staff in staff_members if staff.rp]

def get_notification_recipients(recipient_type, **kwargs):
    if recipient_type == 'general':
        return general_recipients(
            kwargs.get('is_brgy_staff', True), 
            kwargs.get('staff_id')
        )
    elif recipient_type == 'position':
        return specific_position_recipients(
            kwargs.get('position_title'),
            kwargs.get('staff_category', 'BARANGAY STAFF')
        )
    else:
        return []
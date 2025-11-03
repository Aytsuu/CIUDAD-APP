from .models import *
from django.db.models import Q
from apps.healthProfiling.models import FamilyComposition, PersonalAddress
from apps.patientrecords.models import Transient
from datetime import date, timedelta
from django.db import IntegrityError
from utils.create_notification import NotificationQueries
from apps.administration.models import Staff
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

def get_medcon_record_count(pat_id):
    return MedicalConsultation_Record.objects.filter(patrec_id__pat_id=pat_id, medrec_status='completed').count()


def get_patient_parents_info(pat_obj):
    """Get parents information for a patient - reusable function"""
    parents = {}
    
    if pat_obj.pat_type == 'Resident' and pat_obj.rp_id:
        try:
            current_composition = FamilyComposition.objects.filter(
                rp=pat_obj.rp_id
            ).order_by('-fam_id__fam_date_registered', '-fc_id').first()
            
            if current_composition:
                fam_id = current_composition.fam_id
                family_compositions = FamilyComposition.objects.filter(
                    fam_id=fam_id
                ).select_related('rp', 'rp__per')
                
                for composition in family_compositions:
                    role = composition.fc_role.lower()
                    if role in ['mother', 'father'] and composition.rp and hasattr(composition.rp, 'per'):
                        personal = composition.rp.per
                        parents[role] = f"{personal.per_fname} {personal.per_mname} {personal.per_lname}"
        except Exception as e:
            print(f"Error fetching parents info for resident {pat_obj.rp_id.rp_id}: {str(e)}")
    
    elif pat_obj.pat_type == 'Transient' and pat_obj.trans_id:
        trans = pat_obj.trans_id
        if hasattr(trans, 'mother_fname') and (trans.mother_fname or trans.mother_lname):
            parents['mother'] = f"{trans.mother_fname or ''} {trans.mother_mname or ''} {trans.mother_lname or ''}".strip()
        
        if hasattr(trans, 'father_fname') and (trans.father_fname or trans.father_lname):
            parents['father'] = f"{trans.father_fname or ''} {trans.father_mname or ''} {trans.father_lname or ''}".strip()
    
    return parents

def get_patient_address_and_sitio(pat_obj):
    """Get address and sitio information for a patient - reusable function"""
    address = "N/A"
    sitio = "N/A"
    
    try:
        if pat_obj.pat_type == 'Resident' and pat_obj.rp_id and hasattr(pat_obj.rp_id, 'per'):
            per = pat_obj.rp_id.per
            personal_address = PersonalAddress.objects.filter(
                per=per
            ).select_related('add', 'add__sitio').first()
            
            if personal_address and personal_address.add:
                address = personal_address.add.add_street or "N/A"
                if personal_address.add.sitio:
                    sitio = personal_address.add.sitio.sitio_name or "N/A"
        
        elif pat_obj.pat_type == 'Transient' and pat_obj.trans_id:
            trans = pat_obj.trans_id
            if hasattr(trans, 'tradd_id') and trans.tradd_id:
                address = trans.tradd_id.tradd_street or "N/A"
                sitio = trans.tradd_id.tradd_sitio or "N/A" 
    
    except Exception as e:
        print(f"Error fetching address for patient {pat_obj.pat_id}: {str(e)}")
    
    return address, sitio

def apply_patient_search_filter(queryset, search_query):
    """Reusable search filter for patients with multiple term support"""
    search_terms = [term.strip() for term in search_query.split(',') if term.strip()]
    if not search_terms:
        return queryset
    
    combined_query = Q()
    
    for term in search_terms:
        term_query = Q()
        
        # Search by patient name (both resident and transient)
        term_query |= (
            Q(rp_id__per__per_fname__icontains=term) |
            Q(rp_id__per__per_mname__icontains=term) |
            Q(rp_id__per__per_lname__icontains=term) |
            Q(trans_id__tran_fname__icontains=term) |
            Q(trans_id__tran_mname__icontains=term) |
            Q(trans_id__tran_lname__icontains=term)
        )
        
        # Search by patient ID, resident profile ID, and transient ID
        term_query |= (
            Q(pat_id__icontains=term) |
            Q(rp_id__rp_id__icontains=term) |
            Q(trans_id__trans_id__icontains=term)
        )
        
        # Search by address for residents (direct relationship query - more efficient)
        term_query |= (
            Q(rp_id__per__personal_addresses__add__add_external_sitio__icontains=term) |
            Q(rp_id__per__personal_addresses__add__add_province__icontains=term) |
            Q(rp_id__per__personal_addresses__add__add_city__icontains=term) |
            Q(rp_id__per__personal_addresses__add__add_street__icontains=term) |
            Q(rp_id__per__personal_addresses__add__sitio__sitio_name__icontains=term)
        )
        
        # Search by address for transients (direct relationship query - more efficient)
        term_query |= (
            Q(trans_id__tradd_id__tradd_sitio__icontains=term) |
            Q(trans_id__tradd_id__tradd_street__icontains=term) |
            Q(trans_id__tradd_id__tradd_barangay__icontains=term) |
            Q(trans_id__tradd_id__tradd_province__icontains=term) |
            Q(trans_id__tradd_id__tradd_city__icontains=term)
        )
        
        # Add this term's query to the combined OR query
        combined_query |= term_query
    
    return queryset.filter(combined_query).distinct()

def apply_patient_type_filter(queryset, patient_type):
    """Reusable patient type filter"""
    search_terms = [term.strip().lower() for term in patient_type.split(',') if term.strip()]
    if not search_terms:
        return queryset    
    type_query = Q()
    for term in search_terms:
        if term in ['resident', 'transient']:
            type_query |= Q(pat_type__iexact=term)
    
    return queryset.filter(type_query) if type_query else queryset



def create_future_date_slots(days_in_advance=60):
    today = date.today() 
    slots_created = 0
    
    for i in range(days_in_advance):
        target_date = today + timedelta(days=i)
        
        try:
            # Only create if it doesn't exist (get_or_create)
            _, created = DateSlot.objects.get_or_create(
                date=target_date,
                defaults={'am_max_slots': 10, 'pm_max_slots': 10}
            )
            if created:
                slots_created += 1
        except IntegrityError:
            pass 
        except Exception as e:
            pass
        
        


def _get_resident_name_and_rp_id(rp):
    name = "Resident"
    rp_id = None
    if rp and rp.per:
        name = f"{rp.per.per_fname or ''} {rp.per.per_lname or ''}".strip()
        rp_id = str(rp.rp_id)
    return name, rp_id


def _medical_staff_rp_ids():
    staff = Staff.objects.filter(
        pos__pos_title__in=['ADMIN', 'DOCTOR', 'BARANGAY HEALTH WORKER', 'MIDWIFE', 'NURSE']
    ).select_related('rp')
    return [str(s.rp.rp_id) for s in staff if s.rp and s.rp.rp_id]

def send_appointment_status_notifications(appointment, status: str):
    notifier = NotificationQueries()
    resident_rp = appointment.rp
    resident_name, resident_rp_id = _get_resident_name_and_rp_id(resident_rp)

    scheduled = appointment.scheduled_date.strftime("%B %d, %Y")
    meridiem = appointment.meridiem
    complaint = appointment.chief_complaint or "Medical Consultation"
    reason = appointment.archive_reason or ""
    app_id = str(appointment.id)
    staff_recipients = _medical_staff_rp_ids()

    # ----------- RESIDENT ----------
    if resident_rp_id:
        if status == "missed":
            title = "Missed Appointment"
            message = (
                f"You missed your appointment on {scheduled} ({meridiem}).\n"
                f"Chief Complaint: {complaint}\n"
                "Please reschedule if needed."
            )
            notif_type = "APPOINTMENT_MISSED"
            
        elif status == "rejected":
            title = "Appointment Request Rejected"
            message = (
                f"Your appointment request has been rejected\n"
                f"Reason: {reason}\n"
            )
            notif_type = "APPOINTMENT_REJECTED"
        
        elif status == "confirmed":
            title = "Appointment Request Approved"
            message = (
                f"Your appointment request has been confirmed by Health Center\n"
                f"See you on {scheduled}"
            )
            notif_type = "APPOINTMENT_CONFIRMED"
            
        elif status == "referred":
            title = "Appointment Request Reffered"
            message = (
                f"Your appointment request has been referred\n"
                f"Reason: {reason}\n"
            )
            notif_type = "APPOINTMENT_REFERRED"
            
        else:
            title = "Appointment Cancelled"
            message = (
                f"Your appointment on {scheduled} ({meridiem}) was cancelled.\n"
                f"Reason: {reason}\n"
                f"Chief Complaint: {complaint}"
            )
            notif_type = "APPOINTMENT_CANCELLED"

        notifier.create_notification(
            title=title,
            message=message,
            recipients=[resident_rp_id],
            notif_type=notif_type,
            web_route="/services/medical-consultation/appointments/missed/cancelled",
            web_params={},
            mobile_route="/(health)/medconsultation/my-medappointments",
            mobile_params={},
        )

    # ----------- STAFF ----------
    if staff_recipients:
        if status == "missed":
            admin_title = "Patient Missed Appointment"
            admin_msg = (
                f"{resident_name} missed their appointment.\n"
                f"Date: {scheduled} ({meridiem})\n"
                f"Complaint: {complaint}\n"
                f"ID: {app_id}"
            )
            admin_type = "APPOINTMENT_MISSED_ADMIN"
            admin_web = "/services/medical-consultation/appointments/missed"
        else:
            admin_title = "Appointment Cancelled"
            admin_msg = (
                f"{resident_name} cancelled their appointment.\n"
                f"Date: {scheduled} ({meridiem})\n"
                f"Reason: {appointment.archive_reason or '–'}\n"
                f"Complaint: {complaint}\n"
                f"ID: {app_id}"
            )
            admin_type = "APPOINTMENT_CANCELLED_ADMIN"
            admin_web = "/services/medical-consultation/appointments/cancelled"

        notifier.create_notification(
            title=admin_title,
            message=admin_msg,
            recipients=staff_recipients,
            notif_type=admin_type,
            web_route=admin_web,
            web_params={},
            mobile_route="/(admin)/appointments",
            mobile_params={"focus_tab": "appointments"},
        )
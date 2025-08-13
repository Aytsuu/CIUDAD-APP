from .models import *


def get_medcon_record_count(pat_id):
    return MedicalConsultation_Record.objects.filter(patrec_id__pat_id=pat_id, medrec_status='completed').count()

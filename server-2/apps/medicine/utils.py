from .models import *

def get_medicine_record_count(pat_id):
    return MedicineRecord.objects.filter(patrec_id__pat_id=pat_id, status__in=["RECORDED", "Recorded"]).count()

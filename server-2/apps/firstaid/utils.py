from .models import  *


def get_firstaid_record_count(pat_id):
    return FirstAidRecord.objects.filter(patrec_id__pat_id=pat_id).count()


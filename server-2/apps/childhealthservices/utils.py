from .models import *

def get_childhealth_record_count(pat_id):
    return ChildHealthrecord.objects.filter(patrec_id__pat_id=pat_id).count()



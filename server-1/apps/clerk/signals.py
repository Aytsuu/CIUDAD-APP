from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import ServiceChargePaymentRequest, SummonCase


@receiver(post_save, sender=ServiceChargePaymentRequest)
def create_summon_case_on_payment(sender, instance, created, **kwargs):
    if instance.pay_status == 'Paid' and instance.comp_id:
        existing_summon_case = SummonCase.objects.filter(comp_id=instance.comp_id).first()
        
        if not existing_summon_case:
            year_suffix = timezone.now().year % 100
            
            try:
                existing_count = SummonCase.objects.filter(
                    sc_code__endswith=f"-{year_suffix:02d}"
                ).count()
            except Exception:
                existing_count = SummonCase.objects.count()
            
            seq = existing_count + 1
            sc_code = f"{seq:04d}-{year_suffix:02d}"
            
            try:
                SummonCase.objects.create(
                    sc_code=sc_code,
                    sc_mediation_status="Waiting for Schedule",
                    sc_conciliation_status=None,
                    sc_date_marked=None,
                    sc_reason=None,
                    comp_id=instance.comp_id
                )
                
            except Exception as e:
                pass

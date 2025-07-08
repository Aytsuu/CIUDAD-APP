from django.db import models
from datetime import date
from django.conf import settings
import uuid

class OnlineDonation(models.Model):
    PAYMENT_CHOICES = [
        ('gcash', 'GCash'),
        ('card', 'Credit/Debit Card'),
    ]

    od_transaction_id = models.CharField(max_length=100, unique=True)
    od_amount = models.DecimalField(max_digits=10, decimal_places=2)
    od_payment_channel = models.CharField(max_length=20, choices=PAYMENT_CHOICES)

    account = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    od_date_created = models.DateTimeField(auto_now_add=True)
    od_payment_details = models.JSONField()

    class Meta:
        db_table = 'online_donation'

class Donation(models.Model):
    don_num = models.CharField(primary_key=True, unique=True)
    
    def save(self, *args, **kwargs):
        if not self.don_num:  # If no ID provided
            if self.od_transaction:  # PayMongo case
                self.don_num = self.od_transaction.od_transaction_id
            else:  # Manual donation case
                self.don_num = f"DON-{uuid.uuid4().hex[:10].upper()}"
        super().save(*args, **kwargs)

    od_transaction = models.OneToOneField(
        OnlineDonation,
        on_delete=models.CASCADE,
        related_name='donation',
        null=True,
        blank=True,
        db_column='od_transaction_id'
    )
    don_item_name = models.CharField(max_length=100, default='')
    don_donor = models.CharField(max_length=100, default='Anonymous')
    don_qty = models.IntegerField(default=1)
    don_description = models.CharField(max_length=200, null=True, blank=True)
    don_category = models.CharField(max_length=100, default='')
    don_date = models.DateField(default=date.today)

    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'donation'
    
    per_id = models.ForeignKey( #for name searching, staff-side
        'profiling.Personal',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='per_id'
    )
    
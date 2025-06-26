from django.db import models
from datetime import date
from django.core.validators import MaxValueValidator
from django.core.validators import MaxValueValidator

# Create your models here.
# create models para as documets later
class ClerkCertificate(models.Model):
    cr_id = models.CharField(max_length=10, primary_key=True)
    req_pay_method = models.CharField(max_length=50)
    req_request_date = models.DateField()
    req_claim_date = models.DateField()
    req_transac_id = models.CharField(max_length=100, default='None')
    # req_bsnss_name = models.CharField(max_length=100, default='None')
    # req_bsnss_address = models.CharField(max_length=200, default='None')
    req_type = models.CharField(max_length=100, default='None')
    # req_sales_proof = models.CharField(max_length=100, default='None')
    req_status = models.CharField(max_length=100, default='None')
    req_payment_status = models.CharField(max_length=100, default='None')
    pr_id = models.ForeignKey('treasurer.Purpose_And_Rates', on_delete=models.CASCADE, db_column='pr_id', related_name='certificates', null=True)
    ra_id = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, db_column='ra_id', related_name='ra_certificates', null=True)
    rp_id = models.ForeignKey('profiling.ResidentProfile', on_delete=models.CASCADE, db_column='rp_id')

    class Meta:
        db_table = 'certification_request'

class ClerkBusinessPermit(models.Model):
    busi_req_no = models.CharField(max_length=10, primary_key=True)
    busi_name = models.CharField(max_length=50)
    busi_add = models.CharField(max_length=50)
    busi_gross_sale = models.DecimalField(max_digits=10, decimal_places=2)
    busi_pay_method = models.CharField(max_length=20, choices=[('Cash', 'Cash'), ('Card', 'Card'), ('Online', 'Online')])
    busi_date_req = models.DateField()
    busi_date_claim = models.DateField()
    
    class Meta:
        db_table = 'clerk_business_permit'

class DocumentsPDF(models.Model):
    # pdf_file = models.FileField(upload_to='template/')  
    pdf_url = models.URLField(blank=True, null=True)  

    class Meta:
        db_table = 'clerk_pdf_documents'

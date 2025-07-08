from django.db import models
from django.utils import timezone
from datetime import datetime


# Create your models here.
# create models para as documets later
class ClerkCertificate(models.Model):
    cr_id = models.CharField(max_length=10, primary_key=True)
    req_pay_method = models.CharField(max_length=50)
    req_request_date = models.DateField()
    req_claim_date = models.DateField()
    req_transac_id = models.CharField(max_length=100, default='None')
    req_type = models.CharField(max_length=100)
    req_status = models.CharField(max_length=100, default='Pending')
    req_payment_status = models.CharField(max_length=100, default='Unpaid')
    pr_id = models.ForeignKey('treasurer.purpose_and_rate', on_delete=models.CASCADE, db_column='pr_id', related_name='certificates', null=True)
    ra_id = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, db_column='ra_id', related_name='ra_certificates', null=True)
    staff_id = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, db_column='staff_id', related_name='staff_certificates', null=True)
    rp = models.ForeignKey('profiling.ResidentProfile', on_delete=models.CASCADE)

    class Meta:
        db_table = 'certification_request'

class Invoice(models.Model):
    inv_num = models.CharField(max_length=50, primary_key=True)
    inv_serial_num = models.CharField(max_length=100)
    inv_date = models.CharField(max_length=20, default='Pending')
    inv_amount = models.DecimalField(max_digits=10, decimal_places=2)
    inv_nat_of_collection = models.DateTimeField(auto_now_add=True)
    cr_id = models.ForeignKey(ClerkCertificate, on_delete=models.CASCADE, related_name='clerk_invoices', db_column='cr_id', )
    
    class Meta:
        db_table = 'invoice'
        managed = False

class Business(models.Model):
    bus_id = models.BigIntegerField(primary_key=True)
    bus_name = models.CharField(max_length=100)
    bus_gross_sales = models.DecimalField(max_digits=10, decimal_places=2)
    bus_province = models.CharField(max_length=100)
    bus_city = models.CharField(max_length=100)
    bus_barangay = models.CharField(max_length=100)
    bus_street = models.CharField(max_length=100)
    bus_respondentLname = models.CharField(max_length=100)
    bus_respondentFname = models.CharField(max_length=100)
    bus_respondentMname = models.CharField(max_length=100)
    bus_respondentSex = models.CharField(max_length=100)
    bus_respondentDob = models.DateField()
    bus_date_registered = models.DateField()
    sitio_id = models.CharField(max_length=100)  
    staff_id = models.CharField(max_length=50) 

    class Meta:
        db_table = 'business'
        managed = False  # This tells Django that this table is managed externally

class BusinessPermitRequest(models.Model):
    bpr_id = models.CharField(max_length=10, primary_key=True)
    req_pay_method = models.CharField(max_length=50)
    req_request_date = models.DateField()
    req_claim_date = models.DateField()
    req_transac_id = models.CharField(max_length=100, default='None')
    req_sales_proof = models.CharField(max_length=100)
    req_status = models.CharField(max_length=100, default='Pending')
    req_payment_status = models.CharField(max_length=100, default='Unpaid')
    business = models.ForeignKey(Business, on_delete=models.CASCADE, db_column='bus_id', related_name='permit_requests')
    ags_id = models.ForeignKey('treasurer.annual_gross_sales', on_delete=models.CASCADE, db_column='ags_id', related_name='business_permits', null=True)
    pr_id = models.ForeignKey('treasurer.purpose_and_rate', on_delete=models.CASCADE, db_column='pr_id', related_name='business_permits', null=True)
    ra_id = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, db_column='ra_id', related_name='ra_business_permits', null=True)
    staff_id = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, db_column='staff_id', related_name='staff_business_permits', null=True)

    class Meta:
        db_table = 'business_permit_request'

class IssuedCertificate(models.Model):
    ic_id = models.CharField(max_length=10, primary_key=True)
    ic_date_of_issuance = models.DateField()
    file = models.ForeignKey('file.File', on_delete=models.CASCADE)
    certificate = models.ForeignKey(ClerkCertificate, on_delete=models.CASCADE, db_column='cr_id')
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE)

    class Meta:
        db_table = 'issued_certificate'

class IssuedBusinessPermit(models.Model):
    ibp_id = models.CharField(max_length=10, primary_key=True)
    ibp_date_of_issuance = models.DateField()
    file = models.ForeignKey('file.File', on_delete=models.CASCADE)
    permit_request = models.ForeignKey(BusinessPermitRequest, on_delete=models.CASCADE, db_column='bpr_id')
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE)

    class Meta:
        db_table = 'issued_business_permit'


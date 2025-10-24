from django.db import models
from django.utils import timezone
from datetime import datetime, date

def default_due_date():
    return timezone.now().date() + timezone.timedelta(days=7)
spay_due_date = models.DateField(default=default_due_date)

class ClerkCertificate(models.Model):
    cr_id = models.CharField(primary_key=True)
    cr_req_request_date = models.DateTimeField(default = datetime.now)
    cr_req_status = models.CharField(max_length=100, default='None')
    cr_req_payment_status = models.CharField(max_length=100, default='None')
    cr_date_completed = models.DateTimeField(null=True, blank=True)  
    cr_date_rejected = models.DateTimeField(null=True, blank = True)
    cr_reason = models.CharField(max_length = 500, default = 'None')

    pr_id = models.ForeignKey(
        'treasurer.Purpose_And_Rates', 
        on_delete=models.CASCADE, 
        db_column='pr_id', 
        related_name='certificates', 
        null=True
    )
    staff_id = models.ForeignKey(
        'administration.Staff', 
        on_delete=models.CASCADE, 
        db_column='staff_id', 
        null=True
    )
    rp_id = models.ForeignKey(
        'profiling.ResidentProfile', 
        on_delete=models.CASCADE, 
        db_column='rp_id'
    )

    class Meta:
        db_table = 'certification_request'
        managed = False

class NonResidentCertificateRequest(models.Model):
    nrc_id = models.CharField(primary_key=True, max_length=20)  # For formatted ID like NRC001-25
    nrc_req_date = models.DateTimeField(default = datetime.now)
    nrc_req_status = models.CharField(max_length=100, default = 'None')
    nrc_req_payment_status = models.CharField(max_length=100, default='None')
    nrc_pay_date = models.DateTimeField(null = True, blank = True)
    nrc_lname = models.CharField(max_length=500)
    nrc_fname = models.CharField(max_length=500)
    nrc_mname = models.CharField(max_length=500)
    nrc_address = models.CharField(max_length=500)
    nrc_birthdate = models.DateField(default=date.today)
    nrc_date_completed = models.DateTimeField(null=True, blank=True)
    nrc_date_rejected = models.DateTimeField(null=True, blank = True)
    nrc_reason = models.CharField(max_length = 500, default = 'None')
    nrc_discount_reason = models.TextField(default = 'None')
    pr_id = models.ForeignKey('treasurer.Purpose_And_Rates', on_delete=models.CASCADE, db_column='pr_id', related_name='nonresident_certificates', null=True)
    staff_id = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, db_column='staff_id', null=True)

    class Meta:
        db_table = 'nonresident_cert_req'
        managed = False
        
class IssuedCertificate(models.Model):
    ic_id = models.BigAutoField(primary_key=True)
    ic_date_of_issuance = models.DateField()
    certificate = models.ForeignKey(ClerkCertificate, on_delete=models.CASCADE, db_column='cr_id', null=True, blank = True)
    nonresidentcert = models.ForeignKey(NonResidentCertificateRequest, on_delete=models.CASCADE, db_column='nrc_id', null = True, blank = True)
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE)

    class Meta:
        db_table = 'issued_certificate'
        managed = False

# Business Models
class Business(models.Model):
    bus_id = models.CharField(primary_key=True, max_length=50)
    bus_name = models.CharField(max_length=255)
    bus_gross_sales = models.DecimalField(max_digits=10, decimal_places=2)
    bus_location = models.CharField(max_length=255)
    bus_status = models.CharField(max_length=50)
    bus_date_of_registration = models.DateField()
    bus_date_verified = models.DateField()
    staff_id = models.CharField(max_length=50, null=True)
    rp_id = models.CharField(max_length=50, null=True)
    br_id = models.CharField(max_length=50)

    class Meta:
        db_table = 'business'
        managed = False

class BusinessPermitRequest(models.Model):
    bpr_id = models.CharField(primary_key=True)
    req_request_date = models.DateField()
    req_status = models.CharField(max_length=100, default='Pending')
    req_date_completed = models.DateField(null=True, blank=True) 
    req_payment_status = models.CharField(max_length=100, default='Unpaid')
    req_amount = models.DecimalField(max_digits=10, decimal_places=2)
    ags_id = models.ForeignKey('treasurer.annual_gross_sales', on_delete=models.CASCADE, db_column='ags_id', related_name='business_permits', null=True)
    bus_id = models.ForeignKey('profiling.Business', on_delete=models.CASCADE, db_column='bus_id', related_name='permit_requests', null=True, blank=True)
    pr_id = models.ForeignKey('treasurer.Purpose_And_Rates', on_delete=models.CASCADE, db_column='pr_id', related_name='business_permits', null=True)
    staff_id = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, db_column='staff_id', related_name='staff_business_permits', null=True)
    rp_id = models.ForeignKey('profiling.ResidentProfile', on_delete=models.CASCADE, db_column='rp_id', null=True)
    bus_permit_name = models.CharField(max_length=255, null=True, blank=True)  # Add business name field
    bus_permit_address = models.CharField(max_length=500, null=True, blank=True)  # Add business address field
    bus_clearance_gross_sales = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)  # Add inputted gross sales field


    class Meta:
        db_table = 'business_permit_request'
        managed = False

class BusinessPermitFile(models.Model):
    bpf_id = models.BigAutoField(primary_key=True)
    bpf_type = models.CharField(max_length=100, null=True, blank=True)
    bpf_url = models.CharField(max_length=500)
    bpr_id = models.ForeignKey('BusinessPermitRequest', on_delete=models.CASCADE, null=True, related_name='permit_files', db_column='bpr_id')
    class Meta:
        db_table = 'business_permit_file'
        managed = True

class IssuedBusinessPermit(models.Model):
    ibp_id = models.CharField(max_length=10, primary_key=True)
    ibp_date_of_issuance = models.DateField()
    bpr_id = models.ForeignKey(BusinessPermitRequest, on_delete=models.CASCADE, db_column='bpr_id')
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE)

    class Meta:
        db_table = 'issued_business_permit'
        managed = False

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

# Document Models
class DocumentsPDF(models.Model):
    pdf_url = models.URLField(blank=True, null=True)  

    class Meta:
        db_table = 'clerk_pdf_documents'


# Service Charge Request Models

class SummonDateAvailability(models.Model):
    sd_id = models.BigAutoField(primary_key=True)
    sd_date = models.DateField(default=date.today)

    class Meta:
        db_table = 'summon_date_availability'
        managed = False

class SummonTimeAvailability(models.Model):
    st_id = models.BigAutoField(primary_key=True)
    st_start_time = models.TimeField()
    st_is_booked = models.BooleanField(default=False)
    sd_id = models.ForeignKey('SummonDateAvailability', on_delete=models.CASCADE, null=True, related_name='time_availability')

    class Meta:
        db_table = 'summon_time_availability'
        managed = False


class ServiceChargePaymentRequest(models.Model):
    pay_id = models.BigAutoField(primary_key=True)
    pay_sr_type = models.CharField(max_length=200)
    pay_status = models.CharField(max_length=200, default='Unpaid')
    pay_date_req = models.DateTimeField(default=datetime.now)
    pay_due_date = models.DateField(default = default_due_date())
    pay_req_status = models.CharField(max_length=200, default='Pending')
    pay_date_paid = models.DateTimeField(null = True, blank = True)
    comp_id = models.ForeignKey('complaint.Complaint', on_delete=models.SET_NULL, db_column='comp_id', null=True, related_name='service_charge_payments')
    pr_id = models.ForeignKey('treasurer.Purpose_And_Rates', on_delete = models.SET_NULL, db_column='pr_id', null = True, blank = True, related_name='payment_requests')

    class Meta:
        db_table = 'service_charge_payment_request'


class SummonCase(models.Model):
    sc_id = models.BigAutoField(primary_key=True)
    sc_code = models.CharField(max_length=200, unique=True)
    sc_mediation_status = models.CharField(max_length=500)
    sc_conciliation_status = models.CharField(max_length=500, null=True, blank=True)
    sc_date_marked = models.DateTimeField(null=True, blank=True)
    sc_reason = models.TextField(null=True, blank=True)
    comp_id = models.ForeignKey('complaint.Complaint', on_delete=models.SET_NULL, db_column='comp_id', null=True, related_name='summon_cases')

    class Meta:
        db_table = 'summon_case'
        managed = False


class HearingSchedule(models.Model):
    hs_id = models.BigAutoField(primary_key=True)
    hs_level = models.CharField(max_length=500)
    hs_is_closed = models.BooleanField(default=False)
    st_id = models.ForeignKey('SummonTimeAvailability', db_column='st_id', on_delete=models.SET_NULL, null = True, blank = True, related_name='hearing_schedules')
    sd_id = models.ForeignKey('SummonDateAvailability', db_column='sd_id', on_delete=models.SET_NULL, null = True, blank = True, related_name='hearing_schedules')
    sc_id = models.ForeignKey('SummonCase', db_column='sc_id', on_delete=models.SET_NULL, null = True, blank = True, related_name='hearing_schedules')

    class Meta:
        db_table = 'hearing_schedule'


class HearingMinutes(models.Model):
    hm_id = models.BigAutoField(primary_key=True)
    hm_name = models.CharField(max_length=255)
    hm_type = models.CharField(max_length=100, null=True, blank=True)
    hm_path = models.CharField(max_length=500, null=True, blank=True)
    hm_url = models.CharField(max_length=500)
    hs_id = models.ForeignKey('HearingSchedule', db_column='hs_id', on_delete=models.SET_NULL, null = True, blank = True, related_name='hearing_minutes')

    class Meta:
        db_table = 'hearing_minutes'


class Remark(models.Model):
    rem_id = models.BigAutoField(primary_key=True)
    rem_remarks = models.TextField()
    rem_date = models.DateTimeField(default = datetime.now)
    hs_id = models.OneToOneField('HearingSchedule', db_column='hs_id', on_delete=models.SET_NULL, null = True, blank = True, related_name='remark')

    class Meta:
        db_table = 'remark'


class RemarkSuppDocs(models.Model):
    rsd_id = models.BigAutoField(primary_key=True)
    rsd_name = models.CharField(max_length=255)
    rsd_type = models.CharField(max_length=100, null=True, blank=True)
    rsd_path = models.CharField(max_length=500, null=True, blank=True)
    rsd_url = models.CharField(max_length=500)
    rem_id = models.ForeignKey('Remark', db_column='rem_id', on_delete=models.SET_NULL, null = True, blank = True, related_name='supporting_documents')
    
    class Meta:
        db_table = 'remark_supp_docs'
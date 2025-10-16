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
    nrc_id = models.BigAutoField(primary_key=True)  
    nrc_req_date = models.DateTimeField(default = datetime.now)
    nrc_req_status = models.CharField(max_length=100, default = 'None')
    nrc_req_payment_status = models.CharField(max_length=100, default='None')
    nrc_pay_date = models.DateTimeField(null = True, blank = True)
    nrc_requester = models.CharField(max_length=500)
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
    bus_id = models.BigIntegerField(primary_key=True)
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
    req_sales_proof = models.CharField(max_length=100)
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

    # previous_permit_image = models.CharField(max_length=500, null=True, blank=True)
    # assessment_image = models.CharField(max_length=500, null=True, blank=True)
    class Meta:
        db_table = 'business_permit_request'
        managed = False

class BusinessPermitFile(models.Model):
    bpf_id = models.BigAutoField(primary_key=True)
    bpf_name = models.CharField(max_length=255)
    bpf_type = models.CharField(max_length=100, null=True, blank=True)
    bpf_path = models.CharField(max_length=500, null=True, blank=True)
    bpf_url = models.CharField(max_length=500)
    bpr_id = models.ForeignKey('BusinessPermitRequest', on_delete=models.CASCADE, null=True, related_name='permit_files', db_column='bpr_id')
    class Meta:
        db_table = 'business_permit_file'
        managed = False

class IssuedBusinessPermit(models.Model):
    ibp_id = models.CharField(max_length=10, primary_key=True)
    ibp_date_of_issuance = models.DateField()
    # file field removed - files are generated dynamically from templates
    permit_request = models.ForeignKey(BusinessPermitRequest, on_delete=models.CASCADE, db_column='bpr_id')
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE)

    class Meta:
        db_table = 'issued_business_permit'

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

# # Address Models
# class Sitio(models.Model):
#     sitio_id = models.CharField(max_length=100, primary_key=True)
#     sitio_name = models.CharField(max_length=100)

#     class Meta:
#         db_table = 'sitio'
#         managed = False 

#     def __str__(self):
#         return self.sitio_id

# class Address(models.Model):
#     add_id = models.BigAutoField(primary_key=True)  
#     add_province = models.CharField(max_length=50)
#     add_city = models.CharField(max_length=50)
#     add_barangay = models.CharField(max_length=50)
#     add_street = models.CharField(max_length=50)
#     add_external_sitio = models.CharField(max_length=50, null=True, blank=True)
#     sitio = models.ForeignKey(Sitio, on_delete=models.CASCADE, null=True)

#     class Meta:
#         db_table = 'address'
#         managed = False

#     def __str__(self):
#         return f'{self.add_province}, {self.add_city}, {self.add_barangay}, {self.sitio if self.sitio else self.add_external_sitio}, {self.add_street}'



# ====================== MIGHT DELETE THIS LATER ============================
# Service Charge Request Models
# class ServiceChargeRequest(models.Model):
#     sr_id = models.BigAutoField(primary_key=True)
#     sr_code = models.CharField(max_length=10, blank=True, null=True) 
#     sr_req_date = models.DateTimeField(default=datetime.now)
#     sr_status = models.CharField(null=True, blank=True)
#     sr_payment_status = models.CharField(null=True, blank=True)
#     sr_type = models.CharField(null=True, blank=True)
#     sr_decision_date = models.DateTimeField(null=True, blank=True)
#     comp_id = models.ForeignKey('complaint.Complaint', on_delete=models.SET_NULL, db_column='comp_id', null=True)
#     staff_id = models.ForeignKey('staff.Administration', on_delete=models.SET_NULL, null = True, blank = True, db_column='staff_id')
    # parent_summon = models.ForeignKey(
    #     'self',
    #     null=True, blank=True,
    #     on_delete=models.SET_NULL,
    #     related_name='escalated_file_actions'
    # )
    # file_action_file = models.OneToOneField(
    #     'ServiceChargeRequestFile', null=True, blank=True,
    #     on_delete=models.SET_NULL,  
    #     related_name='file_action'
    # )

    # class Meta:
    #     db_table = 'service_charge_request'

# class ServiceChargeRequestFile(models.Model):
#     srf_id = models.BigAutoField(primary_key=True)
#     srf_name = models.CharField(max_length=255)
#     srf_type = models.CharField(max_length=100, null=True, blank=True)
#     srf_path = models.CharField(max_length=500, null=True, blank=True)
#     srf_url = models.CharField(max_length=500)
    
#     class Meta:
#         db_table = 'service_charge_request_file'



# # Case Activity Models
# class CaseActivity(models.Model):
#     ca_id = models.BigAutoField(primary_key=True)
#     ca_reason = models.CharField(max_length=100)
#     ca_hearing_date = models.DateField(null=False)
#     ca_hearing_time = models.TimeField(null=False)
#     ca_mediation = models.CharField(max_length=255)
#     ca_date_of_issuance = models.DateTimeField(default=datetime.now)
#     sr = models.ForeignKey('ServiceChargeRequest', on_delete=models.CASCADE, related_name='case')
#     srf = models.ForeignKey('ServiceChargeRequestFile', on_delete=models.CASCADE, null=True, related_name='case_file')

#     class Meta:
#         db_table = 'case_activity'

# class CaseSuppDoc(models.Model):
#     csd_id = models.BigAutoField(primary_key=True)
#     csd_name = models.CharField(max_length=255)
#     csd_type = models.CharField(max_length=100)
#     csd_path = models.CharField(max_length=500)
#     csd_url = models.CharField(max_length=500)
#     csd_description = models.TextField(null=False)
#     csd_upload_date = models.DateTimeField(default=datetime.now)
#     ca_id = models.ForeignKey('CaseActivity', on_delete=models.CASCADE, null=True, db_column="ca_id", related_name="supporting_docs")

#     class Meta:
#         db_table = 'case_activity_supp_doc'

# =========================================================

# Service Charge Request Models
class ServiceChargeRequest(models.Model):
    sr_id = models.CharField(primary_key=True, max_length = 200)
    sr_code = models.CharField(max_length=10, blank=True, null=True) 
    sr_type = models.CharField(max_length = 250, null=True, blank=True)
    sr_req_date = models.DateTimeField(default=datetime.now)
    sr_req_status = models.CharField(max_length = 250)
    sr_case_status = models.CharField(max_length = 250)
    sr_date_marked = models.DateTimeField(null=True, blank = True)
    comp_id = models.ForeignKey('complaint.Complaint', on_delete=models.SET_NULL, db_column='comp_id', null=True)
    staff_id = models.ForeignKey('administration.Staff', on_delete=models.SET_NULL, null = True, blank = True, db_column='staff_id')

    class Meta:
        db_table = 'service_charge_request'

class ServiceChargeDecision(models.Model):
    scd_id = models.BigAutoField(primary_key=True)
    scd_decision_date = models.DateTimeField(default=datetime.now)
    scd_reason = models.TextField(null = True, blank = True)
    sr_id = models.OneToOneField('ServiceChargeRequest', db_column = 'sr_id', on_delete=models.CASCADE, null = True, blank = True)

    class Meta:
        db_table = 'service_charge_decision'

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
    pay_status = models.CharField(max_length=200)
    pay_date_req = models.DateTimeField(default = datetime.now)
    pay_due_date = models.DateField(default = default_due_date())
    pay_date_paid = models.DateTimeField(null = True, blank = True)
    comp_id = models.ForeignKey('complaint.Complaint', on_delete=models.SET_NULL, db_column='comp_id', null=True)
    pr_id = models.ForeignKey('treasurer.Purpose_And_Rates', on_delete = models.SET_NULL, db_column='pr_id', null = True, blank = True)

    class Meta:
        db_table = 'service_charge_payment_request'


class SummonSchedule(models.Model):
    ss_id = models.BigAutoField(primary_key=True)
    ss_mediation_level = models.CharField(max_length=500)
    ss_is_rescheduled = models.BooleanField(default=False)
    ss_reason = models.TextField()
    st_id = models.ForeignKey('SummonTimeAvailability', db_column='st_id', on_delete=models.SET_NULL, null = True, blank = True)
    sd_id = models.ForeignKey('SummonDateAvailability', db_column='sd_id', on_delete=models.SET_NULL, null = True, blank = True)
    sr_id = models.ForeignKey('ServiceChargeRequest', on_delete=models.CASCADE, db_column='sr_id')

    class Meta:
        db_table = 'summon_schedule'


class SummonSuppDoc(models.Model):
    ssd_id = models.BigAutoField(primary_key=True)
    ssd_name = models.CharField(max_length=255)
    ssd_type = models.CharField(max_length=100)
    ssd_path = models.CharField(max_length=500)
    ssd_url = models.CharField(max_length=500)
    ssd_upload_date = models.DateTimeField(default=datetime.now)
    ss_id = models.ForeignKey('SummonSchedule', on_delete=models.CASCADE, null=True, db_column="ss_id", related_name="supporting_docs")

    class Meta:
        db_table = 'summon_supp_doc'





    


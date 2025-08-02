from django.db import models
from django.core.validators import MaxValueValidator
from django.utils import timezone
from datetime import datetime

# Certificate Models
class ClerkCertificate(models.Model):
    cr_id = models.CharField(max_length=10, primary_key=True)
    req_pay_method = models.CharField(max_length=50)
    req_request_date = models.DateField()
    req_claim_date = models.DateField()
    req_transac_id = models.CharField(max_length=100, default='None')
    req_type = models.CharField(max_length=100, default='None')
    req_status = models.CharField(max_length=100, default='None')
    req_payment_status = models.CharField(max_length=100, default='None')
    pr_id = models.ForeignKey('treasurer.Purpose_And_Rates', on_delete=models.CASCADE, db_column='pr_id', related_name='certificates', null=True)
    ra_id = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, db_column='ra_id', related_name='ra_certificates', null=True)
    rp_id = models.ForeignKey('profiling.ResidentProfile', on_delete=models.CASCADE, db_column='rp_id')

    class Meta:
        db_table = 'certification_request'

class IssuedCertificate(models.Model):
    ic_id = models.CharField(max_length=10, primary_key=True)
    ic_date_of_issuance = models.DateField()
    file = models.ForeignKey('file.File', on_delete=models.CASCADE)
    certificate = models.ForeignKey(ClerkCertificate, on_delete=models.CASCADE, db_column='cr_id')
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE)

    class Meta:
        db_table = 'issued_certificate'

# Business Models
class Business(models.Model):
    bus_id = models.BigIntegerField(primary_key=True)
    bus_name = models.CharField(max_length=255)
    bus_gross_sales = models.DecimalField(max_digits=10, decimal_places=2)
    bus_respondentLname = models.CharField(max_length=100)  
    bus_respondentFname = models.CharField(max_length=100)  
    bus_respondentMname = models.CharField(max_length=100)
    bus_respondentSex = models.CharField(max_length=100)
    bus_respondentDob = models.DateField()
    bus_date_registered = models.DateField()
    staff_id = models.CharField(max_length=50)
    add_id = models.CharField(max_length=50)
    bus_respondentAddress = models.CharField(max_length=255)
    bus_respondentContact = models.CharField(max_length=50)

    class Meta:
        db_table = 'business'
        managed = False

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

class IssuedBusinessPermit(models.Model):
    ibp_id = models.CharField(max_length=10, primary_key=True)
    ibp_date_of_issuance = models.DateField()
    file = models.ForeignKey('file.File', on_delete=models.CASCADE)
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

# Invoice Model
class Invoice(models.Model):
    inv_num = models.CharField(max_length=50, primary_key=True)
    inv_serial_num = models.CharField(max_length=100)
    inv_date = models.CharField(max_length=20, default='Pending')
    inv_amount = models.DecimalField(max_digits=10, decimal_places=2)
    inv_nat_of_collection = models.DateTimeField(auto_now_add=True)
    cr_id = models.ForeignKey(ClerkCertificate, on_delete=models.CASCADE, related_name='clerk_invoices', db_column='cr_id')
    
    class Meta:
        db_table = 'invoice'
        managed = False

# Document Models
class DocumentsPDF(models.Model):
    pdf_url = models.URLField(blank=True, null=True)  

    class Meta:
        db_table = 'clerk_pdf_documents'

# Address Models
class Sitio(models.Model):
    sitio_id = models.CharField(max_length=100, primary_key=True)
    sitio_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'sitio'
        managed = False 

    def __str__(self):
        return self.sitio_id

class Address(models.Model):
    add_id = models.BigAutoField(primary_key=True)  
    add_province = models.CharField(max_length=50)
    add_city = models.CharField(max_length=50)
    add_barangay = models.CharField(max_length=50)
    add_street = models.CharField(max_length=50)
    add_external_sitio = models.CharField(max_length=50, null=True, blank=True)
    sitio = models.ForeignKey(Sitio, on_delete=models.CASCADE, null=True)

    class Meta:
        db_table = 'address'
        managed = False

    def __str__(self):
        return f'{self.add_province}, {self.add_city}, {self.add_barangay}, {self.sitio if self.sitio else self.add_external_sitio}, {self.add_street}'

# Complaint Models
class Complainant(models.Model):
    cpnt_id = models.BigAutoField(primary_key=True)
    cpnt_name = models.CharField(max_length=100)
    cpnt_gender = models.CharField(max_length=20)
    cpnt_age = models.CharField(max_length=2)
    cpnt_number = models.CharField(max_length=11)
    cpnt_relation_to_respondent = models.CharField(max_length=20)
    add = models.ForeignKey('clerk.Address', on_delete=models.CASCADE, related_name='complainant')

    class Meta:
        db_table = 'complainant'

class Accused(models.Model):
    acsd_id = models.BigAutoField(primary_key=True)
    acsd_name = models.CharField(max_length=100)
    acsd_age = models.CharField(max_length=2)
    acsd_gender = models.CharField(max_length=20)
    acsd_description = models.TextField()
    add = models.ForeignKey('clerk.Address', on_delete=models.CASCADE, related_name='accused')

    class Meta:
        db_table = 'accused'

class Complaint(models.Model):
    comp_id = models.BigAutoField(primary_key=True)
    comp_location = models.CharField(max_length=255)
    comp_incident_type = models.CharField(max_length=100)
    comp_datetime = models.CharField(max_length=100)
    comp_allegation = models.TextField()
    comp_created_at = models.DateTimeField(auto_now_add=True)
    comp_is_archive = models.BooleanField(default=False)

    complainant = models.ManyToManyField(
        Complainant,
        through='ComplaintComplainant',
        related_name='complaint'
    )
    accused = models.ManyToManyField(
        Accused,
        through='ComplaintAccused',
        related_name='complaint'
    )

    class Meta:
        db_table = 'complaint'

class ComplaintComplainant(models.Model):
    cc_id = models.BigAutoField(primary_key=True)
    comp = models.ForeignKey(Complaint, on_delete=models.CASCADE)
    cpnt = models.ForeignKey(Complainant, on_delete=models.CASCADE)

    class Meta:
        db_table = 'complaint_complainant'
        unique_together = ('comp', 'cpnt')  

class ComplaintAccused(models.Model):
    ca_id = models.BigAutoField(primary_key=True)
    comp = models.ForeignKey(Complaint, on_delete=models.CASCADE)
    acsd = models.ForeignKey(Accused, on_delete=models.CASCADE)

    class Meta:
        db_table = 'complaint_accused'
        unique_together = ('comp', 'acsd')

class Complaint_File(models.Model):
    cf_id = models.BigAutoField(primary_key=True)
    comp = models.ForeignKey(Complaint, related_name='complaint_file', on_delete=models.CASCADE)
    file = models.ForeignKey('file.File', related_name='complaint_file', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'complaint_file'
        managed = False

# Service Charge Request Models
class ServiceChargeRequest(models.Model):
    sr_id = models.BigAutoField(primary_key=True)
    sr_code = models.CharField(max_length=10, blank=True, null=True) 
    sr_req_date = models.DateTimeField(default=datetime.now)
    sr_status = models.CharField(null=True, blank=True)
    sr_payment_status = models.CharField(null=True, blank=True)
    sr_type = models.CharField(null=True, blank=True)
    sr_decision_date = models.DateTimeField(null=True, blank=True)
    comp = models.ForeignKey('complaint.Complaint', on_delete=models.SET_NULL, db_column='comp_id', null=True)
    parent_summon = models.ForeignKey(
        'self',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='escalated_file_actions'
    )
    file_action_file = models.OneToOneField(
        'ServiceChargeRequestFile', null=True, blank=True,
        on_delete=models.SET_NULL,  
        related_name='file_action'
    )

    class Meta:
        db_table = 'service_charge_request'

class ServiceChargeRequestFile(models.Model):
    srf_id = models.BigAutoField(primary_key=True)
    srf_name = models.CharField(max_length=255)
    srf_type = models.CharField(max_length=100, null=True, blank=True)
    srf_path = models.CharField(max_length=500, null=True, blank=True)
    srf_url = models.CharField(max_length=500)
    
    class Meta:
        db_table = 'service_charge_request_file'

# Case Activity Models
class CaseActivity(models.Model):
    ca_id = models.BigAutoField(primary_key=True)
    ca_reason = models.CharField(max_length=100)
    ca_hearing_date = models.DateField(null=False)
    ca_hearing_time = models.TimeField(null=False)
    ca_mediation = models.CharField(max_length=255)
    ca_date_of_issuance = models.DateTimeField(default=datetime.now)
    sr = models.ForeignKey('ServiceChargeRequest', on_delete=models.CASCADE, related_name='case')
    srf = models.ForeignKey('ServiceChargeRequestFile', on_delete=models.CASCADE, null=True, related_name='case_file')

    class Meta:
        db_table = 'case_activity'

class CaseSuppDoc(models.Model):
    csd_id = models.BigAutoField(primary_key=True)
    csd_name = models.CharField(max_length=255)
    csd_type = models.CharField(max_length=100)
    csd_path = models.CharField(max_length=500)
    csd_url = models.CharField(max_length=500)
    csd_description = models.TextField(null=False)
    csd_upload_date = models.DateTimeField(default=datetime.now)
    ca_id = models.ForeignKey('CaseActivity', on_delete=models.CASCADE, null=True, db_column="ca_id", related_name="supporting_docs")

    class Meta:
        db_table = 'case_activity_supp_doc'

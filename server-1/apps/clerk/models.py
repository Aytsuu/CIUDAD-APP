from django.db import models
from django.utils import timezone

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
from datetime import datetime
# Create your models here.

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
    comp_file_id = models.BigAutoField(primary_key=True)
    comp_file_name = models.CharField(max_length=255)
    comp_file_type = models.CharField(max_length=10)
    comp_file_path = models.URLField(max_length=512)
    supabase_path = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    comp = models.ForeignKey(
        Complaint,
        on_delete=models.CASCADE,
        related_name='complaint_file',
    )

    class Meta:
        db_table = 'complaint_file'
        indexes = [
            models.Index(fields=['comp_file_type']),
            models.Index(fields=['comp']),
        ]

    def __str__(self):
        return f"{self.comp_file_name} (Case #{self.comp.comp_id})"

class ServiceChargeRequest(models.Model):
    sr_id = models.BigAutoField(primary_key=True)
    sr_code = models.CharField(max_length=10, blank=True, null=True) 
    sr_req_date = models.DateTimeField(default=datetime.now)
    sr_status = models.CharField(null=True, blank=True)
    sr_payment_status = models.CharField(null=True, blank=True)
    sr_type = models.CharField(null=True, blank=True)
    sr_decision_date = models.DateTimeField(null=True, blank=True)

    comp = models.ForeignKey('clerk.Complaint', on_delete=models.SET_NULL, db_column='comp_id', null=True)

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

    def save(self, *args, **kwargs):
        if self.comp and not self.sr_code:
            case_id = f"{self.comp.id:03}"
            year_suffix = timezone.now().year % 100
            self.sr_code = f"{case_id}-{year_suffix:02}"
        super().save(*args, **kwargs)

class CaseActivity(models.Model):
    ca_id = models.BigAutoField(primary_key=True)
    ca_reason = models.CharField(max_length=100)
    ca_hearing_date = models.DateField(null=False)
    ca_hearing_time = models.TimeField(null=False)
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
    csd_description = models.TextField()
    csd_upload_date = models.DateTimeField(default=datetime.now)
    ca_id = models.ForeignKey('CaseActivity', on_delete=models.CASCADE, null=True, db_column="ca_id", related_name="supporting_docs")

    class Meta:
        db_table = 'case_activity_supp_doc'


class ServiceChargeRequestFile(models.Model):
    srf_id = models.BigAutoField(primary_key=True)
    srf_name = models.CharField(max_length=255)
    srf_type = models.CharField(max_length=100, null=True, blank=True)
    srf_path = models.CharField(max_length=500, null=True, blank=True)
    srf_url = models.CharField(max_length=500)
    
    class Meta:
        db_table = 'service_charge_request_file'

from django.db import models
from django.conf import settings
from datetime import date
from simple_history.models import HistoricalRecords

class Voter(models.Model):
    voter_id = models.BigAutoField(primary_key=True)
    voter_name = models.CharField(max_length=200)
    voter_address = models.TextField()
    voter_category = models.CharField(max_length=5, null=True)
    voter_precinct = models.CharField(max_length=20)

    class Meta:
        db_table = "voter"

class Sitio(models.Model):
    sitio_id = models.CharField(max_length=100, primary_key=True)
    sitio_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'sitio'

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
        indexes = [
            models.Index(fields=['sitio']),
        ]

    def __str__(self):
        return f'{self.add_province}, {self.add_city}, {self.add_barangay}, {self.sitio if self.sitio else self.add_external_sitio}, {self.add_street}'

class Personal(models.Model):
    per_id = models.BigAutoField(primary_key=True)
    per_lname = models.CharField(max_length=100)
    per_fname = models.CharField(max_length=100)
    per_mname = models.CharField(max_length=100, null=True, blank=True)
    per_suffix = models.CharField(max_length=100, null=True, blank=True)
    per_dob = models.DateField()
    per_sex = models.CharField(max_length=100)
    per_status = models.CharField(max_length=100)
    per_edAttainment = models.CharField(max_length=100, null=True, blank=True)
    per_religion = models.CharField(max_length=100)
    per_contact = models.CharField(max_length=20)  
    per_disability = models.CharField(max_length=100, null=True, blank=True)

    history = HistoricalRecords(
        table_name='personal_history',
        user_model='administration.Staff',
        user_db_constraint=False,
        cascade_delete_history=True,
    )

    class Meta:
        db_table = 'personal'
        indexes = [
            models.Index(fields=['per_lname', 'per_fname']),
            models.Index(fields=['per_contact']),
        ]

    def __str__(self):
        name_parts = [self.per_lname, self.per_fname]
        if self.per_mname:
            name_parts.append(self.per_mname)
        if self.per_suffix:
            name_parts.append(self.per_suffix)
        return ', '.join(name_parts)

class PersonalAddress(models.Model):
    pa_id = models.BigAutoField(primary_key=True)
    per = models.ForeignKey(Personal, on_delete=models.CASCADE, related_name='personal_addresses')
    add = models.ForeignKey(Address, on_delete=models.CASCADE)
    class Meta:
        db_table = 'personal_address'

class PersonalAddressHistory(models.Model):
    pah_id = models.BigAutoField(primary_key=True)
    per = models.ForeignKey(Personal, on_delete=models.CASCADE)
    add = models.ForeignKey(Address, on_delete=models.CASCADE)
    history_id = models.IntegerField()

    class Meta:
        db_table = 'personal_address_history'

class ResidentProfile(models.Model):
    rp_id = models.CharField(max_length=50, primary_key=True)
    rp_date_registered = models.DateField(auto_now_add=True)
    per = models.ForeignKey(Personal, on_delete=models.CASCADE, related_name='personal_information')
    staff = models.ForeignKey("administration.Staff", on_delete=models.CASCADE, null=True, related_name="resident_profiles")
    voter = models.ForeignKey(Voter, on_delete=models.CASCADE, null=True)

    class Meta:
        db_table = 'resident_profile'
        indexes = [
            models.Index(fields=['rp_id']),
            models.Index(fields=['per']),
            models.Index(fields=['rp_date_registered'])
        ]

    def __str__(self):
        return f"{self.per} (ID: {self.rp_id})"


class Household(models.Model):
    hh_id = models.CharField(max_length=50, primary_key=True)
    hh_nhts = models.CharField(max_length=50)
    hh_date_registered = models.DateField(auto_now_add=True)
    add = models.ForeignKey(Address, on_delete=models.CASCADE)
    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE)
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, related_name="households")

    class Meta:
        db_table = 'household'

    def __str__(self):
        return f"Household {self.hh_id} - {self.rp} in {self.add}"

class Family(models.Model):
    fam_id = models.CharField(max_length=50, primary_key=True)
    fam_indigenous = models.CharField(max_length=50)
    fam_building = models.CharField(max_length=50)
    fam_date_registered = models.DateField(auto_now_add=True)
    hh = models.ForeignKey(Household, on_delete=models.CASCADE, related_name="family_set")
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, related_name="families")

    class Meta:
        db_table = 'family' 

    def __str__(self):
        return f"Family {self.fam_id}"

class FamilyComposition(models.Model):
    fc_id = models.BigAutoField(primary_key=True)
    fc_role = models.CharField(max_length=50)
    fam = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='family_compositions')
    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE, related_name='family_compositions')

    class Meta:
        db_table = 'family_composition'

    def __str__(self):
        return f"{self.rp} in Family {self.fam.fam_id}"

    
class RequestRegistration(models.Model):
    req_id = models.BigAutoField(primary_key=True)
    req_date = models.DateField(auto_now_add=True)
    req_is_archive = models.BooleanField(default=False)

    class Meta: 
        db_table = 'request_registration'

class RequestRegistrationComposition(models.Model):
    rrc_id = models.BigAutoField(primary_key=True)
    rrc_fam_role = models.CharField(max_length=50)
    req = models.ForeignKey(RequestRegistration, on_delete=models.CASCADE, related_name="request_composition")
    per = models.ForeignKey(Personal, on_delete=models.CASCADE)
    acc = models.ForeignKey('account.Account', on_delete=models.CASCADE, null=True)

    class Meta:
        db_table = 'request_registration_composition'

class BusinessRespondent(models.Model):
    br_id = models.BigAutoField(primary_key=True)
    br_date_registered = models.DateField(default=date.today)
    br_lname = models.CharField(max_length=50)
    br_fname = models.CharField(max_length=50)
    br_mname = models.CharField(max_length=50, null=True)
    br_sex = models.CharField(max_length=10)
    br_dob = models.DateField()
    br_contact = models.CharField(max_length=11)

    class Meta:
        db_table = 'business_respondent'

class Business(models.Model):
    bus_id = models.BigAutoField(primary_key=True)
    bus_name = models.CharField(max_length=100)
    bus_gross_sales = models.FloatField()
    bus_status = models.CharField(max_length=20, default='Pending')
    bus_date_of_registration = models.DateField(default=date.today)
    bus_date_verified = models.DateField(null=True)
    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE, null=True, related_name="owned_business")
    br = models.ForeignKey(BusinessRespondent, on_delete=models.CASCADE, null=True, related_name="owned_business")
    add = models.ForeignKey(Address, on_delete=models.CASCADE, null=True)
    staff = models.ForeignKey('administration.Staff', null=True, on_delete=models.CASCADE, related_name='businesses')

    history = HistoricalRecords(
        table_name='business_history',
        user_model='administration.Staff',
        user_db_constraint=False,
        cascade_delete_history=True
    )

    class Meta:
        db_table = 'business'

class BusinessModification(models.Model):
    bm_id = models.BigAutoField(primary_key=True)
    bm_updated_name = models.CharField(max_length=100, null=True)
    bm_updated_gs = models.FloatField(null=True)
    bm_submitted_at = models.DateTimeField(auto_now_add=True)
    bm_status = models.CharField(max_length=50, null=True)
    bm_rejection_reason = models.TextField(null=True)
    add = models.ForeignKey(Address, on_delete=models.CASCADE, null=True)
    bus = models.ForeignKey(Business, on_delete=models.CASCADE)

    class Meta:
        db_table = 'business_modification'

class BusinessFile(models.Model):
    bf_id = models.BigAutoField(primary_key=True)
    bf_name = models.CharField(max_length=500)
    bf_type = models.CharField(max_length=50)
    bf_path = models.CharField(max_length=500)
    bf_url = models.URLField()
    bf_created_at = models.DateTimeField(auto_now_add=True)
    bus = models.ForeignKey(Business, on_delete=models.CASCADE, related_name='business_files', null=True)
    bm = models.ForeignKey(BusinessModification, on_delete=models.CASCADE, related_name='business_files', null=True)

    class Meta:
        db_table = 'business_file'

class KYCRecord(models.Model):
    kyc_id = models.BigAutoField(primary_key=True)
    id_document_front = models.TextField(null=True, blank=True)
    id_has_face = models.BooleanField(null=True, default=False)
    id_face_embedding = models.BinaryField(null=True, blank=True)
    face_photo = models.TextField(null=True, blank=True)
    document_info_match = models.BooleanField(null=True, default=False)
    face_match_score = models.FloatField(null=True, blank=True)
    is_verified = models.BooleanField(null=True, default=False)
    created_at = models.DateTimeField(null=True, auto_now_add=True)
    updated_at = models.DateTimeField(null=True, auto_now=True)

    class Meta:
        db_table = 'kyc_record'
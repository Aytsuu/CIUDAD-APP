from django.db import models
from django.conf import settings
from datetime import date
from simple_history.models import HistoricalRecords

class ProfilingAbstractModel(models.Model):
    class Meta:
        abstract = True
    
    def save(self, *args, **kwargs):
        for field in self._meta.fields:
            if(
                isinstance(field, (models.CharField, models.TextField))
                and not field.primary_key
                and field.editable
            ):
                val = getattr(self, field.name)
                if isinstance(val, str):
                    setattr(self, field.name, val.upper())
        super().save(*args, **kwargs)



class Sitio(models.Model):
    sitio_id = models.CharField(max_length=100, primary_key=True)
    sitio_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'sitio'

    def __str__(self):
        return self.sitio_name

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
    per = models.ForeignKey(Personal, on_delete=models.CASCADE)
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
    rp_date_registered = models.DateField(default=date.today)
    per = models.ForeignKey(Personal, on_delete=models.CASCADE, related_name='personal_information')
    staff = models.ForeignKey("administration.Staff", on_delete=models.CASCADE, null=True, related_name="resident_profiles")

    class Meta:
        db_table = 'resident_profile'
        indexes = [
            models.Index(fields=['rp_id']),
            models.Index(fields=['per']),
            models.Index(fields=['rp_date_registered'])
        ]

    def __str__(self):
        return f"{self.per} (ID: {self.rp_id})"
    
class RespondentsInfo(models.Model):
    ri_id = models.BigAutoField(primary_key=True)
    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE, related_name='respondents_info')
    fam = models.ForeignKey('Family', on_delete=models.CASCADE, related_name='respondents_info', null=True, blank=True)
 
    class Meta:
        db_table = 'respondents_info'

    def __str__(self):
        return f"{self.rp} (Respondent ID: {self.ri_id})"

class Household(models.Model):
    hh_id = models.CharField(max_length=50, primary_key=True)
    hh_nhts = models.CharField(max_length=50)
    hh_date_registered = models.DateField(default=date.today)
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
    fam_date_registered = models.DateField(default=date.today)
    hh = models.ForeignKey(Household, on_delete=models.CASCADE)
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

# class RequestRegistration(models.Model):
#     req_id = models.BigAutoField(primary_key=True)
#     req_date = models.DateField(auto_now_add=True)
#     req_is_archive = models.BooleanField(default=False)

#     class Meta: 
#         db_table = 'request_registration'

# class RequestRegistrationComposition(models.Model):
#     rrc_id = models.BigAutoField(primary_key=True)
#     rrc_fam_role = models.CharField(max_length=50)
#     req = models.ForeignKey(RequestRegistration, on_delete=models.CASCADE, related_name="request_composition")
#     per = models.ForeignKey(Personal, on_delete=models.CASCADE)
#     acc = models.ForeignKey('account.Account', on_delete=models.CASCADE, null=True)

#     class Meta:
#         db_table = 'request_registration_composition'

class HealthRelatedDetails(models.Model):
    per_add_id = models.BigAutoField(primary_key=True)
    per_add_bloodType = models.CharField(max_length=5, null=True, blank=True)
    per_add_philhealth_id = models.CharField(max_length=50, null=True, blank=True)
    per_add_covid_vax_status = models.CharField(max_length=50, null=True, blank=True)
    per_add_rel_to_hh_head = models.CharField(max_length=100, null=True, blank=True)
    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        db_table = 'per_additional_details'

class Dependents_Over_Five(models.Model):
    dep_ov_five_id = models.CharField(max_length=50, primary_key=True)
    # dep = models.ForeignKey(Dependent, on_delete=models.CASCADE)
    fc = models.ForeignKey(FamilyComposition, on_delete=models.CASCADE)
    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE)

    class Meta:
        db_table = 'dep_over_five'

class Dependents_Under_Five(models.Model):
    duf_id = models.CharField(max_length=50, primary_key=True)
    duf_fic= models.CharField(max_length=50 )
    duf_nutritional_status= models.CharField(max_length=50 )
    duf_exclusive_bf= models.CharField(max_length=50 )
    fc = models.ForeignKey(FamilyComposition, on_delete=models.CASCADE)

    class Meta:
        db_table = 'dep_under_five'

class WaterSupply(models.Model):
    water_sup_id = models.CharField(max_length=50, primary_key=True)
    water_sup_type = models.CharField(max_length=50)
    water_conn_type = models.CharField(max_length=50, null=True, blank=True)
    water_sup_desc = models.TextField(max_length=1000)
    hh = models.ForeignKey(Household, on_delete=models.CASCADE)

    class Meta:
        db_table = 'water_supply'

class SanitaryFacility(models.Model):
    sf_id = models.CharField(max_length=50, primary_key=True)
    sf_type = models.CharField(max_length=50)
    sf_toilet_type = models.CharField(max_length=50)

    hh = models.ForeignKey(Household, on_delete=models.CASCADE)

    class Meta:
        db_table = 'sanitary_facility'

class FacilityDetails(models.Model):
    fd_id = models.CharField(max_length=50, primary_key=True)
    fd_description = models.CharField(max_length=200)

    sf = models.ForeignKey(SanitaryFacility, on_delete=models.CASCADE)

    class Meta:
        db_table = 'facility_details'

class SolidWasteMgmt(models.Model):
    swm_id = models.CharField(max_length=50, primary_key=True)
    swn_desposal_type = models.CharField(max_length=50)
    swm_desc = models.TextField(max_length=1000)
    hh = models.ForeignKey(Household, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'solid_waste_mgmt'
        
class TBsurveilance(models.Model):
    tb_id = models.CharField(max_length=50, primary_key=True)
    tb_meds_source = models.CharField(max_length=100, blank=True, null=True)
    tb_days_taking_meds = models.IntegerField(null=True, blank=True, default=0)
    tb_status = models.CharField(max_length=100, blank=True, null=True)

    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE)

    class Meta:
        db_table = 'tb_surveillance_records'

class NonCommunicableDisease(models.Model):
    ncd_id = models.CharField(max_length=50, primary_key=True)
    ncd_riskclass_age = models.CharField(max_length=100, blank=True, null=True)
    ncd_comorbidities = models.CharField(max_length=100, blank=True, null=True)
    ncd_lifestyle_risk = models.CharField(max_length=100, blank=True, null=True)
    ncd_maintenance_status = models.CharField(max_length=100, blank=True, null=True)

    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE)

    class Meta:
        db_table = 'non_communicable_disease'


class MotherHealthInfo(models.Model):
    mhi_id = models.BigAutoField(primary_key=True)
    mhi_healthRisk_class = models.CharField(max_length=50, null=True, blank=True)
    mhi_immun_status = models.CharField(max_length=50, null=True, blank=True)
    mhi_famPlan_method = models.CharField(max_length=100, null=True, blank=True)
    mhi_famPlan_source = models.CharField(max_length=100, null=True, blank=True)
    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE, related_name='mother_health_infos')
    fam = models.ForeignKey('Family', on_delete=models.CASCADE, related_name='mother_health_infos', null=True, blank=True)

    # Add other fields as needed

    class Meta:
        db_table = 'mother_health_info'
        unique_together = ('rp', 'fam')
        
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

class SurveyIdentification(models.Model):
    si_id = models.CharField(max_length=50, primary_key=True)
    si_filled_by = models.CharField(max_length=100, blank=True, null=True)
    si_informant = models.CharField(max_length=100)
    si_checked_by = models.CharField(max_length=100)
    si_date = models.DateField()
    si_signature = models.TextField()  # Base64 encoded signature
    si_created_at = models.DateTimeField(auto_now_add=True)
    si_updated_at = models.DateTimeField(auto_now=True)
    
    fam = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='survey_identifications')

    class Meta:
        db_table = 'survey_identification'
        indexes = [
            models.Index(fields=['fam']),
            models.Index(fields=['si_date']),
        ]

    def __str__(self):
        return f"Survey {self.si_id} - Family {self.fam.fam_id}"


# class RiskClassGroups(models.Model):
#     rcg_code = models.CharField(max_length=50, primary_key=True)
#     rcg_desc = models.CharField(max_length=200)
    

# class ComorbiditiesRecord(models.Model):
#     com_rec_id = models.CharField(max_length=50, primary_key=True)
#     ill_id = models.CharField(max_length=50)
#     pat_rec = models.ForeignKey(PatientRecords, on_delete=models.CASCADE)

#     db_table = 'comorbidities_record'

# class Illness(models.Model):
#     ill_id = models.CharField(max_length=50, primary_key=True)
#     ill_name = models.CharField(max_length=100)
#     ill_desc = models.TextField(max_length=1000)
#     ill_code = models.CharField(max_length=50)

#     class Meta:
#         db_table = 'illness'



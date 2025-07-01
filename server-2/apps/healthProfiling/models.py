# from django.db import models

# # Create your models here.
# from django.db import models

from django.db import models
from django.conf import settings
from datetime import date

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

    def __str__(self):
        return f'{self.add_province}, {self.add_city}, {self.add_barangay}, {self.sitio if self.sitio else self.add_external_sitio}, {self.add_street}'

class Personal(models.Model):
    per_id = models.BigAutoField(primary_key=True)
    per_lname = models.CharField(max_length=100)
    per_fname = models.CharField(max_length=100)
    per_mname = models.CharField(max_length=100, null=True)
    per_suffix = models.CharField(max_length=100, null=True)
    per_dob = models.DateField()
    per_sex = models.CharField(max_length=100)
    per_status = models.CharField(max_length=100)
    per_edAttainment = models.CharField(max_length=100, null=True)
    per_religion = models.CharField(max_length=100)
    per_contact = models.CharField(max_length=100)  

    class Meta:
        db_table = 'personal'


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

class ResidentProfile(models.Model):
    rp_id = models.CharField(max_length=50, primary_key=True)
    rp_date_registered = models.DateField(default=date.today)
    per = models.ForeignKey(Personal, on_delete=models.CASCADE, related_name='personal_information')
    staff = models.ForeignKey("administration.Staff", on_delete=models.CASCADE, null=True, related_name="resident_profiles")

    class Meta:
        db_table = 'resident_profile'

    def __str__(self):
        return f"{self.per} (ID: {self.rp_id})"

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

    
class RequestRegistration(models.Model):
    req_id = models.BigAutoField(primary_key=True)
    req_date = models.DateField()
    per = models.ForeignKey(Personal, on_delete=models.CASCADE)

    class Meta: 
        db_table = 'request_registration'

    def __str__(self):
        return f"Request #{self.req_id} by {self.per} on {self.req_date}"

class HealthRelatedDetails(models.Model):
    hrd_id = models.BigAutoField(primary_key=True)
    hrd_blood_type = models.CharField(max_length=5)
    hrd_philhealth_id = models.CharField(max_length=50)
    per = models.ForeignKey(Personal, on_delete=models.CASCADE)
    

    class Meta:
        db_table = 'health_related_details'

class Dependents_Over_Five(models.Model):
    dep_ov_five_id = models.CharField(max_length=50, primary_key=True)
    # dep = models.ForeignKey(Dependent, on_delete=models.CASCADE)
    fc = models.ForeignKey(FamilyComposition, on_delete=models.CASCADE)
    per = models.ForeignKey(Personal, on_delete=models.CASCADE)

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
    water_sup_desc = models.TextField(max_length=1000)
    hh = models.ForeignKey(Household, on_delete=models.CASCADE)

    class Meta:
        db_table = 'water_supply'
#     class Meta:
#         db_table = 'water_supply'

# class SanitaryFacility(models.Model):
#     sf_id = models.CharField(max_length=50, primary_key=True)
#     sf_type = models.CharField(max_length=50)
#     sf_toilet_type = models.CharField(max_length=50)

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
    tb_meds_source = models.CharField(max_length=100)
    tb_days_taking_meds = models.IntegerField()
    tb_status = models.CharField(max_length=100)

    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE)

    class Meta:
        db_table = 'tb_surveillance_records'

class NonCommunicableDisease(models.Model):
    ncd_id = models.CharField(max_length=50, primary_key=True)
    ncd_riskclass_age = models.CharField(max_length=100)
    ncd_comorbidities = models.CharField(max_length=100)
    ncd_lifestyle_risk = models.CharField(max_length=100)
    ncd_maintenance_status = models.CharField(max_length=100)

    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE)

    class Meta:
        db_table = 'non_communicable_disease'

class RequestFile(models.Model):
    rf_id = models.BigAutoField(primary_key=True)
    rf_name = models.CharField(max_length=500)
    rf_type = models.CharField(max_length=50)
    rf_path = models.CharField(max_length=500)
    rf_url = models.URLField()
    rf_is_id = models.BooleanField(default=False)
    rf_id_type = models.CharField(max_length=50, null=True ,blank=True)
    rf_created_at = models.DateTimeField(auto_now_add=True)
    req = models.ForeignKey(RequestRegistration, on_delete=models.CASCADE, related_name='files') 
 
    class Meta:
        db_table = 'request_file'


# class Patient(models.Model):
#     pat_id = models.CharField(max_length=50, primary_key=True)
    # per = models.ForeignKey(Personal, on_depete=models.CASCADE)

#     class Meta:
#         db_table = 'patient'

# class PatientRecords(models.Model):
#     pat_rec_id = models.CharField(max_length=50, primary_key=True)
#     pat = models.ForeignKey(Patient, on_delete=models.CASCADE)

#     class Meta:
#         db_table = 'patient_records'


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



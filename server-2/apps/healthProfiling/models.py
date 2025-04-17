# from django.db import models

# # Create your models here.
# from django.db import models

from django.db import models
from django.conf import settings
from datetime import date

# class Sitio(models.Model):
#     sitio_id = models.CharField(max_length=100, primary_key=True)
#     sitio_name = models.CharField(max_length=100)

#     class Meta:
#         db_table = 'sitio'

#     def __str__(self):
#         return self.sitio_name

# class Personal(models.Model):
#     per_id = models.BigAutoField(primary_key=True)
#     per_lname = models.CharField(max_length=100)
#     per_fname = models.CharField(max_length=100)
#     per_mname = models.CharField(max_length=100, null=True)
#     per_suffix = models.CharField(max_length=100, null=True)
#     per_dob = models.DateField()
#     per_sex = models.CharField(max_length=100)
#     per_status = models.CharField(max_length=100)
#     per_address = models.CharField(max_length=100)
#     per_edAttainment = models.CharField(max_length=100, null=True)
#     per_religion = models.CharField(max_length=100)
#     per_contact = models.CharField(max_length=100)  

#     class Meta:
#         db_table = 'personal'

#     def __str__(self):
#         name_parts = [self.per_lname, self.per_fname]
#         if self.per_mname:
#             name_parts.append(self.per_mname)
#         if self.per_suffix:
#             name_parts.append(self.per_suffix)
#         return ', '.join(name_parts)


# class ResidentProfile(models.Model):
#     rp_id = models.CharField(max_length=50, primary_key=True)
#     rp_date_registered = models.DateField(default=date.today)
#     per = models.ForeignKey(Personal, on_delete=models.CASCADE, related_name='personal_information')
#     staff = models.ForeignKey("administration.Staff", on_delete=models.CASCADE, null=True, related_name="resident_profiles")

#     class Meta:
#         db_table = 'resident_profile'

#     def __str__(self):
#         return f"{self.per} (ID: {self.rp_id})"


# class Household(models.Model):
#     hh_id = models.CharField(max_length=50, primary_key=True)
#     hh_nhts = models.CharField(max_length=50)
#     hh_province = models.CharField(max_length=50)
#     hh_city = models.CharField(max_length=50)       
#     hh_barangay = models.CharField(max_length=50)
#     hh_street = models.CharField(max_length=50)
#     hh_date_registered = models.DateField(default=date.today)
#     rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE)
#     sitio = models.ForeignKey(Sitio, on_delete=models.CASCADE)
#     staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, null=True, related_name="households")

#     class Meta:
#         db_table = 'household'

#     def __str__(self):
#         return f"Household {self.hh_id} - {self.rp} in {self.sitio}"


# class Mother(models.Model):
#     mother_id = models.BigAutoField(primary_key=True)
#     rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE)

#     class Meta:
#         db_table = 'mother'

#     def __str__(self):
#         return f"Mother: {self.rp}"


# class Father(models.Model):
#     father_id = models.BigAutoField(primary_key=True)
#     rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE)

#     class Meta:
#         db_table = 'father'

#     def __str__(self):
#         return f"Father: {self.rp}"


# class HealthRelatedDetails(models.Model):
#     hrd_id = models.CharField(max_length=50, primary_key=True)
#     hrd_blood_type = models.CharField(max_length=5)
#     hrd_philhealth_id = models.CharField(max_length=50)
#     # father = models.ForeignKey(Father, on_delete=models.CASCADE)
#     # mother = models.ForeignKey(Mother, on_delete=models.CASCADE)
#     # dof = models.ForeignKey(Dependents_Over_Five, on_delete=models.CASCADE)

#     class Meta:
#         db_table = 'health_related_details'

class Dependents_Over_Five(models.Model):
    dep_ov_five_id = models.CharField(max_length=50, primary_key=True)
    dep = models.ForeignKey(Dependent, on_delete=models.CASCADE)

#     class Meta:
#         db_table = 'dep_ov_five'

class Dependents_Under_Five(models.Model):
    dep_un_five_id = models.CharField(max_length=50, primary_key=True)
    dep = models.ForeignKey(Dependent, on_delete=models.CASCADE)

#     class Meta:
#         db_table = 'dependents_under_five'

class WaterSupply(models.Model):
    water_sup_id = models.CharField(max_length=50, primary_key=True)
    water_sup_type = models.CharField(max_length=50)
    water_sup_desc = models.TextField(max_length=1000)
    hh = models.ForeignKey(Household, on_delete=models.CASCADE)

#     class Meta:
#         db_table = 'water_supply'

# class SanitaryFacility(models.Model):
#     sf_id = models.CharField(max_length=50, primary_key=True)
#     sf_type = models.CharField(max_length=50)
#     sf_toilet_type = models.CharField(max_length=50)

    hh = models.ForeignKey(Household, on_delete=models.CASCADE)

#     class Meta:
#         db_table = 'sanitary_facility'

# class Facility_Details(models.Model):
#     fd_id = models.CharField(max_length=50, primary_key=True)
#     fd_description = models.CharField(max_length=200)
#     sf = models.ForeignKey(SanitaryFacility, on_delete=models.CASCADE)

class Solid_Waste_Mgmt(models.Model):
    swm_id = models.CharField(max_length=50, primary_key=True)
    swn_desposal_type = models.CharField(max_length=50)
    swm_desc = models.TextField(max_length=1000)
    hh = models.ForeignKey(Household, on_delete=models.CASCADE)
    
#     class Meta:
#         db_table = 'solid_waste_mgmt'


class Patient(models.Model):
    pat_id = models.CharField(max_length=50, primary_key=True)
    per = models.ForeignKey(Personal, on_depete=models.CASCADE)

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

# class TB_Surveilance(models.Model):
#     pass
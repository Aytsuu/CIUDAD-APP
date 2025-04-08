# from django.db import models

# # Create your models here.
# from django.db import models

# # Create your models here.
# class HealthRelatedDetails(models.Model):
#     hrd_id = models.CharField(max_length=50, primary_key=True)
#     hrd_blood_type = models.CharField(max_length=5)
#     hrd_philhealth_id = models.CharField(max_length=50)
#     father = models.ForeignKey(Father, on_delete=models.CASCADE)
#     mother = models.ForeignKey(Mother, on_delete=models.CASCADE)
#     dof = models.ForeignKey(Dependents_Over_Five, on_delete=models.CASCADE)

#     class Meta:
#         db_table = 'health_related_details'

# class Dependents_Over_Five(models.Model):
#     dep_ov_five_id = models.CharField(max_length=50, primary_key=True)
#     dep = models.ForeignKey(Dependent, on_delete=models.CASCADE)

#     class Meta:
#         db_table = 'dep_ov_five'

# class Dependents_Under_Five(models.Model):
#     dep_un_five_id = models.CharField(max_length=50, primary_key=True)
#     dep = models.ForeignKey(Dependent, on_delete=models.CASCADE)

#     class Meta:
#         db_table = 'dependents_under_five'

# class WaterSupply(models.Model):
#     water_sup_id = models.CharField(max_length=50, primary_key=True)
#     water_sup_type = models.CharField(max_length=50)
#     water_sup_desc = models.TextField(max_length=1000)
#     hh = models.ForeignKey(Household, on_delete=models.CASCADE)

#     class Meta:
#         db_table = 'water_supply'

# class SanitaryFacility(models.Model):
#     sf_id = models.CharField(max_length=50, primary_key=True)
#     sf_type = models.CharField(max_length=50)
#     sf_toilet_type = models.CharField(max_length=50)

#     hh = models.ForeignKey(Household, on_delete=models.CASCADE)

#     class Meta:
#         db_table = 'sanitary_facility'

# class Facility_Details(models.Model):
#     fd_id = models.CharField(max_length=50, primary_key=True)
#     fd_description = models.CharField(max_length=200)
#     sf = models.ForeignKey(SanitaryFacility, on_delete=models.CASCADE)

# class Solid_Waste_Mgmt(models.Model):
#     swm_id = models.CharField(max_length=50, primary_key=True)
#     swn_desposal_type = models.CharField(max_length=50)
#     swm_desc = models.TextField(max_length=1000)
#     hh = models.ForeignKey(Household, on_delete=models.CASCADE)
    
#     class Meta:
#         db_table = 'solid_waste_mgmt'


# class Patient(models.Model):
#     pat_id = models.CharField(max_length=50, primary_key=True)
#     per = models.ForeignKey(Personal, on_depete=models.CASCADE)

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
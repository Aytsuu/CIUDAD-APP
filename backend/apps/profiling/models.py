from django.db import models
from datetime import date
from apps.administration.models import Staff

# Create your models here.

class Personal(models.Model):
    per_id = models.CharField(max_length=50,primary_key=True)
    per_lname = models.CharField(max_length=100)
    per_fname = models.CharField(max_length=100)
    per_mname = models.CharField(max_length=100, null=True)
    per_suffix = models.CharField(max_length=100, null=True)
    per_dob = models.DateField()
    per_sex = models.CharField(max_length=100)
    per_status = models.CharField(max_length=100)
    per_address = models.CharField(max_length=100)
    per_edAttainment = models.CharField(max_length=100, null=True)
    per_religion = models.CharField(max_length=100)
    per_contact = models.CharField(max_length=100)  

    class Meta:
        db_table = 'personal'

class Mother(models.Model):
    mother_id = models.BigAutoField(primary_key=True)
    per = models.ForeignKey(Personal, on_delete=models.CASCADE)

    class Meta:
        db_table = 'mother'

class Father(models.Model):
    father_id = models.BigAutoField(primary_key=True)
    per = models.ForeignKey(Personal, on_delete=models.CASCADE)

    class Meta:
        db_table = 'father'

class Family(models.Model):
    fam_id = models.CharField(max_length=50,primary_key=True)
    fam_indigenous = models.CharField(max_length=50)
    fam_date_registered = models.DateField(default=date.today)
    father = models.ForeignKey(Father, on_delete=models.CASCADE, null=True)
    mother = models.ForeignKey(Mother, on_delete=models.CASCADE, null=True)

    class Meta:
        db_table = 'family' 

class Dependent(models.Model):
    dep_id = models.BigAutoField(primary_key=True)
    per = models.ForeignKey(Personal, on_delete=models.CASCADE)
    fam = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='dependents') 

    class Meta:
        db_table = 'dependent'

class FamilyComposition(models.Model):
    fc_id = models.BigAutoField(primary_key=True)
    fam = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='compositions')
    per = models.ForeignKey(Personal, on_delete=models.CASCADE, related_name='compositions')

    class Meta:
        db_table = 'family_composition' 

class Sitio(models.Model):
    sitio_id = models.BigAutoField(primary_key=True)
    sitio_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'sitio'

class Household(models.Model):
    hh_id = models.CharField(max_length=50,primary_key=True)
    hh_nhts = models.CharField(max_length=50)
    hh_province = models.CharField(max_length=50)
    hh_city = models.CharField(max_length=50)       
    hh_barangay = models.CharField(max_length=50)
    hh_street = models.CharField(max_length=50)
    hh_date_registered = models.DateField(default=date.today)
    per = models.ForeignKey(Personal, on_delete=models.CASCADE)
    sitio = models.ForeignKey(Sitio, on_delete=models.CASCADE)

    class Meta:
        db_table = 'household'

class Building(models.Model): 
    build_id = models.BigAutoField(primary_key=True)
    build_type = models.CharField(max_length=100)
    hh = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='buildings')
    fam = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='buildings')
    
    class Meta:
        db_table = 'building'

class Registered(models.Model):
    reg_id = models.BigAutoField(primary_key=True)
    reg_date = models.DateField(default=date.today)
    per = models.ForeignKey(Personal, on_delete=models.CASCADE, related_name='registered')
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE)

    class Meta:
        db_table = 'registered'



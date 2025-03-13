from django.db import models

# Create your models here.

class Personal(models.Model):
    per_id = models.BigAutoField(primary_key=True)
    per_lname = models.CharField(max_length=100)
    per_fname = models.CharField(max_length=100)
    per_mname = models.CharField(max_length=100, null=True)
    per_suffix = models.CharField(max_length=100, null=True)
    per_dob = models.DateField()
    per_sex = models.CharField(max_length=100)
    per_status = models.CharField(max_length=100)
    per_religion = models.CharField(max_length=100)
    per_contact = models.CharField(max_length=100)  

    class Meta:
        db_table = 'personal'

class Mother(models.Model):
    mother_id = models.BigAutoField(primary_key=True)
    mother_lname = models.CharField(max_length=100, null=True)
    mother_fname = models.CharField(max_length=100, null=True)
    mother_mname = models.CharField(max_length=100, null=True)
    mother_suffix = models.CharField(max_length=100, null=True)
    mother_dob = models.DateField(null=True)
    mother_status = models.CharField(max_length=100, null=True)
    mother_religion = models.CharField(max_length=100, null=True)
    mother_ed_attainment = models.CharField(max_length=100, null=True)
    mother_contact = models.CharField(max_length=100, null=True)
    mother_philhealth = models.CharField(max_length=100, null=True)
    mother_vacstatus = models.CharField(max_length=100, null=True)
    mother_bloodtype = models.CharField(max_length=100, null=True)

    class Meta:
        db_table = 'mother'

class Father(models.Model):
    father_id = models.BigAutoField(primary_key=True)
    father_lname = models.CharField(max_length=100, null=True)
    father_fname = models.CharField(max_length=100, null=True)
    father_mname = models.CharField(max_length=100, null=True)
    father_suffix = models.CharField(max_length=100, null=True)
    father_dob = models.DateField(null=True)
    father_status = models.CharField(max_length=100, null=True)
    father_religion = models.CharField(max_length=100, null=True)
    father_ed_attainment = models.CharField(max_length=100, null=True)
    father_contact = models.CharField(max_length=100, null=True)
    father_philhealth = models.CharField(max_length=100, null=True)
    father_vacstatus = models.CharField(max_length=100, null=True)
    father_bloodtype = models.CharField(max_length=100, null=True)

    class Meta:
        db_table = 'father'

class Family(models.Model):
    fam_id = models.CharField(max_length=50,primary_key=True)
    fam_date_registered = models.DateField()
    father = models.ForeignKey(Father, on_delete=models.CASCADE)
    mother = models.ForeignKey(Mother, on_delete=models.CASCADE)

    class Meta:
        db_table = 'family' 

class Dependent(models.Model):
    dep_id = models.BigAutoField(primary_key=True)
    dep_lname = models.CharField(max_length=100, null=True)
    dep_fname = models.CharField(max_length=100, null=True)
    dep_mname = models.CharField(max_length=100, null=True)
    dep_suffix = models.CharField(max_length=100, null=True)
    dep_dob = models.DateField(null=True)
    dep_sex = models.CharField(max_length=100, null=True)
    fam = models.ForeignKey(Family, on_delete=models.CASCADE) 

    class Meta:
        db_table = 'dependent'

class FamilyComposition(models.Model):
    fc_id = models.BigAutoField(primary_key=True)
    fam = models.ForeignKey(Family, on_delete=models.CASCADE)
    per = models.ForeignKey(Personal, on_delete=models.CASCADE)

    class Meta:
        db_table = 'family_composition'
        unique_together = ('fam', 'per')

class Sitio(models.Model):
    sitio_id = models.BigAutoField(primary_key=True)
    sitio_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'sitio'

class Address(models.Model):
    add_id = models.BigAutoField(primary_key=True)
    add_province = models.CharField(max_length=100)
    add_city = models.CharField(max_length=100)
    add_barangay = models.CharField(max_length=100)
    add_street = models.CharField(max_length=100)
    sitio = models.ForeignKey(Sitio, on_delete=models.CASCADE)

    class Meta:
        db_table = 'address'

class Household(models.Model):
    hh_id = models.CharField(max_length=50,primary_key=True)
    hh_date_registered = models.DateField()
    per = models.ForeignKey(Personal, on_delete=models.CASCADE)
    add = models.ForeignKey(Address, on_delete=models.CASCADE)

    class Meta:
        db_table = 'household'

class Building(models.Model): 
    build_id = models.BigAutoField(primary_key=True)
    build_type = models.CharField(max_length=100)
    hh = models.ForeignKey(Household, on_delete=models.CASCADE)
    fam = models.ForeignKey(Family, on_delete=models.CASCADE)

    class Meta:
        db_table = 'building'
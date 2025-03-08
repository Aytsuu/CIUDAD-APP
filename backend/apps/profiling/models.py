from django.db import models

# Create your models here.

class Personal(models.Model):
    per_lname = models.CharField(max_length=100)
    per_fname = models.CharField(max_length=100)
    per_mname = models.CharField(max_length=100)
    per_suffix = models.CharField(max_length=100)
    per_mname = models.CharField(max_length=100)
    per_dob = models.DateField()
    per_sex = models.CharField(max_length=100)
    per_status = models.CharField(max_length=100)
    per_pob = models.CharField(max_length=200)
    per_citizenship = models.CharField(max_length=100)
    per_religion = models.CharField(max_length=100)
    per_contact = models.CharField(max_length=100)

    def __str__(self):
        return self.per_fname + self.per_lname

    class Meta:
        db_table = 'personal'

class Father(models.Model):
    mother_lname = models.CharField(max_length=100)
    mother_fname = models.CharField(max_length=100)
    mother_mname = models.CharField(max_length=100)
    mother_suffix = models.CharField(max_length=100)
    mother_mname = models.CharField(max_length=100)
    mother_dob = models.DateField()
    mother_status = models.CharField(max_length=100)

    class Meta:
        db_table = 'father'

class Mother(models.Model):
    father_lname = models.CharField(max_length=100)
    father_fname = models.CharField(max_length=100)
    father_mname = models.CharField(max_length=100)
    father_suffix = models.CharField(max_length=100)
    father_mname = models.CharField(max_length=100)
    father_dob = models.DateField()
    father_status = models.CharField(max_length=100)

    class Meta:
        db_table = 'mother'

class Family(models.Model):
    fam_date_registered = models.DateTimeField()
    father = models.ForeignKey(Father, on_delete=models.CASCADE)
    mother = models.ForeignKey(Mother, on_delete=models.CASCADE)

    class Meta:
        db_table = 'family'

class Dependent(models.Model):
    dep_lname = models.CharField(max_length=100)
    dep_fname = models.CharField(max_length=100)
    dep_mname = models.CharField(max_length=100)
    dep_suffix = models.CharField(max_length=100)
    dep_mname = models.CharField(max_length=100)
    dep_dob = models.DateField()
    dep_sex = models.CharField(max_length=100)
    fam = models.ForeignKey(Family, on_delete=models.CASCADE) 

    class Meta:
        db_table = 'dependent'

class FamilyComposition(models.Model):
    fam = models.ForeignKey(Family, on_delete=models.CASCADE)
    per = models.ForeignKey(Personal, on_delete=models.CASCADE)

    class Meta:
        db_table = 'family_composition'
        unique_together = ('fam', 'per')

class Sitio(models.Model):
    sitio_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'sitio'

class Address(models.Model):
    add_province = models.CharField(max_length=100)
    add_city = models.CharField(max_length=100)
    add_barangay = models.CharField(max_length=100)
    add_street = models.CharField(max_length=100)
    sitio = models.ForeignKey(Sitio, on_delete=models.CASCADE)

    class Meta:
        db_table = 'address'

class Household(models.Model):
    hh_date_registered = models.DateTimeField()
    add = models.ForeignKey(Address, on_delete=models.CASCADE)

    class Meta:
        db_table = 'household'

class Ownership(models.Model): 
    hh = models.ForeignKey(Household, on_delete=models.CASCADE)
    fam = models.ForeignKey(Family, on_delete=models.CASCADE)
    own_type = models.CharField(max_length=100)

    class Meta:
        db_table = 'ownership'
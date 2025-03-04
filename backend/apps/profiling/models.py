from django.db import models

# Create your models here.

class Personal(models.Model):
    per_lname = models.CharField(max_length=50)
    per_fname = models.CharField(max_length=50)
    per_mname = models.CharField(max_length=50)
    per_suffix = models.CharField(max_length=50)
    per_mname = models.CharField(max_length=50)
    per_dob = models.DateField()
    per_sex = models.CharField(max_length=50)
    per_status = models.CharField(max_length=50)
    per_pob = models.CharField(max_length=200)
    per_citizenship = models.CharField(max_length=50)
    per_religion = models.CharField(max_length=50)
    per_contact = models.CharField(max_length=50)

class Father(models.Model):
    mother_lname = models.CharField(max_length=50)
    mother_fname = models.CharField(max_length=50)
    mother_mname = models.CharField(max_length=50)
    mother_suffix = models.CharField(max_length=50)
    mother_mname = models.CharField(max_length=50)
    mother_dob = models.DateField()
    mother_status = models.CharField(max_length=50)

class Mother(models.Model):
    father_lname = models.CharField(max_length=50)
    father_fname = models.CharField(max_length=50)
    father_mname = models.CharField(max_length=50)
    father_suffix = models.CharField(max_length=50)
    father_mname = models.CharField(max_length=50)
    father_dob = models.DateField()
    father_status = models.CharField(max_length=50)

class Family(models.Model):
    fam_date_registered = models.DateTimeField()
    father_id = models.ForeignKey(Father, on_delete=models.CASCADE)
    mother_id = models.ForeignKey(Mother, on_delete=models.CASCADE)

class Dependent(models.Model):
    dep_lname = models.CharField(max_length=50)
    dep_fname = models.CharField(max_length=50)
    dep_mname = models.CharField(max_length=50)
    dep_suffix = models.CharField(max_length=50)
    dep_mname = models.CharField(max_length=50)
    dep_dob = models.DateField()
    dep_sex = models.CharField(max_length=50)
    fam_id = models.ForeignKey(Family, on_delete=models.CASCADE) 

class FamilyComposition(models.Model):
    fam_id = models.ForeignKey(Family, on_delete=models.CASCADE)
    per_id = models.ForeignKey(Personal, on_delete=models.CASCADE)



class Ownership(models.Model): 
    hh_id = models.ForeignKey()
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

class Personal(models.Model):
    per_id = models.BigAutoField(primary_key=True)
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

    def __str__(self):
        name_parts = [self.per_lname, self.per_fname]
        if self.per_mname:
            name_parts.append(self.per_mname)
        if self.per_suffix:
            name_parts.append(self.per_suffix)
        return ', '.join(name_parts)


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
    hh_province = models.CharField(max_length=50)
    hh_city = models.CharField(max_length=50)       
    hh_barangay = models.CharField(max_length=50)
    hh_street = models.CharField(max_length=50)
    hh_date_registered = models.DateField(default=date.today)
    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE)
    sitio = models.ForeignKey(Sitio, on_delete=models.CASCADE)
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, null=True, related_name="households")

    class Meta:
        db_table = 'household'

    def __str__(self):
        return f"Household {self.hh_id} - {self.rp} in {self.sitio}"


class Mother(models.Model):
    mother_id = models.BigAutoField(primary_key=True)
    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE)

    class Meta:
        db_table = 'mother'

    def __str__(self):
        return f"Mother: {self.rp}"


class Father(models.Model):
    father_id = models.BigAutoField(primary_key=True)
    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE)

    class Meta:
        db_table = 'father'

    def __str__(self):
        return f"Father: {self.rp}"


class Guardian(models.Model):
    guard_id = models.BigAutoField(primary_key=True)
    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE)

    class Meta:
        db_table = 'guardian'

    def __str__(self):
        return f"Guardian: {self.rp}"


class Family(models.Model):
    fam_id = models.CharField(max_length=50, primary_key=True)
    fam_indigenous = models.CharField(max_length=50)
    fam_building = models.CharField(max_length=50)
    fam_date_registered = models.DateField(default=date.today)
    father = models.ForeignKey(Father, on_delete=models.CASCADE, null=True, related_name="families")
    mother = models.ForeignKey(Mother, on_delete=models.CASCADE, null=True, related_name="families")
    guard = models.ForeignKey(Guardian, on_delete=models.CASCADE, null=True, related_name="families")
    hh = models.ForeignKey(Household, on_delete=models.CASCADE)
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, null=True, related_name="families")

    class Meta:
        db_table = 'family' 

    def __str__(self):
        members = []
        if self.father:
            members.append(str(self.father))
        if self.mother:
            members.append(str(self.mother))
        if self.guard:
            members.append(str(self.guard))
        return f"Family {self.fam_id} ({', '.join(members)})"


class Dependent(models.Model):
    dep_id = models.BigAutoField(primary_key=True)
    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE)
    fam = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='dependents') 

    class Meta:
        db_table = 'dependent'

    def __str__(self):
        return f"Dependent: {self.rp} in Family {self.fam.fam_id}"


class FamilyComposition(models.Model):
    fc_id = models.BigAutoField(primary_key=True)
    fam = models.ForeignKey(Family, on_delete=models.CASCADE, related_name='compositions')
    rp = models.ForeignKey(ResidentProfile, on_delete=models.CASCADE, related_name='compositions')

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


class Business(models.Model):
    bus_id = models.BigAutoField(primary_key=True)
    bus_name = models.CharField(max_length=100)
    bus_gross_sales = models.FloatField()
    bus_province = models.CharField(max_length=50)
    bus_city = models.CharField(max_length=50)
    bus_barangay = models.CharField(max_length=50)
    bus_street = models.CharField(max_length=50)
    bus_respondentLname = models.CharField(max_length=50)
    bus_respondentFname = models.CharField(max_length=50)
    bus_respondentMname = models.CharField(max_length=50)
    bus_respondentSex = models.CharField(max_length=50)
    bus_respondentDob = models.DateField()
    bus_doc_url = models.TextField()
    bus_date_registered = models.DateField(default=date.today)
    sitio = models.ForeignKey(Sitio, on_delete=models.CASCADE)
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, null=True, related_name='businesses')

    class Meta:
        db_table = 'business'

    def __str__(self):
        return f"{self.bus_name} (Owner: {self.bus_respondentLname})"
    

from django.db import models

class Complainant(models.Model):
    cpnt_id = models.BigAutoField(primary_key=True)
    cpnt_name = models.CharField(max_length=100)
    add = models.ForeignKey('profiling.Address', on_delete=models.CASCADE, related_name='complainant')
    
    class Meta:
        db_table = 'complainant'
        
class Accused(models.Model):
    acsd_id = models.BigAutoField(primary_key=True)
    acsd_name = models.CharField(max_length=100)
    add = models.ForeignKey('profiling.Address', on_delete=models.CASCADE, related_name='accused')
    
    class Meta:
        db_table = 'accused'
            
class Complaint(models.Model):
    comp_id = models.BigAutoField(primary_key=True)
    comp_incident_type = models.CharField(max_length=100)
    comp_datetime = models.CharField(max_length=100)
    comp_allegation = models.TextField()
    comp_created_at = models.DateTimeField(auto_now_add=True)
    comp_is_archive = models.BooleanField(default=False)
    cpnt = models.ForeignKey(Complainant, related_name='Complainant', on_delete=models.CASCADE)
    acsd = models.ForeignKey(Accused, related_name='Accused', on_delete=models.CASCADE)   
                                     
    class Meta:
        db_table = 'complaint'

class Complaint_File(models.Model):
    cf_id = models.BigAutoField(primary_key=True)
    comp = models.ForeignKey(Complaint, related_name='media', on_delete=models.CASCADE)
    file = models.ForeignKey('file.File', related_name='file', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'complaint_file'
        
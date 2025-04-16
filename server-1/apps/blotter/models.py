from django.db import models

class Blotter(models.Model):
    bc_complainant = models.CharField(max_length=255)
    bc_cmplnt_address = models.CharField(max_length=255)
    bc_accused = models.CharField(max_length=255)
    bc_accused_address = models.CharField(max_length=255)
    bc_incident_type = models.CharField(max_length=100)
    bc_datetime = models.CharField(max_length=100)
    bc_allegation = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
                                                                                                         
    class Meta:
        db_table = 'blotter'
    
class BlotterMedia(models.Model):
    blotter = models.ForeignKey(Blotter, related_name='media', on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    storage_path = models.CharField(max_length=255)
    url = models.URLField()
    file_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'blotter_media'
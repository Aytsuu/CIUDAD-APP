from django.db import models

class File(models.Model):
  file_id = models.BigAutoField(primary_key=True)
  file_name = models.TextField()
  file_type = models.CharField(max_length=50)
  file_path = models.TextField()
  file_url = models.TextField()

  class Meta:
    db_table = 'file'
  
  def __str__(self):
    return f"Name: {self.file_name} Type: {self.file_type}"
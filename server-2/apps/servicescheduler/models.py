from django.db import models

# Create your models here.
class ServiceScheduler(models.Model):
	ss_id = models.BigAutoField(primary_key=True)
	service = models.CharField(max_length=100)
	meridiem = models.CharField(max_length=2, choices=[('AM', 'AM'), ('PM', 'PM')])

	class Meta:
		db_table = 'service_scheduler'
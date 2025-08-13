from django.db import models


# Create your models here.
class Service(models.Model):
	service_id = models.AutoField(primary_key=True)
	service_name = models.CharField(max_length=100)

	class Meta:
		db_table = 'service'


class Day(models.Model):
	day_id = models.BigAutoField(primary_key=True)
	day = models.CharField(max_length=100)
	day_description = models.TextField(default='', blank=True, null=True)

	class Meta:
		db_table = 'day'
		
class ServiceScheduler(models.Model):
	ss_id = models.BigAutoField(primary_key=True)
	service_id = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='service_scheduler', db_column='service_id')
	day_id = models.ForeignKey(Day, on_delete=models.CASCADE, related_name='service_scheduler', db_column='day_id')
	meridiem = models.CharField(max_length=2, choices=[('AM', 'AM'), ('PM', 'PM')])

	class Meta:
		db_table = 'service_scheduler'
from django.db import models

class CouncilScheduling(models.Model):
    ce_id = models.BigAutoField(primary_key=True)
    ce_title = models.CharField(max_length=100)
    ce_place = models.CharField(max_length=100)
    ce_date = models.DateField()
    ce_time = models.TimeField()
    ce_category = models.CharField(max_length=100)
    ce_description = models.CharField(max_length=100)
    ce_attendees = models.CharField(max_length=500)
    feat_id = models.ForeignKey(Feature, on_delete=models.CASCADE)

    class Meta:
        db_table = 'council_event'


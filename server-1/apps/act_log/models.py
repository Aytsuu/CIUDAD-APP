from django.db import models
from apps.administration.models import Feature, Staff

class ActivityLog(models.Model):
    act_id = models.AutoField(primary_key=True)
    act_timestamp = models.DateTimeField()
    act_type = models.CharField(max_length=100)
    act_description = models.TextField()
    feat = models.ForeignKey(Feature, on_delete=models.CASCADE)
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE)

    class Meta:
        db_table = 'activity_log'

    def __str__(self):
        return f"{self.act_type} at {self.act_timestamp}" 
from django.db import models
from apps.administration.models import Feature, Staff

class ActivityLog(models.Model):
    act_id = models.AutoField(primary_key=True)
    act_timestamp = models.DateTimeField()
    act_type = models.CharField(max_length=100)
    act_description = models.TextField()
    act_module = models.CharField(max_length=50, help_text="Module/App name (e.g., 'treasurer', 'clerk', 'council')")
    act_action = models.CharField(max_length=50, help_text="Action performed (e.g., 'create', 'update', 'delete')")
    act_record_id = models.CharField(max_length=100, null=True, blank=True, help_text="ID of the affected record")
    feat = models.ForeignKey(Feature, on_delete=models.CASCADE)
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE)

    class Meta:
        db_table = 'activity_log'
        indexes = [
            models.Index(fields=['act_module']),
            models.Index(fields=['act_action']),
            models.Index(fields=['act_timestamp']),
        ]

    def __str__(self):
        return f"{self.act_module} - {self.act_type} at {self.act_timestamp}" 

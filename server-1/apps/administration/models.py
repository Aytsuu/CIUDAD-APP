from django.db import models
from datetime import date
from ..abstract_classes import AbstractModels

class Position(AbstractModels):
    pos_id = models.BigAutoField(primary_key=True)    
    pos_title = models.CharField(max_length=100)
    pos_max = models.IntegerField(default=1)
    pos_group = models.CharField(max_length=100, null=True)
    pos_category = models.CharField(max_length=100)
    pos_is_predefined = models.BooleanField(default=False)
    staff = models.ForeignKey('Staff', on_delete=models.CASCADE, related_name='positions', null=True)

    class Meta:
        db_table = 'position'

class Feature(AbstractModels):
    feat_id = models.BigAutoField(primary_key=True)
    feat_name = models.CharField(max_length=100)
    feat_group = models.CharField(max_length=100)
    feat_category = models.CharField(max_length=100)
    feat_url = models.TextField()

    class Meta:
        db_table = 'feature'

class Assignment(AbstractModels):
    assi_id = models.BigAutoField(primary_key=True)
    assi_permission = models.CharField(max_length=20, default="VIEW ONLY")
    feat = models.ForeignKey(Feature, on_delete=models.CASCADE)
    pos = models.ForeignKey(Position, on_delete=models.CASCADE)
    assi_date = models.DateField(default=date.today)
    staff = models.ForeignKey('Staff', on_delete=models.CASCADE, related_name='assignments')
    
    class Meta: 
        db_table = 'assignment'
        unique_together = (('feat', 'pos'))


class Staff(AbstractModels):
    staff_id = models.CharField(primary_key=True,max_length=50)
    staff_assign_date = models.DateField(default=date.today)
    staff_type = models.CharField(max_length=20, default="BARANGAY STAFF")
    rp = models.ForeignKey('profiling.ResidentProfile', on_delete=models.CASCADE, related_name="staff_assignments")
    pos = models.ForeignKey(Position, on_delete=models.CASCADE, related_name='staffs')
    manager = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subordinates')
    
    class Meta: 
        db_table = 'staff'
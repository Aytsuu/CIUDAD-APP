from django.db import models
from datetime import date

# Create your models here.
class Position(models.Model):
    pos_id = models.BigAutoField(primary_key=True)
    pos_title = models.CharField(max_length=100)
    pos_max = models.IntegerField(default=1)
    staff = models.ForeignKey('Staff', on_delete=models.CASCADE, related_name='positions')

    class Meta:
        db_table = 'position'

class Feature(models.Model):
    feat_id = models.BigAutoField(primary_key=True)
    feat_name = models.CharField(max_length=50)
    feat_category = models.CharField(max_length=50)
    feat_url = models.CharField(max_length=100)

    class Meta:
        db_table = 'feature'

class Assignment(models.Model):
    assi_id = models.BigAutoField(primary_key=True)
    feat = models.ForeignKey(Feature, on_delete=models.CASCADE)
    pos = models.ForeignKey(Position, on_delete=models.CASCADE)
    assi_date = models.DateField(default=date.today)
    staff = models.ForeignKey('Staff', on_delete=models.CASCADE, related_name='assignments')

    class Meta: 
        db_table = 'assignment'
        unique_together = (('feat', 'pos'))

class Permission(models.Model):
    perm_id = models.BigAutoField(primary_key=True)
    view = models.BooleanField(default=True)
    create = models.BooleanField(default=False)
    update = models.BooleanField(default=False)
    delete = models.BooleanField(default=False)
    assi = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='permissions')

    class Meta:
        db_table = 'permission'

class Staff(models.Model):
    staff_id = models.CharField(primary_key=True,max_length=50)
    staff_assign_date = models.DateField(default=date.today)
    rp = models.ForeignKey('profiling.ResidentProfile', on_delete=models.CASCADE, related_name="staff_assignments")
    pos = models.ForeignKey(Position, on_delete=models.CASCADE, related_name='staffs')
    manager = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subordinates')
    
    class Meta: 
        db_table = 'staff'


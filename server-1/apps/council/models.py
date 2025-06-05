from django.db import models
from datetime import date

class CouncilScheduling(models.Model):
    ce_id = models.BigAutoField(primary_key=True)
    ce_title = models.CharField(max_length=100)
    ce_place = models.CharField(max_length=100)
    ce_date = models.DateField(default=date.today)
    ce_time = models.TimeField()
    ce_type = models.CharField(max_length=100)
    ce_description = models.CharField(max_length=100)
    ce_is_archive = models.BooleanField(default=False)
    
    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    class Meta:
        db_table = 'council_event'

class CouncilAttendees(models.Model):
    atn_id = models.BigAutoField(primary_key=True)
    atn_name = models.CharField(max_length=200, default='')
    atn_designation = models.CharField(max_length=200, default='')
    atn_present_or_absent = models.CharField(max_length=100)
    ce_id = models.ForeignKey('CouncilScheduling', on_delete=models.CASCADE)
    
    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    class Meta:
        db_table = 'attendees'

class CouncilAttendance(models.Model):
    att_id = models.BigAutoField(primary_key=True)
    ce_id = models.ForeignKey('CouncilScheduling', on_delete=models.CASCADE)
    
    file = models.ForeignKey(
        'file.File',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='file_id'
    )    

    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    class Meta:
        db_table = 'attendance_sheet'


class Template(models.Model):
    temp_id = models.BigAutoField(primary_key=True)
    temp_header = models.CharField(max_length=200)
    # temp_below_headerContent = models.CharField(max_length=999, null=True, blank=True)
    temp_below_headerContent = models.TextField(null=True, blank=True) 
    temp_title = models.CharField(max_length=200)
    temp_subtitle = models.CharField(max_length=200, null=True, blank=True)
    temp_w_sign = models.BooleanField(default=False)
    temp_w_seal = models.BooleanField(default=False)
    temp_w_summon = models.BooleanField(default=False)
    temp_paperSize = models.CharField(max_length=100)
    temp_margin = models.CharField(max_length=100)
    temp_filename = models.CharField(max_length=100)
    temp_body = models.TextField(null=True, blank=True) 
    temp_is_archive = models.BooleanField(default=False)

    class Meta:
        db_table = 'template'

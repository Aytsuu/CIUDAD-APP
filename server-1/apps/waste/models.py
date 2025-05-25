from django.db import models
from datetime import date
from django.core.validators import MaxValueValidator

# Create your models here.
# KANI UNA 

class WasteEvent(models.Model):
    we_num = models.BigAutoField(primary_key=True)
    we_name = models.CharField(max_length=100, null=True)
    we_location = models.CharField(max_length=100, null=True)
    we_date = models.DateField(null=True)
    we_time = models.TimeField(null=True)
    we_description = models.CharField(max_length=200, null=True)
    we_organizer = models.CharField(max_length=100, null=True)
    we_invitees = models.CharField(max_length=100, null=True)
    #wf_id = models.ForeignKey(?, on_delete=models.CASCADE)
    # feat_id = models.ForeignKey(Feature, on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'waste_event'

class WasteCollectionStaff(models.Model):
    wstf_id = models.BigAutoField(primary_key=True)
    # ra_id = models.ForeignKey(ResidentAccount, on_delete=models.CASCADE)
    # pos_id = models.ForeignKey(Postion, on_delete=models.CASCADE)

    class Meta:
        db_table = 'waste_collection_staff'


class WasteCollectionAssignment(models.Model):
    was_id = models.BigAutoField(primary_key=True)
    wstf_id = models.ForeignKey(WasteCollectionStaff, on_delete=models.CASCADE)
    # sitio_id = models.ForeignKey(Sitio, on_delete=models.CASCADE)
    # staff_id = models.ForeignKey(Staff, on_delete=models.CASCADE)

    class Meta:
        db_table = 'waste_collection_assignment'


class WasteCollectionSched(models.Model):
    wc_num = models.BigAutoField(primary_key=True)
    wc_date = models.DateField(null=True)
    wc_time = models.TimeField(null=True)
    wc_add_info = models.CharField(max_length=200, null=True)
    was_id = models.ForeignKey(WasteCollectionAssignment, on_delete=models.CASCADE)
    # feat_id = models.ForeignKey(Feature, on_delete=models.CASCADE)

    class Meta:
        db_table = 'waste_collection_sched'


class WasteHotspot(models.Model):
    wh_num = models.BigAutoField(primary_key=True)
    wh_date = models.DateField(null=True)
    wh_time = models.TimeField(null=True)
    wh_add_info = models.CharField(max_length=200, null=True)
    # sitio_id = models.ForeignKey(Sitio, on_delete=models.CASCADE)
    # staff_id = models.ForeignKey(Staff, on_delete=models.CASCADE)
    # feat_id = models.ForeignKey(Feature, on_delete=models.CASCADE)

    class Meta:
        db_table = 'waste_hotspot'


class WasteReport(models.Model):
    rep_id = models.BigAutoField(primary_key=True)
    rep_image = models.CharField(default="none")
    rep_matter = models.CharField(default="none")
    rep_location = models.CharField(default="none")
    rep_add_details = models.CharField(max_length=200, null=True)
    rep_violator = models.CharField(default="none")
    rep_complainant = models.CharField(default="none")
    rep_contact = models.CharField(default="none")
    rep_status = models.CharField(max_length=100, default="pending")
    rep_date = models.DateField(default=date.today)
    rep_date_resolved = models.DateField(null=True)
    # ra_id = models.ForeignKey(ResidentAccount, on_delete=models.CASCADE)
    # sitio_id = models.ForeignKey(Sitio, on_delete=models.CASCADE)
    # feat_id = models.ForeignKey(Feature, on_delete=models.CASCADE)

    class Meta:
        db_table = 'waste_report'

class WastePersonnel(models.Model):
    wstp_id = models.BigAutoField(primary_key=True)
    # staff_id = models.ForeignKey(Staff, on_delete=models.CASCADE)

    class Meta:
        db_table = 'waste_personnel'

class WasteTruck(models.Model):
    truck_id = models.BigAutoField(primary_key=True)
    truck_plate_num = models.CharField(max_length=20)
    truck_model = models.CharField(max_length=50)
    truck_capacity = models.IntegerField(max_length=500)
    truck_status = models.CharField(max_length=50, default="operational")
    truck_last_maint = models.DateField(default=date.today)
    # staff_id = models.ForeignKey(Staff, on_delete=models.CASCADE)

    class Meta:
        db_table = 'truck'
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
    rep_resolved_img = models.CharField(null=True)

    # ra_id = models.ForeignKey(ResidentAccount, on_delete=models.CASCADE)
    # sitio_id = models.ForeignKey(Sitio, on_delete=models.CASCADE)
    # feat_id = models.ForeignKey(Feature, on_delete=models.CASCADE)

    class Meta:
        db_table = 'waste_report'

class WastePersonnel(models.Model):
    wstp_id = models.BigAutoField(primary_key=True)
    staff_id = models.ForeignKey('administration.Staff', on_delete=models.CASCADE)

    class Meta:
        db_table = 'waste_personnel'

    def get_staff_position(self):
        return self.staff_id.pos.pos_title if self.staff_id.pos else None

    def get_staff_name(self):
        if self.staff_id.rp and self.staff_id.rp.per:
            return f"{self.staff_id.rp.per.first_name} {self.staff_id.rp.per.last_name}"
        return "Unknown"

    
    def to_dict(self):
        return {
            "wstp_id": self.wstp_id,
            "staff": {
                "staff_id": self.staff_id.staff_id,
                "staff_assign_date": self.staff_id.staff_assign_date.isoformat(),
                "rp": {
                    "rp_id": self.staff_id.rp.rp_id,
                    "rp_date_registered": self.staff_id.rp.rp_date_registered.isoformat(),
                    "per": {
                        "per_id": self.staff_id.rp.per.per_id,
                        "per_lname": self.staff_id.rp.per.per_lname,
                        "per_fname": self.staff_id.rp.per.per_fname,
                        "per_mname": self.staff_id.rp.per.per_mname,
                        "per_suffix": self.staff_id.rp.per.per_suffix,
                        "per_dob": self.staff_id.rp.per.per_dob.isoformat(),
                        "per_sex": self.staff_id.rp.per.per_sex,
                        "per_status": self.staff_id.rp.per.per_status,
                        "per_edAttainment": self.staff_id.rp.per.per_edAttainment,
                        "per_religion": self.staff_id.rp.per.per_religion,
                        "per_contact": self.staff_id.rp.per.per_contact,
                    }
                },
                "pos": {
                    "pos_id": self.staff_id.pos.pos_id,
                    "pos_title": self.staff_id.pos.pos_title,
                    "pos_max": self.staff_id.pos.pos_max,
                }
            }
        }

class WasteTruck(models.Model):
    truck_id = models.BigAutoField(primary_key=True)
    truck_plate_num = models.CharField(max_length=20)
    truck_model = models.CharField(max_length=50)
    truck_capacity = models.IntegerField()
    truck_status = models.CharField(
        max_length=50,
        choices=[
            ('Operational', 'Operational'),
            ('Maintenance', 'Maintenance')
        ],
        default="Operational"
    )
    truck_last_maint = models.DateField(default=date.today)

    class Meta:
        db_table = 'truck'


class WasteCollectionSched(models.Model):
    wc_num = models.BigAutoField(primary_key=True)
    wc_date = models.DateField(null=True)
    wc_time = models.TimeField(null=True)
    wc_add_info = models.CharField(max_length=200, null=True)
    wc_is_archive = models.BooleanField(default=False)
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, null=True, blank=True)
    # feat_id = models.ForeignKey(Feature, on_delete=models.CASCADE)

    class Meta:
        db_table = 'waste_collection_sched'

class WasteCollectionAssignment(models.Model):
    was_id = models.BigAutoField(primary_key=True)
    sitio = models.ForeignKey('profiling.Sitio', on_delete=models.CASCADE, null=True, blank=True)
    wstp = models.ForeignKey(WastePersonnel, on_delete=models.CASCADE, null=True, blank=True)
    wc_num = models.ForeignKey(WasteCollectionSched, on_delete=models.CASCADE, null=True, blank=True)
    truck = models.ForeignKey(WasteTruck, on_delete=models.CASCADE, null=True, blank=True)
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = 'waste_collection_assignment'


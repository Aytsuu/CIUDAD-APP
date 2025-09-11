from django.db import models
from datetime import date, datetime
from django.core.exceptions import ObjectDoesNotExist

def current_time():
    return datetime.now().time()


class WasteEvent(models.Model):
    we_num = models.BigAutoField(primary_key=True)
    we_name = models.CharField(max_length=100, null=True)
    we_location = models.CharField(max_length=100, null=True)
    we_date = models.DateField(null=True)
    we_time = models.TimeField(null=True)
    we_description = models.CharField(max_length=200, null=True)
    we_organizer = models.CharField(max_length=100, null=True)
    we_invitees = models.CharField(max_length=100, null=True)
    
    class Meta:
        db_table = 'waste_event'

class WasteCollectionStaff(models.Model):
    wstf_id = models.BigAutoField(primary_key=True)
    
    class Meta:
        db_table = 'waste_collection_staff'


class WasteReport(models.Model):
    rep_id = models.BigAutoField(primary_key=True)
    rep_matter = models.CharField(default="none")
    rep_location = models.CharField(default="none")
    rep_add_details = models.CharField(max_length=200, null=True)
    rep_violator = models.CharField(default="none")
    rep_anonymous = models.BooleanField(default=False)
    rep_contact = models.CharField(default="none")
    rep_status = models.CharField(max_length=100, default="pending")
    rep_cancel_reason =  models.CharField(max_length=200, null=True)
    rep_date = models.DateTimeField(null=True)
    rep_date_resolved = models.DateTimeField(null=True)
    rep_date_cancelled = models.DateTimeField(null=True)

    sitio_id = models.ForeignKey(
        'profiling.Sitio', 
        on_delete=models.CASCADE,
        null=True, 
        blank=True, 
        db_column='sitio_id'
    )

    rp_id = models.ForeignKey(
        'profiling.ResidentProfile', 
        on_delete=models.CASCADE,
        null=True, 
        blank=True, 
        db_column='rp_id'
    )

    staff_id = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )




    # ra_id = models.ForeignKey(ResidentAccount, on_delete=models.CASCADE)
    # sitio_id = models.ForeignKey(Sitio, on_delete=models.CASCADE)
    # feat_id = models.ForeignKey(Feature, on_delete=models.CASCADE)

    class Meta:
        db_table = 'waste_report'


class WasteReport_File(models.Model):
    wrf_id = models.BigAutoField(primary_key=True)
    wrf_name = models.CharField(max_length=255)
    wrf_type = models.CharField(max_length=100)
    wrf_path = models.CharField(max_length=500)
    wrf_url = models.CharField(max_length=500)

    rep_id = models.ForeignKey(
        WasteReport,
        on_delete=models.CASCADE,
        null=True, 
        blank=True,
        related_name='waste_report_file',
        db_column='rep_id'
    )

    class Meta:
        db_table = 'waste_report_file'


class WasteReportResolve_File(models.Model):
    wrsf_id = models.BigAutoField(primary_key=True)
    wrsf_name = models.CharField(max_length=255)
    wrsf_type = models.CharField(max_length=100)
    wrsf_path = models.CharField(max_length=500)
    wrsf_url = models.CharField(max_length=500)

    rep_id = models.ForeignKey(
        WasteReport,
        on_delete=models.CASCADE,
        null=True, 
        blank=True,
        related_name='waste_report_rslv_file',
        db_column='rep_id'
    )

    class Meta:
        db_table = 'waste_report_rslv_file'


class WastePersonnel(models.Model):
    wstp_id = models.BigAutoField(primary_key=True)
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE)

    class Meta:
        db_table = 'waste_personnel'

    def get_staff_position(self):
        return self.staff.pos.pos_title if self.staff.pos else None  

    def get_staff_name(self):
        if self.staff.rp and self.staff.rp.per:  
            return f"{self.staff.rp.per.per_fname} {self.staff.rp.per.per_lname}"
        return "Unknown"
    
    def to_dict(self):
        return {
            "wstp_id": self.wstp_id,
            "staff": {
                "staff": self.staff.staff_id,  
                "staff_assign_date": self.staff.staff_assign_date.isoformat(),  
                "rp": {
                    "rp_id": self.staff.rp.rp_id,  
                    "rp_date_registered": self.staff.rp.rp_date_registered.isoformat(),  
                    "per": {
                        "per_id": self.staff.rp.per.per_id,  
                        "per_lname": self.staff.rp.per.per_lname,  
                        "per_fname": self.staff.rp.per.per_fname,  
                        "per_mname": self.staff.rp.per.per_mname,  
                        "per_suffix": self.staff.rp.per.per_suffix,  
                        "per_dob": self.staff.rp.per.per_dob.isoformat(),  
                        "per_sex": self.staff.rp.per.per_sex,  
                        "per_status": self.staff.rp.per.per_status,  
                        "per_edAttainment": self.staff.rp.per.per_edAttainment,  
                        "per_religion": self.staff.rp.per.per_religion,  
                        "per_contact": self.staff.rp.per.per_contact,  
                    }
                },
                "pos": {
                    "pos_id": self.staff.pos.pos_id,  
                    "pos_title": self.staff.pos.pos_title,  
                    "pos_max": self.staff.pos.pos_max, 
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
    truck_is_archive = models.BooleanField(default=False) 

    class Meta:
        db_table = 'truck'


class WasteCollectionSched(models.Model):
    wc_num = models.BigAutoField(primary_key=True)
    wc_date = models.DateField(null=True)
    wc_time = models.TimeField(null=True)
    wc_add_info = models.CharField(max_length=200, null=True)
    wc_is_archive = models.BooleanField(default=False)
    sitio = models.ForeignKey('profiling.Sitio', on_delete=models.CASCADE, null=True, blank=True)
    wstp = models.ForeignKey(WastePersonnel, on_delete=models.CASCADE, null=True, blank=True)
    truck = models.ForeignKey(WasteTruck, on_delete=models.CASCADE, null=True, blank=True)
    staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = 'waste_collection_sched'

# class WasteCollectionAssignment(models.Model):
#     was_id = models.BigAutoField(primary_key=True)
#     sitio = models.ForeignKey('profiling.Sitio', on_delete=models.CASCADE, null=True, blank=True)
#     wc_num = models.ForeignKey(WasteCollectionSched, on_delete=models.CASCADE, null=True, blank=True)
#     wstp = models.ForeignKey(WastePersonnel, on_delete=models.CASCADE, null=True, blank=True)
#     truck = models.ForeignKey(WasteTruck, on_delete=models.CASCADE, null=True, blank=True)
#     staff = models.ForeignKey('administration.Staff', on_delete=models.CASCADE, null=True, blank=True)

#     class Meta:
#         db_table = 'waste_collection_assignment'

class WasteCollector(models.Model):
    wasc_id = models.BigAutoField(primary_key=True)
    wc_num = models.ForeignKey(WasteCollectionSched, on_delete=models.CASCADE, null=True, blank=True)
    wstp = models.ForeignKey(WastePersonnel, on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        db_table = 'waste_collector'


class GarbagePickupRequestFile(models.Model):
    gprf_id = models.BigAutoField(primary_key=True)
    gprf_name = models.CharField(max_length=255)
    gprf_type = models.CharField(max_length=100)
    gprf_path = models.CharField(max_length=500)
    gprf_url = models.CharField(max_length=500)

    class Meta:
        db_table = 'garbage_pickup_request_file'


class Garbage_Pickup_Request(models.Model):
    garb_id = models.CharField(primary_key=True, max_length=15, editable=False)
    garb_location = models.CharField(max_length=250, null=False)
    garb_waste_type = models.CharField(max_length=250, null=False)
    garb_pref_date = models.DateField(default=date.today)
    garb_pref_time = models.TimeField(default=current_time)
    garb_req_status = models.CharField(max_length=20, null=False)
    garb_additional_notes = models.TextField()
    garb_created_at = models.DateTimeField(default=datetime.now)
    rp = models.ForeignKey(
        'profiling.ResidentProfile', 
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    
    gprf = models.ForeignKey(
        'GarbagePickupRequestFile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='gprf_id'
    )
    
    sitio_id = models.ForeignKey(
        'profiling.Sitio',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        db_column='sitio_id'
    )

    class Meta:
        db_table = 'garbage_pickup_request'

    def save(self, *args, **kwargs):
        if not self.garb_id:
            self.garb_id = self.generate_custom_id()
        super().save(*args, **kwargs)

    def generate_custom_id(self):
        current_year = datetime.now().year % 100  
        year_suffix = f"-{current_year:02d}"
        
        try:
            current_year_ids = Garbage_Pickup_Request.objects.filter(
                garb_id__endswith=year_suffix
            )
            
            if current_year_ids.exists():
                max_id = 0
                for obj in current_year_ids:
                    try:
                        numeric_part = obj.garb_id[3:8] 
                        numeric_value = int(numeric_part)
                        if numeric_value > max_id:
                            max_id = numeric_value
                    except (ValueError, IndexError):
                        continue
                
                next_number = max_id + 1
            else:
                next_number = 0
                
        except ObjectDoesNotExist:
            next_number = 0
        
        number_part = f"{next_number:05d}"
        
        return f"GPR{number_part}{year_suffix}"

    def get_resident_name(self):
        return str(self.rp.per) if self.rp and self.rp.per else "Unknown"
    
class Pickup_Request_Decision(models.Model):
    dec_id = models.BigAutoField(primary_key=True)
    dec_reason = models.TextField(null=True, blank=True)
    dec_date = models.DateTimeField(default=datetime.now)
    garb_id = models.ForeignKey(
        Garbage_Pickup_Request,
        on_delete=models.CASCADE,
        db_column='garb_id' 
    )
    staff_id = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )
    

    class Meta:
        db_table = 'pickup_request_decision'
    
class Pickup_Assignment(models.Model):
    pick_id = models.BigAutoField(primary_key=True)
    pick_date = models.DateField(default=date.today)
    pick_time = models.TimeField(default=current_time)
    truck_id = models.ForeignKey(
        WasteTruck, 
        on_delete=models.CASCADE,
        db_column='truck_id' 
    )
    wstp_id = models.ForeignKey(
        WastePersonnel,
        on_delete=models.CASCADE,
        db_column='wstp_id' 
    )
    garb_id = models.ForeignKey(
        Garbage_Pickup_Request,
        on_delete=models.CASCADE,
        db_column='garb_id' 
    )
    class Meta:
        db_table = 'pickup_assignment'

class Assignment_Collector(models.Model):
    acl_id = models.BigAutoField(primary_key=True)
    wstp_id = models.ForeignKey(
        WastePersonnel, 
        on_delete=models.CASCADE,
        db_column='wstp_id' 
    )
    pick_id = models.ForeignKey(
        Pickup_Assignment, 
        on_delete=models.CASCADE,
        db_column='pick_id' 
    )

    class Meta:
        db_table = 'assignment_collector'

class Pickup_Confirmation(models.Model):
    conf_id = models.BigAutoField(primary_key=True)
    conf_resident_conf = models.BooleanField(blank=True)
    conf_staff_conf = models.BooleanField(blank=True)
    conf_staff_conf_date = models.DateTimeField(default=datetime.now)
    conf_resident_conf_date = models.DateTimeField(null=True, blank=True)
    garb_id = models.ForeignKey(
        Garbage_Pickup_Request,
        on_delete=models.CASCADE,
        db_column='garb_id' 
    )

    class Meta: 
        db_table = "pickup_confirmation"


class WasteHotspot(models.Model):
    wh_num = models.BigAutoField(primary_key=True)
    wh_date = models.DateField()
    wh_start_time = models.TimeField()
    wh_end_time = models.TimeField()
    wh_add_info = models.CharField(max_length=200, null=True, blank=True)
    wh_is_archive = models.BooleanField(default=False)
    sitio_id = models.ForeignKey(
        'profiling.Sitio',
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        db_column='sitio_id'
    )
    wstp_id = models.ForeignKey(
        'WastePersonnel', 
        on_delete=models.CASCADE,
        db_column='wstp_id',
        default=None,
    )
    staff_id = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    class Meta:
        db_table = 'waste_hotspot'
from django.db import models
from datetime import date
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
from django.db.models import Max
from datetime import date


class CouncilScheduling(models.Model):
    ce_id = models.BigAutoField(primary_key=True)
    ce_title = models.CharField(max_length=100)
    ce_place = models.CharField(max_length=100)
    ce_date = models.DateField(default=date.today)
    ce_time = models.TimeField()
    ce_type = models.CharField(max_length=100)
    ce_description = models.CharField(max_length=500)
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
    att_is_archive = models.BooleanField(default=False)
    att_file_name = models.CharField(max_length=255, null=True)
    att_file_path = models.CharField(max_length=512, null=True)
    att_file_url = models.URLField(max_length=1024, null=True)
    att_file_type = models.CharField(max_length=100, null=True)

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
    temp_contact_num = models.CharField(max_length=200)
    temp_email = models.CharField(null=True, blank=True) 

    staff_id = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    ) 

    class Meta:
        db_table = 'template'



class TemplateFile(models.Model):
    tf_id = models.BigAutoField(primary_key=True)
    tf_name = models.CharField(max_length=500)
    tf_type = models.CharField(max_length=500)
    tf_path = models.CharField(max_length=500)
    tf_url = models.CharField(max_length=500)
    tf_logoType = models.CharField(max_length=500)
 
    temp_id = models.ForeignKey(
        Template,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='template_files',
        db_column='temp_id'
    )   

    class Meta:
        db_table = 'template_file'

# class Resolution(models.Model):
#     res_num = models.CharField(primary_key=True)
#     res_title = models.CharField(max_length=500)
#     res_date_approved = models.DateField(default=date.today)
#     res_area_of_focus = ArrayField(
#         models.CharField(max_length=100),
#         default=list,
#         blank=True
#     )
#     res_is_archive = models.BooleanField(default=False)

#     staff = models.ForeignKey(
#         'administration.Staff',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         db_column='staff_id'
#     )

#     class Meta:
#         db_table = 'resolution'


class Resolution(models.Model):
    res_num = models.CharField(primary_key=True)
    res_title = models.CharField(max_length=500)
    res_date_approved = models.DateField(default=date.today)
    res_area_of_focus = ArrayField(
        models.CharField(max_length=100),
        default=list,
        blank=True
    )
    res_is_archive = models.BooleanField(default=False)

    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    gpr_id = models.ForeignKey(
        'gad.ProjectProposal',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='gpr_id'
    )    

    class Meta:
        db_table = 'resolution'
    
    @classmethod
    def generate_resolution_number(cls):
        current_year = timezone.now().year % 100
        year_prefix = str(current_year).zfill(2)
        
        # Get the max resolution number for this year
        max_res = cls.objects.filter(
            res_num__endswith=f"-{year_prefix}"
        ).aggregate(Max('res_num'))
        
        if max_res['res_num__max']:
            try:
                current_num = int(max_res['res_num__max'].split('-')[0])
                next_num = current_num + 1
            except (ValueError, IndexError):
                next_num = 1
        else:
            next_num = 1
            
        return f"{next_num:03d}-{year_prefix}"
    

class ResolutionFile(models.Model):
    rf_id = models.BigAutoField(primary_key=True)
    rf_name = models.CharField(max_length=500)
    rf_type = models.CharField(max_length=500)
    rf_path = models.CharField(max_length=500)
    rf_url = models.CharField(max_length=500)
 

    res_num = models.ForeignKey(
        Resolution,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='resolution_files',
        db_column='res_num'
    )   

    

    class Meta:
        db_table = 'resolution_file'

class ResolutionSupDocs(models.Model):
    rsd_id = models.BigAutoField(primary_key=True)
    rsd_name = models.CharField(max_length=500)
    rsd_type = models.CharField(max_length=500)
    rsd_path = models.CharField(max_length=500)
    rsd_url = models.CharField(max_length=500)

    res_num = models.ForeignKey(
        Resolution,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='resolution_supp',
        db_column='res_num'
    )   

    class Meta:
        db_table = 'resolution_supp_doc'
    


class MinutesOfMeeting(models.Model):
    mom_id = models.BigAutoField(primary_key=True)
    mom_date = models.DateField(default=date.today)
    mom_title= models.TextField(null=False)
    mom_agenda = models.TextField(null=False)
    mom_is_archive = models.BooleanField(default=False)

    class Meta:
        db_table = 'minutes_of_meeting'

class MOMAreaOfFocus(models.Model):
    mof_id = models.BigAutoField(primary_key=True)
    mof_area = models.CharField(null=False)
    mom_id = models.ForeignKey(
        'council.MinutesOfMeeting',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        db_column='mom_id'
    )

    class Meta:
        db_table = 'mom_area_of_focus'    


class MOMFile(models.Model):
    momf_id = models.BigAutoField(primary_key=True)
    momf_name = models.CharField(max_length=255)
    momf_type = models.CharField(max_length=100)
    momf_path = models.CharField(max_length=500)
    momf_url = models.CharField(max_length=500)
    mom_id = models.OneToOneField(
        'council.MinutesOfMeeting',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        db_column='mom_id'
    )

    class Meta:
        db_table = 'mom_file'


class MOMSuppDoc(models.Model):
    momsp_id = models.BigAutoField(primary_key=True)
    momsp_name = models.CharField(max_length=255)
    momsp_type = models.CharField(max_length=100)
    momsp_path = models.CharField(max_length=500)
    momsp_url = models.CharField(max_length=500)
    mom_id = models.ForeignKey(
        'council.MinutesOfMeeting',
        on_delete= models.CASCADE,
        null=True,
        blank=True,
        db_column='mom_id'
    )

    class Meta: 
        db_table = 'mom_supporting_document'
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
    ce_description = models.CharField(max_length=500)
    ce_rows = models.IntegerField(null=True)
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

# class CouncilAttendees(models.Model):
#     atn_id = models.BigAutoField(primary_key=True)
#     atn_name = models.CharField(max_length=200, default='')
#     atn_designation = models.CharField(max_length=200, default='')
#     atn_present_or_absent = models.CharField(max_length=100)
#     ce_id = models.ForeignKey('CouncilScheduling', on_delete=models.CASCADE)
    
#     staff = models.ForeignKey(
#         'administration.Staff',
#         on_delete=models.SET_NULL,
#         null=True,
#         blank=True,
#         db_column='staff_id'
#     )

#     class Meta:
#         db_table = 'attendees'

class CouncilAttendance(models.Model):
    att_id = models.BigAutoField(primary_key=True)
    ce = models.ForeignKey(
        'CouncilScheduling', 
        on_delete=models.CASCADE,
        db_column='ce_id',
        related_name='attendance_sheets'
    )
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
    mom_area_of_focus = ArrayField(
        models.CharField(max_length=100),
        default=list,
        blank=True
    )
    mom_is_archive = models.BooleanField(default=False)
    staff_id = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    class Meta:
        db_table = 'minutes_of_meeting' 

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

class Ordinance(models.Model):
    ord_num = models.CharField(max_length=50, unique=True, primary_key=True)
    ord_title = models.CharField(max_length=255)
    ord_date_created = models.DateField()
    ord_category = models.CharField(max_length=100)
    ord_details = models.TextField()
    ord_year = models.IntegerField()
    ord_is_archive = models.BooleanField(default=False)
    ord_parent = models.CharField(max_length=50, null=True, blank=True, help_text="ord_num of the parent ordinance (if this is an amendment)")
    ord_is_ammend = models.BooleanField(default=False, help_text="Whether this ordinance is an amendment to another")
    ord_ammend_ver = models.IntegerField(null=True, blank=True, help_text="Version number of the amendment")
    ord_repealed = models.BooleanField(default=False, help_text="Whether this ordinance is repealed")

    of_id = models.ForeignKey(
        'OrdinanceFile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='of_id',
        to_field='of_id',
        related_name='ordinances'
    )
    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )
    
    def clean(self):
        # An ordinance cannot be marked as an amendment if it is repealed
        if self.ord_repealed and self.ord_is_ammend:
            from django.core.exceptions import ValidationError
            raise ValidationError({
                'ord_is_ammend': 'A repealed ordinance cannot be marked as an amendment.'
            })

        # If this ordinance amends another, ensure the parent is not repealed
        if self.ord_is_ammend and self.ord_parent:
            try:
                parent = Ordinance.objects.get(ord_num=self.ord_parent)
                if parent.ord_repealed:
                    from django.core.exceptions import ValidationError
                    raise ValidationError({
                        'ord_parent': 'Cannot amend a repealed ordinance.'
                    })
            except Ordinance.DoesNotExist:
                # Let other validations handle missing parent if needed
                pass

    def save(self, *args, **kwargs):
        # Run validations before saving
        try:
            self.full_clean()
        except Exception:
            # Re-raise to preserve default behavior upstream
            raise
        if not self.ord_num:  # If no ordinance number provided
            
            year = getattr(self, 'ord_year', 2024)
            import random
            import string
            
            # Generate a unique number
            while True:
                # Generate 4 random digits
                random_digits = ''.join(random.choices(string.digits, k=4))
                ord_num = f"ORD-{year}-{random_digits}"
                
                # Check if it's unique
                if not Ordinance.objects.filter(ord_num=ord_num).exists():
                    self.ord_num = ord_num
                    break
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.ord_num} - {self.ord_title}"

    class Meta:
        db_table = 'ordinance'
        ordering = ['-ord_date_created']
        managed = False

# class OrdinanceSupplementaryDoc(models.Model):
#     osd_id = models.AutoField(primary_key=True)
#     osd_title = models.CharField(max_length=255)
#     osd_is_archive = models.BooleanField(default=False)
#     ordinance = models.ForeignKey(Ordinance, on_delete=models.CASCADE, related_name='supplementary_docs', to_field='ord_num')
#     file = models.ForeignKey(File, on_delete=models.SET_NULL, null=True)

#     def __str__(self):
#         return f"{self.osd_title} - {self.ordinance.ord_num}"

#     class Meta:
#         db_table = 'ordinance_supp_doc'
#         ordering = ['osd_id']

# class OrdinanceTemplate(models.Model):
#     template_id = models.AutoField(primary_key=True)
#     title = models.CharField(max_length=255)
#     template_body = models.TextField()
#     with_seal = models.BooleanField(default=False)
#     with_signature = models.BooleanField(default=False)
#     header_media = models.ForeignKey(File, on_delete=models.SET_NULL, null=True, blank=True, related_name='template_headers')
#     created_at = models.DateTimeField(auto_now_add=True)
#     updated_at = models.DateTimeField(auto_now=True)
#     is_active = models.BooleanField(default=True)

#     def __str__(self):
#         return f"{self.title}"

#     class Meta:
#         db_table = 'ordinance_template'
#         ordering = ['-created_at']

class OrdinanceFile(models.Model):
    of_id = models.BigAutoField(primary_key=True)
    of_name = models.CharField(max_length=255)
    of_type = models.CharField(max_length=100, null=True, blank=True)
    of_path = models.CharField(max_length=500, null=True, blank=True)
    of_url = models.CharField(max_length=500)

    class Meta:
        db_table = 'ordinance_file'
        managed = False
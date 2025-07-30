from django.db import models
from apps.file.models import File
from apps.administration.models import Staff

class Ordinance(models.Model):
    ord_num = models.CharField(max_length=50, unique=True, primary_key=True)
    ord_title = models.CharField(max_length=255)
    ord_date_created = models.DateField()
    ord_category = models.CharField(max_length=100)
    ord_details = models.TextField()
    ord_year = models.IntegerField()
    ord_is_archive = models.BooleanField(default=False)
    file = models.ForeignKey(File, on_delete=models.SET_NULL, null=True)
    staff = models.ForeignKey(Staff, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.ord_num} - {self.ord_title}"

    class Meta:
        db_table = 'ordinance'
        ordering = ['-ord_date_created']

class OrdinanceSupplementaryDoc(models.Model):
    osd_id = models.AutoField(primary_key=True)
    osd_title = models.CharField(max_length=255)
    osd_is_archive = models.BooleanField(default=False)
    ordinance = models.ForeignKey(Ordinance, on_delete=models.CASCADE, related_name='supplementary_docs', to_field='ord_num')
    file = models.ForeignKey(File, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.osd_title} - {self.ordinance.ord_num}"

    class Meta:
        db_table = 'ordinance_supp_doc'
        ordering = ['osd_id']

class OrdinanceTemplate(models.Model):
    template_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    template_body = models.TextField()
    with_seal = models.BooleanField(default=False)
    with_signature = models.BooleanField(default=False)
    pdf_url = models.URLField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.title}"

    class Meta:
        db_table = 'ordinance_template'
        ordering = ['-created_at'] 
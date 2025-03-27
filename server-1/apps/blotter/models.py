from django.db import models

class BlotterReport(models.Model):
    REPORT_TYPES = [
        ('complaint', 'Complaint'),
        ('incident', 'Incident'),
        ('violation', 'Violation'),
    ]

    rep_date = models.DateField(auto_now_add=True)  
    rep_occurred_date = models.DateField()  
    rep_reasons = models.TextField()
    rep_type = models.CharField(max_length=20, choices=REPORT_TYPES) 

    complainant = models.ForeignKey('Complainant', on_delete=models.CASCADE)
    accused = models.ForeignKey('Accused', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.get_rep_type_display()} on {self.rep_occurred_date} - {self.complainant} vs {self.accused}"

    class Meta:
        db_table = 'blotter_report'


class SupportingDocument(models.Model):
    REPORT_DOCUMENT_TYPES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    blotter_report = models.ForeignKey(BlotterReport, on_delete=models.CASCADE, related_name="supporting_documents")
    doc_type = models.CharField(max_length=10, choices=REPORT_DOCUMENT_TYPES)
    file = models.FileField(upload_to='supporting_documents/')  

    def __str__(self):
        return f"{self.doc_type} for Report {self.blotter_report.id}"

    class Meta:
        db_table = 'blotter_supporting_document'


# Complainant Model
class Complainant(models.Model):
    comp_lname = models.CharField(max_length=100)
    comp_fname = models.CharField(max_length=100)
    comp_mname = models.CharField(max_length=100, blank=True, null=True)
    comp_suffix = models.CharField(max_length=10, blank=True, null=True)
    comp_contact = models.CharField(max_length=15, unique=True)
    comp_address = models.TextField()

    def __str__(self):
        return f"{self.comp_fname} {self.comp_lname}"

    class Meta:
        db_table = 'complainant'

# Accused Model
class Accused(models.Model):
    acc_lname = models.CharField(max_length=100)
    acc_fname = models.CharField(max_length=100)
    acc_mname = models.CharField(max_length=100, blank=True, null=True)
    acc_suffix = models.CharField(max_length=10, blank=True, null=True)
    acc_contact = models.CharField(max_length=15, unique=True)
    acc_address = models.TextField()

    def __str__(self):
        return f"{self.acc_fname} {self.acc_lname}"

    class Meta:
        db_table = 'accused'

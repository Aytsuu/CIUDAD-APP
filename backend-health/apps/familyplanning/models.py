from django.db import models

class Acknowledgement(models.Model):
    selectedMethod = models.CharField(max_length=100)
    clientSignature = models.TextField()  # Base64 encoded image
    clientSignatureDate = models.DateField()

    guardianName = models.CharField(max_length=100)
    guardianSignature = models.TextField()
    guardianSignatureDate = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "acknowledgement"

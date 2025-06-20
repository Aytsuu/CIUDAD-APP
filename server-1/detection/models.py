from django.db import models

class FaceDetectionRequest(models.Model):
    id = models.BigAutoField(primary_key=True)
    image = models.TextField() 
    status = models.CharField(max_length=20, default='pending')
    faces_detected = models.IntegerField(null=True)
    embeddings = models.JSONField(null=True)
    face_box = models.JSONField(null=True)
    quality_score = models.FloatField(null=True)
    created_at = models.DateTimeField(auto_now_add=True),
    error_message = models.TextField(null=True)
    rejection_reason = models.TextField(null=True)

    class Meta:
      db_table = 'face_detection_request'
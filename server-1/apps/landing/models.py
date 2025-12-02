from django.db import models

class LandingPage(models.Model):
  lp_id = models.BigAutoField(primary_key=True)
  cpt_photo = models.URLField()
  cpt_name = models.CharField(max_length=100)
  contact = models.CharField(max_length=100)
  email = models.CharField(max_length=100)
  address = models.TextField()
  quote = models.TextField()
  mission = models.TextField()
  vision = models.TextField()
  values = models.TextField()

  class Meta:
    db_table = "landingpage"

class LandingCarouselFIle(models.Model):
  lcf_id = models.BigAutoField(primary_key=True)
  lcf_name = models.CharField(max_length=500)
  lcf_type = models.CharField(max_length=50)
  lcf_path = models.CharField(max_length=500)
  lcf_url = models.URLField()
  lp = models.ForeignKey(LandingPage, on_delete=models.CASCADE, related_name="landing_carousel_files")

  class Meta:
    db_table = "landingcarouselfile"
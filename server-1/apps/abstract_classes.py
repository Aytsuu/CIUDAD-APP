from django.db import models

class AbstractModels(models.Model):
  class Meta:
    abstract = True
  
  def save(self, *args, **kwargs):
    for field in self._meta.fields:
      if(
        isinstance(field, models.CharField) 
        and not isinstance(field, models.URLField)
        and not field.primary_key
        and field.editable
      ) :
        val = getattr(self, field.name)
        if isinstance(val, str):
          setattr(self, field.name, val.upper())
    
    super().save(*args, **kwargs)
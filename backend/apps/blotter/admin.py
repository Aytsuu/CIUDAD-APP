from django.contrib import admin
from .models import BlotterReport, Accused, Complainant, SupportingDocument

# Register your models here.
admin.site.register(BlotterReport)
admin.site.register(Accused)
admin.site.register(Complainant)
admin.site.register(SupportingDocument)
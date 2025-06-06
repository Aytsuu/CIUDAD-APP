from rest_framework import serializers
from ..models import *

class SitioBaseSerializer(serializers.ModelSerializer):
  class Meta:
    model = Sitio
    fields = '__all__'
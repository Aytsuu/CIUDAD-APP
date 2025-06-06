#KANI 2ND

from rest_framework import serializers, generics
from .models import *
from .models import WasteTruck
from apps.profiling.models import Sitio


class WasteEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteEvent
        fields = '__all__'

class WasteCollectionStaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteCollectionStaff
        fields = '__all__'

class WasteCollectionAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteCollectionAssignment
        fields = '__all__'

class WasteCollectionSchedSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteCollectionSched
        fields = '__all__'

class WasteHotspotSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteHotspot
        fields = '__all__'

class WasteReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteReport
        fields = '__all__'

class WastePersonnelSerializer(serializers.ModelSerializer):
    staff_id = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = WastePersonnel
        fields = '__all__'

class WasteTruckSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteTruck
        fields = '__all__' 

class SitioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sitio
        fields = ['sitio_id', 'sitio_name']
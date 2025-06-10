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
    watchman = serializers.SerializerMethodField()
    sitio = serializers.SerializerMethodField()

    class Meta:
        model = WasteHotspot
        fields = '__all__'

    def get_watchman(self, obj):
        return str(obj.wstp_id.staff_id.rp.per) if obj.wstp_id and obj.wstp_id.staff_id else ""

    def get_sitio(self, obj):
        return str(obj.sitio_id) if obj.sitio_id else ""

        
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

class WasteCollectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteCollector
        fields = '__all__' 


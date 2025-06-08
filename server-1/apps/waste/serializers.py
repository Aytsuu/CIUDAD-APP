#KANI 2ND

from rest_framework import serializers, generics
from .models import *
from .models import WasteTruck


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

class GarbagePickupRequestPendingSerializer(serializers.ModelSerializer):
    garb_requester = serializers.SerializerMethodField()

    class Meta:
        model = Garbage_Pickup_Request
        fields = '__all__'  

    def get_garb_requester(self, obj):
        if obj.rp and obj.rp.per:
            return f"{obj.rp.per.per_fname} {obj.rp.per.per_lname}".strip()
        return "Unknown"
    
class GarbagePickupRequestRejectedSerializer(serializers.ModelSerializer):
    garb_requester = serializers.SerializerMethodField()
    dec_id = serializers.SerializerMethodField()
    dec_date = serializers.SerializerMethodField()
    dec_reason = serializers.SerializerMethodField()
    file_id = serializers.SerializerMethodField()

    class Meta:
        model = Garbage_Pickup_Request
        fields = [
            'garb_id',
            'garb_location',
            'garb_waste_type',
            'garb_created_at',
            'garb_requester',
            'dec_id',
            'dec_date',
            'dec_reason',
            'file_id'
        ]

    def get_garb_requester(self, obj):
        if obj.rp and obj.rp.per:
            return f"{obj.rp.per.per_fname} {obj.rp.per.per_lname}".strip()
        return "Unknown"

    def get_decision(self, obj):
        try:
            return Pickup_Request_Decision.objects.get(garb_id=obj)
        except Pickup_Request_Decision.DoesNotExist:
            return None

    def get_dec_id(self, obj):
        decision = self.get_decision(obj)
        return decision.dec_id if decision else None

    def get_dec_date(self, obj):
        decision = self.get_decision(obj)
        return decision.dec_date if decision else None

    def get_dec_reason(self, obj):
        decision = self.get_decision(obj)
        return decision.dec_rejection_reason if decision else ""

    def get_file_id(self, obj):
        return obj.file.file_url if obj.file else ""
    
class GarbagePickupRequestAcceptedSerializer(serializers.ModelSerializer):
    garb_requester = serializers.SerializerMethodField()
    dec_id = serializers.SerializerMethodField()
    dec_date = serializers.SerializerMethodField()
    assignment_info = serializers.SerializerMethodField()

    class Meta:
        model = Garbage_Pickup_Request
        fields = [
            'garb_id',
            'garb_location',
            'garb_waste_type',
            'garb_created_at',
            'garb_requester',
            'dec_id',
            'dec_date',
            'assignment_info'
        ]

    def get_garb_requester(self, obj):
        if obj.rp and obj.rp.per:
            return f"{obj.rp.per.per_fname} {obj.rp.per.per_lname}".strip()
        return "Unknown"

    def get_decision(self, obj):
        try:
            return Pickup_Request_Decision.objects.get(garb_id=obj)
        except Pickup_Request_Decision.DoesNotExist:
            return None

    def get_dec_id(self, obj):
        decision = self.get_decision(obj)
        return decision.dec_id if decision else None

    def get_dec_date(self, obj):
        decision = self.get_decision(obj)
        return decision.dec_date if decision else None

    def get_assignment_info(self, obj):
        try:
            assignment = Pickup_Assignment.objects.get(garb_id=obj)
            return {
                'pick_date': assignment.pick_date,
                'pick_time': assignment.pick_time.strftime('%H:%M') if assignment.pick_time else None,
                'driver': assignment.wstp_id.get_staff_name() if assignment.wstp_id else None,
                'truck': self._get_truck_info(assignment.truck_id) if assignment.truck_id else None,
                'collectors': self._get_collector_names(assignment)
            }
        except Pickup_Assignment.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error getting assignment info: {str(e)}")
            return None

    def _get_collector_names(self, assignment):
        try:
            collectors = assignment.assignment_collector_set.all()  # ← use default reverse name
            return [
                collector.wstp_id.get_staff_name()
                for collector in collectors
                if collector.wstp_id and hasattr(collector.wstp_id, 'get_staff_name')
            ]
        except Exception as e:
            print(f"Error getting collectors: {str(e)}")
            return []


    def _get_truck_info(self, truck):
        """Helper method to get truck plate number and model"""
        try:
            plate = getattr(truck, 'truck_plate_num', None)
            model = getattr(truck, 'truck_model', None)
            if plate and model:
                return f"{plate} - {model}"
            elif plate:
                return plate
            elif model:
                return model
            return "Truck info unavailable"
        except Exception:
            return "Truck info unavailable"


class GarbagePickupRequestCompletedSerializer(serializers.ModelSerializer):
    garb_requester = serializers.SerializerMethodField()
    confirmation_info = serializers.SerializerMethodField()
    assignment_info = serializers.SerializerMethodField()

    class Meta:
        model = Garbage_Pickup_Request
        fields = [
            'garb_id',
            'garb_location',
            'garb_waste_type',
            'garb_created_at',
            'garb_requester',
            'confirmation_info',
            'assignment_info',
        ]

    def get_garb_requester(self, obj):
        if obj.rp and obj.rp.per:
            return f"{obj.rp.per.per_fname} {obj.rp.per.per_lname}".strip()
        return "Unknown"

    def get_confirmation_info(self, obj):
        try:
            confirmation = Pickup_Confirmation.objects.get(garb_id=obj)
            return {
                'conf_resident_conf_date': confirmation.conf_resident_conf_date,
                'conf_staff_conf_date': confirmation.conf_staff_conf_date,
                'conf_resident_conf': confirmation.conf_resident_conf,
                'conf_staff_conf': confirmation.conf_staff_conf,
            }
        except Pickup_Confirmation.DoesNotExist:
            return {
                'conf_resident_conf_date': None,
                'conf_staff_conf_date': None,
                'conf_resident_conf': None,
                'conf_staff_conf': None,
            }
        
    def get_assignment_info(self, obj):
        try:
            assignment = Pickup_Assignment.objects.get(garb_id=obj)
            return {
                'pick_date': assignment.pick_date,
                'pick_time': assignment.pick_time.strftime('%H:%M') if assignment.pick_time else None,
                'driver': assignment.wstp_id.get_staff_name() if assignment.wstp_id else None,
                'truck': self._get_truck_info(assignment.truck_id) if assignment.truck_id else None,
                'collectors': self._get_collector_names(assignment)
            }
        except Pickup_Assignment.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error getting assignment info: {str(e)}")
            return None

    def _get_collector_names(self, assignment):
        try:
            collectors = assignment.assignment_collector_set.all()  # ← use default reverse name
            return [
                collector.wstp_id.get_staff_name()
                for collector in collectors
                if collector.wstp_id and hasattr(collector.wstp_id, 'get_staff_name')
            ]
        except Exception as e:
            print(f"Error getting collectors: {str(e)}")
            return []


    def _get_truck_info(self, truck):
        """Helper method to get truck plate number and model"""
        try:
            plate = getattr(truck, 'truck_plate_num', None)
            model = getattr(truck, 'truck_model', None)
            if plate and model:
                return f"{plate} - {model}"
            elif plate:
                return plate
            elif model:
                return model
            return "Truck info unavailable"
        except Exception:
            return "Truck info unavailable"
    

class PickupRequestDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pickup_Request_Decision
        fields = '__all__' 

class PickupAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pickup_Assignment
        fields = '__all__' 

class AssignmentCollectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment_Collector
        fields = '__all__' 

class PickupConfirmationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pickup_Confirmation
        fields = '__all__' 
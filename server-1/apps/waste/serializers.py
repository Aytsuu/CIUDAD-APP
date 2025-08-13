#KANI 2ND

from rest_framework import serializers, generics
from rest_framework import serializers, generics
from .models import *
from .models import WasteTruck
from apps.profiling.models import Sitio
from utils.supabase_client import upload_to_storage
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

class WasteCollectionSchedSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteCollectionSched
        fields = '__all__'
        extra_kwargs = {
            'wc_num': {'read_only': True}
        }

# class WasteCollectionAssignmentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = WasteCollectionAssignment
#         fields = '__all__'


class WasteCollectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteCollector
        fields = '__all__' 


# class WasteCollectionSchedFullDataSerializer(serializers.ModelSerializer):
#     collectors_wstp_ids = serializers.SerializerMethodField()
#     collectors_wasc_ids = serializers.SerializerMethodField()
#     sitio_name = serializers.SerializerMethodField() 

#     class Meta:
#         model = WasteCollectionSched
#         fields = [
#             'wc_num',
#             'wc_date',
#             'wc_time',
#             'wc_add_info',
#             'wc_is_archive',
#             'staff',
#             'sitio',
#             'sitio_name',
#             'truck',
#             'wstp',
#             'collectors_wstp_ids',
#             'collectors_wasc_ids'
#         ]

#     def get_collectors_wstp_ids(self, obj):
#         collectors = WasteCollector.objects.filter(wc_num=obj)
#         return [
#             collector.wstp.wstp_id
#             for collector in collectors
#             if collector.wstp is not None
#         ]

#     def get_collectors_wasc_ids(self, obj):
#         collectors = WasteCollector.objects.filter(wc_num=obj)
#         return [
#             collector.wasc_id
#             for collector in collectors
#         ]

#     def get_sitio_name(self, obj):
#         return obj.sitio.sitio_name if obj.sitio else None



class WasteCollectionSchedFullDataSerializer(serializers.ModelSerializer):
    collectors_wstp_ids = serializers.SerializerMethodField()
    collectors_names = serializers.SerializerMethodField()
    driver_name = serializers.SerializerMethodField()
    sitio_name = serializers.SerializerMethodField() 

    class Meta:
        model = WasteCollectionSched
        fields = [
            'wc_num',
            'wc_date',
            'wc_time',
            'wc_add_info',
            'wc_is_archive',
            'staff',
            'sitio',
            'sitio_name',
            'truck',
            'wstp',
            'collectors_wstp_ids',
            'collectors_names',
            'driver_name'
        ]


    def get_collectors_wstp_ids(self, obj):
        collectors = WasteCollector.objects.filter(wc_num=obj)
        return [
            collector.wstp.wstp_id
            for collector in collectors
            if collector.wstp is not None
        ]
    

    def get_collectors_names(self, obj):
        collectors = WasteCollector.objects.filter(wc_num=obj)
        names = [
            collector.wstp.get_staff_name()
            for collector in collectors
            if collector.wstp is not None
        ]
        return ', '.join(names)
    

    def get_driver_name(self, obj):
        return obj.wstp.get_staff_name() if obj.wstp else None
    

    def get_sitio_name(self, obj):
        return obj.sitio.sitio_name if obj.sitio else None
    
        extra_kwargs = {
            'wc_num': {'read_only': True}
        }

# class WasteCollectionAssignmentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = WasteCollectionAssignment
#         fields = '__all__'


class WasteCollectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteCollector
        fields = '__all__' 


# class WasteCollectionSchedFullDataSerializer(serializers.ModelSerializer):
#     collectors_wstp_ids = serializers.SerializerMethodField()
#     collectors_wasc_ids = serializers.SerializerMethodField()
#     sitio_name = serializers.SerializerMethodField() 

#     class Meta:
#         model = WasteCollectionSched
#         fields = [
#             'wc_num',
#             'wc_date',
#             'wc_time',
#             'wc_add_info',
#             'wc_is_archive',
#             'staff',
#             'sitio',
#             'sitio_name',
#             'truck',
#             'wstp',
#             'collectors_wstp_ids',
#             'collectors_wasc_ids'
#         ]

#     def get_collectors_wstp_ids(self, obj):
#         collectors = WasteCollector.objects.filter(wc_num=obj)
#         return [
#             collector.wstp.wstp_id
#             for collector in collectors
#             if collector.wstp is not None
#         ]

#     def get_collectors_wasc_ids(self, obj):
#         collectors = WasteCollector.objects.filter(wc_num=obj)
#         return [
#             collector.wasc_id
#             for collector in collectors
#         ]

#     def get_sitio_name(self, obj):
#         return obj.sitio.sitio_name if obj.sitio else None



class WasteCollectionSchedFullDataSerializer(serializers.ModelSerializer):
    collectors_wstp_ids = serializers.SerializerMethodField()
    collectors_names = serializers.SerializerMethodField()
    driver_name = serializers.SerializerMethodField()
    sitio_name = serializers.SerializerMethodField() 

    class Meta:
        model = WasteCollectionSched
        fields = [
            'wc_num',
            'wc_date',
            'wc_time',
            'wc_add_info',
            'wc_is_archive',
            'staff',
            'sitio',
            'sitio_name',
            'truck',
            'wstp',
            'collectors_wstp_ids',
            'collectors_names',
            'driver_name'
        ]


    def get_collectors_wstp_ids(self, obj):
        collectors = WasteCollector.objects.filter(wc_num=obj)
        return [
            collector.wstp.wstp_id
            for collector in collectors
            if collector.wstp is not None
        ]
    

    def get_collectors_names(self, obj):
        collectors = WasteCollector.objects.filter(wc_num=obj)
        names = [
            collector.wstp.get_staff_name()
            for collector in collectors
            if collector.wstp is not None
        ]
        return ', '.join(names)
    

    def get_driver_name(self, obj):
        return obj.wstp.get_staff_name() if obj.wstp else None
    

    def get_sitio_name(self, obj):
        return obj.sitio.sitio_name if obj.sitio else None
    

class WasteHotspotSerializer(serializers.ModelSerializer):
    watchman = serializers.SerializerMethodField()
    sitio = serializers.SerializerMethodField()
    sitio_id = serializers.PrimaryKeyRelatedField(
        queryset=Sitio.objects.all(),  
    )
    wstp_id = serializers.PrimaryKeyRelatedField(
        queryset=WastePersonnel.objects.all(),  
    )

    class Meta:
        model = WasteHotspot
        fields = '__all__'

    def get_watchman(self, obj):
        try:
            return str(obj.wstp_id.staff.rp.per)
        except AttributeError:
            return ""
        except WastePersonnel.DoesNotExist:
            return ""

    def get_sitio(self, obj):
        return str(obj.sitio_id.sitio_name) if obj.sitio_id else ""


class WasteReportFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteReport_File
        fields = '__all__'


class WasteReportResolveFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = WasteReportResolve_File
        fields = '__all__'        

    def _upload_files(self, files, rep_id=None):

        if not rep_id:
            return
        
        try:
            tracking_instance = WasteReport.objects.get(pk=rep_id)
        except WasteReport.DoesNotExist:
            
            raise ValueError(f"Income_Expense_Tracking with id {rep_id} does not exist")       
        
        rep_rslv_files = []
        for file_data in files:
            rep_rslv_file = WasteReportResolve_File(
                wrsf_name =file_data['name'],
                wrsf_type=file_data['type'],
                wrsf_path=f"uploads/{file_data['name']}",
                rep_id=tracking_instance  # THIS SETS THE FOREIGN KEY
            )

            url = upload_to_storage(file_data, 'image-bucket', 'uploads')
            rep_rslv_file.wrsf_url = url
            rep_rslv_files.append(rep_rslv_file)

        if rep_rslv_files:
            WasteReportResolve_File.objects.bulk_create(rep_rslv_files)

        
class WasteReportSerializer(serializers.ModelSerializer):
    rep_complainant = serializers.SerializerMethodField()
    waste_report_file = WasteReportFileSerializer(many=True, read_only=True)
    waste_report_rslv_file = WasteReportResolveFileSerializer(many=True, read_only=True)
    sitio_name = serializers.CharField(source='sitio_id.sitio_name', allow_null=True, default=None) 

    class Meta:
        model = WasteReport
        fields = [
            'rep_id', 'rep_matter', 'rep_location', 'rep_add_details',
            'rep_violator', 'rep_anonymous', 'rep_contact', 'rep_status', 
            'rep_date', 'rep_date_resolved', 'rep_complainant', 'waste_report_file', 
            'waste_report_rslv_file', 'sitio_name', 'sitio_id', 'staff_id', 
            'rp_id'
        ]
    
    def get_rep_complainant(self, obj):
        try:
            return f"{obj.rp_id.per.per_lname}, {obj.rp_id.per.per_fname}"
        except:
            return "Unknown"

class WastePersonnelSerializer(serializers.ModelSerializer):
    staff = serializers.PrimaryKeyRelatedField(read_only=True)

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

class GarbagePickupRequestPendingSerializer(serializers.ModelSerializer):
    garb_requester = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    sitio_name = serializers.SerializerMethodField()
    garb_additional_notes = serializers.CharField(required=False, allow_blank=True)
    sitio_id = serializers.PrimaryKeyRelatedField(queryset=Sitio.objects.all())
    # file = serializers.PrimaryKeyRelatedField(queryset=File.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Garbage_Pickup_Request
        fields = '__all__'  

    def get_garb_requester(self, obj):
        if obj.rp and obj.rp.per:
            return f"{obj.rp.per.per_fname} {obj.rp.per.per_lname}".strip()
        return "Unknown"
    
    def get_file_url(self, obj):
        return obj.file.file_url if obj.file else ""
    
    def get_sitio_name(self, obj):
        return obj.sitio_id.sitio_name if obj.sitio_id else ""
    
class GarbagePickupRequestRejectedSerializer(serializers.ModelSerializer):
    garb_requester = serializers.SerializerMethodField()
    dec_id = serializers.SerializerMethodField()
    dec_date = serializers.SerializerMethodField()
    dec_reason = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    sitio_name = serializers.SerializerMethodField()

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
            'file_url',
            'sitio_name',
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

    def get_file_url(self, obj):
        return obj.file.file_url if obj.file else ""
    
    def get_sitio_name(self, obj):
        return obj.sitio_id.sitio_name if obj.sitio_id else ""

class GarbagePickupRequestAcceptedSerializer(serializers.ModelSerializer):
    garb_requester = serializers.SerializerMethodField()
    dec_date = serializers.SerializerMethodField()
    assignment_info = serializers.SerializerMethodField()
    truck_id = serializers.SerializerMethodField()
    driver_id = serializers.SerializerMethodField()
    collector_ids = serializers.SerializerMethodField()
    pickup_assignment_id = serializers.SerializerMethodField()
    assignment_collector_ids = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    sitio_name = serializers.SerializerMethodField()

    class Meta:
        model = Garbage_Pickup_Request
        fields = [
            'garb_id',
            'garb_location',
            'garb_waste_type',
            'garb_created_at',
            'garb_requester',
            'garb_additional_notes',
            'truck_id',
            'driver_id',
            'collector_ids',
            'dec_date',
            'assignment_info',
            'pickup_assignment_id',         
            'assignment_collector_ids',    
            'file_url',
            'sitio_name'
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

    def get_truck_id(self, obj):
        try:
            assignment = Pickup_Assignment.objects.get(garb_id=obj)
            if assignment.truck_id:
                return assignment.truck_id.truck_id
            return None
        except Pickup_Assignment.DoesNotExist:
            return None

    def get_driver_id(self, obj):
        try:
            assignment = Pickup_Assignment.objects.get(garb_id=obj)
            if assignment.wstp_id:
                return assignment.wstp_id.wstp_id
            return None
        except Pickup_Assignment.DoesNotExist:
            return None

    def get_collector_ids(self, obj):
        try:
            assignment = Pickup_Assignment.objects.get(garb_id=obj)
            collectors = Assignment_Collector.objects.filter(pick_id=assignment)
            return [collector.wstp_id.wstp_id for collector in collectors if collector.wstp_id]
        except Pickup_Assignment.DoesNotExist:
            return []
        except Exception as e:
            print(f"Error getting collector IDs: {str(e)}")
            return []

    def _get_collector_names(self, assignment):
        try:
            collectors = Assignment_Collector.objects.filter(pick_id=assignment)
            return [
                collector.wstp_id.get_staff_name()
                for collector in collectors
                if collector.wstp_id and hasattr(collector.wstp_id, 'get_staff_name')
            ]
        except Exception as e:
            print(f"Error getting collectors: {str(e)}")
            return []

    def _get_truck_info(self, truck):
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
        
    def get_pickup_assignment_id(self, obj):
        try:
            assignment = Pickup_Assignment.objects.get(garb_id=obj)
            return assignment.pick_id  # or assignment.pk
        except Pickup_Assignment.DoesNotExist:
            return None

    def get_assignment_collector_ids(self, obj):
        try:
            assignment = Pickup_Assignment.objects.get(garb_id=obj)
            collectors = Assignment_Collector.objects.filter(pick_id=assignment)
            return [collector.acl_id for collector in collectors]
        except Pickup_Assignment.DoesNotExist:
            return []
        except Exception as e:
            print(f"Error getting acl_ids: {str(e)}")
            return []

    def get_file_url(self, obj):
        return obj.file.file_url if obj.file else ""
    
    def get_sitio_name(self, obj):
        return obj.sitio_id.sitio_name if obj.sitio_id else ""


class GarbagePickupRequestCompletedSerializer(serializers.ModelSerializer):
    garb_requester = serializers.SerializerMethodField()
    confirmation_info = serializers.SerializerMethodField()
    assignment_info = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    sitio_name = serializers.SerializerMethodField()


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
            'file_url',
            'sitio_name',
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
        
    def get_file_url(self, obj):
        return obj.file.file_url if obj.file else ""
    
    def get_sitio_name(self, obj):
        return obj.sitio_id.sitio_name if obj.sitio_id else ""
    

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
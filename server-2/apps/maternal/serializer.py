from rest_framework import serializers
from django.db import transaction 
from .models import *
from datetime import date, timedelta
from apps.patientrecords.models import Spouse, VitalSigns, FollowUpVisit, PatientRecord, Patient
from apps.maternal.models import Prenatal_Form
from apps.patientrecords.serializers import PatientSerializer, SpouseSerializer

# ************** prenatal serializers **************
class PrenatalFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prenatal_Form
        fields = ['pf_lmp', 'pf_edc', 'patrec_id']

# illness serializer

class PreviousHospitalizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Previous_Hospitalization
        fields = '__all__'

class PreviousPregnancySerializer(serializers.ModelSerializer):
    class Meta:
        model = Previous_Pregnancy
        fields = '__all__'

class TTStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = TT_Status
        fields = '__all__'

# class LabResultDatesSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Lab_Result_Dates
#         fields = '__all__'

class Guide4ANCVisitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Guide4ANCVisit
        fields = '__all__'

class ChecklistSerializer(serializers.ModelSerializer):
    class Meta: 
        model = Checklist
        fields = '__all__'



# ************** postpartum serializers **************
try:
    from .models import Prenatal_Form
    PRENATAL_FORM_EXISTS = True
except ImportError:
    PRENATAL_FORM_EXISTS = False
    print("Prenatal_Form model not found, prenatal linking will be disabled")

class PostpartumDeliveryRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostpartumDeliveryRecord
        fields = ['ppdr_date_of_delivery', 'ppdr_time_of_delivery', 'ppdr_place_of_delivery', 
                 'ppdr_attended_by', 'ppdr_outcome']

class PostpartumAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostpartumAssessment
        fields = ['ppa_date_of_visit', 'ppa_feeding', 'ppa_findings', 'ppa_nurses_notes']

class SpouseCreateSerializer(serializers.ModelSerializer):
    spouse_mname = serializers.CharField(required=False, allow_blank=True, default="N/A")
    
    class Meta:
        model = Spouse
        fields = ['spouse_type', 'spouse_lname', 'spouse_fname', 'spouse_mname', 
                 'spouse_occupation', 'spouse_dob']

class PostpartumCompleteSerializer(serializers.ModelSerializer):
    # Nested serializers for related data
    delivery_record = PostpartumDeliveryRecordSerializer()
    assessments = PostpartumAssessmentSerializer(many=True)
    spouse_data = SpouseCreateSerializer(required=False)
    
    # Vital signs data
    vital_bp_systolic = serializers.CharField()
    vital_bp_diastolic = serializers.CharField()
    
    # Follow-up visit data
    followup_date = serializers.DateField()
    followup_description = serializers.CharField(default="Postpartum follow-up visit")
    
    # Patient data - we'll create the PatientRecord here
    pat_id = serializers.CharField(write_only=True, required=True)
    patrec_type = serializers.CharField(default="Postpartum Care", write_only=True)  # Fixed: was "Postpartum"

    def validate_pat_id(self, value):
        """Validate patient ID exists and is not null"""
        print(f"Validating pat_id: {value} (type: {type(value)})")
        
        if value is None or value == "":
            raise serializers.ValidationError("Patient ID is required")
        
        # Handle string patient IDs like "PT20050001"
        if isinstance(value, str):
            if value.lower() == 'nan' or value.strip() == '':
                raise serializers.ValidationError("Invalid patient ID: received NaN or empty string")
            # Don't try to convert to int - keep as string
            patient_id = value.strip()
        else:
            patient_id = str(value)
        
        try:
            # Import your Patient model here if not already imported
            from apps.patientrecords.models import Patient  
            # Use the string patient ID directly
            patient = Patient.objects.get(pat_id=patient_id)
            print(f"Found patient: {patient.pat_id}")
            return patient_id
        except Patient.DoesNotExist:
            raise serializers.ValidationError(f"Patient with ID {patient_id} does not exist")
        except Exception as e:
            raise serializers.ValidationError(f"Error validating patient ID {patient_id}: {str(e)}")

    class Meta:
        model = PostpartumRecord
        fields = [
            'ppr_lochial_discharges', 'ppr_vit_a_date_given',
            'ppr_num_of_pads', 'ppr_mebendazole_date_given', 'ppr_date_of_bf',
            'ppr_time_of_bf', 'pat_id', 'patrec_type', 'delivery_record', 'assessments',
            'spouse_data', 'vital_bp_systolic', 'vital_bp_diastolic', 'followup_date',
            'followup_description'
        ]

    def validate_ppr_lochial_discharges(self, value):
        """Ensure lochial discharges is not blank"""
        if not value or (isinstance(value, str) and value.strip() == ""):
            return ""  # Default value
        return value

    def validate_assessments(self, value):
        """Validate assessment data"""
        from datetime import datetime, date
        
        if not value or len(value) == 0:
            raise serializers.ValidationError("At least one assessment is required")
        
        for assessment in value:
            # Ensure date is in correct format
            date_value = assessment.get('ppa_date_of_visit', '')
            
            if not date_value:
                raise serializers.ValidationError("Assessment date is required")
            
            # Handle both string and date objects
            if isinstance(date_value, date):
                # Already a date object, no need to validate format
                continue
            elif isinstance(date_value, str):
                try:
                    datetime.strptime(date_value, '%Y-%m-%d')
                except ValueError:
                    raise serializers.ValidationError(
                        f"Date '{date_value}' has wrong format. Use YYYY-MM-DD format."
                    )
            else:
                raise serializers.ValidationError(
                    f"Invalid date type for ppa_date_of_visit: {type(date_value)}"
                )
        return value

    def validate_delivery_record(self, value):
        """Validate delivery record data"""
        required_fields = ['ppdr_date_of_delivery', 'ppdr_place_of_delivery', 'ppdr_attended_by']
        
        for field in required_fields:
            if not value.get(field):
                raise serializers.ValidationError(f"{field} is required in delivery record")
        
        return value

    def validate_vital_bp_systolic(self, value):
        """Validate systolic BP"""
        try:
            bp_value = int(value)
            if bp_value < 60 or bp_value > 250:
                raise serializers.ValidationError("Systolic BP must be between 60 and 250")
        except (ValueError, TypeError):
            raise serializers.ValidationError("Systolic BP must be a valid number")
        return value

    def validate_vital_bp_diastolic(self, value):
        """Validate diastolic BP"""
        try:
            bp_value = int(value)
            if bp_value < 40 or bp_value > 150:
                raise serializers.ValidationError("Diastolic BP must be between 40 and 150")
        except (ValueError, TypeError):
            raise serializers.ValidationError("Diastolic BP must be a valid number")
        return value

    def validate_followup_date(self, value):
        """Validate follow-up date"""
        if not value:
            raise serializers.ValidationError("Follow-up date is required")
        
        from datetime import date
        if isinstance(value, str):
            try:
                value = datetime.strptime(value, '%Y-%m-%d').date()
            except ValueError:
                raise serializers.ValidationError("Follow-up date must be in YYYY-MM-DD format")
        
        if value < date.today():
            raise serializers.ValidationError("Follow-up date cannot be in the past")
        
        return value

    def find_related_prenatal_form(self, patient, delivery_date):
        """
        Temporarily disabled prenatal form linking to avoid database issues
        """
        print("Prenatal form linking temporarily disabled")
        return None

    def handle_spouse_logic(self, patient, spouse_data):
        """
        Handle spouse creation logic using your existing business rules
        """
        if not spouse_data:
            return None
        
        try:
            patient_serializer = PatientSerializer(patient)
            spouse_info = patient_serializer.get_spouse_info(patient)
            
            print(f"Spouse info for patient {patient.pat_id}: {spouse_info}")
            
            # check if spouse exists (either in family composition or medical records)
            if spouse_info.get('spouse_exists', False):
                spouse_source = spouse_info.get('spouse_source', '')
                existing_spouse_info = spouse_info.get('spouse_info', {})
                
                if spouse_source == 'family_composition':
                    # if father exists in family composition, don't create spouse
                    print("Father exists in family composition, not creating spouse")
                    return None
                
                elif spouse_source in ['prenatal_record', 'postpartum_record']:
                    # existing spouse in medical records, use it
                    spouse_id = existing_spouse_info.get('spouse_id')
                    if spouse_id:
                        existing_spouse = Spouse.objects.get(spouse_id=spouse_id)
                        print(f"Using existing spouse from {spouse_source}: {existing_spouse.spouse_id}")
                        return existing_spouse
            
            # check if spouse insertion is allowed
            if spouse_info.get('allow_spouse_insertion', False):
                print(f"Creating new spouse. Reason: {spouse_info.get('reason', 'Unknown')}")
                return Spouse.objects.create(**spouse_data)
            else:
                print("Spouse insertion not allowed")
                return None
                
        except Exception as e:
            print(f"Error in spouse logic: {str(e)}")
            # fallback: try to create spouse if there's an error
            try:
                return Spouse.objects.create(**spouse_data)
            except Exception as create_error:
                print(f"Error creating spouse: {str(create_error)}")
                return None

    def create(self, validated_data):
        print(f"Creating postpartum record with validated data: {validated_data}")
        
        # validated data
        delivery_data = validated_data.pop('delivery_record')
        assessments_data = validated_data.pop('assessments', [])
        spouse_data = validated_data.pop('spouse_data', None)
        
        vital_bp_systolic = validated_data.pop('vital_bp_systolic')
        vital_bp_diastolic = validated_data.pop('vital_bp_diastolic')
        
        followup_date = validated_data.pop('followup_date')
        followup_description = validated_data.pop('followup_description')
        
        pat_id = validated_data.pop('pat_id')
        patrec_type = validated_data.pop('patrec_type')

        try:
            with transaction.atomic():
                # Verify patient exists
                patient = Patient.objects.get(pat_id=pat_id)
                print(f"Found patient: {patient.pat_id}")
                
                # Create PatientRecord first
                patient_record = PatientRecord.objects.create(
                    patrec_type=patrec_type,
                    pat_id=patient  # Pass the patient object, not the ID
                )
                print(f"Created patient record: {patient_record.patrec_id}")
                
                # Create VitalSigns with only BP data
                vital_signs = VitalSigns.objects.create(
                    vital_bp_systolic=vital_bp_systolic,
                    vital_bp_diastolic=vital_bp_diastolic,
                    vital_temp="N/A",
                    vital_RR="N/A",
                    vital_o2="N/A",
                    vital_pulse="N/A"
                )
                print(f"Created vital signs: {vital_signs.vital_id}")
                
                # Handle spouse logic using your existing business rules
                spouse = self.handle_spouse_logic(patient, spouse_data)
                if spouse:
                    print(f"Using spouse: {spouse.spouse_id}")
                else:
                    print("No spouse created/used")
                
                # Create FollowUpVisit with pending status
                follow_up_visit = FollowUpVisit.objects.create(
                    followv_date=followup_date,
                    followv_status="Pending",
                    followv_description=followup_description,
                    patrec=patient_record
                )
                print(f"Created follow-up visit: {follow_up_visit.followv_id}")
                
                # find related prenatal form if it exists within timeframe
                delivery_date = delivery_data.get('ppdr_date_of_delivery')
                prenatal_form = self.find_related_prenatal_form(patient, delivery_date)
                
                # create PostpartumRecord - check if pf_id column exists first
                postpartum_data = {
                    'patrec_id': patient_record,
                    'vital_id': vital_signs,
                    'spouse_id': spouse,
                    'followv_id': follow_up_visit,
                    **validated_data
                }
                
                # only add pf_id if the column exists in the database
                from django.db import connection
                with connection.cursor() as cursor:
                    cursor.execute("""
                        SELECT column_name 
                        FROM information_schema.columns 
                        WHERE table_name = 'postpartum_record' 
                        AND column_name = 'pf_id'
                    """)
                    if cursor.fetchone():
                        postpartum_data['pf_id'] = prenatal_form
                        print("Added pf_id to postpartum record")
                    else:
                        print("pf_id column does not exist, skipping prenatal form linking")
                
                postpartum_record = PostpartumRecord.objects.create(**postpartum_data)
                print(f"Created postpartum record: {postpartum_record.ppr_id}")
                
                # create PostpartumDeliveryRecord
                delivery_record = PostpartumDeliveryRecord.objects.create(
                    ppr_id=postpartum_record,
                    **delivery_data
                )
                print(f"Created delivery record: {delivery_record.ppdr_id}")
                
                # create PostpartumAssessments
                for i, assessment_data in enumerate(assessments_data):
                    assessment = PostpartumAssessment.objects.create(
                        ppr_id=postpartum_record,
                        **assessment_data
                    )
                    print(f"Created assessment {i+1}: {assessment.ppa_id}")
                
                print(f"Successfully created complete postpartum record: {postpartum_record.ppr_id}")
                return postpartum_record
                
        except Patient.DoesNotExist:
            error_msg = f"Patient with ID {pat_id} does not exist"
            print(error_msg)
            raise serializers.ValidationError(error_msg)
        except Exception as e:
            error_msg = f"Error creating postpartum record: {str(e)}"
            print(error_msg)
            raise serializers.ValidationError(error_msg)

    def to_representation(self, instance):
        # Get the base representation but exclude the nested fields that don't exist on the instance
        representation = {}
        
        # Only include fields that actually exist on the PostpartumRecord instance
        for field_name, field in self.fields.items():
            if field_name in ['delivery_record', 'assessments', 'spouse_data', 
                            'vital_bp_systolic', 'vital_bp_diastolic', 
                            'followup_date', 'followup_description', 
                            'pat_id', 'patrec_type']:
                # Skip these fields as they don't exist on the instance
                continue
            
            if hasattr(instance, field_name):
                attribute = field.get_attribute(instance)
                if attribute is not None:
                    representation[field_name] = field.to_representation(attribute)
        
        # Add the created patrec_id to the response
        representation['patrec_id'] = instance.patrec_id.patrec_id if instance.patrec_id else None
        
        # Add prenatal form info if linked and column exists
        try:
            if hasattr(instance, 'pf_id') and instance.pf_id:
                representation['prenatal_form'] = {
                    'pf_id': instance.pf_id.pf_id,
                    'pf_lmp': instance.pf_id.pf_lmp,
                    'pf_edc': instance.pf_id.pf_edc
                }
            else:
                representation['prenatal_form'] = None
        except AttributeError:
            representation['prenatal_form'] = None
        
        # Add delivery records using the correct related name
        try:
            delivery_records = instance.postpartum_delivery_record.all()
            representation['delivery_records'] = PostpartumDeliveryRecordSerializer(
                delivery_records, many=True
            ).data
        except Exception as e:
            print(f"Error getting delivery records: {e}")
            representation['delivery_records'] = []
        
        # Add assessments - you'll need to provide the correct related name for PostpartumAssessment
        try:
            # Replace 'postpartum_assessment' with the actual related_name from your PostpartumAssessment model
            assessments = instance.postpartum_assessment.all()  # Update this line with correct related_name
            representation['assessments'] = PostpartumAssessmentSerializer(
                assessments, many=True
            ).data
        except Exception as e:
            print(f"Error getting assessments: {e}")
            representation['assessments'] = []
        
        
        # Add vital signs data
        if instance.vital_id:
            representation['vital_signs'] = {
                'vital_id': instance.vital_id.vital_id,
                'vital_bp_systolic': instance.vital_id.vital_bp_systolic,
                'vital_bp_diastolic': instance.vital_id.vital_bp_diastolic
            }
        else:
            representation['vital_signs'] = None
        
        # Add spouse data
        if instance.spouse_id:
            representation['spouse'] = {
                'spouse_id': instance.spouse_id.spouse_id,
                'spouse_lname': instance.spouse_id.spouse_lname,
                'spouse_fname': instance.spouse_id.spouse_fname,
                'spouse_mname': instance.spouse_id.spouse_mname,
                'spouse_occupation': instance.spouse_id.spouse_occupation
            }
        else:
            representation['spouse'] = None
        
        # Add follow-up visit data
        if instance.followv_id:
            representation['follow_up_visit'] = {
                'followv_id': instance.followv_id.followv_id,
                'followv_date': instance.followv_id.followv_date,
                'followv_status': instance.followv_id.followv_status,
                'followv_description': instance.followv_id.followv_description
            }
        else:
            representation['follow_up_visit'] = None
        
        return representation

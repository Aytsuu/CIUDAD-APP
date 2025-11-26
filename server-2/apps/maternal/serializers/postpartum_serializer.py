from rest_framework import serializers
from django.db import transaction 
from datetime import timedelta, datetime
from django.utils import timezone
from django.db.models import Max

from apps.maternal.models import *

from apps.maternal.utils import handle_spouse_logic, create_medicine_request_for_maternal
from apps.healthProfiling.models import PersonalAddress, FamilyComposition
from apps.administration.models import Staff



class SpouseCreateSerializer(serializers.ModelSerializer):
    spouse_mname = serializers.CharField(required=False, allow_blank=True, default="N/A")
    
    class Meta:
        model = Spouse
        fields = ['spouse_type', 'spouse_lname', 'spouse_fname', 'spouse_mname', 
                 'spouse_occupation', 'spouse_dob']

class PostpartumDetailViewSerializer(serializers.ModelSerializer):
    delivery_date = serializers.SerializerMethodField()
    vital_systolic = serializers.CharField(source='vital_id.vital_bp_systolic', read_only=True)
    vital_diastolic = serializers.CharField(source='vital_id.vital_bp_diastolic', read_only=True)

    class Meta:
        model = PostpartumRecord
        fields = ['ppr_id', 'ppr_lochial_discharges', 'ppr_num_of_pads',
                 'ppr_date_of_bf', 'ppr_time_of_bf', 'created_at',
                 'delivery_date', 'vital_systolic', 'vital_diastolic']
        
    def get_delivery_date(self, obj):
        delivery_record = obj.postpartum_delivery_record.first()
        return delivery_record.ppdr_date_of_delivery if delivery_record else None


class PostpartumDeliveryRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostpartumDeliveryRecord
        fields = ['ppdr_date_of_delivery', 'ppdr_time_of_delivery', 'ppdr_place_of_delivery', 
                 'ppdr_attended_by', 'ppdr_outcome']


class PostpartumAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostpartumAssessment
        fields = ['ppa_date_of_visit', 'ppa_feeding', 'ppa_findings', 'ppa_nurses_notes']


class PostpartumAssessmentWithVitalsSerializer(serializers.ModelSerializer):
    """Serializer for PostpartumAssessment with associated vital signs"""
    vital_signs = serializers.SerializerMethodField()
    postpartum_record_info = serializers.SerializerMethodField()
    
    class Meta:
        model = PostpartumAssessment
        fields = ['ppa_date_of_visit', 'ppa_feeding', 'ppa_findings', 'ppa_nurses_notes', 
                 'vital_signs', 'postpartum_record_info']
    
    def get_vital_signs(self, obj):
        """Get vital signs from the related PostpartumRecord"""
        if hasattr(obj, 'ppr_id') and obj.ppr_id and obj.ppr_id.vital_id:
            vital = obj.ppr_id.vital_id
            return {
                'vital_id': vital.vital_id,
                'vital_bp_systolic': vital.vital_bp_systolic,
                'vital_bp_diastolic': vital.vital_bp_diastolic,
            }
        return None
    
    def get_postpartum_record_info(self, obj):
        """Get basic postpartum record information"""
        if hasattr(obj, 'ppr_id') and obj.ppr_id:
            return {
                'ppr_id': obj.ppr_id.ppr_id,
                'ppr_lochial_discharges': obj.ppr_id.ppr_lochial_discharges,
                'created_at': obj.ppr_id.created_at,
            }
        return None

# for inserting of postpartum record along with nested data
class PostpartumCompleteSerializer(serializers.ModelSerializer):
    # Nested serializers for related data
    delivery_record = PostpartumDeliveryRecordSerializer(write_only=True)
    assessments = PostpartumAssessmentSerializer(many=True, write_only=True)
    spouse_data = SpouseCreateSerializer(required=False)
    
    # Vital signs data
    vital_bp_systolic = serializers.CharField(write_only=True)
    vital_bp_diastolic = serializers.CharField(write_only=True)
    vital_temp = serializers.CharField(write_only=True, required=False, allow_blank=True)
    vital_RR = serializers.CharField(write_only=True, required=False, allow_blank=True)
    vital_o2 = serializers.CharField(write_only=True, required=False, allow_blank=True)
    vital_pulse = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    # Follow-up visit data
    followup_date = serializers.DateField(write_only=True)
    followup_description = serializers.CharField(default="Postpartum follow-up visit", write_only=True)
    
    # TT Status FK
    tts_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    # Medicine data - for micronutrient supplementation
    selected_medicines = serializers.ListField(
        child=serializers.DictField(), 
        write_only=True, 
        required=False,
        allow_empty=True
    )
    
    # Patient data - we'll create the PatientRecord here
    pat_id = serializers.CharField(write_only=True, required=True)
    patrec_type = serializers.CharField(default="Postpartum Care", write_only=True)  # Fixed: was "Postpartum"
    
    # Staff data - for tracking who performed the transaction
    staff_id = serializers.CharField(write_only=True, required=False, allow_blank=True)

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
            'ppr_lochial_discharges',
            'ppr_num_of_pads', 'ppr_date_of_bf',
            'ppr_time_of_bf', 'pat_id', 'patrec_type', 'delivery_record', 'assessments',
            'spouse_data', 'vital_bp_systolic', 'vital_bp_diastolic', 'vital_temp', 
            'vital_RR', 'vital_o2', 'vital_pulse', 'followup_date',
            'followup_description', 'selected_medicines', 'staff_id', 'tts_id'
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

    def validate_selected_medicines(self, value):
        """Validate selected medicines data"""
        if not value:
            return value
        
        from apps.medicineservices.models import MedicineInventory
        
        for medicine in value:
            minv_id = medicine.get('minv_id')
            medrec_qty = medicine.get('medrec_qty', 0)
            
            if not minv_id:
                raise serializers.ValidationError("Medicine ID (minv_id) is required for each selected medicine")
            
            if not isinstance(medrec_qty, int) or medrec_qty <= 0:
                raise serializers.ValidationError("Medicine quantity must be a positive integer")
            
            try:
                medicine_inv = MedicineInventory.objects.get(minv_id=minv_id)
                if medicine_inv.minv_qty_avail < medrec_qty:
                    raise serializers.ValidationError(
                        f"Insufficient stock for medicine {medicine_inv.med_id.med_name}. "
                        f"Available: {medicine_inv.minv_qty_avail}, Requested: {medrec_qty}"
                    )
            except MedicineInventory.DoesNotExist:
                raise serializers.ValidationError(f"Medicine with ID {minv_id} not found")
        
        return value

    def get_patient_details(self, patient):
        """Get comprehensive patient details for both Resident and Transient patients"""
        if not patient:
            return None
            
        # Initialize the response structure
        patient_data = {
            'pat_id': patient.pat_id,
            'pat_type': patient.pat_type,
            'personal_info': None,
            'address': None,
            'family': None
        }
        
        # Handle Resident patients
        if patient.pat_type == 'Resident' and patient.rp_id:
            try:
                # Get personal info from ResidentProfile -> Personal
                if hasattr(patient.rp_id, 'per') and patient.rp_id.per:
                    personal = patient.rp_id.per
                    patient_data['personal_info'] = {
                        'per_fname': personal.per_fname,
                        'per_lname': personal.per_lname,
                        'per_mname': personal.per_mname,
                        'per_dob': personal.per_dob,
                        'per_sex': personal.per_sex,
                        'per_contact': personal.per_contact,
                        'per_status': personal.per_status,
                        'per_religion': personal.per_religion,
                        'per_edAttainment': personal.per_edAttainment,
                    }
                    
                    # Get address from Personal -> PersonalAddress -> Address
                    try:
                        personal_address = PersonalAddress.objects.filter(
                            per=personal
                        ).select_related('add', 'add__sitio').first()
                        
                        if personal_address and personal_address.add:
                            address = personal_address.add
                            patient_data['address'] = {
                                'add_street': address.add_street,
                                'add_sitio': address.sitio.sitio_name if hasattr(address, 'sitio') and address.sitio else None,
                                'add_barangay': address.add_barangay,
                                'add_city': address.add_city,
                                'add_province': address.add_province,
                            }
                        else:
                            patient_data['address'] = {
                                'add_street': None,
                                'add_sitio': None,
                                'add_barangay': None,
                                'add_city': None,
                                'add_province': None,
                            }
                    except Exception as e:
                        print(f"Error getting resident address: {e}")
                        patient_data['address'] = {
                            'add_street': None,
                            'add_sitio': None,
                            'add_barangay': None,
                            'add_city': None,
                            'add_province': None,
                        }
                    
                    # Get family info from FamilyComposition
                    try:
                        family_composition = FamilyComposition.objects.filter(
                            rp=patient.rp_id
                        ).select_related('fam').first()

                        if family_composition and family_composition.fam:
                            # Get all family members to find MOTHER and FATHER roles
                            family_members = FamilyComposition.objects.filter(
                                fam=family_composition.fam
                            ).select_related('rp', 'rp__per')
                            
                            family_heads = {}
                            for member in family_members:
                                role = member.fc_role.lower()
                                if role in ['father'] and member.rp and member.rp.per:
                                    family_heads[role] = {
                                        'rp_id': member.rp.rp_id,
                                        'role': member.fc_role,
                                        'composition_id': member.fc_id,
                                        'personal_info': {
                                            'per_lname': member.rp.per.per_lname,
                                            'per_fname': member.rp.per.per_fname,
                                            'per_mname': member.rp.per.per_mname,
                                            'per_dob': member.rp.per.per_dob,
                                            'per_sex': member.rp.per.per_sex,
                                            # 'per_occupation': getattr(ember.rp.per, 'per_occupation', ''),
                                        }
                                    }
                            
                            patient_data['family'] = {
                                'fam_id': family_composition.fam.fam_id,
                                'fc_role': family_composition.fc_role,
                                'fam_date_registered': family_composition.fam.fam_date_registered,
                                'family_heads': family_heads, 
                            }
                        else:
                            patient_data['family'] = {
                                'fam': None,
                                'note': 'No family composition found for this resident'
                            }
                    except Exception as e:
                        print(f"Error getting family composition: {e}")
                        patient_data['family'] = {
                            'fam': None,
                            'error': f'Error retrieving family composition: {str(e)}'
                        }
                        
            except Exception as e:
                print(f"Error processing resident patient: {e}")
        
        # Handle Transient patients
        elif patient.pat_type == 'Transient' and patient.trans_id:
            try:
                transient = patient.trans_id
                patient_data['personal_info'] = {
                    'per_fname': transient.tran_fname,
                    'per_lname': transient.tran_lname,
                    'per_mname': transient.tran_mname,
                    'per_dob': transient.tran_dob,
                    'per_sex': transient.tran_sex,
                    'per_contact': transient.tran_contact,
                    'per_status': transient.tran_status,
                    'per_religion': transient.tran_religion,
                    'per_edAttainment': transient.tran_ed_attainment,
                }
                
                # Get transient address
                if transient.tradd_id:
                    trans_address = transient.tradd_id  # This is the TransientAddress object
                    patient_data['address'] = {
                        'add_street': trans_address.tradd_street,
                        'add_sitio': trans_address.tradd_sitio,
                        'add_barangay': trans_address.tradd_barangay,
                        'add_city': trans_address.tradd_city,
                        'add_province': trans_address.tradd_province,
                    }
                else:
                    patient_data['address'] = {
                        'add_street': None,
                        'add_sitio': None,
                        'add_barangay': None,
                        'add_city': None,
                        'add_province': None,
                    }
                
                # Transients don't have family compositions
                patient_data['family'] = {
                    'fam': None,
                    'note': 'Transient patients do not have family compositions'
                }
                
            except Exception as e:
                print(f"Error processing transient patient: {e}")
        
        return patient_data

    def create(self, validated_data):
        print(f"Creating postpartum record with validated data: {validated_data}")
        
        # validated data
        delivery_data = validated_data.pop('delivery_record')
        assessments_data = validated_data.pop('assessments', [])
        spouse_data = validated_data.pop('spouse_data', None)
        selected_medicines = validated_data.pop('selected_medicines', [])
        
        vital_bp_systolic = validated_data.pop('vital_bp_systolic')
        vital_bp_diastolic = validated_data.pop('vital_bp_diastolic')
        vital_temp = validated_data.pop('vital_temp', "N/A")
        vital_RR = validated_data.pop('vital_RR', "N/A")
        vital_o2 = validated_data.pop('vital_o2', "N/A")
        vital_pulse = validated_data.pop('vital_pulse', "N/A")
        
        followup_date = validated_data.pop('followup_date')
        followup_description = validated_data.pop('followup_description')
        
        pat_id = validated_data.pop('pat_id')
        patrec_type = validated_data.pop('patrec_type')
        staff_id = validated_data.pop('staff_id', None)
        tts_id = validated_data.pop('tts_id', None)  # ✅ Extract TT Status FK

        try:
            with transaction.atomic():
                # Verify patient exists
                patient = Patient.objects.get(pat_id=pat_id)
                print(f"Found patient: {patient.pat_id}")
                
				#  pregnancy creation logic
                pregnancy = None
                current_datetime = timezone.now()
                current_date = current_datetime.date()
                
				# first, check if patient has an active pregnancy
                recent_active_pregnancy = Pregnancy.objects.filter(pat_id=patient, status='active').first()
                if recent_active_pregnancy:
                    print("Found active pregnancy: {recently_active_pregnancy.pregnancy_id}. Marking as completed")
                    recent_active_pregnancy.status = "completed"
                    recent_active_pregnancy.updated_at = current_datetime
                    recent_active_pregnancy.prenatal_end_date = current_date
                    recent_active_pregnancy.postpartum_end_date = None
                    recent_active_pregnancy.save()
                    pregnancy = recent_active_pregnancy
                
				# second, check if there are any completed pregnancies that is within 45 days
                else:
                    forty_five_days_ago = current_date - timedelta(days=45)
                    recent_completed_pregnancy = Pregnancy.objects.filter(
                        pat_id=patient, 
                        status='completed', 
                        prenatal_end_date__gte=forty_five_days_ago,
                        prenatal_end_date__lte=current_date
                    ).order_by('-prenatal_end_date').first()
                    
                    if recent_completed_pregnancy:
                        print(f'Found recent completed pregnancy: {recent_completed_pregnancy.pregnancy_id}')
                        pregnancy = recent_completed_pregnancy
                    
                    # if no completed then create new pregnancy
                    else:
                        current_yr = current_datetime.year
                        current_yr_suffix = str(current_yr)[-2:]
                        prefix = f'PREG-{current_yr}-{current_yr_suffix}'
                        existing_preg_max = Pregnancy.objects.filter(
                            pregnancy_id__startswith=prefix
                        ).aggregate(
                            max_num = Max('pregnancy_id')
                        )
                        
                        if existing_preg_max['max_num']:
                            last_preg_id = existing_preg_max['max_num']
                            last_num = int(last_preg_id[-4:])
                            new_num = last_num + 1
                        else:
                            new_num = 1
                        
                        new_pregnancy_id = f'{prefix}{str(new_num).zfill(4)}'

                        pregnancy = Pregnancy.objects.create(
                            pregnancy_id=new_pregnancy_id,
                            pat_id=patient,
                            status='active',
                            created_at=current_date,
                            updated_at=current_date,
                            prenatal_end_date=None,
                            postpartum_end_date=None
                        )
                        print(f'Created new Pregnancy: {pregnancy.pregnancy_id}')
                
                # Create PatientRecord first
                patient_record = PatientRecord.objects.create(
                    patrec_type=patrec_type,
                    pat_id=patient  # Pass the patient object, not the ID
                )
                print(f"Created patient record: {patient_record.patrec_id}")
                
                # Get staff instance early for vital signs and other records
                staff_instance = None
                if staff_id:
                    try:
                        staff_instance = Staff.objects.get(staff_id=staff_id)
                        print(f"Found staff: {staff_instance.staff_id}")
                    except Staff.DoesNotExist:
                        print(f"Staff with ID {staff_id} not found")
                
                # Create VitalSigns with only BP data
                vital_signs = VitalSigns.objects.create(
                    vital_bp_systolic=vital_bp_systolic,
                    vital_bp_diastolic=vital_bp_diastolic,
                    vital_temp=vital_temp,
                    vital_RR=vital_RR,
                    vital_o2=vital_o2,
                    vital_pulse=vital_pulse,
                    patrec=patient_record,
                    staff=staff_instance
                )
                print(f"Created vital signs: {vital_signs.vital_id}")
                
                # Handle spouse logic using your existing business rules
                spouse = handle_spouse_logic(patient, spouse_data)
                if spouse:
                    print(f"Using spouse: {spouse.spouse_id}")
                else:
                    print("No spouse created/used")
                
                # Create FollowUpVisit with pending status
                follow_up_visit = FollowUpVisit.objects.create(
                    followv_date=followup_date,
                    followv_status="pending",
                    followv_description=followup_description,
                    patrec=patient_record
                )
                print(f"Created follow-up visit: {follow_up_visit.followv_id}")

                # create postpartum record - only pass model fields, not write_only fields
                postpartum_data = {
                    'patrec_id': patient_record,
                    'vital_id': vital_signs,
                    'spouse_id': spouse,
                    'followv_id': follow_up_visit,
                    'pregnancy_id': pregnancy,
                    'ppr_lochial_discharges': validated_data.get('ppr_lochial_discharges'),
                    'ppr_vit_a_date_given': validated_data.get('ppr_vit_a_date_given'),
                    'ppr_num_of_pads': validated_data.get('ppr_num_of_pads'),
                    'ppr_date_of_bf': validated_data.get('ppr_date_of_bf'),
                    'ppr_time_of_bf': validated_data.get('ppr_time_of_bf'),
                    'staff_id': staff_instance,
                }
                
                # Handle TT Status FK - fetch the object and pass it
                if tts_id:
                    try:
                        tts_record = TT_Status.objects.get(tts_id=tts_id)
                        postpartum_data['tts_id'] = tts_record  # ✅ Pass the TT_Status object
                        print(f"Linked TT Status: {tts_id}")
                    except TT_Status.DoesNotExist:
                        print(f"Warning: TT Status with ID {tts_id} not found, skipping FK link")
                
                postpartum_record = PostpartumRecord.objects.create(**postpartum_data)
                print(f"Created postpartum record: {postpartum_record.ppr_id}")
                
                # postpartum_history = PostpartumHistory.objects.create(
                #     ppr_id=postpartum_record,
                # )

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
                
                # Process selected medicines using shared utility -> creates MedicineRequest & allocations
                if selected_medicines:
                    try:
                        med_request = create_medicine_request_for_maternal(
                            patient_record=patient_record,
                            selected_medicines=selected_medicines,
                            staff_instance=staff_instance
                        )
                        if med_request:
                            postpartum_record.medreq_id = med_request
                            postpartum_record.save()
                            print(f"Linked MedicineRequest {med_request.medreq_id} to postpartum record")
                    except Exception as e:
                        print(f"Error creating MedicineRequest for postpartum record: {str(e)}")
                
                print(f"Successfully created complete postpartum record: {postpartum_record.ppr_id}")
                return postpartum_record
                
        except Patient.DoesNotExist:
            error_msg = f"Patient with ID {pat_id} does not exist"
            print(error_msg)
            raise serializers.ValidationError(error_msg)
        except Exception as e:
            error_msg = f"Error creating postpartum record: {str(e)}"
            print(error_msg)
            # Transaction automatically rolls back on exception exit
            raise serializers.ValidationError(error_msg)

    def to_representation(self, instance):
        # get the base representation but exclude the nested fields that don't exist on the instance
        representation = super().to_representation(instance)
        
        # Add the ppr_id to the representation
        representation['ppr_id'] = instance.ppr_id
        
        # Add patient details
        if instance.patrec_id and instance.patrec_id.pat_id:
            representation['patient_details'] = self.get_patient_details(instance.patrec_id.pat_id)
        else:
            representation['patient_details'] = None
        
        # Exclude write-only fields and nested objects from representation
        # These should not be in the serialized output
        write_only_fields = [
            'delivery_record', 'assessments', 'spouse_data',
            'vital_bp_systolic', 'vital_bp_diastolic', 'vital_temp', 'vital_RR', 'vital_o2', 'vital_pulse',
            'followup_date', 'followup_description',
            'pat_id', 'patrec_type', 'selected_medicines', 'staff_id', 'tts_id'
        ]
        
        # Remove write-only fields from representation to prevent serialization errors
        for field_name in write_only_fields:
            representation.pop(field_name, None)
        
        if instance.pregnancy_id:
            representation['pregnancy'] = {
                'pregnancy_id': instance.pregnancy_id.pregnancy_id,
                'status': instance.pregnancy_id.status,
                'created_at': instance.pregnancy_id.created_at,
                'updated_at': instance.pregnancy_id.updated_at,
                'prenatal_end_date': instance.pregnancy_id.prenatal_end_date,
                'postpartum_end_date': instance.pregnancy_id.postpartum_end_date,
                # 'pat_id': instance.pregnancy_id.pat_id.pat_id
            }
        else:
            representation['pregnancy'] = None
        
        representation['patrec_id'] = instance.patrec_id.patrec_id if instance.patrec_id else None
        
        try:
            delivery_records = instance.postpartum_delivery_record.all()
            representation['delivery_records'] = PostpartumDeliveryRecordSerializer(
                delivery_records, many=True
            ).data
        except Exception as e:
            print(f"Error getting delivery records: {e}")
            representation['delivery_records'] = []
        
        try:
            assessments = instance.postpartum_assessment.all()
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
                'vital_bp_diastolic': instance.vital_id.vital_bp_diastolic,
                'vital_temp': instance.vital_id.vital_temp,
                'vital_RR': instance.vital_id.vital_RR,
                'vital_o2': instance.vital_id.vital_o2,
                'vital_pulse': instance.vital_id.vital_pulse
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
                'spouse_dob': instance.spouse_id.spouse_dob,
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
        
        # Add TT Status FK data
        if instance.tts_id:
            representation['tts_info'] = {
                'tts_id': instance.tts_id.tts_id,
                'tts_status': instance.tts_id.tts_status,
                'tts_date_given': str(instance.tts_id.tts_date_given) if hasattr(instance.tts_id, 'tts_date_given') else None,
            }
        else:
            representation['tts_info'] = None
        
        return representation
    

from rest_framework import serializers
from datetime import date

from apps.maternal.models import *
from apps.maternal.serializers.serializer import *
from apps.patientrecords.serializers.followvisits_serializers import FollowUpVisitSerializer

# for maternal accordion view
class PregnancyDetailSerializer(serializers.ModelSerializer):
    prenatal_form = PrenatalDetailViewSerializer(many=True, read_only=True)
    postpartum_record = PostpartumDetailViewSerializer(many=True, read_only=True)
    pat_id = serializers.CharField(source='pat_id.pat_id', read_only=True)
    prenatal_care = serializers.SerializerMethodField()
    follow_up = serializers.SerializerMethodField()

    class Meta:
        model = Pregnancy
        fields = ['pregnancy_id', 'status', 'created_at', 'updated_at',
                  'prenatal_end_date', 'postpartum_end_date', 'pat_id',
                 'prenatal_form', 'prenatal_care', 'postpartum_record', 'follow-up']

    def get_prenatal_care(self, obj):
        """
        Get prenatal_care entry for a specific record
        """
        try:
            prenatal_forms = obj.prenatal_form.all()  
            
            prenatal_care_data = []
            
            for pf in prenatal_forms:
                # Get prenatal care records for each prenatal form
                prenatal_care_records = pf.pf_prenatal_care.all()  
                
                for pc_record in prenatal_care_records:
                    prenatal_care_serializer = PrenatalCareSerializer(
                        pc_record, 
                        context=self.context
                    )
                    prenatal_care_data.append(prenatal_care_serializer.data)
            
            return prenatal_care_data
                
        except Exception as e:
            print(f'Error getting prenatal care: {str(e)}')
            return []
        
    def get_follow_up(self, obj):
        """
        Get follow-up visit records for the pregnancy's patient
        """
        try:
            follow_up_data = []
            prenatal_forms = obj.prenatal_form.all()
            for pf in prenatal_forms:
                follow_up_visit = getattr(pf, 'followv_id', None)
                if follow_up_visit:
                    follow_up_serializer = FollowUpVisitSerializer(
                        follow_up_visit,
                        context=self.context
                    )
                    follow_up_data.append(follow_up_serializer.data)
            return follow_up_data
        except Exception as e:
            print(f'Error getting follow-up visits: {str(e)}')
            return []

# for completing pregnancy status
class PregnancyCompleteStatusSerializer(serializers.ModelSerializer):
    pat_id = serializers.CharField(write_only=True, required=True)

    class Meta: 
        model = Pregnancy
        fields = ['pat_id', 'pregnancy_id', 'status', 'prenatal_end_date']

    def validate_pat_id(self, value):
        if not value or value.lower() == 'nan' or value.strip() == '':
            raise serializers.ValidationError("Patient ID is required")
        try:
            Patient.objects.get(pat_id=value.strip())
            return value.strip()
        
        except Patient.DoesNotExist:
            raise serializers.ValidationError(f'Patient with ID {value} does not exist.')
        except Exception as e:
            raise serializers.ValidationError(f'Error validating patient ID {value}: {str(e)}')

    def create(self, validated_data):
        pat_id = validated_data.pop('pat_id')

        pregnancy = Pregnancy.objects.update(
            pat_id=pat_id, 
            status='Completed',
            prenatal_end_date=date.today()
        )

        return pregnancy
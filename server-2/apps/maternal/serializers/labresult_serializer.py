from rest_framework import serializers
from apps.maternal.models import *


class LabResultImgSerializer(serializers.ModelSerializer):
   class Meta:
      model = LaboratoryResultImg
      fields = '__all__'


class LabResultSerializer(serializers.ModelSerializer):
   labresult_imgs = LabResultImgSerializer(many=True, read_only=True)

   class Meta:
      model = LaboratoryResult
      fields = '__all__'


# Helper function to fetch all laboratory results for a pregnancy
def get_laboratory_results_by_pregnancy(pregnancy_id):
    """
    Fetch all laboratory results for a specific pregnancy.
    
    Relationship chain:
    Pregnancy → Prenatal_Form (via pregnancy_id FK) → LaboratoryResult (via pf_id FK)
    
    Args:
        pregnancy_id: The pregnancy_id to fetch lab results for
    
    Returns:
        List of laboratory results with their images
    """
    try:
        # Get all prenatal forms for this pregnancy
        prenatal_forms = Prenatal_Form.objects.filter(
            pregnancy_id=pregnancy_id
        ).values_list('pf_id', flat=True)
        
        # Get all laboratory results for these prenatal forms
        lab_results = LaboratoryResult.objects.filter(
            pf_id__in=prenatal_forms
        ).prefetch_related('lab_result_img').order_by('-created_at')
        
        # Build the result data
        lab_data = []
        for lab in lab_results:
            lab_images = [{
                'lab_img_id': str(img.lab_img_id),
                'image_url': img.image_url,
                'image_name': img.image_name,
                'image_type': img.image_type,
                'image_size': img.image_size,
                'created_at': img.created_at
            } for img in lab.lab_result_img.all()]
            
            lab_data.append({
                'lab_id': str(lab.lab_id),
                'pf_id': lab.pf_id.pf_id,  # Include the prenatal form reference
                'lab_type': lab.lab_type,
                'result_date': lab.result_date,
                'is_completed': lab.is_completed,
                'to_be_followed': lab.to_be_followed,
                'document_path': lab.document_path,
                'remarks': lab.remarks,
                'images': lab_images,
                'created_at': lab.created_at,
                'updated_at': lab.updated_at
            })
        
        return lab_data
    
    except Pregnancy.DoesNotExist:
        return []
    except Exception as e:
        raise serializers.ValidationError(f"Error fetching laboratory results: {str(e)}")
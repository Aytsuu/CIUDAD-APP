from rest_framework import serializers
from apps.profiling.serializers.business_serializers import FileInputSerializer
from utils.supabase_client import upload_to_storage, remove_from_storage
from .models import *

class LandingBaseSerializer(serializers.ModelSerializer):
  files = serializers.SerializerMethodField()
  class Meta:
    model = LandingPage
    fields = '__all__'
  
  def get_files(self, obj):
    return [
      {
        'id': file.lcf_id,
        'name': file.lcf_name,
        'type': file.lcf_type,
        'url': file.lcf_url
      } for file in obj.landing_carousel_files.all()
    ]
  
class LandingUpdateSerializer(serializers.ModelSerializer):
  cpt_name = serializers.CharField(write_only=True, required=False)
  cpt_photo = FileInputSerializer(write_only=True, required=False)
  contact = serializers.CharField(write_only=True, required=False)
  email = serializers.CharField(write_only=True, required=False)
  address = serializers.CharField(write_only=True, required=False)
  quote = serializers.CharField(write_only=True, required=False)
  mission = serializers.CharField(write_only=True, required=False)
  vision = serializers.CharField(write_only=True, required=False)
  values = serializers.CharField(write_only=True, required=False)
  carousel = FileInputSerializer(write_only=True, required=False, many=True)

  class Meta:
    model = LandingPage
    fields = ['cpt_name', 'cpt_photo', 'quote', 'mission', 'vision',
              'values', 'contact', 'email', 'address', 'carousel']
  
  def update(self, instance, validated_data):
    cpt_photo = validated_data.pop('cpt_photo', None)
    carousel = validated_data.pop('carousel', [])

    if len(carousel) > 0:
      existing = instance.landing_carousel_files.all()

      carousel_files = []
      files_to_keep = []
      
      for file_data in carousel:
        if 'file' in file_data and file_data['file'] != "":
          carousel_file = LandingCarouselFIle(
            lp=instance,
            lcf_name=file_data['name'],
            lcf_type=file_data['type'],
            lcf_path=file_data['name']
          )

          url = upload_to_storage(file_data, 'landing-page-bucket', '')
          carousel_file.lcf_url=url
          carousel_files.append(carousel_file)
        
        files_to_keep.append(file_data['name'])
      
      # Consider removed files, should be removed in the db as well
      for file in existing:
        if file.lcf_name not in files_to_keep:
          remove_from_storage('landing-page-bucket', file.lcf_path)
          file.delete()
      
      # Bulk upload
      if len(carousel_files) > 0:
        LandingCarouselFIle.objects.bulk_create(carousel_files)

    if cpt_photo:
      url = upload_to_storage(cpt_photo, 'landing-page-bucket', '')
      if url:
        setattr(instance, 'cpt_photo', url)
    
    for attr, val in validated_data.items():
      setattr(instance, attr, val)

    instance.save()
    return instance
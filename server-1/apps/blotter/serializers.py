from rest_framework import serializers
from .models import Blotter, BlotterMedia
import json

class BlotterMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlotterMedia
        fields = ['file_name', 'storage_path', 'url', 'file_type']

class BlotterSerializer(serializers.ModelSerializer):
    media_urls = serializers.CharField(write_only=True, required=False)
    media = BlotterMediaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Blotter
        fields = '__all__'
    
    def create(self, validated_data):
        media_urls_json = validated_data.pop('media_urls', '[]')
        
        blotter = Blotter.objects.create(**validated_data)
        
        try:
            media_urls = json.loads(media_urls_json)
            for media_data in media_urls:
                BlotterMedia.objects.create(
                    blotter=blotter,
                    file_name=media_data.get('originalName', ''),
                    storage_path=media_data.get('storagePath', ''),
                    url=media_data.get('url', ''),
                    file_type=media_data.get('type', '')
                )
        except json.JSONDecodeError:
            pass  # Handle invalid JSON
            
        return blotter
from rest_framework import serializers
from .models import Acknowledgement


class AcknowledgementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Acknowledgement
        fields = '__all__'

from rest_framework import serializers

class AllRecordTableSerializer(serializers.Serializer):
    lname = serializers.CharField()
    fname = serializers.CharField()
    mname = serializers.CharField()

from rest_framework import serializers

class AllRecordTableSerializer(serializers.Serializer):
    id = serializers.CharField()
    lname = serializers.CharField()
    fname = serializers.CharField()
    mname = serializers.CharField()
    family_no = serializers.CharField(required=False)
    date_registered = serializers.DateField()
    type = serializers.CharField()

from rest_framework import serializers
from .models import *
from datetime import date

class Prenatal_Form(serializers.ModelSerializer):
    class Meta:
        model = Prenatal_Form
        fields = '__all__'

class Obstretical_History(serializers.ModelSerializer):
    class Meta:
        model = Obstretical_History
        fields = '__all__'
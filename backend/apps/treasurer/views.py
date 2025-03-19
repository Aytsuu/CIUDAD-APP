from django.shortcuts import render
from rest_framework  import generics
from .serializers import *

class Budget_PlanView(generics.ListCreateAPIView):
    serializer_class = Budget_PlanSerializer
    queryset = Budget_Plan.objects.all()

class Current_Expenditures_PersonalView(generics.ListCreateAPIView):
    serializer_class = Current_Expenditures_PersonalSerializers
    queryset = Current_Expenditures_Personal.objects.all()

class Current_Expenditures_MaintenanceView(generics.ListCreateAPIView):
    serializer_class = Current_Expenditures_MaintenanceSerializers
    queryset = Current_Expenditures_Maintenance.objects.all()

class Other_Maint_And_Operating_ExpenseView(generics.ListCreateAPIView):
    serializer_class = Other_Maint_And_Operating_ExpenseSerializers
    queryset = Other_Maint_And_Operating_Expense.objects.all()

class Capital_Outlays_And_Non_OfficeView(generics.ListCreateAPIView):
    serializer_class = Capital_Outlays_And_Non_OfficeSerializers
    queryset = Capital_Outlays_And_Non_Office.objects.all()

class Income_FileView(generics.ListCreateAPIView):
    serializer_class = Income_FileSerializers
    queryset = Income_File.objects.all()

class Disbursement_FileView(generics.ListCreateAPIView):
    serializer_class = Disbursement_FileSerializers
    queryset = Disbursement_File.objects.all()
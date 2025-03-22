from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


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

# class Income_FileView(generics.ListCreateAPIView):
#     serializer_class = Income_FileSerializers
#     queryset = Income_File.objects.all()

# class Disbursement_FileView(generics.ListCreateAPIView):
#     serializer_class = Disbursement_FileSerializers
#     queryset = Disbursement_File.objects.all()


# -------------------------------- INCOME & EXPENSE ------------------------------------

class Income_Expense_TrackingView(generics.ListCreateAPIView):
    serializer_class = Income_Expense_TrackingSerializers
    queryset = Income_Expense_Tracking.objects.all()


class DeleteIncomeExpenseView(generics.DestroyAPIView):
    serializer_class = Income_Expense_TrackingSerializers    
    queryset = Income_Expense_Tracking.objects.all()

    def get_object(self):
        iet_num = self.kwargs.get('iet_num')
        return get_object_or_404(Income_Expense_Tracking, iet_num=iet_num) 

class UpdateIncomeExpenseView(generics.RetrieveUpdateAPIView):
    serializer_class = Income_Expense_TrackingSerializers
    queryset = Income_Expense_Tracking.objects.all()
    lookup_field = 'iet_num'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


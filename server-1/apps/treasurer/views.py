from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from datetime import datetime


class BudgetHeaderView(generics.ListCreateAPIView):
    serializer_class = Budget_HeaderSerializer
    queryset = Budget_Plan.objects.all()

class BudgetPlanDetailView(generics.ListCreateAPIView):
    serializer_class = Budget_Plan_DetailSerializer
    queryset = Budget_Plan_Detail.objects.all()

    def create(self, request, *args, **kwargs):
        if isinstance(request.data, list): 
            serializer = self.get_serializer(data=request.data, many=True) 
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return super().create(request, *args, **kwargs) 
        
class DeleteRetrieveBudgetPlanAndDetails(generics.RetrieveDestroyAPIView):
    queryset = Budget_Plan.objects.all()
    serializer_class = Budget_HeaderSerializer
    lookup_field = 'plan_id'


class UpdateBudgetPlan(generics.UpdateAPIView):
    serializer_class = Budget_HeaderSerializer
    queryset = Budget_Plan.objects.all()
    lookup_field = 'plan_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class UpdateBudgetDetails(generics.UpdateAPIView):
    serializer_class = Budget_Plan_DetailSerializer
    queryset = Budget_Plan_Detail.objects.all()
    lookup_field = 'dtl_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# class Income_FileView(generics.ListCreateAPIView):
#     serializer_class = Income_FileSerializers
#     queryset = Income_File.objects.all()

# class Disbursement_FileView(generics.ListCreateAPIView):
#     serializer_class = Disbursement_FileSerializers
#     queryset = Disbursement_File.objects.all()




# -------------------------------- INCOME & EXPENSE ------------------------------------



class Income_Expense_TrackingView(generics.ListCreateAPIView):
    serializer_class = Income_Expense_TrackingSerializers

    def get_queryset(self):
        # Get year from query params (default to current year if not provided)
        year = self.request.query_params.get('year', datetime.now().year)
        return Income_Expense_Tracking.objects.filter(
            Q(iet_date__year=year)
        ).select_related('dtl_id')


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


# class GetParticularsView(generics.ListAPIView):
#     serializer_class = Budget_Plan_DetailSerializer

#     def get_queryset(self):
#         current_year = timezone.now().year
#         # Get the current year's budget plan
#         current_plan = Budget_Plan.objects.filter(plan_year=str(current_year)).first()
        
#         if current_plan:
#             # Return all details for the current year's plan
#             return Budget_Plan_Detail.objects.filter(plan=current_plan)
#         return Budget_Plan_Detail.objects.none()
    

class GetParticularsView(generics.ListAPIView):
    serializer_class = Budget_Plan_DetailSerializer

    def get_queryset(self):
        year = self.request.query_params.get('year', timezone.now().year)
        print(f"Using year: {year} (type: {type(year)})")
        # Get the current year's budget plan
        current_plan = Budget_Plan.objects.filter(plan_year=str(year)).first()
        
        if current_plan:
            # Return all details for the current year's plan
            print(f"Found plan for year {year}")
            return Budget_Plan_Detail.objects.filter(plan=current_plan)
        print(f"No plan found for year {year}")
        return Budget_Plan_Detail.objects.none()
    


# ------------------------- INCOME --------------------------------------

 

# class Income_TrackingView(generics.ListCreateAPIView):
#     serializer_class = Income_TrackingSerializers
#     queryset = Income_Tracking.objects.all().select_related('incp_id')


class Income_TrackingView(generics.ListCreateAPIView):
    serializer_class = Income_TrackingSerializers
    def get_queryset(self):
        # Get year from query params (default to current year if not provided)
        year = self.request.query_params.get('year', datetime.now().year)
        return Income_Tracking.objects.filter(
            Q(inc_date__year=year)
        ).select_related('incp_id')


class UpdateIncomeTrackingView(generics.RetrieveUpdateAPIView):
    serializer_class = Income_TrackingSerializers
    queryset = Income_Tracking.objects.all()
    lookup_field = 'inc_num'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteIncomeTrackingView(generics.DestroyAPIView):
    serializer_class = Income_TrackingSerializers    
    queryset = Income_Tracking.objects.all()

    def get_object(self):
        inc_num = self.kwargs.get('inc_num')
        return get_object_or_404(Income_Tracking, inc_num=inc_num) 
    

# ------ INCOME PARTICULAR

class Income_ParticularView(generics.ListCreateAPIView):
    serializer_class = Income_ParticularSerializers
    queryset = Income_Particular.objects.all()


class DeleteIncome_ParticularView(generics.DestroyAPIView):
    serializer_class = Income_ParticularSerializers
    queryset = Income_Particular.objects.all()   

    def get_object(self):
        incp_id = self.kwargs.get('incp_id')
        return get_object_or_404(Income_Particular, incp_id=incp_id)   


# ---------- INCOME EXPENSE MAIN

class Income_Expense_MainView(generics.ListCreateAPIView):
    serializer_class = Income_Expense_MainSerializers
    queryset = Income_Expense_Main.objects.all()
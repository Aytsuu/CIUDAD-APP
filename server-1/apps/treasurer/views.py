from django.shortcuts import render
from rest_framework import generics
from .serializers import *
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from datetime import datetime
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny
from .models import Budget_Plan_Detail, Budget_Plan

class BudgetPlanView(generics.ListCreateAPIView):
    serializer_class = BudgetPlanSerializer
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
    serializer_class = BudgetPlanSerializer
    lookup_field = 'plan_id'


class UpdateBudgetPlan(generics.UpdateAPIView):
    serializer_class = BudgetPlanSerializer
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
    

class BudgetPlanHistoryView(generics.ListCreateAPIView):
    serializer_class = BudgetPlanHistorySerializer
    queryset = Budget_Plan_History.objects.all()

class BudgetPlanHistoryRetrieveView(generics.ListCreateAPIView):
    serializer_class = BudgetPlanHistorySerializer

    def get_queryset(self):
        plan_id = self.kwargs.get('plan_id')
        if plan_id:
            return Budget_Plan_History.objects.filter(plan=plan_id)
        return Budget_Plan_History.objects.all()


class BudgetPlanDetailHistoryView(generics.ListCreateAPIView):
    serializer_class = BudgetPlanDetailHistorySerializer
    queryset = Budget_Plan_Detail_History.objects.all()


class BudgetPlanAndDetailHistoryView(generics.RetrieveAPIView):
    queryset = Budget_Plan_History.objects.all()
    serializer_class = BudgetPlanHistorySerializer
    lookup_field = 'bph_id'

# -------------------------------- INCOME & DISBURSEMENT ------------------------------------
class IncomeFolderListView(generics.ListCreateAPIView):
    serializer_class = Income_Folder_Serializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Income_File_Folder.objects.all()
        archive_status = self.request.query_params.get('archive', None)
        
        if archive_status == 'true':
            queryset = queryset.filter(inf_is_archive=True)
        elif archive_status == 'false':
            queryset = queryset.filter(inf_is_archive=False)
            
        return queryset

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        print("Income folder creation response (view):", response.data)
        return response
    
class IncomeFolderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = Income_Folder_Serializer
    queryset = Income_File_Folder.objects.all()
    lookup_field = 'inf_num'
    permission_classes = [AllowAny]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Get all images in folder (both archived and active)
        images = Income_Image.objects.filter(inf_num=instance)
        
        # Delete all images
        deleted_count, _ = images.delete()
        
        # Delete the now-empty folder
        instance.delete()
        
        return Response(
            {
                "message": "Folder and all images deleted",
                "deleted_images": deleted_count
            },
            status=status.HTTP_200_OK
        )

class RestoreIncomeFolderView(generics.UpdateAPIView):
    queryset = Income_File_Folder.objects.filter(inf_is_archive=True)
    serializer_class = Income_Folder_Serializer
    lookup_field = 'inf_num'
    permission_classes = [AllowAny]

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.inf_is_archive = False
        instance.save()
        # Restore all images in this folder
        Income_Image.objects.filter(inf_num=instance).update(infi_is_archive=False)
        return Response({"message": "Income folder and all images restored"}, 
                      status=status.HTTP_200_OK)

class DisbursementFolderListView(generics.ListCreateAPIView):
    serializer_class = Disbursement_Folder_Serializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Disbursement_File_Folder.objects.all()
        archive_status = self.request.query_params.get('archive', None)
        
        if archive_status == 'true':
            queryset = queryset.filter(dis_is_archive=True)
        elif archive_status == 'false':
            queryset = queryset.filter(dis_is_archive=False)
            
        return queryset
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        print("Disbursement folder creation response (view):", response.data)
        return response

class DisbursementFolderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = Disbursement_Folder_Serializer
    queryset = Disbursement_File_Folder.objects.all()
    lookup_field = 'dis_num'
    permission_classes = [AllowAny]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Get all images in folder (both archived and active)
        images = Disbursement_Image.objects.filter(dis_num=instance)
        
        # Delete all images
        deleted_count, _ = images.delete()
        
        # Delete the now-empty folder
        instance.delete()
        
        return Response(
            {
                "message": "Folder and all images deleted",
                "deleted_images": deleted_count
            },
            status=status.HTTP_200_OK
        )

class RestoreDisbursementFolderView(generics.UpdateAPIView):
    queryset = Disbursement_File_Folder.objects.filter(dis_is_archive=True)
    serializer_class = Disbursement_Folder_Serializer
    lookup_field = 'dis_num'
    permission_classes = [AllowAny]

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.dis_is_archive = False
        instance.save()
        # Restore all images in this folder
        Disbursement_Image.objects.filter(dis_num=instance).update(disf_is_archive=False)
        return Response({"message": "Disbursement folder and all images restored"}, 
                      status=status.HTTP_200_OK)

class Income_ImageListView(generics.ListCreateAPIView):
    serializer_class = Income_ImageSerializers
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Income_Image.objects.all()
        archive_status = self.request.query_params.get('archive', None)
        
        if archive_status == 'true':
            queryset = queryset.filter(infi_is_archive=True)
        elif archive_status == 'false':
            queryset = queryset.filter(infi_is_archive=False)
            
        return queryset

    def perform_create(self, serializer):
        inf_num = self.request.data.get('inf_num')
        try:
            folder = Income_File_Folder.objects.get(inf_num=inf_num)
            serializer.save(inf_num=folder)
        except Income_File_Folder.DoesNotExist:
            raise serializers.ValidationError("Invalid income folder ID")

class Income_ImageView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = Income_ImageSerializers
    queryset = Income_Image.objects.all()
    lookup_field = 'infi_num'
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            instance.delete()
            return Response({"message": "Income image permanently deleted"}, status=status.HTTP_204_NO_CONTENT)
        else:
            instance.infi_is_archive = True
            instance.save()
            return Response({"message": "Income image archived"}, status=status.HTTP_200_OK)

class Disbursement_ImageListView(generics.ListCreateAPIView):
    serializer_class = Disbursement_ImageSerializers
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Disbursement_Image.objects.all()
        archive_status = self.request.query_params.get('archive', None)
        
        if archive_status == 'true':
            queryset = queryset.filter(disf_is_archive=True)
        elif archive_status == 'false':
            queryset = queryset.filter(disf_is_archive=False)
            
        return queryset

    def perform_create(self, serializer):
        dis_num = self.request.data.get('dis_num')
        try:
            folder = Disbursement_File_Folder.objects.get(dis_num=dis_num)
            serializer.save(dis_num=folder)
        except Disbursement_File_Folder.DoesNotExist:
            raise serializers.ValidationError("Invalid disbursement folder ID")

class Disbursement_ImageView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = Disbursement_ImageSerializers
    queryset = Disbursement_Image.objects.all()
    lookup_field = 'disf_num'
    permission_classes = [AllowAny]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            instance.delete()
            return Response({"message": "Disbursement image permanently deleted"}, status=status.HTTP_204_NO_CONTENT)
        else:
            instance.disf_is_archive = True
            instance.save()
            return Response({"message": "Disbursement image archived"}, status=status.HTTP_200_OK)


# -------------------------------- INCOME & EXPENSE ------------------------------------

class UpdateBudgetPlanDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = Budget_Plan_DetailSerializer
    lookup_field = 'dtl_id'

    def get_queryset(self):
        year = self.kwargs['year']
        queryset = Budget_Plan_Detail.objects.filter(plan__plan_year=year)

        if not queryset.exists():
            raise NotFound(detail=f"No budget plan found for the year {year}.")

        return queryset

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True) 
        return super().update(request, *args, **kwargs)


class Income_Expense_TrackingView(generics.ListCreateAPIView):
    serializer_class = Income_Expense_TrackingSerializers

    def get_queryset(self):
        # Get year from query params (default to current year if not provided)
        year = self.request.query_params.get('year', datetime.now().year)
        return Income_Expense_Tracking.objects.filter(
            Q(iet_datetime__year=year)
        ).select_related('dtl_id').prefetch_related('files')


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
            Q(inc_datetime__year=year)
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
    # queryset = Income_Expense_Main.objects.all()
    queryset = Income_Expense_Main.objects.filter(ie_is_archive=False)


class UpdateIncome_Expense_MainView(generics.RetrieveUpdateAPIView):
    serializer_class = Income_Expense_MainSerializers
    # queryset = Income_Expense_Main.objects.all()
    queryset = Income_Expense_Main.objects.filter(ie_is_archive=False)
    lookup_field = 'ie_main_year'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)




# ------------- INCOME_EXPENSE FILE FOLDER

class Income_Expense_FileView(generics.ListCreateAPIView):
    serializer_class = Income_Expense_FileSerializers
    queryset = Income_Expense_File.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        iet_num = self.request.query_params.get('iet_num')
        if iet_num:
            queryset = queryset.filter(iet_num=iet_num)
        return queryset

class IncomeExpenseFileDetailView(generics.RetrieveDestroyAPIView):
    queryset = Income_Expense_File.objects.all()
    serializer_class = Income_Expense_FileSerializers
    lookup_field = 'ief_id' 

#---------------RATES

class Annual_Gross_SalesView(generics.ListCreateAPIView):
    serializer_class = Annual_Gross_SalesSerializers
    queryset = Annual_Gross_Sales.objects.all()

class DeleteUpdate_Annual_Gross_SalesView(generics.UpdateAPIView):
    serializer_class = Annual_Gross_SalesSerializers
    queryset = Annual_Gross_Sales.objects.all()
    lookup_field = 'ags_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class Purpose_And_RatesView(generics.ListCreateAPIView):
    serializer_class = Purpose_And_RatesSerializers
    queryset = Purpose_And_Rates.objects.all()


class DeleteUpdate_Purpose_And_RatesView(generics.UpdateAPIView):
    serializer_class = Purpose_And_RatesSerializers
    queryset = Purpose_And_Rates.objects.all()
    lookup_field = 'pr_id'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


#---------------  RECEIPTS

# class InvoiceView(generics.ListCreateAPIView):
#     serializer_class = InvoiceSerializers
#     queryset = Invoice.objects.all()

class InvoiceView(generics.ListCreateAPIView):
    serializer_class = InvoiceSerializers
    queryset = Invoice.objects.select_related(
        'cr_id__rp_id__per'  # This ensures efficient querying
    ).all()
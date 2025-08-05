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
from simple_history.utils import update_change_reason
from .models import Budget_Plan_Detail, Budget_Plan
from .serializers import ClearanceRequestSerializer, ClearanceRequestDetailSerializer, PaymentStatusUpdateSerializer

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
        

class BudgetPlanHistoryView(generics.ListCreateAPIView):
    serializer_class = BudgetPlanHistorySerializer
    queryset = Budget_Plan_History.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        plan_id = self.kwargs.get('plan_id')  
        if plan_id:
            queryset = queryset.filter(plan_id=plan_id)
        return queryset.order_by('-bph_date_updated')  

    def post(self, request, *args, **kwargs):
        plan_id = self.kwargs.get('plan_id')
        if plan_id:
            if isinstance(request.data, list):
                for item in request.data:
                    item['plan'] = plan_id
            else:
                request.data['plan'] = plan_id
        
        serializer = self.get_serializer(data=request.data, many=isinstance(request.data, list))
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        
class BudgetPlanFileView(generics.ListCreateAPIView):
    serializer_class = BudgetPlanFileSerializer
    queryset = BudgetPlan_File.objects.all()

class BudgetPlanFileRetrieveView(generics.ListCreateAPIView):
    serializer_class = BudgetPlanFileSerializer

    def get_queryset(self):
        plan_id = self.kwargs.get('plan_id')
        if plan_id:
            # Use the exact field name from your model
            return BudgetPlan_File.objects.filter(plan_id=plan_id)
        return BudgetPlan_File.objects.all()


class PreviousYearBudgetPlanView(generics.RetrieveAPIView):
    serializer_class = BudgetPlanSerializer
    
    def get_object(self):
        current_year = datetime.now().year
        previous_year = current_year - 1
        
        # Get the budget plan for previous year
        previous_year_plan = get_object_or_404(
            Budget_Plan, 
            plan_year=str(previous_year)
        )
        return previous_year_plan

class PreviousYearBudgetPlanDetailsView(generics.ListAPIView):
    serializer_class = Budget_Plan_DetailSerializer
    
    def get_queryset(self):
        current_year = datetime.now().year
        previous_year = current_year - 1
        
        # First get the previous year's plan
        previous_year_plan = get_object_or_404(
            Budget_Plan, 
            plan_year=str(previous_year)
        )
        
        # Then get all details for that plan
        return Budget_Plan_Detail.objects.filter(plan_id=previous_year_plan.plan_id)
    
class DeleteBudgetPlanFile(generics.RetrieveDestroyAPIView):
    queryset = BudgetPlan_File.objects.all()
    serializer_class = BudgetPlanFileSerializer
    lookup_field = 'bpf_id'

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
    


class BudgetPlanHistoryView(generics.ListAPIView):
    serializer_class = BudgetPlanHistorySerializer

    def get_queryset(self):
        plan_id = self.kwargs['plan_id']
        return Budget_Plan.history.filter(
            plan_id=plan_id,
            history_type='~'  
        ).order_by('-history_date')


    def list(self, request, *args, **kwargs):
        plan_id = self.kwargs['plan_id']
        plan = get_object_or_404(Budget_Plan, plan_id=plan_id)
        
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        response_data = {
            'plan_id': plan.plan_id,
            'plan_year': plan.plan_year,
            'history': serializer.data
        }
        
        return Response(response_data)
    

class RetrieveBudgetPlanAndDetailHistoryView(generics.ListAPIView):
    serializer_class = BudgetPlanHistorySerializer

    def get_queryset(self):
        plan_id = self.kwargs['plan_id']
        budget_plan = Budget_Plan.objects.get(plan_id=plan_id)
        return budget_plan.history.all().order_by('-history_date')

    def list(self, request, *args, **kwargs):
        plan_id = self.kwargs['plan_id']
        
        try:
            budget_plan = Budget_Plan.objects.get(plan_id=plan_id)
            
            plan_history = self.get_queryset()
            plan_history_data = self.get_serializer(plan_history, many=True).data
            
            detail_items = Budget_Plan_Detail.objects.filter(plan=budget_plan)
            
            details_history = []
            for detail in detail_items:
                detail_history = detail.history.all().order_by('-history_date')
                serialized_detail_history = BudgetPlanDetailHistorySerializer(detail_history, many=True).data
                
                details_history.append({
                    'detail_id': detail.dtl_id,
                    'item_name': detail.dtl_budget_item,
                    'category': detail.dtl_budget_category,
                    'history': serialized_detail_history
                })
            
            response_data = {
                'plan_id': budget_plan.plan_id,
                'plan_year': budget_plan.plan_year,
                'plan_history': plan_history_data,
                'details_history': details_history
            }
            
            return Response(response_data)
            
        except Budget_Plan.DoesNotExist:
            return Response(
                {'error': 'Budget Plan not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# -------------------------------- INCOME & DISBURSEMENT ------------------------------------
class IncomeFolderListView(generics.ListAPIView):
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

class IncomeFolderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = Income_Folder_Serializer
    queryset = Income_File_Folder.objects.all()
    lookup_field = 'inf_num'
    permission_classes = [AllowAny]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            # First delete all images in the folder
            Income_Image.objects.filter(inf_num=instance).delete()
            # Then delete the folder
            instance.delete()
            return Response({"message": "Income folder and all images permanently deleted"}, 
                          status=status.HTTP_204_NO_CONTENT)
        else:
            # Archive folder and all its images
            instance.inf_is_archive = True
            instance.save()
            Income_Image.objects.filter(inf_num=instance).update(infi_is_archive=True)
            return Response({"message": "Income folder and all images archived"}, 
                          status=status.HTTP_200_OK)

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

class DisbursementFolderListView(generics.ListAPIView):
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

class DisbursementFolderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = Disbursement_Folder_Serializer
    queryset = Disbursement_File_Folder.objects.all()
    lookup_field = 'dis_num'
    permission_classes = [AllowAny]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            # First delete all images in the folder
            Disbursement_Image.objects.filter(dis_num=instance).delete()
            # Then delete the folder
            instance.delete()
            return Response({"message": "Disbursement folder and all images permanently deleted"}, 
                          status=status.HTTP_204_NO_CONTENT)
        else:
            # Archive folder and all its images
            instance.dis_is_archive = True
            instance.save()
            Disbursement_Image.objects.filter(dis_num=instance).update(disf_is_archive=True)
            return Response({"message": "Disbursement folder and all images archived"}, 
                          status=status.HTTP_200_OK)

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

class Income_ImageListView(generics.ListAPIView):
    serializer_class = Income_ImageSerializers
    queryset = Income_Image.objects.filter(infi_is_archive=False)  # Exclude archived
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Income_Image.objects.all()
        archive_status = self.request.query_params.get('archive', None)
        
        if archive_status == 'true':
            queryset = queryset.filter(infi_is_archive=True)
        elif archive_status == 'false':
            queryset = queryset.filter(infi_is_archive=False)
            
        return queryset

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
            return Response({"message": "Income image permanently deleted"}, 
                          status=status.HTTP_204_NO_CONTENT)
        else:
            instance.infi_is_archive = True
            instance.save()
            return Response({"message": "Income image archived"}, 
                          status=status.HTTP_200_OK)

class Disbursement_ImageListView(generics.ListAPIView):
    serializer_class = Disbursement_ImageSerializers
    queryset = Disbursement_Image.objects.filter(disf_is_archive=False)  # Exclude archived
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Disbursement_Image.objects.all()
        archive_status = self.request.query_params.get('archive', None)
        
        if archive_status == 'true':
            queryset = queryset.filter(disf_is_archive=True)
        elif archive_status == 'false':
            queryset = queryset.filter(disf_is_archive=False)
            
        return queryset

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
            return Response({"message": "Disbursement image permanently deleted"}, 
                          status=status.HTTP_204_NO_CONTENT)
        else:
            instance.disf_is_archive = True
            instance.save()
            return Response({"message": "Disbursement image archived"}, 
                          status=status.HTTP_200_OK)

# -------------------------------- INCOME & EXPENSE ------------------------------------

class ExpenseParticulartView(generics.ListCreateAPIView):
    serializer_class = Expense_ParticularSerializers
    queryset = Expense_Particular.objects.all()

    def create(self, request, *args, **kwargs):
        if isinstance(request.data, list): 
            serializer = self.get_serializer(data=request.data, many=True) 
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            return super().create(request, *args, **kwargs) 
        
class UpdateExpenseParticularView(generics.RetrieveUpdateAPIView):
    serializer_class = Expense_ParticularSerializers
    lookup_field = 'exp_id'

    def get_queryset(self):
        year = self.kwargs['year']
        queryset = Expense_Particular.objects.filter(plan__plan_year=year)

        if not queryset.exists():
            raise NotFound(detail=f"No budget plan found for the year {year}.")

        return queryset

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True) 
        return super().update(request, *args, **kwargs)
    

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
        ).select_related('exp_id').prefetch_related('files')


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


class GetExpenseParticularsView(generics.ListAPIView):
    serializer_class = Expense_ParticularSerializers

    def get_queryset(self):
        year = self.request.query_params.get('year', timezone.now().year)
        print(f"Using year: {year} (type: {type(year)})")
        # Get the current year's budget plan
        current_plan = Budget_Plan.objects.filter(plan_year=str(year)).first()
        
        if current_plan:
            # Return all details for the current year's plan
            print(f"Found plan for year {year}")
            return Expense_Particular.objects.filter(plan=current_plan)
        print(f"No plan found for year {year}")
        return Expense_Particular.objects.none()
    


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
    queryset = annual_gross_sales.objects.all()

class DeleteUpdate_Annual_Gross_SalesView(generics.UpdateAPIView):
    serializer_class = Annual_Gross_SalesSerializers
    queryset = annual_gross_sales.objects.all()
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

# Clearance Request Views
class ClearanceRequestListView(generics.ListAPIView):
    serializer_class = ClearanceRequestSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        from apps.clerk.models import ClerkCertificate
        queryset = ClerkCertificate.objects.select_related('rp').prefetch_related('clerk_invoices').all()
        
        # Search functionality
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(cr_id__icontains=search_query) |
                Q(rp__per_fname__icontains=search_query) |
                Q(rp__per_lname__icontains=search_query) |
                Q(req_type__icontains=search_query)
            )
        
        return queryset


class ClearanceRequestDetailView(generics.RetrieveAPIView):
    serializer_class = ClearanceRequestDetailSerializer
    lookup_field = 'cr_id'
    permission_classes = [AllowAny]

    def get_queryset(self):
        from apps.clerk.models import ClerkCertificate
        return ClerkCertificate.objects.select_related('rp').prefetch_related('clerk_invoices').all()


class UpdatePaymentStatusView(generics.UpdateAPIView):
    serializer_class = PaymentStatusUpdateSerializer
    lookup_field = 'cr_id'
    permission_classes = [AllowAny]

    def get_queryset(self):
        from apps.clerk.models import ClerkCertificate
        return ClerkCertificate.objects.all()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if serializer.is_valid():
            instance.req_payment_status = serializer.validated_data['payment_status']
            instance.save()
            
            # Return the updated clearance request
            detail_serializer = ClearanceRequestDetailSerializer(instance)
            return Response(detail_serializer.data, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PaymentStatisticsView(generics.ListAPIView):
    permission_classes = [AllowAny]
    
    def list(self, request, *args, **kwargs):
        from apps.clerk.models import ClerkCertificate
        total_requests = ClerkCertificate.objects.count()
        paid_requests = ClerkCertificate.objects.filter(req_payment_status='Paid').count()
        unpaid_requests = ClerkCertificate.objects.filter(req_payment_status='Unpaid').count()
        partial_requests = ClerkCertificate.objects.filter(req_payment_status='Partial').count()
        overdue_requests = ClerkCertificate.objects.filter(req_payment_status='Overdue').count()
        pending_requests = ClerkCertificate.objects.filter(req_status='Pending').count()
        
        statistics = {
            'total_requests': total_requests,
            'paid_requests': paid_requests,
            'unpaid_requests': unpaid_requests,
            'partial_requests': partial_requests,
            'overdue_requests': overdue_requests,
            'pending_requests': pending_requests
        }
        
        return Response(statistics, status=status.HTTP_200_OK)

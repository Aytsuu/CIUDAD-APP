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
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
import logging
logger = logging.getLogger(__name__)

class BudgetPlanView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = BudgetPlanSerializer
    queryset = Budget_Plan.objects.all()

class BudgetPlanDetailView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
    serializer_class = BudgetPlanFileCreateSerializer
    queryset = BudgetPlan_File.objects.all()

class BudgetPlanFileRetrieveView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = BudgetPlanFileViewSerializer

    def get_queryset(self):
        plan_id = self.kwargs.get('plan_id')
        if plan_id:
            # Use the exact field name from your model
            return BudgetPlan_File.objects.filter(plan_id=plan_id)
        return BudgetPlan_File.objects.all()


class PreviousYearBudgetPlanView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
    queryset = BudgetPlan_File.objects.all()
    serializer_class = BudgetPlanFileViewSerializer
    lookup_field = 'bpf_id'

class DeleteRetrieveBudgetPlanAndDetails(generics.RetrieveDestroyAPIView):
    permission_classes = [AllowAny]
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
    
# -------------------------------- DISBURSEMENT ------------------------------------
class DisbursementArchiveMixin:
    """Mixin for archive/restore functionality"""
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            instance.delete()
        else:
            # Soft delete - determine archive field name
            archive_field = 'dis_is_archive' if hasattr(instance, 'dis_is_archive') else 'disf_is_archive'
            setattr(instance, archive_field, True)
            instance.save()
            
        return Response(status=status.HTTP_204_NO_CONTENT)

class DisbursementArchiveView(generics.UpdateAPIView):
    """Generic archive view"""
    permission_classes = [AllowAny]
    
    def perform_update(self, serializer):
        # Determine archive field name
        model = serializer.instance.__class__
        archive_field = 'dis_is_archive' if hasattr(serializer.instance, 'dis_is_archive') else 'disf_is_archive'
        serializer.save(**{archive_field: True})

class DisbursementRestoreView(generics.UpdateAPIView):
    """Generic restore view"""
    permission_classes = [AllowAny]
    
    def perform_update(self, serializer):
        # Determine archive field name
        model = serializer.instance.__class__
        archive_field = 'dis_is_archive' if hasattr(serializer.instance, 'dis_is_archive') else 'disf_is_archive'
        serializer.save(**{archive_field: False})

class DisbursementVoucherView(generics.ListCreateAPIView):
    serializer_class = Disbursement_VoucherSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Disbursement_Voucher.objects.select_related('staff').order_by('-dis_num')
        
        archive = self.request.query_params.get('archive')
        if archive in ['true', 'false']:
            queryset = queryset.filter(dis_is_archive=archive == 'true')
        
        year = self.request.query_params.get('year')
        if year:
            queryset = queryset.filter(dis_date__year=year)
            
        return queryset

class DisbursementVoucherDetailView(DisbursementArchiveMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Disbursement_Voucher.objects.select_related('staff')
    serializer_class = Disbursement_VoucherSerializer
    lookup_field = 'dis_num'
    permission_classes = [AllowAny]


class DisbursementVoucherArchiveView(DisbursementArchiveView):
    queryset = Disbursement_Voucher.objects.filter(dis_is_archive=False)
    serializer_class = Disbursement_VoucherSerializer
    lookup_field = 'dis_num'


class DisbursementVoucherRestoreView(DisbursementRestoreView):
    queryset = Disbursement_Voucher.objects.filter(dis_is_archive=True)
    serializer_class = Disbursement_VoucherSerializer
    lookup_field = 'dis_num'

# Disbursement File Views
class DisbursementFileView(generics.ListCreateAPIView):
    serializer_class = Disbursement_FileSerializers
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Disbursement_File.objects.select_related('dis_num').order_by('-disf_num')
        
        dis_num = self.request.query_params.get('dis_num')
        if dis_num:
            queryset = queryset.filter(dis_num=dis_num)
        
        archive = self.request.query_params.get('archive')
        if archive in ['true', 'false']:
            queryset = queryset.filter(disf_is_archive=archive == 'true')
            
        return queryset

    def create(self, request, *args, **kwargs):
        # Handle bulk file upload
        files = request.data.get('files')
        dis_num_id = request.data.get('dis_num')
        
        if files and dis_num_id:
            serializer = self.get_serializer()
            serializer._upload_files(files, dis_num_id=dis_num_id)
            return Response({"status": "Files uploaded successfully"}, status=status.HTTP_201_CREATED)
        
        return super().create(request, *args, **kwargs)

class DisbursementFileDetailView(DisbursementArchiveMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Disbursement_File.objects.select_related('dis_num')
    serializer_class = Disbursement_FileSerializers
    lookup_field = 'disf_num'
    permission_classes = [AllowAny]


class DisbursementFileArchiveView(DisbursementArchiveView):
    queryset = Disbursement_File.objects.filter(disf_is_archive=False)
    serializer_class = Disbursement_FileSerializers
    lookup_field = 'disf_num'


class DisbursementFileRestoreView(DisbursementRestoreView):
    queryset = Disbursement_File.objects.filter(disf_is_archive=True)
    serializer_class = Disbursement_FileSerializers
    lookup_field = 'disf_num'

class DisbursementFileCreateView(generics.CreateAPIView):
    serializer_class = Disbursement_FileSerializers
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            dis_num_id = self.kwargs.get('dis_num') or request.data.get('dis_num')
            files = request.data.get('files', [])
            
            print(f"Received file upload request for dis_num: {dis_num_id}")
            print(f"Number of files: {len(files)}")
            
            if not dis_num_id:
                return Response({"error": "dis_num is required"}, status=status.HTTP_400_BAD_REQUEST)

            if not files:
                return Response({"error": "No files provided"}, status=status.HTTP_400_BAD_REQUEST)

            try:
                disbursement_voucher = Disbursement_Voucher.objects.get(pk=dis_num_id)
            except Disbursement_Voucher.DoesNotExist:
                return Response(
                    {"error": f"Disbursement voucher with id {dis_num_id} does not exist"}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            # Use the serializer's upload method
            serializer = self.get_serializer()
            serializer.context['request'] = request
            
            uploaded_files = serializer._upload_files(files, dis_num_id=dis_num_id)
            
            return Response({
                "status": "Files processed successfully", 
                "uploaded_count": len(uploaded_files),
                "total_files": len(files),
                "files": Disbursement_FileSerializers(uploaded_files, many=True).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"ERROR in DisbursementFileCreateView: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
# -------------------------------- INCOME & EXPENSE ------------------------------------

class ExpenseParticulartView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
    serializer_class = Income_Expense_TrackingSerializers

    def get_queryset(self):
        # Get year from query params (default to current year if not provided)
        year = self.request.query_params.get('year', datetime.now().year)
        return Income_Expense_Tracking.objects.filter(
            Q(iet_datetime__year=year)
        ).select_related('exp_id').prefetch_related('files')


class DeleteIncomeExpenseView(generics.DestroyAPIView):
    permission_classes = [AllowAny]
    serializer_class = Income_Expense_TrackingSerializers    
    queryset = Income_Expense_Tracking.objects.all()

    def get_object(self):
        iet_num = self.kwargs.get('iet_num')
        return get_object_or_404(Income_Expense_Tracking, iet_num=iet_num) 

class UpdateIncomeExpenseView(generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
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
    

class Expense_LogView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Expense_LogSerializers

    def get_queryset(self):
        # Get year from query params (default to current year if not provided)
        year = self.request.query_params.get('year', datetime.now().year)
        return Expense_Log.objects.filter(
            Q(el_datetime__year=year)
        ).select_related('iet_num')

# ------------------------- INCOME --------------------------------------

 

# class Income_TrackingView(generics.ListCreateAPIView):
#     serializer_class = Income_TrackingSerializers
#     queryset = Income_Tracking.objects.all().select_related('incp_id')


class Income_TrackingView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Income_TrackingSerializers
    def get_queryset(self):
        # Get year from query params (default to current year if not provided)
        year = self.request.query_params.get('year', datetime.now().year)
        return Income_Tracking.objects.filter(
            Q(inc_datetime__year=year)
        ).select_related('incp_id')


class UpdateIncomeTrackingView(generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
    serializer_class = Income_TrackingSerializers    
    queryset = Income_Tracking.objects.all()

    def get_object(self):
        inc_num = self.kwargs.get('inc_num')
        return get_object_or_404(Income_Tracking, inc_num=inc_num) 
    

# ------ INCOME PARTICULAR

class Income_ParticularView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Income_ParticularSerializers
    queryset = Income_Particular.objects.all()


class DeleteIncome_ParticularView(generics.DestroyAPIView):
    permission_classes = [AllowAny]
    serializer_class = Income_ParticularSerializers
    queryset = Income_Particular.objects.all()   

    def get_object(self):
        incp_id = self.kwargs.get('incp_id')
        return get_object_or_404(Income_Particular, incp_id=incp_id)   


# ---------- INCOME EXPENSE MAIN

class Income_Expense_MainView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Income_Expense_MainSerializers
    # queryset = Income_Expense_Main.objects.all()
    queryset = Income_Expense_Main.objects.filter(ie_is_archive=False)


class UpdateIncome_Expense_MainView(generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
    serializer_class = Income_Expense_FileSerializers
    queryset = Income_Expense_File.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        iet_num = self.request.query_params.get('iet_num')
        if iet_num:
            queryset = queryset.filter(iet_num=iet_num)
        return queryset

    def create(self, request, *args, **kwargs):
        # Get iet_num from either query params or request data
        iet_num = request.query_params.get('iet_num') or request.data.get('iet_num')
        
        if not iet_num:
            return Response(
                {"error": "iet_num is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Call your serializer's upload method
        files = request.data.get('files', [])
        self.get_serializer()._upload_files(files, iet_num=iet_num)
        
        return Response({"status": "Files uploaded successfully"}, status=status.HTTP_201_CREATED)


class IncomeExpenseFileDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [AllowAny]
    queryset = Income_Expense_File.objects.all()
    serializer_class = Income_Expense_FileSerializers
    lookup_field = 'ief_id' 

#---------------RATES

class Annual_Gross_SalesView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Annual_Gross_SalesSerializers
    queryset = Annual_Gross_Sales.objects.all().order_by('-ags_date')

class DeleteUpdate_Annual_Gross_SalesView(generics.UpdateAPIView):
    permission_classes = [AllowAny]
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
    permission_classes = [AllowAny]
    serializer_class = Purpose_And_RatesSerializers
    queryset = Purpose_And_Rates.objects.all().order_by('-pr_date')


class DeleteUpdate_Purpose_And_RatesView(generics.UpdateAPIView):
    permission_classes = [AllowAny]
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

class PurposeAndRatesByPurposeView(generics.RetrieveAPIView):
    serializer_class = Purpose_And_RatesSerializers
    
    def get_object(self):
        # Get the pr_purpose parameter from query string
        pr_purpose = self.request.query_params.get('pr_purpose')
        
        # Get the object or return 404
        obj = get_object_or_404(
            Purpose_And_Rates, 
            pr_purpose=pr_purpose, 
            pr_is_archive=False
        )
        return obj

#---------------  RECEIPTS

# class InvoiceView(generics.ListCreateAPIView):
#     serializer_class = InvoiceSerializers
#     queryset = Invoice.objects.all()

class InvoiceView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = InvoiceSerializers
    
    # Use the correct field names that exist in your Invoice model
    queryset = Invoice.objects.select_related(
        'bpr_id__rp_id__per',  # For business permit requests
        'nrc_id',              # For non-resident certificate requests
        'cr_id__rp_id__per'       # For resident certificates
    ).all()


# Clearance Request Views
class ClearanceRequestListView(generics.ListAPIView):
    serializer_class = ClearanceRequestSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        from apps.clerk.models import ClerkCertificate
        queryset = ClerkCertificate.objects.select_related('rp_id').all()
        
        # Search functionality
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(cr_id__icontains=search_query) |
                Q(rp_id__per__per_fname__icontains=search_query) |
                Q(rp_id__per__per_lname__icontains=search_query) |
                Q(req_type__icontains=search_query)
            )
        
        return queryset


class ClearanceRequestDetailView(generics.RetrieveAPIView):
    serializer_class = ClearanceRequestDetailSerializer
    lookup_field = 'cr_id'
    permission_classes = [AllowAny]

    def get_queryset(self):
        from apps.clerk.models import ClerkCertificate
        return ClerkCertificate.objects.select_related('rp_id').all()


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

            # --- AUTO CREATE RECEIPT FOR ANY PAID ---
            try:
                if instance.req_payment_status == "Paid":
                    from apps.treasurer.models import Invoice
                    if not Invoice.objects.filter(cr_id=instance).exists():
                        # Generate next available inv_num
                        try:
                            highest_num = Invoice.objects.aggregate(
                                max_num=models.Max('inv_num')
                            )['max_num'] or 0
                            next_num = highest_num + 1
                        except Exception as e:
                            # Fallback: use current timestamp as ID
                            import time
                            next_num = int(time.time())
                        
                        Invoice.objects.create(
                            inv_num=next_num,
                            cr_id=instance,
                            inv_serial_num=f"INV-{instance.cr_id}",  # You can improve this serial logic
                            inv_amount=0,  # Set correct amount if available
                            inv_nat_of_collection=instance.req_type or "",
                            inv_status="Paid",  # Set status to Paid since payment is complete
                        )
                        
                        # Log the auto-created invoice activity
                        try:
                            from apps.act_log.utils import create_activity_log
                            from apps.administration.models import Staff
                            
                            # Get staff member from the clearance request
                            staff_id = getattr(instance.ra_id, 'staff_id', '00003250722') if instance.ra_id else '00003250722'
                            staff = Staff.objects.filter(staff_id=staff_id).first()
                            
                            if staff:
                                # Create activity log
                                create_activity_log(
                                    act_type="Auto-Invoice Created",
                                    act_description=f"Auto-generated invoice INV-{instance.cr_id} created for {instance.req_type} payment",
                                    staff=staff,
                                    record_id=f"INV-{instance.cr_id}",
                                    feat_name="Payment Processing"
                                )
                                logger.info(f"Activity logged for auto-invoice creation: INV-{instance.cr_id}")
                            else:
                                logger.warning(f"Staff not found for ID: {staff_id}, cannot log activity")
                                
                        except Exception as log_error:
                            logger.error(f"Failed to log activity for auto-invoice creation: {str(log_error)}")
                            # Don't fail the request if logging fails
            except Exception as e:
                import logging
                logging.error(f"Auto-create invoice failed: {e}")
            # --- END AUTO CREATE RECEIPT ---
            
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

# Clearance Request Views
class ResidentNameListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResidentNameSerializer
    
    def get_queryset(self):
        from apps.profiling.models import ResidentProfile
        return ResidentProfile.objects.select_related('per').all()  
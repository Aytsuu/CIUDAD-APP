from rest_framework import generics
from .serializers import *
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.http import Http404
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from datetime import datetime
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny
from apps.act_log.utils import ActivityLogMixin
from .models import Budget_Plan_Detail, Budget_Plan
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
import logging
from apps.pagination import StandardResultsPagination
from django.db.models.functions import ExtractYear
from apps.gad.serializers import GADBudgetYearSerializer
from apps.gad.models import GAD_Budget_Year

logger = logging.getLogger(__name__)

class BudgetPlanAnalyticsView(ActivityLogMixin, generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = BudgetPlanSerializer

    def get_object(self):
        current_year = str(timezone.now().year)
        
        budget_plan = Budget_Plan.objects.filter(
            plan_year=current_year
        ).select_related(
            'staff_id__rp__per'
        ).only(
            'plan_id',
            'plan_year',
            'plan_budgetaryObligations',
            'plan_balUnappropriated',
            'plan_issue_date',
            'plan_is_archive',  
            'staff_id__rp__per__per_lname',
            'staff_id__rp__per__per_fname',
            'staff_id__rp__per__per_mname',
        ).first()
        
        return budget_plan 

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            if instance is None:
                return Response({})  
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as ex:
            return Response({})  

class BudgetPlanActiveView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = BudgetPlanSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = Budget_Plan.objects.filter(plan_is_archive=False).select_related(
            'staff_id__rp__per'
        ).only(
            'plan_id',
            'plan_year',
            'plan_actual_income',
            'plan_rpt_income',
            'plan_balance',
            'plan_tax_share',
            'plan_tax_allotment',
            'plan_cert_fees',
            'plan_other_income',
            'plan_budgetaryObligations',
            'plan_balUnappropriated',
            'plan_issue_date',
            'plan_is_archive',
            'staff_id__rp__per__per_lname',
            'staff_id__rp__per__per_fname',
            'staff_id__rp__per__per_mname',
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(plan_id__icontains=search_query) |
                Q(plan_year__icontains=search_query) |
                Q(plan_actual_income__icontains=search_query) |
                Q(plan_rpt_income__icontains=search_query) |
                Q(plan_balance__icontains=search_query) |
                Q(plan_tax_share__icontains=search_query) |
                Q(plan_tax_allotment__icontains=search_query) |
                Q(plan_cert_fees__icontains=search_query) |
                Q(plan_other_income__icontains=search_query) |
                Q(plan_budgetaryObligations__icontains=search_query) |
                Q(plan_balUnappropriated__icontains=search_query) |
                Q(plan_issue_date__icontains=search_query) |
                Q(staff_id__rp__per__per_lname__icontains=search_query) |
                Q(staff_id__rp__per__per_fname__icontains=search_query) |
                Q(staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()

        return queryset.order_by('plan_id')
    
class BudgetPlanInactiveView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = BudgetPlanSerializer
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = Budget_Plan.objects.filter(plan_is_archive=True).select_related(
            'staff_id__rp__per'
        ).only(
            'plan_id',
            'plan_year',
            'plan_actual_income',
            'plan_rpt_income',
            'plan_balance',
            'plan_tax_share',
            'plan_tax_allotment',
            'plan_cert_fees',
            'plan_other_income',
            'plan_budgetaryObligations',
            'plan_balUnappropriated',
            'plan_issue_date',
            'plan_is_archive',
            'staff_id__rp__per__per_lname',
            'staff_id__rp__per__per_fname',
            'staff_id__rp__per__per_mname',
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(plan_id__icontains=search_query) |
                Q(plan_year__icontains=search_query) |
                Q(plan_actual_income__icontains=search_query) |
                Q(plan_rpt_income__icontains=search_query) |
                Q(plan_balance__icontains=search_query) |
                Q(plan_tax_share__icontains=search_query) |
                Q(plan_tax_allotment__icontains=search_query) |
                Q(plan_cert_fees__icontains=search_query) |
                Q(plan_other_income__icontains=search_query) |
                Q(plan_budgetaryObligations__icontains=search_query) |
                Q(plan_balUnappropriated__icontains=search_query) |
                Q(plan_issue_date__icontains=search_query) |
                Q(staff_id__rp__per__per_lname__icontains=search_query) |
                Q(staff_id__rp__per__per_fname__icontains=search_query) |
                Q(staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()

        return queryset.order_by('plan_id')

class BudgetPlanDetailView(ActivityLogMixin, generics.ListCreateAPIView):
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
        

class BudgetPlanHistoryView(ActivityLogMixin, generics.ListCreateAPIView):
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
        old_is_archive = instance.plan_is_archive
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated_instance = serializer.save()
            
            # Log activity if archive status changed
            try:
                from apps.act_log.utils import create_activity_log
                from apps.administration.models import Staff
                
                new_is_archive = updated_instance.plan_is_archive
                
                if old_is_archive != new_is_archive:
                    staff_id = request.data.get('staff_id') or (updated_instance.staff_id.staff_id if updated_instance.staff_id else None)
                    
                    if staff_id:
                        if isinstance(staff_id, str) and len(staff_id) < 11:
                            staff_id = staff_id.zfill(11)
                        elif isinstance(staff_id, int):
                            staff_id = str(staff_id).zfill(11)
                        
                        staff = Staff.objects.filter(staff_id=staff_id).first() if staff_id else None
                        
                        if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                            act_type = "Budget Plan Archived" if new_is_archive else "Budget Plan Restored"
                            act_description = f"Budget Plan for year {updated_instance.plan_year} {'archived' if new_is_archive else 'restored'}. Budgetary Obligations: ₱{updated_instance.plan_budgetaryObligations:,.2f}"
                            
                            create_activity_log(
                                act_type=act_type,
                                act_description=act_description,
                                staff=staff,
                                record_id=str(updated_instance.plan_id)
                            )
                            logger.info(f"Activity logged for budget plan {'archive' if new_is_archive else 'restore'}: {updated_instance.plan_id}")
            except Exception as log_error:
                logger.error(f"Failed to log activity for budget plan update: {str(log_error)}")
            
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
    

class GADBudgetYearByYearView(generics.RetrieveAPIView):
    serializer_class = GADBudgetYearSerializer
    lookup_field = 'gbudy_year'
    lookup_url_kwarg = 'year'

    def get_object(self):
        year = self.kwargs.get('year')
        try:
            return GAD_Budget_Year.objects.get(gbudy_year=year)
        except GAD_Budget_Year.DoesNotExist:
            raise NotFound(f"GAD budget record for year {year} not found")
    
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

class DisbursementVoucherView(ActivityLogMixin, generics.ListCreateAPIView):
    serializer_class = Disbursement_VoucherSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = Disbursement_Voucher.objects.select_related('staff').order_by('-dis_num')
        
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(dis_payee__icontains=search) |
                Q(dis_particulars__icontains=search) |
                Q(dis_num__icontains=search)
            )
        
        # Year filter
        year = self.request.query_params.get('year', None)
        if year and year != 'all':
            queryset = queryset.filter(dis_date__year=year)
        
        # Archive filter
        archive = self.request.query_params.get('archive', None)
        if archive in ['true', 'false']:
            queryset = queryset.filter(dis_is_archive=archive == 'true')
            
        return queryset
    
    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in DisbursementVoucherView list: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class DisbursementVoucherDetailView(DisbursementArchiveMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Disbursement_Voucher.objects.select_related('staff')
    serializer_class = Disbursement_VoucherSerializer
    lookup_field = 'dis_num'
    permission_classes = [AllowAny]
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_is_archive = instance.dis_is_archive
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            updated_instance = serializer.save()
            
            # Log activity if archive status changed
            try:
                from apps.act_log.utils import create_activity_log
                from apps.administration.models import Staff
                
                new_is_archive = updated_instance.dis_is_archive
                
                if old_is_archive != new_is_archive:
                    staff_id = request.data.get('staff_id') or (updated_instance.staff.staff_id if updated_instance.staff else None)
                    
                    if staff_id:
                        if isinstance(staff_id, str) and len(staff_id) < 11:
                            staff_id = staff_id.zfill(11)
                        elif isinstance(staff_id, int):
                            staff_id = str(staff_id).zfill(11)
                        
                        staff = Staff.objects.filter(staff_id=staff_id).first() if staff_id else None
                        
                        if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                            act_type = "Disbursement Voucher Archived" if new_is_archive else "Disbursement Voucher Restored"
                            act_description = f"Disbursement Voucher {updated_instance.dis_num} {'archived' if new_is_archive else 'restored'}. Payee: {updated_instance.dis_payee}. Amount: ₱{updated_instance.dis_fund:,.2f}"
                            
                            create_activity_log(
                                act_type=act_type,
                                act_description=act_description,
                                staff=staff,
                                record_id=str(updated_instance.dis_num)
                            )
                            logger.info(f"Activity logged for disbursement voucher {'archive' if new_is_archive else 'restore'}: {updated_instance.dis_num}")
            except Exception as log_error:
                logger.error(f"Failed to log activity for disbursement voucher update: {str(log_error)}")
            
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        # Log activity before deletion
        try:
            from apps.act_log.utils import create_activity_log
            from apps.administration.models import Staff
            
            staff_id = request.data.get('staff_id') or (instance.staff.staff_id if instance.staff else None)
            
            if staff_id:
                if isinstance(staff_id, str) and len(staff_id) < 11:
                    staff_id = staff_id.zfill(11)
                elif isinstance(staff_id, int):
                    staff_id = str(staff_id).zfill(11)
                
                staff = Staff.objects.filter(staff_id=staff_id).first() if staff_id else None
                
                if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                    act_type = "Disbursement Voucher Deleted" if permanent else "Disbursement Voucher Archived"
                    act_description = f"Disbursement Voucher {instance.dis_num} {'permanently deleted' if permanent else 'archived'}. Payee: {instance.dis_payee}. Amount: ₱{instance.dis_fund:,.2f}"
                    
                    create_activity_log(
                        act_type=act_type,
                        act_description=act_description,
                        staff=staff,
                        record_id=str(instance.dis_num)
                    )
                    logger.info(f"Activity logged for disbursement voucher {'deletion' if permanent else 'archive'}: {instance.dis_num}")
        except Exception as log_error:
            logger.error(f"Failed to log activity for disbursement voucher deletion: {str(log_error)}")
        
        return super().destroy(request, *args, **kwargs)


class DisbursementVoucherArchiveView(DisbursementArchiveView):
    queryset = Disbursement_Voucher.objects.filter(dis_is_archive=False)
    serializer_class = Disbursement_VoucherSerializer
    lookup_field = 'dis_num'


class DisbursementVoucherRestoreView(DisbursementRestoreView):
    queryset = Disbursement_Voucher.objects.filter(dis_is_archive=True)
    serializer_class = Disbursement_VoucherSerializer
    lookup_field = 'dis_num'
    
class DisbursementVoucherYearsView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, *args, **kwargs):
        try:
            years = Disbursement_Voucher.objects.filter(
                dis_date__isnull=False
            ).annotate(
                year=ExtractYear('dis_date')
            ).values_list('year', flat=True).distinct().order_by('-year')
            
            return Response(list(years))
        except Exception as e:
            logger.error(f"Error fetching disbursement years: {str(e)}")
            return Response([], status=status.HTTP_200_OK)
        
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


class Income_Expense_TrackingView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Income_Expense_TrackingSerializers
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        # Get parameters from query params
        year = self.request.query_params.get('year', datetime.now().year)
        search_query = self.request.query_params.get('search', '')
        month = self.request.query_params.get('month', 'All')
        is_archive = self.request.query_params.get('is_archive', None)
        
        queryset = Income_Expense_Tracking.objects.filter(
            Q(iet_datetime__year=year)
        ).select_related('exp_id').prefetch_related('files')
        
        # Filter by archive status if provided
        if is_archive is not None:
            # Convert string to boolean
            if is_archive.lower() in ['true', '1', 'yes']:
                is_archive_bool = True
            elif is_archive.lower() in ['false', '0', 'no']:
                is_archive_bool = False
            else:
                # Default behavior if invalid value
                is_archive_bool = None
                
            if is_archive_bool is not None:
                queryset = queryset.filter(iet_is_archive=is_archive_bool)
        
        # Apply search filter if search query exists
        if search_query:
            queryset = queryset.filter(
                Q(exp_id__exp_budget_item__icontains=search_query) |
                Q(iet_serial_num__icontains=search_query) |
                Q(iet_check_num__icontains=search_query) |
                Q(iet_additional_notes__icontains=search_query) |
                Q(staff_id__rp__per__per_lname__icontains=search_query) |
                Q(staff_id__rp__per__per_fname__icontains=search_query) |
                Q(staff_id__rp__per__per_mname__icontains=search_query)
            )
        
        # Apply month filter
        if month and month != "All":
            queryset = queryset.filter(iet_datetime__month=month)
        
        return queryset.order_by('-iet_datetime')


class DeleteIncomeExpenseView(generics.DestroyAPIView):
    permission_classes = [AllowAny]
    serializer_class = Income_Expense_TrackingSerializers    
    queryset = Income_Expense_Tracking.objects.all()

    def get_object(self):
        iet_num = self.kwargs.get('iet_num')
        return get_object_or_404(Income_Expense_Tracking, iet_num=iet_num)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Log activity before deletion
        try:
            from apps.act_log.utils import create_activity_log
            from apps.administration.models import Staff
            
            staff_id = request.data.get('staff_id') or (instance.staff_id.staff_id if instance.staff_id else None)
            
            if staff_id:
                if isinstance(staff_id, str) and len(staff_id) < 11:
                    staff_id = staff_id.zfill(11)
                elif isinstance(staff_id, int):
                    staff_id = str(staff_id).zfill(11)
                
                staff = Staff.objects.filter(staff_id=staff_id).first() if staff_id else None
                
                if staff and hasattr(staff, 'staff_id') and staff.staff_id:
                    budget_item = instance.exp_id.exp_budget_item if instance.exp_id else "N/A"
                    amount = instance.iet_amount if hasattr(instance, 'iet_amount') else "N/A"
                    
                    create_activity_log(
                        act_type="Income and Expense Deleted",
                        act_description=f"Income and Expense entry {instance.iet_serial_num} deleted. Budget Item: {budget_item}. Amount: ₱{amount:,.2f}" if isinstance(amount, (int, float)) else f"Income and Expense entry {instance.iet_serial_num} deleted. Budget Item: {budget_item}",
                        staff=staff,
                        record_id=str(instance.iet_num)
                    )
                    logger.info(f"Activity logged for income and expense deletion: {instance.iet_num}")
        except Exception as log_error:
            logger.error(f"Failed to log activity for income and expense deletion: {str(log_error)}")
        
        return super().destroy(request, *args, **kwargs) 

class UpdateIncomeExpenseView(ActivityLogMixin, generics.RetrieveUpdateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Income_Expense_TrackingSerializers
    queryset = Income_Expense_Tracking.objects.all()
    lookup_field = 'iet_num'

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            # Use perform_update to ensure ActivityLogMixin logging works
            self.perform_update(serializer)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    pagination_class = StandardResultsPagination  # Add pagination

    def get_queryset(self):
        # Get parameters from query params
        year = self.request.query_params.get('year', datetime.now().year)
        search_query = self.request.query_params.get('search', '')
        month = self.request.query_params.get('month', 'All')
        
        queryset = Expense_Log.objects.filter(
            Q(el_datetime__year=year)
        ).select_related('iet_num')
        
        # Apply search filter if search query exists
        if search_query:
            queryset = queryset.filter(
                Q(iet_num__exp_id__exp_budget_item__icontains=search_query) |
                Q(el_proposed_budget__icontains=search_query) |
                Q(el_actual_expense__icontains=search_query) |
                Q(el_return_amount__icontains=search_query) |
                Q(iet_num__staff_id__rp__per__per_lname__icontains=search_query) |
                Q(iet_num__staff_id__rp__per__per_fname__icontains=search_query) |
                Q(iet_num__staff_id__rp__per__per_mname__icontains=search_query)
            )
        
        # Apply month filter
        if month and month != "All":
            queryset = queryset.filter(el_datetime__month=month)
        
        return queryset.order_by('-el_datetime')  # Add ordering

# ------------------------- INCOME --------------------------------------
class Income_TrackingView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Income_TrackingSerializers
    pagination_class = StandardResultsPagination  # Add pagination
    
    def get_queryset(self):
        # Get parameters from query params
        year = self.request.query_params.get('year', datetime.now().year)
        search_query = self.request.query_params.get('search', '')
        month = self.request.query_params.get('month', 'All')
        is_archive = self.request.query_params.get('is_archive', None)  # Add archive filter
        
        queryset = Income_Tracking.objects.filter(
            Q(inc_datetime__year=year)
        ).select_related('incp_id')
        
        # Filter by archive status if provided
        if is_archive is not None:
            # Convert string to boolean
            if is_archive.lower() in ['true', '1', 'yes']:
                is_archive_bool = True
            elif is_archive.lower() in ['false', '0', 'no']:
                is_archive_bool = False
            else:
                # Default behavior if invalid value
                is_archive_bool = None
                
            if is_archive_bool is not None:
                queryset = queryset.filter(inc_is_archive=is_archive_bool)
        
        # Apply search filter if search query exists
        if search_query:
            queryset = queryset.filter(
                Q(incp_id__incp_item__icontains=search_query) |
                Q(inc_serial_num__icontains=search_query) |
                Q(inc_transac_num__icontains=search_query) |
                Q(inc_additional_notes__icontains=search_query) |
                Q(staff_id__rp__per__per_lname__icontains=search_query) |
                Q(staff_id__rp__per__per_fname__icontains=search_query) |
                Q(staff_id__rp__per__per_mname__icontains=search_query)
            )
        
        # Apply month filter
        if month and month != "All":
            queryset = queryset.filter(inc_datetime__month=month)
        
        return queryset.order_by('-inc_datetime')  # Add ordering


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
    pagination_class = StandardResultsPagination  # Add pagination
    
    def get_queryset(self):
        search_query = self.request.query_params.get('search', '')
        
        queryset = Income_Expense_Main.objects.filter(ie_is_archive=False)
        
        # Apply search filter if search query exists
        if search_query:
            queryset = queryset.filter(
                Q(ie_main_year__icontains=search_query) |
                Q(ie_main_tot_budget__icontains=search_query) |
                Q(ie_remaining_bal__icontains=search_query) |
                Q(ie_main_inc__icontains=search_query) |
                Q(ie_main_exp__icontains=search_query)
            )
        
        return queryset.order_by('-ie_main_year') 


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

class Annual_Gross_SalesActiveView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Annual_Gross_SalesSerializers
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = Annual_Gross_Sales.objects.filter(
            ags_is_archive=False  
        ).select_related(
            'staff_id__rp__per'
        ).only(
            'ags_id',
            'ags_minimum',
            'ags_maximum',
            'ags_rate',
            'ags_date',
            'ags_is_archive',
            'staff_id__rp__per__per_lname',
            'staff_id__rp__per__per_fname',
            'staff_id__rp__per__per_mname',
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(ags_id__icontains=search_query) |
                Q(ags_minimum__icontains=search_query) |
                Q(ags_maximum__icontains=search_query) |
                Q(ags_rate__icontains=search_query) |
                Q(ags_date__icontains=search_query) |
                Q(staff_id__rp__per__per_lname__icontains=search_query) |
                Q(staff_id__rp__per__per_fname__icontains=search_query) |
                Q(staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()

        return queryset.order_by('-ags_date')

class All_Annual_Gross_SalesView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Annual_Gross_SalesSerializers
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = Annual_Gross_Sales.objects.filter(
        ).select_related(
            'staff_id__rp__per'
        ).only(
            'ags_id',
            'ags_minimum',
            'ags_maximum',
            'ags_rate',
            'ags_date',
            'ags_is_archive',
            'staff_id__rp__per__per_lname',
            'staff_id__rp__per__per_fname',
            'staff_id__rp__per__per_mname',
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(ags_id__icontains=search_query) |
                Q(ags_minimum__icontains=search_query) |
                Q(ags_maximum__icontains=search_query) |
                Q(ags_rate__icontains=search_query) |
                Q(ags_date__icontains=search_query) |
                Q(staff_id__rp__per__per_lname__icontains=search_query) |
                Q(staff_id__rp__per__per_fname__icontains=search_query) |
                Q(staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()

        return queryset.order_by('-ags_date')


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

class Purpose_And_RatesPersonalActiveView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Purpose_And_RatesSerializers
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = Purpose_And_Rates.objects.filter(
            pr_category='Personal',
            pr_is_archive=False  
        ).select_related(
            'staff_id__rp__per'
        ).only(
            'pr_id',
            'pr_purpose',
            'pr_rate',
            'pr_category',
            'pr_date',
            'pr_is_archive',
            'staff_id__rp__per__per_lname',
            'staff_id__rp__per__per_fname',
            'staff_id__rp__per__per_mname',
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(pr_id__icontains=search_query) |
                Q(pr_purpose__icontains=search_query) |
                Q(pr_rate__icontains=search_query) |
                Q(pr_date__icontains=search_query) |
                Q(staff_id__rp__per__per_lname__icontains=search_query) |
                Q(staff_id__rp__per__per_fname__icontains=search_query) |
                Q(staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()

        return queryset.order_by('-pr_date')

class Purpose_And_RatesAllPersonalView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Purpose_And_RatesSerializers
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        queryset = Purpose_And_Rates.objects.filter(
            pr_category='Personal',
        ).select_related(
            'staff_id__rp__per'
        ).only(
            'pr_id',
            'pr_purpose',
            'pr_rate',
            'pr_date',
            'pr_is_archive',
            'staff_id__rp__per__per_lname',
            'staff_id__rp__per__per_fname',
            'staff_id__rp__per__per_mname',
        )

        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(pr_id__icontains=search_query) |
                Q(pr_purpose__icontains=search_query) |
                Q(pr_rate__icontains=search_query) |
                Q(pr_date__icontains=search_query) |
                Q(staff_id__rp__per__per_lname__icontains=search_query) |
                Q(staff_id__rp__per__per_fname__icontains=search_query) |
                Q(staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()

        return queryset.order_by('-pr_date')
    

class Purpose_And_RatesServiceChargeActiveView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Purpose_And_RatesSerializers
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        # Base queryset with category filter and related data
        queryset = Purpose_And_Rates.objects.filter(
            pr_category='Service Charge',
            pr_is_archive=False  # Assuming you want active records
        ).select_related(
            'staff_id__rp__per'
        ).only(
            'pr_id',
            'pr_purpose',
            'pr_rate',
            'pr_date',
            'pr_is_archive',
            'staff_id__rp__per__per_lname',
            'staff_id__rp__per__per_fname',
            'staff_id__rp__per__per_mname',
        )

        # Search functionality
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(pr_id__icontains=search_query) |
                Q(pr_purpose__icontains=search_query) |
                Q(pr_rate__icontains=search_query) |
                Q(pr_date__icontains=search_query) |
                Q(staff_id__rp__per__per_lname__icontains=search_query) |
                Q(staff_id__rp__per__per_fname__icontains=search_query) |
                Q(staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()

        return queryset.order_by('-pr_date')
    
class Purpose_And_RatesAllServiceChargeView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Purpose_And_RatesSerializers
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        # Base queryset with category filter and related data
        queryset = Purpose_And_Rates.objects.filter(
            pr_category='Service Charge',
        ).select_related(
            'staff_id__rp__per'
        ).only(
            'pr_id',
            'pr_purpose',
            'pr_rate',
            'pr_date',
            'pr_is_archive',
            'staff_id__rp__per__per_lname',
            'staff_id__rp__per__per_fname',
            'staff_id__rp__per__per_mname',
        )

        # Search functionality
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(pr_id__icontains=search_query) |
                Q(pr_purpose__icontains=search_query) |
                Q(pr_rate__icontains=search_query) |
                Q(pr_date__icontains=search_query) |
                Q(staff_id__rp__per__per_lname__icontains=search_query) |
                Q(staff_id__rp__per__per_fname__icontains=search_query) |
                Q(staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()

        return queryset.order_by('-pr_date')
    
class Purpose_And_RatesBarangayPermitActiveView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Purpose_And_RatesSerializers
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        # Base queryset with category filter and related data
        queryset = Purpose_And_Rates.objects.filter(
            pr_category='Barangay Permit',
            pr_is_archive=False  # Assuming you want active records
        ).select_related(
            'staff_id__rp__per'
        ).only(
            'pr_id',
            'pr_purpose',
            'pr_rate',
            'pr_date',
            'pr_is_archive',
            'staff_id__rp__per__per_lname',
            'staff_id__rp__per__per_fname',
            'staff_id__rp__per__per_mname',
        )

        # Search functionality
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(pr_id__icontains=search_query) |
                Q(pr_purpose__icontains=search_query) |
                Q(pr_rate__icontains=search_query) |
                Q(pr_date__icontains=search_query) |
                Q(staff_id__rp__per__per_lname__icontains=search_query) |
                Q(staff_id__rp__per__per_fname__icontains=search_query) |
                Q(staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()

        return queryset.order_by('-pr_date')

class Purpose_And_RatesAllBarangayPermitView(generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = Purpose_And_RatesSerializers
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        # Base queryset with category filter and related data
        queryset = Purpose_And_Rates.objects.filter(
            pr_category='Barangay Permit',
        ).select_related(
            'staff_id__rp__per'
        ).only(
            'pr_id',
            'pr_purpose',
            'pr_rate',
            'pr_date',
            'pr_is_archive',
            'staff_id__rp__per__per_lname',
            'staff_id__rp__per__per_fname',
            'staff_id__rp__per__per_mname',
        )

        # Search functionality
        search_query = self.request.query_params.get('search', '').strip()
        if search_query:
            queryset = queryset.filter(
                Q(pr_id__icontains=search_query) |
                Q(pr_purpose__icontains=search_query) |
                Q(pr_rate__icontains=search_query) |
                Q(pr_date__icontains=search_query) |
                Q(staff_id__rp__per__per_lname__icontains=search_query) |
                Q(staff_id__rp__per__per_fname__icontains=search_query) |
                Q(staff_id__rp__per__per_mname__icontains=search_query)
            ).distinct()

        return queryset.order_by('-pr_date')


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

class InvoiceView(ActivityLogMixin, generics.ListCreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = InvoiceSerializers
    pagination_class = StandardResultsPagination  # Add pagination
    
    def get_queryset(self):
        queryset = Invoice.objects.select_related(
            'bpr_id__rp_id__per',
            'nrc_id',
            'cr_id__rp_id__per',
            'pay_id__comp_id'
        ).prefetch_related(
            'pay_id__comp_id__complainant'
        ).all()
        
        # Get filter parameters from request
        search_query = self.request.query_params.get('search', '')
        nature_filter = self.request.query_params.get('nature', '')
        
        # Apply search filter
        if search_query:
            queryset = queryset.filter(
                Q(inv_serial_num__icontains=search_query) |
                Q(inv_nat_of_collection__icontains=search_query) |
                Q(inv_discount_reason__icontains=search_query) |
                Q(bpr_id__rp_id__per__per_lname__icontains=search_query) |
                Q(bpr_id__rp_id__per__per_fname__icontains=search_query) |
                Q(bpr_id__rp_id__per__per_mname__icontains=search_query) |
                Q(cr_id__rp_id__per__per_lname__icontains=search_query) |
                Q(cr_id__rp_id__per__per_fname__icontains=search_query) |
                Q(cr_id__rp_id__per__per_mname__icontains=search_query) |
                Q(nrc_id__nrc_lname__icontains=search_query) |
                Q(nrc_id__nrc_fname__icontains=search_query) |                
                Q(pay_id__comp_id__complainant__cpnt_name__icontains=search_query)
            ).distinct()
        
        # Apply nature of collection filter
        if nature_filter and nature_filter != "all":
            queryset = queryset.filter(inv_nat_of_collection=nature_filter)
        
        return queryset.order_by('-inv_date') 


# Clearance Request Views
class ClearanceRequestListView(generics.ListAPIView):
    serializer_class = ClearanceRequestSerializer
    permission_classes = [AllowAny]
    pagination_class = StandardResultsPagination

    def get_queryset(self):
        from apps.clerk.models import ClerkCertificate
        queryset = ClerkCertificate.objects.select_related('rp_id', 'pr_id').all()
        
        # Search functionality
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(cr_id__icontains=search_query) |
                Q(rp_id__per__per_fname__icontains=search_query) |
                Q(rp_id__per__per_lname__icontains=search_query) |
                Q(req_type__icontains=search_query) |
                Q(pr_id__pr_purpose__icontains=search_query) |
                Q(cr_req_status__icontains=search_query) |
                Q(cr_req_payment_status__icontains=search_query)
            )

        # Status filter
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(cr_req_status=status_filter)

        # Payment status filter
        payment_status = self.request.query_params.get('payment_status', None)
        if payment_status:
            queryset = queryset.filter(cr_req_payment_status=payment_status)

        # Date range filters
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        
        if start_date:
            queryset = queryset.filter(cr_req_request_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(cr_req_request_date__lte=end_date)
        
        return queryset.order_by('-cr_req_request_date')


class ClearanceRequestDetailView(generics.RetrieveAPIView):
    serializer_class = ClearanceRequestDetailSerializer
    lookup_field = 'cr_id'
    permission_classes = [AllowAny]

    def get_queryset(self):
        from apps.clerk.models import ClerkCertificate
        return ClerkCertificate.objects.select_related('rp_id').all()


class UpdatePaymentStatusView(ActivityLogMixin, generics.UpdateAPIView):
    serializer_class = PaymentStatusUpdateSerializer
    lookup_field = 'cr_id'
    permission_classes = [AllowAny]

    def get_queryset(self):
        from apps.clerk.models import ClerkCertificate
        return ClerkCertificate.objects.all()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_payment_status = instance.cr_req_payment_status
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        
        if serializer.is_valid():
            instance.cr_req_payment_status = serializer.validated_data['payment_status']
            instance.save()
            
            # Log payment status change activity
            try:
                from apps.act_log.utils import create_activity_log
                from apps.administration.models import Staff
                
                # Get staff member - try multiple sources
                staff = None
                staff_id = getattr(instance, 'staff_id', None) or request.data.get('staff_id')
                
                if staff_id:
                    # Format staff_id properly (pad with leading zeros if needed)
                    if len(str(staff_id)) < 11:
                        staff_id = str(staff_id).zfill(11)
                    staff = Staff.objects.filter(staff_id=staff_id).first()
                
                # Fallback: try to get staff from related records
                if not staff and hasattr(instance, 'ra_id') and instance.ra_id:
                    staff_id = getattr(instance.ra_id, 'staff_id', None)
                    if staff_id and len(str(staff_id)) < 11:
                        staff_id = str(staff_id).zfill(11)
                    staff = Staff.objects.filter(staff_id=staff_id).first()
                
                # Final fallback: use any available staff
                if not staff:
                    staff = Staff.objects.first()
                
                if staff:
                    # Get resident name for better description
                    resident_name = "Unknown"
                    if instance.rp_id and instance.rp_id.per:
                        per = instance.rp_id.per
                        resident_name = f"{per.per_fname} {per.per_lname}"
                    
                    # Get purpose
                    purpose = instance.pr_id.pr_purpose if instance.pr_id else 'N/A'
                    
                    # Create activity log for payment status change
                    create_activity_log(
                        act_type="Payment Status Updated",
                        act_description=f"Payment status for certificate {instance.cr_id} changed from '{old_payment_status}' to '{instance.cr_req_payment_status}' for {resident_name} ({purpose})",
                        staff=staff,
                        record_id=instance.cr_id
                    )
                    logger.info(f"Activity logged for payment status change: {instance.cr_id}")
                else:
                    logger.warning(f"No staff found for payment status change logging: {instance.cr_id}")
                    
            except Exception as log_error:
                logger.error(f"Failed to log payment status change activity: {str(log_error)}")
                # Don't fail the request if logging fails
            
            # Check if payment status changed to "Paid" and create automatic income entry
            new_payment_status = instance.cr_req_payment_status
            if old_payment_status != "Paid" and new_payment_status == "Paid":
                try:
                    from apps.treasurer.utils import create_automatic_income_entry
                    
                    # Get purpose from the certificate
                    purpose = "Unknown"
                    if instance.pr_id:
                        purpose = instance.pr_id.pr_purpose
                    
                    # Get amount from purpose and rates
                    amount = 0.0
                    if instance.pr_id:
                        amount = float(instance.pr_id.pr_rate)
                    
                    # Get staff from certificate record (primary source) or request data
                    staff_id = getattr(instance, 'staff_id', None) or request.data.get('staff_id')
                    
                    # Get invoice discount reason if available
                    invoice_discount_reason = None
                    try:
                        from apps.treasurer.models import Invoice
                        invoice = Invoice.objects.filter(cr_id=instance).first()
                        if invoice:
                            invoice_discount_reason = invoice.inv_discount_reason
                    except Exception as e:
                        logger.warning(f"Could not get invoice discount reason for certificate {instance.cr_id}: {str(e)}")
                    
                    # Create automatic income entry
                    create_automatic_income_entry(
                        request_type='CERT',
                        request_id=instance.cr_id,
                        purpose=purpose,
                        amount=amount,
                        staff_id=staff_id,
                        discount_notes=getattr(instance, 'cr_discount_reason', None),
                        invoice_discount_reason=invoice_discount_reason
                    )
                    logger.info(f"Created automatic income entry for certificate {instance.cr_id}")
                except Exception as e:
                    logger.error(f"Failed to create automatic income entry for certificate {instance.cr_id}: {str(e)}")
                    # Don't fail the request if income tracking fails

            # --- AUTO CREATE RECEIPT FOR ANY PAID ---
            try:
                if instance.cr_req_payment_status == "Paid":
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
                        
                        # Get the purpose name from the related pr_id if available
                        purpose_name = instance.req_type or ""
                        if hasattr(instance, 'pr_id') and instance.pr_id:
                            purpose_name = instance.pr_id.pr_purpose
                        
                        Invoice.objects.create(
                            inv_num=next_num,
                            cr_id=instance,
                            inv_serial_num=f"INV-{instance.cr_id}",  # You can improve this serial logic
                            inv_amount=0,  # Set correct amount if available
                            inv_nat_of_collection=purpose_name,
                            inv_status="Paid",  # Set status to Paid since payment is complete
                        )
                        
                        # Log the auto-created invoice activity
                        try:
                            from apps.act_log.utils import create_activity_log
                            from apps.administration.models import Staff
                            
                            # Get staff member from the clearance request
                            staff_id = getattr(instance.ra_id, 'staff_id', None) if instance.ra_id else None
                            # Format staff_id properly (pad with leading zeros if needed)
                            if len(str(staff_id)) < 11:
                                staff_id = str(staff_id).zfill(11)
                            staff = Staff.objects.filter(staff_id=staff_id).first()
                            
                            if staff:
                                # Create activity log
                                create_activity_log(
                                    act_type="Auto-Invoice Created",
                                    act_description=f"Auto-generated invoice INV-{instance.cr_id} created for {instance.req_type} payment",
                                    staff=staff,
                                    record_id=f"INV-{instance.cr_id}"
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
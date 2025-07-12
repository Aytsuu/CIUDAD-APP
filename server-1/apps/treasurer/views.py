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
from rest_framework.views import APIView


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

class IncomeFolderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = Income_Folder_Serializer
    queryset = Income_File_Folder.objects.all()
    lookup_field = 'inf_num'
    lookup_url_kwarg = 'inf_num'
    permission_classes = [AllowAny]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Archive all images first
        Income_Image.objects.filter(inf_num=instance).update(infi_is_archive=True)
        # Then archive the folder
        instance.inf_is_archive = True
        instance.save()
        return Response({"message": "Income folder and all images archived"}, 
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

class DisbursementFolderDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = Disbursement_Folder_Serializer
    queryset = Disbursement_File_Folder.objects.all()
    lookup_field = 'dis_num'
    lookup_url_kwarg = 'dis_num'
    permission_classes = [AllowAny]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Archive all images first
        Disbursement_Image.objects.filter(dis_num=instance).update(disf_is_archive=True)
        # Then archive the folder
        instance.dis_is_archive = True
        instance.save()
        return Response({"message": "Disbursement folder and all images archived"}, 
                      status=status.HTTP_200_OK)

class PermanentDeleteFolder(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, pk, *args, **kwargs):
        if 'income' in request.path:
            folder = get_object_or_404(Income_File_Folder, pk=pk)
            images = Income_Image.objects.filter(inf_num=folder)
            
            if all(img.infi_is_archive for img in images):
                images.delete()
                # Delete folder only if it has no images left
                if not Income_Image.objects.filter(inf_num=folder).exists():
                    folder.delete()
                    return Response(
                        {"message": "Income folder and all images permanently deleted"},
                        status=status.HTTP_200_OK
                    )
                return Response(
                    {"message": "All archived income images deleted (folder kept)"},
                    status=status.HTTP_200_OK
                )
            else:
                archived_images = images.filter(infi_is_archive=True)
                count = archived_images.count()
                archived_images.delete()
                # Check if folder is now empty
                if not Income_Image.objects.filter(inf_num=folder).exists():
                    folder.delete()
                    return Response(
                        {"message": f"{count} archived income images deleted and empty folder removed"},
                        status=status.HTTP_200_OK
                    )
                # Update folder archive status
                folder.inf_is_archive = not Income_Image.objects.filter(
                    inf_num=folder, 
                    infi_is_archive=False
                ).exists()
                folder.save()
                return Response(
                    {"message": f"{count} archived income images deleted"},
                    status=status.HTTP_200_OK
                )
        else:
            # Similar logic for disbursement
            folder = get_object_or_404(Disbursement_File_Folder, pk=pk)
            images = Disbursement_Image.objects.filter(dis_num=folder)
            
            if all(img.disf_is_archive for img in images):
                images.delete()
                if not Disbursement_Image.objects.filter(dis_num=folder).exists():
                    folder.delete()
                    return Response(
                        {"message": "Disbursement folder and all images permanently deleted"},
                        status=status.HTTP_200_OK
                    )
                return Response(
                    {"message": "All archived disbursement images deleted (folder kept)"},
                    status=status.HTTP_200_OK
                )
            else:
                archived_images = images.filter(disf_is_archive=True)
                count = archived_images.count()
                archived_images.delete()
                if not Disbursement_Image.objects.filter(dis_num=folder).exists():
                    folder.delete()
                    return Response(
                        {"message": f"{count} archived disbursement images deleted and empty folder removed"},
                        status=status.HTTP_200_OK
                    )
                folder.dis_is_archive = not Disbursement_Image.objects.filter(
                    dis_num=folder, 
                    disf_is_archive=False
                ).exists()
                folder.save()
                return Response(
                    {"message": f"{count} archived disbursement images deleted"},
                    status=status.HTTP_200_OK
                )

class ImageBaseView:
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = self.model.objects.all()
        archive_status = self.request.query_params.get('archive', None)
        
        if archive_status == 'true':
            queryset = queryset.filter(**{f'{self.archive_field}': True})
        elif archive_status == 'false':
            queryset = queryset.filter(**{f'{self.archive_field}': False})
            
        return queryset

    def perform_archive_unarchive(self, instance, archive):
        setattr(instance, self.archive_field, archive)
        instance.save()
        
        # Update parent folder status
        if hasattr(instance, 'inf_num'):  # Income image
            folder = instance.inf_num
            folder.inf_is_archive = not Income_Image.objects.filter(
                inf_num=folder, 
                infi_is_archive=False
            ).exists()
            folder.save()
        elif hasattr(instance, 'dis_num'):  # Disbursement image
            folder = instance.dis_num
            folder.dis_is_archive = not Disbursement_Image.objects.filter(
                dis_num=folder, 
                disf_is_archive=False
            ).exists()
            folder.save()

    def perform_destroy(self, instance):
        # Get folder reference before deletion
        folder = None
        if hasattr(instance, 'inf_num'):
            folder = instance.inf_num
        elif hasattr(instance, 'dis_num'):
            folder = instance.dis_num
        
        instance.delete()
        
        # Check if folder is now empty
        if folder:
            if hasattr(folder, 'inf_num') and not Income_Image.objects.filter(inf_num=folder).exists():
                folder.delete()
            elif hasattr(folder, 'dis_num') and not Disbursement_Image.objects.filter(dis_num=folder).exists():
                folder.delete()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        permanent = request.query_params.get('permanent', 'false').lower() == 'true'
        
        if permanent:
            self.perform_destroy(instance)
            return Response(
                {"message": f"{self.model.__name__} permanently deleted"}, 
                status=status.HTTP_200_OK
            )
        else:
            self.perform_archive_unarchive(instance, True)
            return Response(
                {"message": f"{self.model.__name__} archived"}, 
                status=status.HTTP_200_OK
            )

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.data.get('restore'):
            self.perform_archive_unarchive(instance, False)
            return Response(
                {"message": f"{self.model.__name__} restored"},
                status=status.HTTP_200_OK
            )
        return super().patch(request, *args, **kwargs)

class Income_ImageListView(ImageBaseView, generics.ListCreateAPIView):
    model = Income_Image
    serializer_class = Income_ImageSerializers
    archive_field = 'infi_is_archive'

    def perform_create(self, serializer):
        inf_num = self.request.data.get('inf_num')
        try:
            folder = Income_File_Folder.objects.get(inf_num=inf_num)
            serializer.save(inf_num=folder)
        except Income_File_Folder.DoesNotExist:
            raise serializers.ValidationError("Invalid income folder ID")

class Income_ImageView(ImageBaseView, generics.RetrieveUpdateDestroyAPIView):
    model = Income_Image
    serializer_class = Income_ImageSerializers
    lookup_field = 'infi_num'
    archive_field = 'infi_is_archive'

class Disbursement_ImageListView(ImageBaseView, generics.ListCreateAPIView):
    model = Disbursement_Image
    serializer_class = Disbursement_ImageSerializers
    archive_field = 'disf_is_archive'

    def perform_create(self, serializer):
        dis_num = self.request.data.get('dis_num')
        try:
            folder = Disbursement_File_Folder.objects.get(dis_num=dis_num)
            serializer.save(dis_num=folder)
        except Disbursement_File_Folder.DoesNotExist:
            raise serializers.ValidationError("Invalid disbursement folder ID")

class Disbursement_ImageView(ImageBaseView, generics.RetrieveUpdateDestroyAPIView):
    model = Disbursement_Image
    serializer_class = Disbursement_ImageSerializers
    lookup_field = 'disf_num'
    archive_field = 'disf_is_archive'
            
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
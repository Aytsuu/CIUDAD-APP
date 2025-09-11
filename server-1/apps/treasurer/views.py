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
    
# -------------------------------- INCOME & DISBURSEMENT ------------------------------------
class ImageBaseView: #helper function
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = self.model.objects.all()
        archive_status = self.request.query_params.get('archive', None)
        folder_id = self.request.query_params.get('folder', None)
        
        # Filter by archive status
        if archive_status == 'true':
            queryset = queryset.filter(**{f'{self.archive_field}': True})
        elif archive_status == 'false':
            queryset = queryset.filter(**{f'{self.archive_field}': False})
        
        # Filter by folder if provided
        if folder_id:
            if hasattr(self.model, 'inf_num'):  # For Income images
                queryset = queryset.filter(inf_num=folder_id)
            elif hasattr(self.model, 'dis_num'):  # For Disbursement images
                queryset = queryset.filter(dis_num=folder_id)
            
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
        
        # Check if folder is now empty and delete if needed
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
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """Handle both single image and bulk image upload"""
        inf_num = request.data.get('inf_num')
        files = request.data.get('files', [])
        
        if not inf_num:
            return Response(
                {"error": "inf_num is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if files:
            # Bulk upload
            serializer = self.get_serializer()
            try:
                uploaded_images = serializer._upload_files(files, inf_num)
                return Response(
                    {
                        "message": f"{len(uploaded_images)} images uploaded successfully",
                        "uploaded_count": len(uploaded_images)
                    },
                    status=status.HTTP_201_CREATED
                )
            except serializers.ValidationError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Single image upload (traditional way)
            return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        inf_num = self.request.data.get('inf_num')
        try:
            folder = Income_File_Folder.objects.get(inf_num=inf_num)
            serializer.save(
                inf_num=folder,
                staff=self.request.user.staff if hasattr(self.request.user, 'staff') else None
            )
        except Income_File_Folder.DoesNotExist:
            raise serializers.ValidationError("Invalid income folder ID")

class Income_ImageView(ImageBaseView, generics.RetrieveUpdateDestroyAPIView):
    model = Income_Image
    serializer_class = Income_ImageSerializers
    lookup_field = 'infi_num'
    archive_field = 'infi_is_archive'
    permission_classes = [AllowAny]

class Disbursement_ImageListView(ImageBaseView, generics.ListCreateAPIView):
    model = Disbursement_Image
    serializer_class = Disbursement_ImageSerializers
    archive_field = 'disf_is_archive'
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """Handle both single image and bulk image upload"""
        dis_num = request.data.get('dis_num')
        files = request.data.get('files', [])
        
        if not dis_num:
            return Response(
                {"error": "dis_num is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if files:
            # Bulk upload
            serializer = self.get_serializer()
            try:
                uploaded_images = serializer._upload_files(files, dis_num)
                return Response(
                    {
                        "message": f"{len(uploaded_images)} images uploaded successfully",
                        "uploaded_count": len(uploaded_images)
                    },
                    status=status.HTTP_201_CREATED
                )
            except serializers.ValidationError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Single image upload (traditional way)
            return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        dis_num = self.request.data.get('dis_num')
        try:
            folder = Disbursement_File_Folder.objects.get(dis_num=dis_num)
            serializer.save(
                dis_num=folder,
                staff=self.request.user.staff if hasattr(self.request.user, 'staff') else None
            )
        except Disbursement_File_Folder.DoesNotExist:
            raise serializers.ValidationError("Invalid disbursement folder ID")

class Disbursement_ImageView(ImageBaseView, generics.RetrieveUpdateDestroyAPIView):
    model = Disbursement_Image
    serializer_class = Disbursement_ImageSerializers
    lookup_field = 'disf_num'
    archive_field = 'disf_is_archive'
    permission_classes = [AllowAny]

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
                if not Income_Image.objects.filter(inf_num=folder).exists():
                    folder.delete()
                    return Response(
                        {"message": f"{count} archived income images deleted and empty folder removed"},
                        status=status.HTTP_200_OK
                    )
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
    queryset = Annual_Gross_Sales.objects.all()

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
    queryset = Purpose_And_Rates.objects.all()


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
        'cr_id__rp__per'       # For resident certificates
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
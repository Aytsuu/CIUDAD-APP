from rest_framework import generics, status
from ..models import *
from ..serializers.inventory_serlializers import *
from rest_framework.response import Response
from django.db.models import ProtectedError
from rest_framework import viewsets
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view




# ====================CATGEORY VIEWS========================
class CategoryView(generics.ListCreateAPIView):
    serializer_class = CategorySerializers
    queryset  = Category.objects.all()
    
    def create(self , request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    
    def delete(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
            category.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {"detail": "Cannot delete - this category has medicines assigned"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Category.DoesNotExist:
            return Response(
                {"detail": "Category not found"},
                status=status.HTTP_404_NOT_FOUND
            )
            
class DeleteCategoryView(generics.DestroyAPIView):
    serializer_class = CategorySerializers    
    queryset = Category.objects.all()

    def get_object(self):
        cat_id = self.kwargs.get('cat_id')
        return get_object_or_404(Category, cat_id=cat_id) 
    
class InventoryView(generics.ListCreateAPIView):
    serializer_class=InventorySerializers
    queryset = Inventory.objects.all()
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)
    

class InventoryUpdateView(generics.RetrieveUpdateAPIView):
    serializer_class = InventorySerializers
    queryset = Inventory.objects.all()
    lookup_field='inv_id'
    
    def get_object(self):
       inv_id = self.kwargs.get('inv_id')
       obj = get_object_or_404(Inventory, inv_id = inv_id)
       return obj


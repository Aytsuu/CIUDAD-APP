from django.db import models, transaction
from django.db.models import Max
from datetime import datetime
from django.utils import timezone  # Import timezone for default value

class Category(models.Model):
    cat_id = models.BigAutoField(primary_key=True)
    cat_type = models.CharField(max_length=100)
    cat_name = models.CharField(max_length=100)
    class Meta:
        db_table = 'category'

    
class Medicinelist(models.Model):
    med_id = models.BigAutoField(primary_key=True)
    med_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'medicine_list'
     
        
class CommodityList(models.Model):
    com_id = models.BigAutoField(primary_key=True)
    com_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'commodity_list'
        
class FirstAidList(models.Model):
    fa_id = models.BigAutoField(primary_key=True)
    fa_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'firstaid_list'
        

class Inventory(models.Model):
    inv_id =models.BigAutoField(primary_key=True)
    expiry_date = models.DateField()
    inv_type = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)  # Remove `default`
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventory'  # Sets the table name explicitlyt

class MedicineInventory(models.Model):
    minv_id =models.BigAutoField(primary_key=True)
    minv_dsg = models.PositiveIntegerField(default=0)
    minv_dsg_unit = models.CharField(max_length=100)
    minv_form = models.CharField(max_length=100)
    minv_qty = models.PositiveIntegerField(default=0)
    minv_qty_unit = models.CharField(max_length=100) 
    minv_pcs = models.PositiveIntegerField(default=0)
    minv_distributed = models.PositiveIntegerField(default=0)
    minv_qty_avail = models.PositiveIntegerField(default=0)
    inv_id = models.ForeignKey('Inventory', on_delete=models.CASCADE)
    med_id = models.ForeignKey('Medicinelist', on_delete=models.CASCADE)
    cat_id = models.ForeignKey('Category', on_delete=models.CASCADE)

    class Meta: 
        db_table = 'medicine_inventory'
  

class MedicineTransactions(models.Model):
    mdt_id =models.BigAutoField(primary_key=True)
    mdt_qty = models.PositiveIntegerField(default=0)
    mdt_action = models.CharField(max_length=100)
    mdt_staff = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)  # Remove `default`
    
    minv_id = models.ForeignKey('MedicineInventory', on_delete=models.CASCADE,  db_column='minv_id')

    class Meta:
        db_table = 'medicine_transaction'
  

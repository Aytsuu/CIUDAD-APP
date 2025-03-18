from django.db import models

class Category(models.Model):
    cat_id = models.BigAutoField(primary_key=True)
    cat_type = models.CharField(max_length=100)
    cat_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'category'



class Inventory(models.Model):
    inv_id = models.BigAutoField(primary_key=True)
    inv_name = models.CharField(max_length=100)

    class Meta:
           db_table = 'inventory'
    
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
    com_id = models.BigAutoField(primary_key=True)
    com_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'firstaid_list'
        
      
class MedicineStocks(models.Model):
    minv_id = models.BigAutoField(primary_key=True)
    minv_dsg = models.IntegerField()  # Dosage
    minv_dsg_unit = models.CharField(max_length=100)  # Dosage unit
    minv_form = models.CharField(max_length=100)  # Medicine form (e.g., Tablet, Syrup)
    minv_qty = models.IntegerField()  # Total quantity
    minv_pcs_per_box = models.IntegerField()  # Pieces per box
    minv_distributed = models.IntegerField(default=0)  # Distributed stock
    minv_qty_avail = models.IntegerField()  # Available quantity

    # Foreign Keys with CASCADE behavior
    inv = models.ForeignKey(Inventory, on_delete=models.CASCADE)  
    med = models.ForeignKey(Medicinelist, on_delete=models.CASCADE)  
    cat = models.ForeignKey(Category, on_delete=models.CASCADE)  

    class Meta:
        db_table = 'medicine_stocks'
     
       
    
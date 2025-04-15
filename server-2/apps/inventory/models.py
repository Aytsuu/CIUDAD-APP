from django.db import models, transaction
from django.db.models import Max
from datetime import datetime
from django.utils import timezone  # Import timezone for default value
from django.core.validators import MinValueValidator


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
    is_Archived = models.BooleanField(default=False)
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
    inv_id = models.OneToOneField('Inventory', on_delete=models.CASCADE)
    med_id = models.ForeignKey('Medicinelist', on_delete=models.CASCADE)
    cat_id = models.ForeignKey('Category', on_delete=models.CASCADE)

    class Meta: 
        db_table = 'medicine_inventory'



class MedicineTransactions(models.Model):
    mdt_id =models.BigAutoField(primary_key=True)
    mdt_qty = models.CharField(max_length=100)
    mdt_action = models.CharField(max_length=100)
    staff = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)  # Remove `default`
    
    minv_id = models.ForeignKey('MedicineInventory', on_delete=models.CASCADE,  db_column='minv_id')

    class Meta:
        db_table = 'medicine_transaction'


        
class CommodityInventory(models.Model):
    cinv_id = models.BigAutoField(primary_key=True)
    cinv_qty = models.PositiveIntegerField(default=0)
    cinv_qty_unit = models.CharField(max_length=100)
    cinv_pcs = models.PositiveIntegerField(default=0)
    cinv_dispensed = models.PositiveIntegerField(default=0)
    cinv_recevFrom = models.CharField(max_length=100,default='OTHERS')
    cinv_qty_avail = models.PositiveIntegerField(default=0)
    inv_id = models.OneToOneField('Inventory', on_delete=models.CASCADE)
    com_id = models.ForeignKey('CommodityList', on_delete=models.CASCADE)
    cat_id = models.ForeignKey('Category', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'commodity_inventory'
        
        
class CommodityTransaction(models.Model):
    comt_id =models.BigAutoField(primary_key=True)
    comt_qty = models.CharField(max_length=100)
    comt_action = models.CharField(max_length=100)
    staff = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)  # Remove `default`
    cinv_id = models.ForeignKey('CommodityInventory', on_delete=models.CASCADE,  db_column='cinv_id')

    class Meta:
        db_table = 'commodity_transaction'




class FirstAidInventory(models.Model):
    finv_id = models.BigAutoField(primary_key=True)
    finv_qty = models.PositiveIntegerField(default=0)
    finv_qty_unit = models.CharField(max_length=100)
    finv_pcs = models.PositiveIntegerField(default=0)
    finv_used = models.PositiveIntegerField(default=0)
    finv_qty_avail = models.PositiveIntegerField(default=0)
    inv_id = models.OneToOneField('Inventory', on_delete=models.CASCADE)
    fa_id = models.ForeignKey('FirstAidList', on_delete=models.CASCADE)
    cat_id = models.ForeignKey('Category', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'firstaid_inventory'
        
  

class FirstAidTransactions(models.Model):
    fat_id =models.BigAutoField(primary_key=True)
    fat_qty = models.CharField(max_length=100)
    fat_action = models.CharField(max_length=100)
    staff = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)  # Remove `default`
    finv_id = models.ForeignKey('FirstAidInventory', on_delete=models.CASCADE,  db_column='finv_id')

    class Meta:
        db_table = 'firstaid_transaction'

# VACCINATION MODELS
class VaccineCategory(models.Model):
    vaccat_id = models.BigAutoField(primary_key=True)   
    vaccat_type = models.CharField(max_length=255, default="N/A")
    
    class Meta:
        db_table = 'vaccine_category'    
        

class VaccineList(models.Model):
    vac_id = models.BigAutoField(primary_key=True)
    vac_type_choices = models.CharField(max_length=100)
    vac_name = models.CharField(max_length=255)
    no_of_doses = models.PositiveIntegerField(default=0)
    age_group = models.CharField(max_length=50)
    specify_age = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    vaccat_id = models.ForeignKey(
        'VaccineCategory', 
        on_delete=models.CASCADE,
        default=1,
        db_column='vaccat_id',
        related_name='vaccines'
    )

    class Meta:
        db_table = 'vaccines'


class VaccineInterval(models.Model):
    vacInt_id = models.BigAutoField(primary_key=True)
    vac_id = models.ForeignKey(
        'VaccineList', 
        on_delete=models.CASCADE,  
        db_column='vac_id',
        related_name='intervals'
    )
    interval = models.PositiveIntegerField(default=0)
    dose_number = models.PositiveIntegerField(default=0)
    time_unit = models.CharField(max_length=100)

    class Meta:
        db_table = 'vaccine_intervals'

class RoutineFrequency(models.Model):
    routineF_id = models.BigAutoField(primary_key=True)
    interval = models.PositiveIntegerField(default=0)
    dose_number = models.PositiveIntegerField(default=0)
    time_unit = models.CharField(max_length=100)
    vac_id = models.OneToOneField(
        'VaccineList', 
        on_delete=models.CASCADE,
        related_name='routine_frequency'
    )
 
    class Meta:
        db_table = 'routine_frequencies'
        
        
        
class VaccineStock(models.Model):
    vacStck_id =models.BigAutoField(primary_key=True)
    solvent = models.CharField(max_length=10 )
    batch_number = models.CharField(max_length=100, default=" N/A")
    volume = models.PositiveIntegerField(default=0)
    qty = models.PositiveIntegerField(default=0)
    dose_ml = models.PositiveIntegerField(default=0)
    vacStck_used = models.PositiveIntegerField(default=0)
    vacStck_qty_avail = models.PositiveIntegerField(default=0)
    wasted_dose =models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    inv_id = models.OneToOneField('Inventory', on_delete=models.CASCADE ,db_column='inv_id')
    vac_id = models.ForeignKey('VaccineList',on_delete=models.CASCADE)

   
    class Meta:
        db_table = 'vaccine_stocks'

        
class AntigenTransaction(models.Model):
    antt_id =models.BigAutoField(primary_key=True)
    antt_qty = models.CharField(max_length=100)
    antt_action = models.CharField(max_length=100)
    staff = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)  
    vacStck_id = models.ForeignKey('VaccineStock', on_delete=models.CASCADE,  db_column='vacStck_id')


    class Meta:
        db_table = 'antigen_transaction'


class ImmunizationSupplies(models.Model):
    imz_id = models.BigAutoField(primary_key=True)   
    imz_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    vaccat_id = models.ForeignKey(
        'VaccineCategory', 
        on_delete=models.CASCADE,
        default=2,
        db_column='vaccat_id',
        related_name='immunization_supplies'
    )
    
    class Meta:
        db_table = 'immunization_supplies'
        
        
class ImmunizationStock(models.Model):
    imzStck_id = models.BigAutoField(primary_key=True)
    batch_number = models.CharField(max_length=100, default=" N/A")
    imzStck_qty = models.PositiveIntegerField(default=0)
    imzStck_per_pcs = models.PositiveIntegerField(default=0)
    imzStck_pcs = models.PositiveIntegerField(default=0)
    imzStck_unit = models.CharField(max_length=100)
    imzStck_used = models.PositiveIntegerField(default=0)
    imzStck_avail = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    inv_id = models.OneToOneField('Inventory', on_delete=models.CASCADE)
    imz_id = models.ForeignKey('ImmunizationSupplies',on_delete=models.CASCADE)

    
    class Meta:
        db_table = 'immunizationsupplies_stock'
        
  
class ImmunizationTransaction(models.Model):
    imzt_id =models.BigAutoField(primary_key=True)
    imzt_qty = models.CharField(max_length=100)
    imzt_action = models.CharField(max_length=100)
    staff = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)  
    imzStck_id = models.ForeignKey('ImmunizationStock', on_delete=models.CASCADE, db_column='imzStck_id')


    class Meta:
        db_table = 'immunization_transaction'
        
        
        

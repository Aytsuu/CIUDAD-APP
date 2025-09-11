from django.db import models, transaction
from django.db.models import Max
from datetime import datetime
from django.utils import timezone  # Import timezone for default value
from django.core.validators import MinValueValidator
from apps.administration.models import Staff


class Category(models.Model):
    cat_id = models.BigAutoField(primary_key=True)
    cat_type = models.CharField(max_length=100)
    cat_name = models.CharField(max_length=100)
    class Meta:
        db_table = 'category'

class Medicinelist(models.Model):
    med_id = models.CharField(primary_key=True, max_length=20, editable=False)
    med_name = models.CharField(max_length=100)
    med_type = models.CharField(max_length=100, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cat = models.ForeignKey(Category, on_delete=models.PROTECT)   
    class Meta:
        db_table = 'medicine_list'
    
    def save(self, *args, **kwargs):
        if not self.med_id:
            today = timezone.now()
            prefix = f"MED{today.day:02d}{today.year % 100:02d}"
            
            # Get the maximum existing ID with this prefix
            max_id = Medicinelist.objects.filter(
                med_id__startswith=prefix
            ).order_by('-med_id').first()
            
            if max_id:
                last_num = int(max_id.med_id[len(prefix):]) + 1
            else:
                last_num = 1
                
            self.med_id = f"{prefix}{last_num:03d}"
            
        if self.med_name:
            self.med_name = self.med_name.title()
        
        
        super().save(*args, **kwargs)
            
class CommodityList(models.Model):
    com_id = models.CharField(primary_key=True, max_length=20, editable=False)
    com_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    USER_TYPE_CHOICES = [
        ('Current user', 'Current user'),
        ('New acceptor', 'New acceptor'),
        ('Both', 'Both'),
    ]
    
    SEX_TYPE_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Both', 'Both'),
    ]
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    gender_type = models.CharField(max_length=10, choices=SEX_TYPE_CHOICES, default='Both')

    class Meta:
        db_table = 'commodity_list'
        
    def save(self, *args, **kwargs):
        if not self.com_id:
            today = timezone.now()
            prefix = f"COM{today.day:02d}{today.year % 100:02d}"
            
            # Get the maximum existing ID with this prefix
            max_id = CommodityList.objects.filter(
                com_id__startswith=prefix
            ).order_by('-com_id').first()
            
            if max_id:
                last_num = int(max_id.com_id[len(prefix):]) + 1
            else:
                last_num = 1
                
            self.com_id = f"{prefix}{last_num:03d}"
            
        if self.com_name:
            self.com_name = self.com_name.title()
        
        
        super().save(*args, **kwargs)
            
class FirstAidList(models.Model):
    fa_id = models.CharField(primary_key=True, max_length=20, editable=False)
    fa_name = models.CharField(max_length=100,default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cat = models.ForeignKey(Category, on_delete=models.PROTECT , related_name='firstaid_category')
    staff= models.ForeignKey(Staff, on_delete=models.CASCADE, null=True, blank=True)  
    class Meta:
        db_table = 'firstaid_list'
        
    def save(self, *args, **kwargs):
        if not self.fa_id:
            today = timezone.now()
            prefix = f"FA{today.day:02d}{today.year % 100:02d}"
            
            # Get the maximum existing ID with this prefix
            max_id = FirstAidList.objects.filter(
                fa_id__startswith=prefix
            ).order_by('-fa_id').first()
            
            if max_id:
                last_num = int(max_id.fa_id[len(prefix):]) + 1
            else:
                last_num = 1
                
            self.fa_id = f"{prefix}{last_num:03d}"
            
        if self.fa_name:
            self.fa_name = self.fa_name.title()
            
        super().save(*args, **kwargs)
        
        

class Inventory(models.Model):
    inv_id = models.CharField(max_length=20, primary_key=True)
    expiry_date = models.DateField(null=True, blank=True)
    inv_type = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)  # Remove `default`
    is_Archived = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self, *args, **kwargs):
        if not self.inv_id:
            # Ensure expiry_date is provided
            if not self.expiry_date:
                raise ValueError("Expiry date is required to generate inv_id")
            
            # Map inv_type to prefix
            type_prefixes = {
                'First Aid': 'INVFA',
                'Medicine': 'INVMED',
                'Commodity': 'INVCOM',
                'Antigen': 'INVANT'
            }
            prefix = type_prefixes.get(self.inv_type, 'INV')
            
            # Format: PREFIX + Expiry YY + Expiry MM
            full_prefix = f"{prefix}{self.expiry_date.year % 100:02d}{self.expiry_date.month:02d}"
            
            # Get the maximum existing ID with this prefix
            max_id = Inventory.objects.filter(
                inv_id__startswith=full_prefix
            ).order_by('-inv_id').first()
            
            if max_id:
                # Extract the numeric part and increment
                last_num = int(max_id.inv_id[len(full_prefix):]) + 1
            else:
                last_num = 1
            
            # Generate unique inv_id with auto-increment number
            self.inv_id = f"{full_prefix}{last_num:03d}"
        
        super().save(*args, **kwargs)
    class Meta:
        db_table = 'inventory'
        
class MedicineInventory(models.Model):
    minv_id =models.BigAutoField(primary_key=True)
    minv_dsg = models.PositiveIntegerField(default=0)
    minv_dsg_unit = models.CharField(max_length=100,default="N/A")
    minv_form = models.CharField(max_length=100, default="N/A") 
    minv_qty = models.PositiveIntegerField(default=0,)
    minv_qty_unit = models.CharField(max_length=100, default="N/A") 
    minv_pcs = models.PositiveIntegerField(default=0)
    minv_qty_avail = models.PositiveIntegerField(default=0)
    # committed_qty = models.PositiveIntegerField(default=0)  # Ensure non-negative
    inv_id = models.OneToOneField('Inventory', on_delete=models.CASCADE,  db_column='inv_id')
    med_id = models.ForeignKey('Medicinelist', on_delete=models.PROTECT, db_column='med_id')
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='medicine_inventories', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # Remove `default`
    wasted = models.PositiveIntegerField(default=0)
    temporary_deduction= models.PositiveIntegerField(default=0)

    class Meta: 
        db_table = 'medicine_inventory'
        ordering = ['-created_at']



class MedicineTransactions(models.Model):
    mdt_id =models.BigAutoField(primary_key=True)
    mdt_qty = models.CharField(max_length=100)
    mdt_action = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)  # Remove `default`
    staff= models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='medicine_transaction', null=True, blank=True)  
    minv_id = models.ForeignKey('MedicineInventory', on_delete=models.PROTECT,related_name='medicine_transaction',  db_column='minv_id')

    class Meta:
        db_table = 'medicine_transaction'
        ordering = ['-created_at']


        
class CommodityInventory(models.Model):
    cinv_id = models.BigAutoField(primary_key=True)
    cinv_qty = models.PositiveIntegerField(default=0)
    cinv_qty_unit = models.CharField(max_length=100)
    cinv_pcs = models.PositiveIntegerField(default=0)
    cinv_recevFrom = models.CharField(max_length=100,default='OTHERS')
    cinv_qty_avail = models.PositiveIntegerField(default=0)
    inv_id = models.OneToOneField('Inventory', on_delete=models.CASCADE, db_column='inv_id')
    com_id = models.ForeignKey('CommodityList', on_delete=models.PROTECT,db_column ='com_id')
    created_at = models.DateTimeField(auto_now_add=True)  # Remove `default`
    wasted = models.PositiveIntegerField(default=0)


    # cat_id = models.ForeignKey('Category', on_delete=models.CASCADE)
    
    class Meta:
        db_table = 'commodity_inventory'
        
        
class CommodityTransaction(models.Model):
    comt_id =models.BigAutoField(primary_key=True)
    comt_qty = models.CharField(max_length=100)
    comt_action = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)  # Remove `default`
    cinv_id = models.ForeignKey('CommodityInventory', on_delete=models.PROTECT,related_name='commodity_transaction',  db_column='cinv_id')
    staff= models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='commodity_transaction', null=True, blank=True)  

    class Meta:
        db_table = 'commodity_transaction'
        ordering = ['-created_at']




class FirstAidInventory(models.Model):
    finv_id = models.BigAutoField(primary_key=True)
    finv_qty = models.PositiveIntegerField(default=0)
    finv_qty_unit = models.CharField(max_length=100,default="N/A")
    finv_pcs = models.PositiveIntegerField(default=0)
    finv_used = models.PositiveIntegerField(default=0)
    finv_qty_avail = models.PositiveIntegerField(default=0)
    inv_id = models.OneToOneField(Inventory, on_delete=models.CASCADE,db_column='inv_id',related_name='inventory_firstaid')
    fa_id = models.ForeignKey(FirstAidList, on_delete=models.PROTECT, db_column='fa_id', related_name='firstaid_inventory')
    wasted = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)  # Remove `default`
    class Meta:
        db_table = 'firstaid_inventory'
        
  
class FirstAidTransactions(models.Model):
    fat_id =models.BigAutoField(primary_key=True)
    fat_qty = models.CharField(max_length=100)
    fat_action = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)  # Remove `default`
    finv_id = models.ForeignKey('FirstAidInventory', on_delete=models.PROTECT,  db_column='finv_id')
    staff= models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='firstaid_transaction', null=True, blank=True)  

    class Meta:
        db_table = 'firstaid_transaction'
        ordering = ['-created_at']

# VACCINATION MODELS

class Agegroup(models.Model):
    agegrp_id = models.BigAutoField(primary_key=True)
    agegroup_name = models.CharField(max_length=100, default="N/A")
    min_age = models.PositiveIntegerField(default=0)
    max_age = models.PositiveIntegerField(default=0)
    time_unit = models.CharField(max_length=100, default="N/A")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'age_group'
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._meta.ordering = ['-updated_at'] if 'updated_at' in [field.name for field in self._meta.fields] else ['-created_at']
        ordering = ['-updated_at'] if 'updated_at' in [field.name for field in Agegroup._meta.fields] else ['-created_at']
        
class VaccineList(models.Model):
    vac_id = models.BigAutoField(primary_key=True)
    vac_type_choices = models.CharField(max_length=100)
    vac_name = models.CharField(max_length=255)
    no_of_doses = models.PositiveIntegerField(default=0)
    # specify_age = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    category =models.CharField(max_length=100, default='Vaccine')
    ageGroup = models.ForeignKey(Agegroup, on_delete=models.PROTECT, db_column='ageGroup', related_name='vaccines', null=True, blank=True)
    class Meta:
        db_table = 'vaccines'
        ordering = ['-created_at']
        
    def save(self, *args, **kwargs):
        # Convert vac_name to uppercase before saving
        if self.vac_name:
            self.vac_name = self.vac_name.title()
        super().save(*args, **kwargs)
        
    
        


class VaccineInterval(models.Model):
    vacInt_id = models.BigAutoField(primary_key=True)
    vac_id = models.ForeignKey(
        'VaccineList', 
        on_delete=models.PROTECT,  
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
        on_delete=models.PROTECT,
        related_name='routine_frequency',
        db_column='vac_id'

    )
 
    class Meta:
        db_table = 'routine_frequencies'
    
class ConditionalVaccine(models.Model):
    condvac_id = models.BigAutoField(primary_key=True)
    vac_id = models.ForeignKey(VaccineList, on_delete=models.PROTECT, db_column='vac_id', related_name='conditional_vaccines')
    class Meta:
        db_table = 'conditional_vaccine'    
       
          
class VaccineStock(models.Model):
    vacStck_id =models.BigAutoField(primary_key=True)
    solvent = models.CharField(max_length=10 )
    batch_number = models.CharField(max_length=100, default=" N/A")
    qty = models.PositiveIntegerField(default=0)
    dose_ml = models.PositiveIntegerField(default=0)
    vacStck_qty_avail = models.PositiveIntegerField(default=0)
    wasted_dose =models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    inv_id = models.OneToOneField('Inventory', on_delete=models.CASCADE ,db_column='inv_id',related_name='vaccine_stock')
    vac_id = models.ForeignKey('VaccineList',on_delete=models.PROTECT,related_name='vaccine_stock',db_column='vac_id')
    created_at = models.DateTimeField(auto_now_add=True)  # Remove `default`

    class Meta:
        db_table = 'vaccine_stocks'
        ordering = ['-created_at']

        

class ImmunizationSupplies(models.Model):
    imz_id = models.BigAutoField(primary_key=True)   
    imz_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    category =models.CharField(max_length=100, default='Immunization Supplies')

    
    class Meta:
        db_table = 'immunization_supplies'
        ordering = ['-created_at']
        
    def save(self, *args, **kwargs):
        # Convert vac_name to uppercase before saving
        if self.imz_name:
            self.imz_name = self.imz_name.title()
        super().save(*args, **kwargs)
        
        
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

    inv_id = models.OneToOneField('Inventory', on_delete=models.CASCADE,related_name='immunization_stock',db_column='inv_id')
    imz_id = models.ForeignKey('ImmunizationSupplies',on_delete=models.PROTECT ,related_name='immunization_stock',db_column='imz_id')

    
    class Meta:
        db_table = 'immunizationsupplies_stock'
        ordering = ['-created_at']
        
  

class AntigenTransaction(models.Model):
    antt_id = models.CharField(primary_key=True, max_length=20, editable=False)
    antt_qty = models.CharField(max_length=100)
    antt_action = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)  
    vacStck_id = models.ForeignKey(VaccineStock, on_delete=models.PROTECT,  db_column='vacStck_id',related_name='antigen_transactions', null=True, blank=True)
    imzStck_id = models.ForeignKey(ImmunizationStock, on_delete=models.PROTECT, db_column='imzStck_id',related_name='antigen_transactions' ,null=True, blank=True)
    staff= models.ForeignKey(Staff, on_delete=models.CASCADE, related_name='antigen_transactions', null=True, blank=True)  

    class Meta:
        db_table = 'antigen_transaction'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.antt_id:
            with transaction.atomic():
                # Get current date
                now = timezone.now()
                
                # Prefix: TRNSANT
                prefix = "TRNSANT"
                
                # Format: TRNSANT + Year (2-digit) + Month + Day
                date_part = f"{now.year % 100:02d}{now.month:02d}{now.day:02d}"
                base_id = f"{prefix}{date_part}"
                
                # Get the maximum existing ID for today using database aggregation
                max_id_today = AntigenTransaction.objects.filter(
                    antt_id__startswith=base_id
                ).aggregate(Max('antt_id'))['antt_id__max']
                
                if max_id_today:
                    try:
                        # Extract the numeric part from the max ID and increment
                        last_num = int(max_id_today[len(base_id):]) + 1
                    except (ValueError, IndexError):
                        last_num = 1
                else:
                    last_num = 1
                
                # Generate unique antt_id with 6-digit number
                self.antt_id = f"{base_id}{last_num:04d}"
        
        super().save(*args, **kwargs)
# gad/models.py
from django.db import models
from datetime import date
from django.db.models import Sum

class GAD_Budget_Year(models.Model):
    """
    Represents a year's GAD budget summary, linked to the treasurer's budget plan.
    Automatically calculates GAD-specific totals from budget plan details.
    """
    budget_plan = models.OneToOneField(
        'treasurer.Budget_Plan',
        on_delete=models.PROTECT,
        related_name='gad_budget_year'
    )
    
    # These are cached values for quick access
    gad_budget_total = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        default=0,
        verbose_name="Total GAD Budget"
    )
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'gad_budget_year'
        ordering = ['-budget_plan__plan_year']
        verbose_name = "GAD Budget Year"
        
    def __str__(self):
        return f"GAD Budget {self.budget_plan.plan_year}"
        
    def save(self, *args, **kwargs):
        # Auto-calculate GAD budget total from related details
        if not self.gad_budget_total or kwargs.get('force_recalculate', False):
            self.gad_budget_total = self.calculate_gad_budget()
        super().save(*args, **kwargs)
        
    def calculate_gad_budget(self):
        """Calculate total GAD budget from related budget plan details"""
        return self.budget_plan.budget_detail.filter(
            dtl_budget_category='GAD Program'
        ).aggregate(
            total=Sum('dtl_proposed_budget')
        )['total'] or 0
        
    @property
    def fiscal_year(self):
        return self.budget_plan.plan_year
        
    @property
    def total_income(self):
        return self.entries.filter(gbud_type='Income').aggregate(
            total=Sum('gbud_amount')
        )['total'] or 0
        
    @property
    def total_expenses(self):
        return self.entries.filter(gbud_type='Expense').aggregate(
            total=Sum('gbud_amount')
        )['total'] or 0
        
    @property
    def remaining_balance(self):
        return float(self.gad_budget_total) - float(self.total_expenses) + float(self.total_income)

class GAD_Budget_Tracker(models.Model):
    ENTRY_TYPES = (
        ('Income', 'Income'),
        ('Expense', 'Expense'),
    )
    
    gbud_num = models.BigAutoField(primary_key=True)
    gbud_date = models.DateField(default=date.today)
    gbud_particulars = models.CharField(max_length=100)
    gbud_type = models.CharField(max_length=10, choices=ENTRY_TYPES)
    gbud_amount = models.DecimalField(max_digits=15, decimal_places=2)
    gbud_add_notes = models.TextField(blank=True, null=True)
    
    # Connection to the GAD budget year
    budget_year = models.ForeignKey(
        GAD_Budget_Year,
        on_delete=models.PROTECT,
        related_name='entries'
    )
    
    # Optional connection to specific budget line item
    budget_item = models.ForeignKey(
        'treasurer.Budget_Plan_Detail',
        on_delete=models.PROTECT,
        limit_choices_to={'dtl_budget_category': 'GAD Program'},
        related_name='gad_entries',
        null=True,
        blank=True
    )
    
    class Meta:
        db_table = 'gad_budget_tracker'
        ordering = ['-gbud_date']
        verbose_name = "GAD Budget Entry"
        
    def save(self, *args, **kwargs):
        # Update the parent year's cached values when saving
        super().save(*args, **kwargs)
        self.budget_year.save(force_recalculate=True)
        
    def delete(self, *args, **kwargs):
        # Update the parent year's cached values when deleting
        budget_year = self.budget_year
        super().delete(*args, **kwargs)
        budget_year.save(force_recalculate=True)
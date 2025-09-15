from django.db import models
from datetime import date
import json, re

class DevelopmentPlan(models.Model):
    dev_id = models.BigAutoField(primary_key=True)
    dev_date = models.DateField(default=date.today)
    dev_client = models.CharField(max_length=200, null=True)
    dev_issue = models.CharField(max_length=200, null=True)
    dev_project = models.TextField(null=True, blank=True, db_column='dev_project')
    dev_activity = models.JSONField(default=list, null=True, blank=True, db_column='dev_activity')
    dev_res_person = models.JSONField(default=list, db_column='dev_res_person')
    dev_indicator = models.JSONField(default=list, db_column='dev_indicator')
    dev_gad_items = models.JSONField(default=list, db_column='dev_budget_items')
   
    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )

    class Meta:
        db_table = 'gad_development_plan'
        managed = False

class GAD_Budget_Year(models.Model):
    gbudy_num = models.BigAutoField(primary_key=True)
    gbudy_budget = models.DecimalField(max_digits=10, decimal_places=2)
    gbudy_year = models.CharField(max_length=4, unique=True)
    gbudy_expenses = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gbudy_is_archive = models.BooleanField(default=False)

    class Meta:
        db_table = 'gad_budget_tracker'

class GAD_Budget_Tracker(models.Model):
    gbud_num = models.BigAutoField(primary_key=True)
    gbud_datetime = models.DateTimeField(null=True)
    gbud_add_notes = models.CharField(max_length=500, null=True)
    # gbud_exp_project = models.CharField(max_length=200, null=True)
    gbud_exp_particulars = models.JSONField(default=list, null=True)
    gbud_proposed_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True)
    gbud_actual_expense = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True)
    gbud_remaining_bal = models.DecimalField(max_digits=10, decimal_places=2, default=0, null=True)
    gbud_reference_num = models.CharField(max_length=200, null=True)
    gbud_is_archive = models.BooleanField(default = False)
    gbud_project_index = models.IntegerField(default=0, help_text="Index of project in dev_project array")
    
    gbudy = models.ForeignKey(
        GAD_Budget_Year, 
        on_delete=models.CASCADE,
        related_name='transactions',
        db_column='gbudy_num'
    )
    
    dev = models.ForeignKey(
        DevelopmentPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='dev_id'
    )

    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )
    
    class Meta:
        db_table = 'gad_budget_record'
    
    @property
    def project_title(self):
        """Get the project title from the related development plan"""
        if self.dev and self.dev.dev_project:
            projects = self.dev.dev_project if isinstance(self.dev.dev_project, list) else [self.dev.dev_project]
            if 0 <= self.gbud_project_index < len(projects):
                return projects[self.gbud_project_index]
        return None
    
    @property
    def budget_items(self):
        """Get budget items from the related development plan"""
        if self.dev and self.dev.dev_gad_items:
            return self.dev.dev_gad_items
        return []

class GAD_Budget_File(models.Model):
    gbf_id = models.BigAutoField(primary_key=True)
    gbf_name = models.CharField()
    gbf_type = models.CharField(max_length=50)
    gbf_path = models.CharField()
    gbf_url = models.CharField()
    
    gbud = models.ForeignKey(
        GAD_Budget_Tracker,
        on_delete=models.CASCADE,
        related_name='files',
        db_column='gbud_num'
    )

    class Meta:
        db_table = 'gad_budget_file'

class GADBudgetLog(models.Model):
    gbudl_id = models.BigAutoField(primary_key=True)
    gbudl_budget_entry = models.ForeignKey(
        GAD_Budget_Tracker,
        on_delete=models.CASCADE,
        related_name="logs"
    )
    gbudl_amount_returned = models.FloatField(default=0, null=True)
    gbudl_created_at = models.DateTimeField(auto_now_add=True)
    gbudl_prev_amount = models.FloatField(default=0, null=True)

    class Meta:
        db_table = "gad_budget_log"

class ProjectProposal(models.Model):
    gpr_id = models.BigAutoField(primary_key=True)
    # gpr_title = models.CharField(max_length=200)
    gpr_background = models.TextField(blank=True, null=True)
    # gpr_date = models.CharField(default=date.today().strftime("%B %d, %Y"))
    gpr_venue = models.CharField(max_length=200, blank=True)
    gpr_monitoring = models.TextField(blank=True)
    gpr_header_img = models.TextField(blank=True, null=True) 
    # gpr_page_size = models.CharField(max_length=20, default='letter', null=True)
    gpr_objectives = models.JSONField(default=list, null=True)
    # gpr_participants = models.JSONField(default=list)
    # gpr_budget_items = models.JSONField(default=list)
    gpr_signatories = models.JSONField(default=list)

    staff = models.ForeignKey(
        'administration.Staff',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='staff_id'
    )
    
    gbud = models.ForeignKey(
        GAD_Budget_Tracker,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='gbud_num'
    )
    
    dev = models.ForeignKey(
        DevelopmentPlan,
        on_delete=models.CASCADE,
        related_name='proposals',
        db_column='dev_id'
    )
    
    gpr_created = models.DateField(default=date.today)
    gpr_is_archive = models.BooleanField(default=False)

    class Meta:
        db_table = 'project_proposal'
    
    @property
    def project_title(self):
        """Get the project title from the related development plan"""
        if self.dev and self.dev.dev_project:
            try:
                # Try parsing as JSON
                projects = json.loads(self.dev.dev_project)
                if isinstance(projects, list) and projects:
                    return projects[0] if isinstance(projects[0], str) else "Untitled Project"
                elif isinstance(projects, str):
                    return projects
            except (json.JSONDecodeError, TypeError):
                # Fallback: just treat it as plain text
                return self.dev.dev_project
        return "Untitled Project"

    @property
    def participants(self):
        """Get participants from the related development plan indicators."""
        if self.dev and self.dev.dev_indicator:
            result = []
            for entry in self.dev.dev_indicator:
                if isinstance(entry, dict):
                    # Already structured
                    category = str(entry.get("category", "")).strip()
                    count = entry.get("count")
                    try:
                        count = int(count)
                    except (ValueError, TypeError):
                        count = None
                    result.append({"category": category, "count": count})
                elif isinstance(entry, str):
                    # Could be multiple comma-separated groups
                    parts = [p.strip() for p in entry.split(",") if p.strip()]
                    for part in parts:
                        match = re.match(r'^(.*?)\s*\((\d+)\s*participants?\)$', part)
                        if match:
                            category, count = match.groups()
                            result.append({"category": category.strip(), "count": int(count)})
                        else:
                            result.append({"category": part, "count": None})
            return result
        return []
        
    @property
    def budget_items(self):
        """Get budget items from the related development plan"""
        if self.dev and self.dev.dev_gad_items:
            return self.dev.dev_gad_items
        return []
    
    @property
    def project_date(self):
        """Get the project date from the related development plan"""
        if self.dev and self.dev.dev_date:
            return self.dev.dev_date
        return None

class ProposalSuppDoc(models.Model):
    psd_id = models.BigAutoField(primary_key=True)
    psd_is_archive = models.BooleanField(default=False)
    psd_name = models.CharField(null=True)
    psd_type = models.CharField(max_length=50, null=True)
    psd_path = models.CharField(null=True)
    psd_url = models.CharField(null=True)

    gpr = models.ForeignKey(
        ProjectProposal,
        on_delete=models.CASCADE,
        related_name='support_docs',
        db_column='gpr_id'
    )

    class Meta:
        db_table = 'proposal_supp_doc'
export type BudgetPlan = {
    plan_id?: number;
    plan_year?: string;
    plan_actual_income: number;
    plan_rpt_income: number;
    plan_balance: number;
    plan_tax_share: number;
    plan_tax_allotment: number;
    plan_cert_fees: number;
    plan_other_income: number;
    plan_budgetaryObligations: number;
    plan_balUnappropriated: number;
    plan_issue_date?: string;
    plan_is_archive?: boolean,
    staff_id: string;
    staff_name?: string;
    details?: BudgetPlanDetail[];
}

export type BudgetPlanDetail = {
    dtl_id?: number;
    dtl_proposed_budget: number;
    dtl_budget_item: string;
    plan?: number; 
}


export type BudgetHeaderUpdate = {
    plan_id?: number;
    plan_actual_income: number;
    plan_rpt_income: number;
    plan_balance: number;
    plan_tax_share: number;
    plan_tax_allotment: number;
    plan_cert_fees: number;
    plan_other_income: number;
    plan_budgetaryObligations: number; 
    plan_balUnappropriated: number;
    plan_personalService_limit: number;
    plan_miscExpense_limit: number;
    plan_localDev_limit: number; 
    plan_skFund_limit: number;
    plan_calamityFund_limit: number;
};

export type BudgetDetailUpdate = {
    dtl_id?: number;
    dtl_proposed_budget: number;
    dtl_budget_item: string;
    // dtl_budget_category: string;
};


export interface BudgetItem {
      name: string;
      label: string;
      category: string;
    }
    
export interface BudgetDetail {
      dtl_proposed_budget: number;
      dtl_budget_item: string;
      // dtl_budget_category: string;
    }

export interface OldBudgetDetail {
  dtl_id?: number;
  dtl_proposed_budget: string | number;
  dtl_budget_item: string;
  // dtl_budget_category: string;
}

export interface NewBudgetDetail {
  dtl_proposed_budget: number;
  dtl_budget_item: string;
  // dtl_budget_category: string;
}

export interface ProcessedOldBudgetDetail {
  proposed_budget: number;
  budget_item: string;
  category: string;
  is_changed: boolean;
}
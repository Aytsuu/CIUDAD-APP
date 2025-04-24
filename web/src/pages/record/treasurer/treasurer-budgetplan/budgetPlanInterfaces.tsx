export interface BudgetPlan {
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
    plan_personalService_limit: number,
    plan_miscExpense_limit: number,
    plan_localDev_limit: number,
    plan_skFund_limit: number,
    plan_calamityFund_limit: number,
    details?: BudgetPlanDetail[];
}

export interface BudgetPlanDetail {
    // dtl_id: number;
    dtl_budget_item: string;
    dtl_proposed_budget: number;
    dtl_budget_category: string;
    // plan?: number; 
}
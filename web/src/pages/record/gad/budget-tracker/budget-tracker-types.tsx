export type BudgetYear = {
  gbudy_year: string;
  gbudy_budget: number;
  gbudy_expenses: number;
  gbudy_income: number;
};

export type BudgetEntry = {
  gbud_type: string;
  gbud_actual_expense?: number;
};

export type GADBudgetEntryUI = GADBudgetEntry & {
  gbud_particulars?: string | { name: string; pax: string; amount: number }[];
  gbud_amount?: number | null;
  gbud_exp_project?: string | null;
  gbud_exp_particulars?: { name: string; pax: string; amount: number }[] | null;
  files?: GADBudgetFile[];
};

export type GADBudgetYearEntry = {
  gbudy_num: number;
  gbudy_year: string;
  gbudy_budget: number;
  gbudy_expenses: number;
  gbudy_income: number;
};

export type GADBudgetEntry = {
  gbud_num?: number;
  gbud_datetime: string;
  gbud_type: string;
  gbud_add_notes?: string;

  // Income fields
  gbud_inc_particulars?: string;
  gbud_inc_amt?: number;

  // Expense fields
  gbud_exp_particulars?: string;
  gbud_proposed_budget?: number;
  gbud_actual_expense?: number;
  gbud_remaining_bal?: number;
  gbud_reference_num?: string;
  gbud_is_archive?: boolean;
  
  // Relations
  gpr?: { gpr_id: number } | null;
  files?: Array<{
    gbf_id: number;
    gbf_name: string;
    gbf_type: string;
    gbf_path: string;
    gbf_url: string;
  }> | null;
};

export type GADBudgetFile = {
  gbf_id?: number;
  gbf_name: string;
  gbf_type: string;
  gbf_path: string;
  gbf_url: string;
  gbud_num?: number;
};

export type GADBudgetCreatePayload = {
  gbud_type: "Income" | "Expense";
  gbud_datetime: string;
  gbud_add_notes?: string | null;
  gbud_inc_particulars?: string | null;
  gbud_inc_amt?: number | null;
  gbud_exp_project?: string | null;
  gbud_exp_particulars?: { name: string; pax: string; amount: number }[] | null;
  gbud_actual_expense?: number | null;
  gbud_reference_num?: string | null;
  gbud_remaining_bal?: number | null;
  gbudy: number;
  gpr_id?: number | null;
};

export type GADBudgetUpdatePayload = {
  gbud_type: "Income" | "Expense";
  gbud_datetime: string;
  gbud_add_notes?: string | null;
  gbud_inc_particulars?: string | null;
  gbud_inc_amt?: number | null;
  gbud_exp_project?: string | null;
  gbud_exp_particulars?: { name: string; pax: string; amount: number }[] | null;
  gbud_actual_expense?: number | null;
  gbud_reference_num?: string | null;
  gbud_remaining_bal?: number | null;
  gbudy: number;
  gpr?: number | null; 
};

export type GADEditEntryFormProps = {
  gbud_num: number;
  onSaveSuccess?: () => void;
};

export interface ProjectProposal {
  gpr_id: number;
  gpr_title: string;
  gpr_budget_items: { name: string; pax: string; amount: number }[];
  recorded_items: string[];
  unrecorded_items: { name: string; pax: string; amount: number }[];
  is_editable: boolean;
}

export interface BudgetLogTable {
  gbudl_id: number;
  gbud_exp_project: string | null;
  gbud_exp_particulars: { name: string; pax: string; amount: number }[] | null;
  gbud_proposed_budget: number | null;
  gbud_actual_expense: number | null;
  gbudl_prev_amount: number | null;
  gbudl_amount_returned: number | null;
  gbudl_created_at: string;
  gbud_type: "Income" | "Expense";
}
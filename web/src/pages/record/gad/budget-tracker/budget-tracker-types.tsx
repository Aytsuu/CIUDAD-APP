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
    gbud_particulars?: string | null;
    gbud_amount?: number | null;
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
      gdb?: {
          gdb_id?: number;
          gdb_name?: string;
      };
      files?: Array<{
          gbf_id: number;
          gbf_name: string;
          gbf_type: string;
          gbf_path: string;
          gbf_url: string;
      }> | null;
  };
  
  export type DevelopmentBudgetItem = {
      gdb_id: number;
      gdb_name: string;
      gdb_pax: number;
      gdb_price: number;
  };

  export type GADBudgetFile = {
    gbf_id?: number;
    gbf_name: string;
    gbf_type: string;
    gbf_path: string;
    gbf_url: string;
    gbud_num: number;
  };
  
  export type GADBudgetCreatePayload = {
    gbud_type: 'Income' | 'Expense';
    gbud_datetime: string;
    gbud_add_notes?: string | null;
    gbud_inc_particulars?: string | null;
    gbud_inc_amt?: number | null;
    gbud_exp_particulars?: string | null;
    gbud_proposed_budget?: number | null;
    gbud_actual_expense?: number | null;
    gbud_remaining_bal?: number | null;
    gbud_reference_num?: string | null;
    gbudy: number;
    gdb_id?: number | null;
    onChange?: string;
  };

  export type GADBudgetUpdatePayload = {
    gbud_type: 'Income' | 'Expense';
    gbud_datetime: string;
    gbud_add_notes?: string | null;
    gbud_inc_particulars?: string | null;
    gbud_inc_amt?: number | null;
    gbud_exp_particulars?: string | null;
    gbud_proposed_budget?: number | null;
    gbud_actual_expense?: number | null;
    gbud_remaining_bal?: number | null;
    gbud_reference_num?: string | null;
    gbudy: number;
    gdb_id?: number | null;
  };
  
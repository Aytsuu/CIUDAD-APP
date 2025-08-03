import BudgetTrackerSchema from "@/form-schema/gad-budget-tracker-schema";
import z from "zod";

export type BudgetYear = {
  gbudy_year: string;
  gbudy_budget: number;
  gbudy_expenses: number;
  gbudy_income: number;
};

export type BudgetEntry = {
  gbud_type: string;
  gbud_actual_expense?: string | number | null;
};

export type FileData = {
  name: string;
  type: string;
  path: string;
  uri: string;
};

export type GADBudgetEntryUI = GADBudgetEntry & {
  gbud_particulars?: string | null;
  gbud_amount?:  number | null;
  gbud_proposed_budget?: number | null;
  gbud_actual_expense?: number | null;
  gbud_inc_amt?: number | null;
};

export type MediaFileType = {
  id: string;
  uri: string;
  name: string;
  type: string;
  path: string;
  publicUrl?: string;
  status: "uploading" | "uploaded" | "error";
};

export type GADBudgetYearEntry = {
    gbudy_num: number;
    gbudy_year: string;
    gbudy_budget: number;
    gbudy_expenses: number;
    gbudy_income: number;
    gbud_remaining_bal?: string | number | null;
    gbudy_is_archive?: boolean; 
  };

  export type GADBudgetEntry = {
    gbud_num?: number;
    gbud_datetime: string;
    gbud_type: "Income" | "Expense";
    gbud_add_notes?: string | null;
    gbud_inc_particulars?: string | null;
    gbud_inc_amt?: string | number | null;
    gbud_exp_particulars?: string | null;
    gbud_proposed_budget?: string | number | null;
    gbud_actual_expense?: string | number | null;
    gbud_remaining_bal?: string | number | null;
    gbud_reference_num?: string | null;
    gbud_is_archive?: boolean;
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
        status?: "uploading" | "uploaded" | "error";
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
  gbud_inc_amt?: string | number | null;
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
  gbud_inc_amt?: string | number | null;
  gbud_exp_particulars?: string | null;
  gbud_proposed_budget?: number | null;
  gbud_actual_expense?: number | null;
  gbud_remaining_bal?: number | null;
  gbud_reference_num?: string | null;
  gbudy: number;
  gdb_id?: number | null;
};

export type FormValues = z.infer<typeof BudgetTrackerSchema>;

export type DropdownOption = {
  label: string;
  value: string;
};

export type BudgetFile = {
  gbf_id: number;
  gbf_name: string;
  gbf_type: string;
  gbf_path: string;
  gbf_url: string;
};
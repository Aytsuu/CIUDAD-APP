// types/deworming.ts
export interface DewormingRound {
  round_number: number;
  round_name: string;
  period: string;
  recipient_count: number;
  total_doses_dispensed: number;
}

export interface DewormingYearItem {
  year: string;
  rounds: DewormingRound[];
  total_recipients: number;
  total_doses: number;
}

export interface DewormingYearsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    success: boolean;
    data: DewormingYearItem[];
    total_years: number;
    deworming_category: string;
  };
}

export interface DewormingRecord {
  medreqitem_id: number;
  med_details: {
    med_id: string;
    catlist: string;
    med_name: string;
    med_type: string;
    med_dsg: number;
    med_dsg_unit: string;
    med_form: string;
    created_at: string;
    updated_at: string;
    cat: number;
  };
  total_allocated_qty: number;
  pat_details: {
    personal_info: {
      per_fname: string;
      per_lname: string;
      per_mname: string | null;
      per_suffix: string | null;
      per_dob: string;
      per_sex: string;
      per_status: string;
      per_edAttainment: string | null;
      per_religion: string;
      per_contact: string;
    };
    address: {
      add_street: string;
      add_barangay: string;
      add_city: string;
      add_province: string;
      add_sitio: string;
      full_address: string;
    };
    pat_id: string;
  };
  unit: string;
  reason: string;
  status: string;
  is_archived: boolean;
  archive_reason: string | null;
  created_at: string;
  cancelled_rejected_reffered_at: string | null;
  confirmed_at: string;
  fulfilled_at: string;
  medreq_id: string;
  med: string;
  action_by: string;
  completed_by: string;
}

export interface DewormingDetailResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    success: boolean;
    data: {
      year: string;
      recipient_count: number;
      deworming_category: string;
      records: DewormingRecord[];
    };
  };
}
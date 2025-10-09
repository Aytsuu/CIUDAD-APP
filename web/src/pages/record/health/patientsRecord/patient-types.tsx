export interface Patient {
  pat_id: string;
  pat_type: string;
  name?: string;
  trans_id?: string;
  rp_id?: { rp_id?: string };
  personal_info?: {
    per_fname?: string;
    per_mname?: string;
    per_lname?: string;
    per_dob?: string;
    per_sex?: string;
  };
  households?: { hh_id: string }[];
  address?: {
    add_street?: string;
    add_barangay?: string;
    add_city?: string;
    add_province?: string;
    add_sitio?: string;
    full_address?: string;
  };
  family?: {
    fam_id: string;
    fc_role: string;
  };
  family_head_info?: {
    fam_id: string | null;
    family_heads?: {
      mother?: {
        role?: string;
        personal_info?: {
          per_fname?: string | null;
          per_mname?: string | null;
          per_lname?: string | null;
          per_dob?: string | null;
          per_sex?: string | null;
        };
      };
      father?: {
        role?: string;
        personal_info?: {
          per_fname?: string | null;
          per_mname?: string | null;
          per_lname?: string | null;
          per_dob?: string | null;
          per_sex?: string | null;
        };
      };
      tt_status:string | null;
    };
  };
  spouse_info?: {
    spouse_info?: {
      spouse_fname?: string
      spouse_lname?: string
      spouse_mname?: string
      spouse_dob?: string
      spouse_occupation?: string
    }
  };
  additional_info?: {
    philhealth_id?: string;
}
}
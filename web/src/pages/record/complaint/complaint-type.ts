export interface Complainant {
  cpnt_id: number;
  cpnt_name: string;
  cpnt_gender: string;
  cpnt_age: string;
  cpnt_number: string;
  cpnt_relation_to_respondent: string;
  cpnt_address: string;
  rp_id: string;
}

export interface Accused {
  acsd_id: number;
  acsd_name: string;
  acsd_age: string;
  acsd_gender: string;
  acsd_description: string;
  acsd_address: string;
  rp_id: string;
}

export interface ComplaintFile {
  comp_file_id: number;
  comp_file_name: string;
  comp_file_type: string;
  comp_file_url: string;
}


export interface Complaint {
  comp_id: number;
  comp_location: string;
  comp_incident_type: string;
  comp_datetime: string;
  comp_allegation: string;
  comp_category: string;
  comp_created_at: string;
  comp_rejection_reason: string;
  comp_updated_at?: string;
  comp_cancel_reason: string;
  comp_status: string;
  staff: Record<string,any>;
  complainant: Complainant[];
  accused: Accused[];
  comp_file?: ComplaintFile[];
}
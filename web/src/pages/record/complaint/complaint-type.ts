export interface Address {
  add_province: string;
  add_city: string;
  add_barangay: string;
  add_street: string;
  add_external_sitio?: string;
  sitio?: number | null;
}

// Matches backend Complainant model + nested Address
export interface Complainant {
  cpnt_id: number;
  cpnt_name: string;
  cpnt_gender: string;
  cpnt_age: string;
  cpnt_number: string;
  cpnt_relation_to_respondent: string;
  add: Address;
}

// Matches backend Accused model + nested Address
export interface Accused {
  acsd_id: number;
  acsd_name: string;
  acsd_age: string;
  acsd_gender: string;
  acsd_description: string;
  add: Address;
}

// Matches Complaint_File model
export interface ComplaintFile {
  comp_file_id: number;
  comp_file_name: string;
  comp_file_type: string;
  comp_file_url: string;
}

export interface Complaint {
  comp_id: number;
  comp_incident_type: string;
  comp_datetime: string;
  comp_allegation: string;
  comp_category: string;
  comp_created_at: string;
  comp_is_archive: boolean;
  complainant: Complainant[];
  accused_persons: Accused[];
  complaint_file?: ComplaintFile[];
}

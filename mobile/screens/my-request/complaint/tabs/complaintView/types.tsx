export interface ResidentProfile {
  full_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  address?: string;
  contact_number?: string;
  email?: string;
}

export interface PersonType {
  res_profile?: ResidentProfile;
  cpnt_name?: string;
  cpnt_gender?: string;
  cpnt_address?: string;
  cpnt_relation_to_respondent?: string;
  cpnt_number?: string | number;
  cpnt_id?: string | number;
  cpnt_contact?: string;
  acsd_name?: string;
  acsd_address?: string;
  acsd_age?: string;
  acsd_gender?: string;
  acsd_description?: string;
  acsd_id?: string | number;
  acsd_contact?: string;
  rp_id?: string | number;
}

export interface ComplaintFile {
  file_name?: string;
  file_type?: string;
  file_url?: string;
  uploaded_at?: string;
  file_id?: string | number;
}

export interface ComplaintData {
  comp_id?: string | number;
  comp_incident_type?: string;
  comp_status?: string;
  comp_location?: string;
  comp_datetime?: string;
  comp_created_at?: string;
  comp_allegation?: string;
  complainant?: PersonType[];
  accused_persons?: PersonType[];
  complaint_files?: ComplaintFile[];
}
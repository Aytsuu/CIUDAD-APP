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

interface Complainant {
  cpnt_id: number;
  res_profile: ResidentProfile;
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
  res_profile: ResidentProfile;
  acsd_name: string;
  acsd_age: string;
  acsd_gender: string;
  acsd_description: string;
  acsd_address: string;
  rp_id: string;
}

export interface ComplaintFile {
  file_name?: string;
  file_type?: string;
  file_url?: string;
  uploaded_at?: string;
}

export interface ComplaintData {
  comp_id: number;
  comp_incident_type: string;
  comp_location: string;
  comp_datetime: string;
  comp_allegation: string;
  comp_created_at: string;
  comp_is_archive: boolean;
  complainant: Complainant[];
  accused: Accused[];
  complaint_files: ComplaintFile[];
  comp_status: string;
  staff: any;
}



// Summon Date and Time
export type SummonDates = {
    sd_id: number;
    sd_date: string;
}


export type SummonTimeSlots = {
    st_id: string | number;
    st_start_time: string;
    sd_id: string | number;
    st_is_booked?: boolean;
}

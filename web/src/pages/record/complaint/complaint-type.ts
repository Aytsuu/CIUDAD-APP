export interface StaffHistoryInfo {
  staff_id: number;
  staff_name: string;
  staff_position: string | null;
  error?: string;
}

export interface ComplaintHistory {
  comp_hist: number;
  comp_hist_action: string;
  comp_hist_details: {
    old_status?: string;
    new_status?: string;
    update_reason?: string;
    rejection_reason?: string;
    cancellation_reason?: string;
    old_staff_name?: string;
    new_staff_name?: string;
    updated_fields?: string[];
    [key: string]: any;
  };
  comp_hist_timestamp: string;
  staff: StaffHistoryInfo | null; 
}

export interface Complainant {
  cpnt_id: number;
  cpnt_name: string;
  cpnt_gender: string;
  cpnt_age: string; 
  cpnt_number: string;
  cpnt_relation_to_respondent: string;
  cpnt_address: string;
  rp_id: string | null;
  res_profile?: any; }

export interface Accused {
  acsd_id: number;
  acsd_name: string;
  acsd_age: string; 
  acsd_gender: string;
  acsd_description: string;
  acsd_address: string;
  rp_id: string | null;
  res_profile?: any; 
}

export interface ComplaintFile {
  comp_file_id: number;
  comp_file_name: string;
  comp_file_type: string;
  comp_file_url: string;
  comp?: number; 
}

export interface Staff {
  staff_id: number;
  staff_name: string;
  staff_position: string | null;
  error?: string;
  staff_email?: string;
  staff_phone?: string;
}

export interface Complaint {
  comp_id: number;
  comp_location: string;
  comp_incident_type: string;
  comp_datetime: string;
  comp_allegation: string;
  comp_created_at: string;
  comp_rejection_reason: string | null;
  comp_updated_at: string;
  comp_cancel_reason: string | null;
  comp_status: "Pending" | "Accepted" | "Rejected" | "Raised" | "Cancelled";
  staff: Staff | null;
  complainant: Complainant[];
  accused: Accused[];
  complaint_files: ComplaintFile[];
  comp_history: ComplaintHistory[];
}

export interface ComplaintCreateData {
  comp_incident_type: string;
  comp_location: string;
  comp_datetime: string;
  comp_allegation: string;
  staff?: number; 
}

export interface ComplaintUpdateData {
  comp_status?: "Pending" | "Accepted" | "Rejected" | "Raised" | "Cancelled";
  comp_rejection_reason?: string;
  comp_cancel_reason?: string;
  staff_id?: number;
}

export interface ComplaintAnalytics {
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
  raised: number;
}
export interface Address {
  add_province: string;
  add_city: string;
  add_barangay: string;
  add_street: string;
  add_external_sitio?: string;
  sitio?: number;
}

export interface Complainant {
  cpnt_id: number;
  cpnt_name: string;
  add: Address;
}

export interface Accused {
  acsd_id: number;
  acsd_name: string;
  add: Address;
}

export interface ComplaintFile {
  cf_id: number;
  file: any;
}

export interface Complaint{
  comp_id: number;
  comp_incident_type: string;
  comp_datetime: string;
  comp_allegation: string;
  comp_category: string;
  comp_created_at: string;
  comp_is_archive: boolean;
  cpnt: Complainant;
  accused_persons: Accused[];
  complaint_files?: ComplaintFile[];
}


// This interface matches what your Django view expects
export interface ComplaintFormValues {
  complainant: {
    name: string;
    address: Address;
  };
  accused: Array<{
    name: string;
    address: Address;
  }>;
  incident_type: string;
  datetime: string;
  allegation: string;
  category: string;
  media_files: File[];
}

// For media upload component
export interface MediaFile {
  id: string;
  file: File | null;
  preview?: string;
}

export interface ComplaintPayload {
  complainant: {
    name: string;
    address: {
      add_province: string;
      add_city: string;
      add_barangay: string;
      add_street: string;
      add_external_sitio: string;
      sitio: null | number;
    };
  };
  accused: Array<{
    name: string;
    address: {
      add_province: string;
      add_city: string;
      add_barangay: string;
      add_street: string;
      add_external_sitio: string;
      sitio: null | number;
    };
  }>;
  incident_type: string;
  datetime: string;
  allegation: string;
  category: string;
  media_files: File[];
}

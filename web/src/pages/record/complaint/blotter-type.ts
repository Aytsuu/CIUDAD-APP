export interface MediaFile {
  storage_path: any;
  file_name: string;
  file_type: any;
  id: number | string;
  type: "image" | "video" | "document";
  url: string;
  file?: File;
  description: string;
}

export interface BlotterFormValues {
  id: string,
  bc_complainant: string;
  bc_cmplnt_address: string;
  bc_accused: string;
  bc_accused_address: string;
  bc_incident_type: string;
  bc_allegation: string;
  bc_datetime: string;
  bc_evidence: FileList | null;
}

export interface BlotterRecord extends Omit<BlotterFormValues, 'bc_evidence'> {
  id: string;
  created_at?: string;
  updated_at?: string;
  bc_status?: 'Pending' | 'Resolved' | 'In Progress';
  media?: MediaFile[]; 
}


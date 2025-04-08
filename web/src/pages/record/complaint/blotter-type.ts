export interface MediaFile {
  id: number | string;
  type: "image" | "video" | "document";
  url: string;
  file?: File;
  description: string;
}

export interface BlotterFormValues {
  bc_complainant: string;
  bc_cmplnt_address: string;
  bc_accused: string;
  bc_accused_address: string;
  bc_incident_type: string;
  bc_allegation: string;
  bc_datetime: string;
  bc_evidence: FileList | null;
}

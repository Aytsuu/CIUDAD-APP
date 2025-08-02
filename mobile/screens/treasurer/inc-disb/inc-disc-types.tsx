export type Album = {
  id: number;
  type: "income" | "disbursement";
  year: string;
  images: ImageItem[];
  staff_names: string[];
  is_archive: boolean; 
  inf_name?: string;
  dis_name?: string;
};

export type ImageItem =
  | (IncomeImage & { type: "income" })
  | (DisbursementImage & { type: "disbursement" });

export type IncomeImage = {
  infi_num: number;
  infi_upload_date: string;
  infi_type: string;
  infi_name: string; 
  infi_path: string; 
  infi_url: string; 
  inf_num: number;
  staff_name?: string;
  inf_year: string;
  infi_is_archive: boolean;
  inf_name: string;
  inf_desc?: string;
};

export type DisbursementImage = {
  disf_num: number;
  disf_upload_date: string;
  disf_type: string; 
  disf_name: string; 
  disf_path: string; 
  disf_url: string; 
  dis_num: number;
  staff_name?: string;
  dis_year: string;
  disf_is_archive: boolean;
  dis_name: string;
  dis_desc?: string;
};

export type IncomeFolder = {
  inf_num: number;
  inf_year: string;
  inf_name: string;
  inf_is_archive: boolean;
  inf_desc?: string;
};

export type DisbursementFolder = {
  dis_num: number;
  dis_year: string;
  dis_name: string;
  dis_is_archive: boolean;
  dis_desc?: string;
};

// Define the expected response type from useCreateFolder mutation
export interface CreateFolderResponse {
  id: number;
  type: "income" | "disbursement";
  name: string;
  year: number;
  desc?: string;
  is_archive: boolean;
  dis_num: number;
  inf_num: number;
}

// Define the form values type to match the schema
export interface CreateFolderFormValues {
  type: "income" | "disbursement";
  name: string;
  year: string;
  desc?: string;
}

export type Album = {
  id: number;
  type: "income" | "disbursement";
  year: string;
  images: ImageItem[];
  staff_names: string[];
  is_archive: boolean; // Derived from all images
  inf_name?: string;
  dis_name?: string;
  inf_desc?: string;
  dis_desc?: string;
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
  // file_url: string; 
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
  // file_url: string; 
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
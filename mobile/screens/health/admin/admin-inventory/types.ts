// src/types.ts

export type CommodityRecords = {
  comt_id: number;
  com_name: string;
  comt_qty: string;
  comt_action: string;
  staff: string;
  created_at: string;
  inv_id: string;
};

export type MedicineRecords = {
  mdt_id: number;
  med_detail: {
    med_name: string;
    minv_dsg: string;
    minv_dsg_unit: string;
    minv_form: string;
  };
  inv_id: string;
  mdt_qty: string;
  mdt_action: string;
  staff: string;
  created_at: string;
};

export type FirstAidRecords = {
  inv_id: string;
  fat_id: number;
  fa_name: string;
  fdt_qty: string; // Note: Original type had fdt_qty, but FirstAidCol uses fat_qty. Assuming fat_qty is correct.
  fat_action: string;
  staff: string;
  created_at: string;
};

export type AntigenTransaction = {
  antt_id: number;
  vac_stock: {
    vaccinelist: {
      vac_name: string;
    };
    inv_details: {
      inv_id: string;
    };
  } | null;
  imz_stock: {
    imz_detail: {
      imz_name: string;
    };
    inv_detail: {
      inv_id: string;
    };
  } | null;
  antt_qty: string;
  antt_action: string;
  staff: string; // Changed from number to string based on usage in web code (staffFullName)
  created_at: string;
  itemName?: string; // Added for formatted data
};

// Assuming staff_detail structure from your web code for formatting staff names
export type StaffDetail = {
  rp?: {
    per?: {
      per_fname?: string;
      per_lname?: string;
    };
  };
};

// Generic type for API response items that include staff_detail
export type ApiItemWithStaff = {
  staff_detail?: StaffDetail;
  created_at: string;
  // Add other properties specific to each transaction type
  [key: string]: any;
};

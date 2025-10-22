export type CommodityStocksRecord = {
    cinv_id: number;
    commodityInfo: {
      com_name: string;
    };
    expiryDate: string;
    category: string;
    qty: {
      cinv_qty: number;
      cinv_pcs: number;
    };
    cinv_qty_unit: string;
    availQty: string;
    dispensed: string;
    recevFrom: string;
    inv_id: string;
  };
  

  export type MedicineStocksRecord = {
    id: number;
    minv_id: number;
    medicineInfo: {
      medicineName: string;
      dosage: number;
      dsgUnit: string;
      form: string;
    };
    expiryDate: string;
    category: string;
    qty: {
      qty: number;
      pcs: number;
    };
    minv_qty_unit: string;
    availQty: string;
    distributed: string;
    inv_id: string;
  };


  export type FirstAidStocksRecord = {
  staff_id: string | null; // Nullable staff_id
  finv_id: number;
  firstAidInfo: {
    fa_name: string;
  };
  expiryDate: string;
  category: string;
  qty: {
    finv_qty: number;
    finv_pcs: number;
  };
  finv_qty_unit: string;
  availQty: string;
  used: string;
  inv_id: string;
};


export type StockRecords = {
  id: number;
  batchNumber: string;
  created_at:string
  category: string;
  item: {
    antigen: string;
    dosage: number;
    unit: string;
  };
  qty: string;
  administered: string;
  wastedDose: string;
  availableStock: number;
  expiryDate: string;
  type: "vaccine" | "supply";
  inv_id: string;
  vac_id: number;
  imz_id: number;
  vacStck_id: number;
  solvent: string;
  volume: number;
  dose_ml: number;
  imzStck_id: number;
  imzStck_unit: string;
  imzStck_pcs: number;
  imzStck_used: number;
  qty_number: number;
  isArchived?: boolean; // Added property

  // wasted_items: number;

};



export function isVaccine(record: any): record is { type: "vaccine" } {
  return record?.type === "vaccine";
}
export function isSupply(record: any): record is { type: "supply" } {
  return record?.type === "supply";
}
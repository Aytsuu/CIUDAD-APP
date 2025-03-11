import { z } from "zod"

export const MedicineStocksSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is Required").default(""),
  category: z.string().min(1, "Category is required").default(""),
  dosage: z.number().min(0, "Dosage cannot be negative").default(0),
  dsgUnit: z.string().min(1, "Dosage unit is required").default(""),
  form: z.string().min(1, "Form is required").default(""),
  qty: z.number().min(1, "Quantity must be at least 1").default(0),
  unit: z.string().min(1, "Unit is required").default(""),
  pcs: z.number().default(0),
  expiryDate: z.string().min(1, "Expiry date is required").default("")
}).refine(
  (data) => {
    if (data.unit === "boxes") {
      return data.pcs >= 1; // Only validate when using boxes
    }
    return true;
  },
  {
    message: "Pieces per box must be at least 1 when using boxes",
    path: ["pcs"],
  }
);


export const VaccineStocksSchema = z.object({
  antigen: z.string().min(1, "Vaccine name is required").default(""),
  category: z.string().min(1, "Category is Required").default(""),
  batchNumber: z.string().min(1, "Batch number is required ").default(""),
  volume: z.number().default(0),
  vialBoxCount: z.number().min(1, "required ").default(0),
  dosesPcsCount: z.number().min(1, "Batch number is required ").default(0),
  expiryDate: z.string().min(1, "ExpiryDate is Required").default(""),

}); 

export const CommodityStocksSchema = z.object({
  commodityName: z.string().min(1, "Commodity name is required").default(""),
  category: z.string().min(1, "Category is required").default(""),
  unit: z.string().min(1, "Unit is required").default(""),
  qty: z.number().min(1, "Quantity is required").default(0),
  pcs: z.number().default(0), // Ensure it's positive.
  recevFrom: z.string().min(1, "Required").default(""),
  expiryDate: z.string().min(1, "Expiry date is required").default(""),
}).refine(
  (data) => {
      if (data.unit === "boxes") {
          return data.pcs >= 1; // Only validate when using boxes
      }
      return true;
  },
  {
      message: "Pieces per box must be at least 1 when using boxes",
      path: ["pcs"],
  }
);


export const FirstAidStockSchema = z.object({
  itemName: z.string().min(1, "Item name is Required").default(""),
  // id: z.number().min(1, "Batch number is required").default(0),
  category: z.string().min(1, "Category is Required").default(""),
  qty: z.number().min(1, "Quantity is required").default(0),
  expiryDate: z.string().default(""),
})



export type MedicineStockType = z.infer<typeof MedicineStocksSchema>
export type CommodityStockType = z.infer<typeof CommodityStocksSchema>
export type VaccineStockType = z.infer<typeof VaccineStocksSchema>
export type FirstAidStockType = z.infer<typeof FirstAidStockSchema>
import { z } from "zod";



export const MedicineStocksSchema = z.object({
  medicineID: z.string().min(1, "Medicine name is Required").default(""),
  category: z.string().min(1, "Category is required").default(""),
  dosage: z.number({ required_error: "Dosage is Required" }).min(0, "Dosage must be a non-negative number"),
  dsgUnit: z.string().min(1, "Dosage unit is required").default(""),
  form: z.string().min(1, "Form is required").default(""),
  qty: z.number().min(1, "Qty is Required"),
  unit: z.string().min(1, "Unit is required").default(""),
  pcs: z.number({ required_error: "Pieces is Required" }).min(0, "Pieces must be a non-negative number"),
  expiryDate: z
  .string()
  .refine((date) => new Date(date) > new Date(), {
    message: "Expiry date must be in the future",
  }),
}).refine(
  (data) => {
    if (data.unit === "boxes") {
      return data.pcs >= 1; // Only validate when using boxes
    }
    return true;
  },
  {
    message: "Pieces per box must be at least 1",
    path: ["pcs"],
  }
);

export const VaccineStocksSchema = z.object({
  antigen: z.string().min(1, "Vaccine name is required").default(""),
  category: z.string().min(1, "Category is Required").default(""),
  batchNumber: z.string().min(1, "Batch number is required").default(""),
  volume: z.number().min(0, "Volume must be a non-negative number").default(0),
  vialBoxCount: z.number({ required_error: "Vial box count is Required" }).min(0, "Vial box count must be a non-negative number"),
  dosesPcsCount: z.number({ required_error: "Doses pieces count is Required" }).min(0, "Doses pieces count must be a non-negative number"),
  expiryDate: z.string().min(1, "Expiry date is Required").default(""),
});

export const CommodityStocksSchema = z.object({
  commodityName: z.string().min(1, "Commodity name is required").default(""),
  category: z.string().min(1, "Category is required").default(""),
  unit: z.string().min(1, "Unit is required").default(""),
  qty: z.number().min(1, "required"),
  pcs: z.number().min(1, "required"),
  recevFrom: z.string().min(1, "Received from is Required").default(""),
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
  category: z.string().min(1, "Category is Required").default(""),
  qty: z.number().min(1, "Quantity required"),
  expiryDate: z.string().default(""),
});

export type MedicineStockType = z.infer<typeof MedicineStocksSchema>;
export type CommodityStockType = z.infer<typeof CommodityStocksSchema>;
export type VaccineStockType = z.infer<typeof VaccineStocksSchema>;
export type FirstAidStockType = z.infer<typeof FirstAidStockSchema>;
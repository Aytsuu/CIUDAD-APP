import { z} from "zod"

export const MedicineStocksSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is Required"),
  category: z.string().min(1, "Category is required"),
  batchNumber: z.string().min(1, "Batch number is required"),
  dosage: z.number(),
  dsgUnit: z.string(),
  form: z.string().min(1, "Form is required"),
  qty: z.number().min(1, "Quantity must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  pcs: z.number().min(1, "Pieces per box must be at least 1").optional(),
  expiryDate: z.string().min(1, "Expiry date is required")
}).refine(
  (data) => {
    if (data.unit === "boxes") {
      return data.pcs !== undefined && data.pcs > 0;
    }
    return true;
  },
  {
    message: "Pieces per box is required when using boxes",
    path: ["pcs"],
  }
);

export const VaccineStocksSchema = z.object({
    vaccineName: z.string().min(1, "Vaccine name is required"),
    batchNumber:z.string(),
    volume: z.number(),
    vialCount:z.number(),
    dosesCount:z.number(),
    expiryDate: z.string().min(1,"ExpiryDate is Required"),

  });

  export const CommodityStocksSchema = z.object({
    commodityName: z.string().min(1, "Commodity name is required"),
    batchNumber: z.string().min(1, "Batch number is required"),
    category: z.string().min(1, "Category is required"),
    unit: z.string().min(1, "Unit is required"),
    qty: z.number().min(1, "Quantity must be at least 1"),
    pcs: z.number().min(1).optional(),
    expiryDate: z.string().min(1, "Expiry date is required"),
}).refine(
  (data) => {
    if (data.unit === "boxes") {
      return data.pcs !== undefined && data.pcs > 0;
    }
    return true;
  },
  {
    message: "Pieces per box is required when using boxes",
    path: ["pcs"],
  }
   
  );
  


export const FirstAidStockSchema  =z.object({
  itemName: z.string().min(1, "Item name is Required"),
  category:z.string().min(1, "Category is Required"),
  qty:z.number().min(1,"Quantity is required"),
  expiryDate: z.string(),
})



export type MedicineStockType = z.infer<typeof MedicineStocksSchema>
export type CommodityStockType = z.infer<typeof CommodityStocksSchema>
export type VaccineStockType = z.infer<typeof VaccineStocksSchema>
export type FirstAidStockType = z.infer<typeof FirstAidStockSchema>
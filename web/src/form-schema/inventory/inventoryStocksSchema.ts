import { z} from "zod"

export const MedicineStocksSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is Required").default(""),
  category: z.string().min(1, "Category is required").default(""),
  batchNumber: z.string().min(1, "Batch number is required").default(""),
  dosage: z.number().default(0),
  dsgUnit: z.string().default(""),
  form: z.string().min(1, "Form is required").default(""),
  qty: z.number().min(1, "Quantity must be at least 1").default(0),
  unit: z.string().min(1, "Unit is required").default(""),
  pcs: z.number().min(1, "Pieces per box must be at least 1").optional().default(0),
  expiryDate: z.string().min(1, "Expiry date is required").default("")
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
    vaccineName: z.string().min(1, "Vaccine name is required").default("").default(""),
    category:z.string().min(1, "Category is Required").default(""),
    batchNumber:z.string().min(1, "Batch number is required ").default(""),
    volume: z.number().default(0),
    vialBoxCount:z.number().min(1, "required ").default(0),
    dosesPcsCount:z.number().min(1, "Batch number is required ").default(0),
    expiryDate: z.string().min(1,"ExpiryDate is Required").default(""),

  });

  export const CommodityStocksSchema = z.object({
    commodityName: z.string().min(1, "Commodity name is required").default(""),
    batchNumber: z.string().min(1, "Batch number is required").default(""),
    category: z.string().min(1, "Category is required").default(""),
    unit: z.string().min(1, "Unit is required").default(""),
    qty: z.number().min(1, "Quantity must be at least 1").default(0),
    pcs: z.number().min(1).optional().default(0),
    expiryDate: z.string().min(1, "Expiry date is required").default(""),
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
  itemName: z.string().min(1, "Item name is Required").default(""),
  category:z.string().min(1, "Category is Required").default(""),
  qty:z.number().min(1,"Quantity is required").default(0),
  expiryDate: z.string().default(""),
})



export type MedicineStockType = z.infer<typeof MedicineStocksSchema>
export type CommodityStockType = z.infer<typeof CommodityStocksSchema>
export type VaccineStockType = z.infer<typeof VaccineStocksSchema>
export type FirstAidStockType = z.infer<typeof FirstAidStockSchema>
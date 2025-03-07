import { z} from "zod"

export const MedicineStocksSchema = z.object({

    medicineName: z.string().min(1," Medicine name is Required"),
    batchNumber:z.string(),
    dosage: z.number(),
    dsgUnit: z.string(),
    form: z.string(),
    qty:z.string(),
    availQty:z.string(),
    expiryDate: z.string().min(1,"ExpiryDate is Required"),
    category: z.string().min(1,"Category is required")
})


export const VaccineStocksSchema = z.object({
    vaccineName: z.string().min(1, "Vaccine name is required"),
    batchNumber:z.string(),
    dosage: z.number(),
    dsgUnit: z.string(),
    vialCount:z.number(),
    dosesCount:z.number(),
    expiryDate: z.string().min(1,"ExpiryDate is Required"),
    category: z.string().min(1,"Category is required")

  });


export const CommodityStocksSchema = z.object({
    commodityName: z.string().min(1,"Enter Commodity Name"),
    // dosage: z.number(),
    // dsgUnit: z.string(),
    // form: z.string(),

    category: z.string().min(1,"Category is required")
    
})



export const FirstAidStockSchema  =z.object({
  itemName: z.string().min(1, "Item name is Required"),
  category:z.string().min(1, "Category is Required")

})



export type MedicineStockType = z.infer<typeof MedicineStocksSchema>
export type CommodityStockType = z.infer<typeof CommodityStocksSchema>
export type VaccineStockType = z.infer<typeof VaccineStocksSchema>
export type FirstAidStockType = z.infer<typeof FirstAidStockSchema>
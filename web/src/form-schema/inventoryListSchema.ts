import { z} from "zod"

export const MedicineListSchema = z.object({

    medicineName: z.string().min(1," Medicine name is Required"),
    // dosage: z.number(),
    // dsgUnit: z.string(),
    // form: z.string(),
    category: z.string().min(1,"Category is required")
})


export const CommodityListSchema = z.object({
    commodityName: z.string().min(1,"Enter Commodity Name"),
    // dosage: z.number(),
    // dsgUnit: z.string(),
    // form: z.string(),

    category: z.string().min(1,"Category is required")
    
})

export const VaccineListSchema = z.object({
  vaccineName: z.string().min(1, "Vaccine name is required"),
  interval: z.number().optional(), 
  timeUnits: z.string().optional(),
  noOfDoses:z.number(),

  // -----------------
  ageGroup: z.string().min(1, "Age group is required"),
  years:z.number().optional(), 
  months:z.number(),
  weeks:z.number(),
  days:z.number(),
});

export const FirstAidSchema  =z.object({
  itemName: z.string().min(1, "Item name is Required"),
  category:z.string().min(1, "Category is Required")

})



export type MedicineType = z.infer<typeof MedicineListSchema>
export type CommodityType = z.infer<typeof CommodityListSchema>
export type VacccineType = z.infer<typeof VaccineListSchema>
export type FirstAidType = z.infer<typeof FirstAidSchema>
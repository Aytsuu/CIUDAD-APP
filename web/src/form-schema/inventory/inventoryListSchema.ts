import { z } from "zod";

export const MedicineListSchema = z.object({
  medicineName: z.string().min(1, "Medicine name is Required").default(""),
  category: z.string().min(1, "Category is required").default("")
});

export const CommodityListSchema = z.object({
  commodityName: z.string().min(1, "Enter Commodity Name").default(""),
  category: z.string().min(1, "Category is required").default("")
});

export const VaccineListSchema = z.object({
  vaccineName: z.string().min(1, "Vaccine name is required").default(""),
  interval: z.number().optional(),
  timeUnits: z.string().optional().default(""),
  noOfDoses: z.number().default(0),
  ageGroup: z.string().min(1, "Age group is required").default(""),
  years: z.number().optional(),
  months: z.number().default(0),
  weeks: z.number().default(0),
  days: z.number().default(0)
});

export const FirstAidSchema = z.object({
  itemName: z.string().min(1, "Item name is Required").default(""),
  category: z.string().min(1, "Category is Required").default("")
});

export type MedicineType = z.infer<typeof MedicineListSchema>;
export type CommodityType = z.infer<typeof CommodityListSchema>;
export type VacccineType = z.infer<typeof VaccineListSchema>;
export type FirstAidType = z.infer<typeof FirstAidSchema>;
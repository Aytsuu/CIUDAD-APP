import { z } from "zod";
import { positiveNumberSchema } from "@/helpers/PositiveNumber";


// Simplified validation helper
const withPiecesValidation = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => 
  schema.refine(
    (data) => {
      const piecesField = Object.keys(data).find(key => key.endsWith('_pcs')) as keyof typeof data;
      const unitField = Object.keys(data).find(key => key.endsWith('_unit') || 'unit') as keyof typeof data;
      
      // Only validate if unit is boxes
      if (data[unitField] === "boxes") {
        return data[piecesField] !== undefined && data[piecesField] >= 1;
      }
      return true;
    },
    {
      message: "Pieces per box must be at least 1 when using boxes",
      path: [Object.keys(schema.shape).find(key => key.endsWith('_pcs')) || 'pcs']
    }
  );

// Simplified schemas
export const MedicineStocksSchema = withPiecesValidation(z.object({
  medicineID: z.string().min(1, "Medicine name is required"),
  category: z.string().min(1, "Category is required"),
  dosage: positiveNumberSchema.pipe(z.number().min(1, "Dosage must be at least 1")),
  dsgUnit: z.string().min(1, "Dosage unit is required"),
  form: z.string().min(1, "Form is required"),
  qty: positiveNumberSchema.pipe(z.number().min(1, "Quantity must be at least 1")),
  unit: z.string().min(1, "Unit is required").default(""),
  pcs: positiveNumberSchema.optional(), // Truly optional now
  inv_type:z.string().min(1, "Inventory type is required").default("Medicine"),
  staff: z.string().optional(),
  expiry_date: z.string().min(1, "Expiry date is required")
    .refine(date => new Date(date) > new Date(), "Expiry date must be in the future")
})

);

export const CommodityStocksSchema = withPiecesValidation(z.object({
  com_id: z.string().min(1, "Commodity name is required"),
  cinv_qty: positiveNumberSchema.pipe(z.number().min(1, "Quantity must be at least 1")),
  cinv_qty_unit: z.string().min(1, "Unit is required").default(""),
  cinv_pcs: positiveNumberSchema.optional(),
  cinv_recevFrom: z.string().min(1, "Received from is required"),
  inv_type:z.string().min(1, "Inventory type is required").default("Commodity"),
  staff: z.string().optional(),
  expiry_date: z.string().min(1, "Expiry date is required")
    .refine(date => new Date(date) > new Date(), "Expiry date must be in the future")}
));

export const FirstAidStockSchema = withPiecesValidation(z.object({
  fa_id: z.string().min(1, "First aid item is required"),
  category: z.string().min(1, "Category is required"),
  finv_qty: positiveNumberSchema.pipe(z.number().min(1, "Quantity must be at least 1")),
  finv_qty_unit: z.string().min(1, "Unit is required").default(""),
  finv_pcs: positiveNumberSchema.optional(),
  inv_type:z.string().min(1, "Inventory type is required").default("First Aid"),
  staff: z.string().optional(),
  expiry_date: z.string().min(1, "Expiry date is required")
    .refine(date => new Date(date) > new Date(), "Expiry date must be in the future")
}));

export const ImmunizationSuppliesSchema = withPiecesValidation(z.object({
  imz_id: z.string().min(1, "Immunization supply is required"),
  batch_number: z.string().min(1, "Batch number is required"),
  imzStck_qty: positiveNumberSchema.pipe(z.number().min(1, "Quantity must be at least 1")),
  imzStck_pcs: positiveNumberSchema.optional(),
  imzStck_unit: z.string().min(1, "Unit is required").default(""),
  inv_type:z.string().min(1, "Inventory type is required").default("Antigen"),
  staff: z.string().optional(),
  expiry_date: z.string().min(1, "Expiry date is required")
    .refine(date => new Date(date) > new Date(), "Expiry date must be in the future")
}));

// Vaccine schema remains unchanged as it doesn't use pieces validation
export const VaccineStocksSchema = z.object({
  vac_id: z.string().min(1, "Vaccine name is required"),
  solvent: z.string().min(1, "required").default(""),
  batchNumber: z.string().min(1, "Batch number is required"),
  volume: positiveNumberSchema,
  dose_ml: positiveNumberSchema,
  qty: positiveNumberSchema,
  inv_type:z.string().min(1, "Inventory type is required").default("Antigen"),
  staff: z.string().optional(),
  expiry_date: z.string().min(1, "Expiry date is required")
    .refine(date => new Date(date) > new Date(), "Expiry date must be in the future")
});
 

export const usedFaSchema = z.object({
  usedItem: positiveNumberSchema,
});
export type usedFaSchemaType = z.infer<typeof usedFaSchema>;
// Type exports
export type ImmunizationSuppliesType = z.infer<typeof ImmunizationSuppliesSchema>;
export type MedicineStockType = z.infer<typeof MedicineStocksSchema>;
export type CommodityStockType = z.infer<typeof CommodityStocksSchema>;
export type VaccineStockType = z.infer<typeof VaccineStocksSchema>;
export type FirstAidStockType = z.infer<typeof FirstAidStockSchema>;
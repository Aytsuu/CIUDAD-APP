import { z } from "zod";
import { ImmunizationSchema } from "./inventoryListSchema";

// Helper schema for number fields that can accept strings or numbers
const numberSchema = z.union([
  z.string().min(1).transform(val => parseInt(val, 10)),
  z.number()
]).pipe(
  z.number().min(0)
);

const positiveNumberSchema = z.union([
  z.string().min(1).transform(val => parseInt(val, 10)),
  z.number()
]).pipe(
  z.number().min(1)
);

export const MedicineStocksSchema = z.object({
  medicineID: z.string().min(1, "Medicine name is Required").default(""),
  category: z.string().min(1, "Category is required").default(""),
  dosage: z.union([
    z.string().min(1).transform(val => parseInt(val, 10)),
    z.number()
  ]).pipe(
    z.number().min(0, "Dosage must be a non-negative number")
  ),
  dsgUnit: z.string().min(1, "Dosage unit is required").default(""),
  form: z.string().min(1, "Form is required").default(""),
  qty: positiveNumberSchema.pipe(
    z.number().min(1, "Qty is Required")
  ),
  unit: z.string().min(1, "Unit is required").default(""),
  pcs: numberSchema.pipe(
    z.number().min(0, "Pieces must be a non-negative number")
  ),
  expiryDate: z.string()
    .refine((date) => new Date(date) > new Date(), {
      message: "Expiry date must be in the future",
    }),
}).refine(
  (data) => {
    if (data.unit === "boxes") {
      return data.pcs >= 1;
    }
    return true;
  },
  {
    message: "Pieces per box must be at least 1",
    path: ["pcs"],
  }
);

export const CommodityStocksSchema = z.object({
  com_id: z.string().min(1, "Commodity name is required").default(""),
  cat_id: z.string().min(1, "Category is required").default(""),
  cinv_qty: positiveNumberSchema.pipe(
    z.number().min(1, "required")
  ),
  cinv_qty_unit: z.string().min(1, "Unit is required").default(""),
  cinv_pcs: numberSchema.pipe(
    z.number().min(0, "Pieces must be a non-negative number")
  ),
  cinv_recevFrom: z.string().min(1, "Received from is Required").default(""),
  expiryDate: z.string()
    .refine((date) => new Date(date) > new Date(), {
      message: "Expiry date must be in the future",
    }),
}).refine(
  (data) => {
    if (data.cinv_qty_unit === "boxes") {
      return data.cinv_pcs >= 1;
    }
    return true;
  },
  {
    message: "Pieces per box must be at least 1 when using boxes",
    path: ["cinv_pcs"], // Fixed path from "pcs" to "cinv_pcs"
  }
);

export const FirstAidStockSchema = z.object({
  fa_id: z.string().min(1, "Commodity name is required").default(""),
  cat_id: z.string().min(1, "Category is required").default(""),
  finv_qty: positiveNumberSchema.pipe(
    z.number().min(1, "required")
  ),
  finv_qty_unit: z.string().min(1, "Unit is required").default(""),
  finv_pcs: numberSchema.pipe(
    z.number().min(0, "Pieces must be a non-negative number")
  ),
  expiryDate: z.string()
    .refine((date) => new Date(date) > new Date(), {
      message: "Expiry date must be in the future",
    }),
}).refine(
  (data) => {
    if (data.finv_qty_unit === "boxes") {
      return data.finv_pcs >= 1;
    }
    return true;
  },
  {
    message: "Pieces per box must be at least 1 when using boxes",
    path: ["finv_pcs"], // Fixed path from "pcs" to "finv_pcs"
  }
);

export const VaccineStocksSchema = z.object({
  vac_id: z.string().min(1, "Vaccine name is required").default(""),
  solvent: z.enum(["diluent", "doses"]).default("doses"),
  batchNumber: z.string().min(1, "Batch number is required").default(""),
  volume: numberSchema.pipe(
    z.number().min(0, "Volume must be a non-negative number")
  ).default(0),
  qty: numberSchema.pipe(
    z.number().min(0, "Vial box count must be a non-negative number")
  ),
  dose_ml: numberSchema.pipe(
    z.number().min(0, "Doses pieces count must be a non-negative number")
  ),
  expiryDate: z.string().min(1, "Expiry date is Required").default(""),
});

export const ImmunizationSuppliesSchema = z.object({
  imz_id: z.string().min(1, "Immunization supply is required"),
  batch_number: z.string().min(1, "Batch number is required"),
  imzStck_qty: numberSchema.pipe(
    z.number().min(0, "Quantity cannot be negative")
  ).default(0),
  imzStck_pcs: numberSchema.pipe(
    z.number().min(0, "Pieces cannot be negative")
  ),
  imzStck_unit: z.enum(["boxes", "pcs"]),
  expiryDate: z.string()
    .min(1, "Expiry date is required")
    .refine((date) => new Date(date) > new Date(), {
      message: "Expiry date must be in the future",
    }),
}).refine(
  (data) => {
    if (data.imzStck_unit === "boxes") {
      return data.imzStck_pcs > 0;
    }
    return true;
  },
  {
    message: "Pieces per box must be at least 1 when using boxes",
    path: ["imzStck_pcs"],
  }
);

export type ImmunizationSuppliesType = z.infer<typeof ImmunizationSuppliesSchema>;
export type MedicineStockType = z.infer<typeof MedicineStocksSchema>;
export type CommodityStockType = z.infer<typeof CommodityStocksSchema>;
export type VaccineStockType = z.infer<typeof VaccineStocksSchema>;
export type FirstAidStockType = z.infer<typeof FirstAidStockSchema>;
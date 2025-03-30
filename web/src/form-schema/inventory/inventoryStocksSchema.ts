import { z } from "zod";
import { ImmunizationSchema } from "./inventoryListSchema";



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

export const CommodityStocksSchema = z.object({
  com_id: z.string().min(1, "Commodity name is required").default(""),
  cat_id: z.string().min(1, "Category is required").default(""),
  cinv_qty: z.number().min(1, "required"),
  cinv_qty_unit: z.string().min(1, "Unit is required").default(""),
  cinv_pcs: z.number({ required_error: "Pieces is Required" }).min(0, "Pieces must be a non-negative number"),
  cinv_recevFrom: z.string().min(1, "Received from is Required").default(""),
  expiryDate: z
    .string()
    .refine((date) => new Date(date) > new Date(), {
      message: "Expiry date must be in the future",
    }),
}).refine(
  (data) => {
    if (data.cinv_qty_unit === "boxes") {
      return data.cinv_pcs >= 1; // Only validate when using boxes
    }
    return true;
  },
  {
    message: "Pieces per box must be at least 1 when using boxes",
    path: ["pcs"],
  }
);


export const FirstAidStockSchema = z.object({
  fa_id: z.string().min(1, "Commodity name is required").default(""),
  cat_id: z.string().min(1, "Category is required").default(""),
  finv_qty: z.number().min(1, "required"),
  finv_qty_unit: z.string().min(1, "Unit is required").default(""),
  finv_pcs: z.number({ required_error: "Pieces is Required" }).min(0, "Pieces must be a non-negative number"),
  expiryDate: z
    .string()
    .refine((date) => new Date(date) > new Date(), {
      message: "Expiry date must be in the future",
    }),
}).refine(
  (data) => {
    if (data.finv_qty_unit === "boxes") {
      return data.finv_pcs >= 1; // Only validate when using boxes
    }
    return true;
  },
  {
    message: "Pieces per box must be at least 1 when using boxes",
    path: ["pcs"],
  }
);


// Updated schema
// Updated schema
export const VaccineStocksSchema = z.object({
  vac_id: z.string().min(1, "Vaccine name is required").default(""),
  solvent: z.enum(["diluent", "doses"]).default("doses"),
  batchNumber: z.string().min(1, "Batch number is required").default(""),
  volume: z.number().min(0, "Volume must be a non-negative number").default(0),
  qty: z.number({ required_error: "Vial box count is Required" }).min(0, "Vial box count must be a non-negative number"),
  dose_ml: z.number({ required_error: "Doses pieces count is Required" }).min(0, "Doses pieces count must be a non-negative number"),
  expiryDate: z.string().min(1, "Expiry date is Required").default(""),
});

// Schema definition
export const ImmunizationSuppliesSchema = z
  .object({
    imz_id: z.string().min(1, "Immunization supply is required"),
    batch_number: z.string().min(1, "Batch number is required"),
    imzStck_qty: z.number().min(0, "Quantity cannot be negative").default(0),
    imzStck_pcs: z.number().min(0, "Pieces cannot be negative"),
    imzStck_unit: z.enum(["boxes", "pcs"]),
    expiryDate: z
      .string()
      .min(1, "Expiry date is required")
      .refine((date) => new Date(date) > new Date(), {
        message: "Expiry date must be in the future",
      }),
  })
  .refine(
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

export type ImmunizationSuppliesType = z.infer<
  typeof ImmunizationSuppliesSchema
>;


export type MedicineStockType = z.infer<typeof MedicineStocksSchema>;
export type CommodityStockType = z.infer<typeof CommodityStocksSchema>;
export type VaccineStockType = z.infer<typeof VaccineStocksSchema>;
export type FirstAidStockType = z.infer<typeof FirstAidStockSchema>;






// export const FirstAidStockSchema = z.object({
//   itemName: z.string().min(1, "Item name is Required").default(""),
//   category: z.string().min(1, "Category is Required").default(""),
//   qty: z.number().min(1, "Quantity required"),
//   expiryDate: z.string().default(""),
// });
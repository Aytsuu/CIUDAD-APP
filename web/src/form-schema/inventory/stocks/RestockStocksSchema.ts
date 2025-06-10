import { z } from "zod";
import { positiveNumberSchema } from "@/helpers/PositiveNumber";

export const AddMedicineStocksSchema = z
  .object({
    minv_qty: positiveNumberSchema.refine(val => val >= 1, "Enter qty Name"),
    minv_qty_unit: z.string().min(1, "Unit is required").default(""),
    minv_pcs: positiveNumberSchema.default(0), // Allow 0 as default
  })
  .refine(
    (data) => {
      if (data.minv_qty_unit === "boxes") {
        return data.minv_pcs >= 1; // Only validate when using boxes
      }
      return true;
    },
    {
      message: "Pieces per box must be at least 1",
      path: ["minv_pcs"],
    }
  );

export const AddCommoditySchema = z
  .object({
    cinv_qty: positiveNumberSchema.refine(val => val >= 1, "Enter qty Name"),
    cinv_qty_unit: z.string().min(1, "Unit is required").default(""),
    cinv_pcs: positiveNumberSchema.default(0), // Allow 0 as default
  })
  .refine(
    (data) => {
      if (data.cinv_qty_unit === "boxes") {
        return data.cinv_pcs >= 1; // Only validate when using boxes
      }
      return true;
    },
    {
      message: "Pieces per box must be at least 1",
      path: ["cinv_pcs"], // Fixed path from minv_pcs to cinv_pcs
    }
  );

export const AddFirstAidSchema = z
  .object({
    finv_qty: positiveNumberSchema.refine(val => val >= 1, "Enter qty Name"),
    finv_qty_unit: z.string().min(1, "Unit is required").default(""),
    finv_pcs: positiveNumberSchema.default(0), // Allow 0 as default
  })
  .refine(
    (data) => {
      if (data.finv_qty_unit === "boxes") {
        return data.finv_pcs >= 1; // Only validate when using boxes
      }
      return true;
    },
    {
      message: "Pieces per box must be at least 1",
      path: ["finv_pcs"], // Fixed path from minv_pcs to finv_pcs
    }
  );

export type addMedicineStocksType = z.infer<typeof AddMedicineStocksSchema>;
export type AddCommodityStockType = z.infer<typeof AddCommoditySchema>;
export type AddFirstAidStockType = z.infer<typeof AddFirstAidSchema>;
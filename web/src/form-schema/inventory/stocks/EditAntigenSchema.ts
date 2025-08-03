import { z } from "zod";
import { positiveNumberSchema } from "@/helpers/PositiveNumber";


export const VaccineStocksSchema = z.object({
  qty: positiveNumberSchema.refine((val) => val > 0, {
    message: "Quantity must be greater than 0",
  }),
  dose_ml: positiveNumberSchema
});


export type VaccineStockType = z.infer<typeof VaccineStocksSchema>;


export const ImmunizationStocksSchema = z.object({
  imzStck_unit: z.enum(["pcs", "boxes"]),
  boxCount: positiveNumberSchema.optional(),
  pcsCount: positiveNumberSchema.optional(),
  pcsPerBox: positiveNumberSchema.optional(),
}).superRefine((data, ctx) => {
  if (data.imzStck_unit === "boxes") {
    if (!data.boxCount || data.boxCount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Number of boxes is required",
        path: ["boxCount"],
      });
    }
    if (!data.pcsPerBox || data.pcsPerBox <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pieces per box is required",
        path: ["pcsPerBox"],
      });
    }
    // Reset pcsCount if it was set
    data.pcsCount = undefined;
  } else if (data.imzStck_unit === "pcs") {
    if (!data.pcsCount || data.pcsCount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Total pieces must be greater than 0",
        path: ["pcsCount"],
      });
    }
    // Reset box-related fields if they were set
    data.boxCount = undefined;
    data.pcsPerBox = undefined;
  }
});

export type ImmunizationStockType = z.infer<typeof ImmunizationStocksSchema>;

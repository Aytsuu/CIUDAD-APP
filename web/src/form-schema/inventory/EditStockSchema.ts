import { z } from "zod";



const positiveNumberSchema = z.union([
  z.string().min(1, "Value is required").transform(val => parseFloat(val)),
  z.number()
])
export const VaccineStocksSchema = z.object({
  qty: positiveNumberSchema,
  dose_ml: positiveNumberSchema,
}).refine(data => data.dose_ml > 0 && data.qty > 0, {
  message: "Both quantity and dose must be positive numbers",
  path: ["dose_ml"],
});


export type VaccineStockType = z.infer<typeof VaccineStocksSchema>;


export const ImmunizationStocksSchema = z.object({
  imzStck_unit: z.enum(["pcs", "boxes"]),
  boxCount:positiveNumberSchema.optional(),
  pcsCount:positiveNumberSchema.optional(),
  pcsPerBox:positiveNumberSchema.optional(),
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
    if (data.pcsCount) {
      data.pcsCount = undefined;
    }
  } else {
    if (!data.pcsCount || data.pcsCount <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Total pieces must be greater than 0",
        path: ["pcsCount"],
      });
    }
    // Reset box-related fields if they were set
    if (data.boxCount) {
      data.boxCount = undefined;
    }
    if (data.pcsPerBox) {
      data.pcsPerBox = undefined;
    }
  }
});

export type ImmunizationStockType = z.infer<typeof ImmunizationStocksSchema>;
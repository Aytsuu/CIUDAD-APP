import { z } from "zod";


export const AddMedicineStocksSchema = z
  .object({
    minv_qty: z.number().min(1, "Enter qty Name").default(0),
    minv_qty_unit: z.string().min(1, "Unit is required").default(""),
    minv_pcs: z.number().min(1, "Enter qty Name").default(0),
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
      path: ["minv_pcs"], // Corrected path
    }
  );
  


export type addMedicineStocksType = z.infer<typeof AddMedicineStocksSchema>
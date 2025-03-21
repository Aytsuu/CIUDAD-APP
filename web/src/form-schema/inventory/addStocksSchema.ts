import { z } from "zod";




export const AddMedicineStocksSchema = z.object({
  minv_qty: z.number().min(0, "Quantity must be at least 0"),
  minv_qty_unit: z.enum(["boxes", "bottles"]),
  minv_pcs: z.number().min(0, "Pieces per box must be at least 0").optional(),
}).refine(
  (data) => {
    if (data.minv_qty_unit === "boxes" && !data.minv_pcs) {
      return false; // minv_pcs is required for boxes
    }
    return true;
  },
  {
    message: "Pieces per box is required when unit is boxes",
    path: ["minv_pcs"],
  }
);


export type addMedicineStocksType = z.infer<typeof AddMedicineStocksSchema>
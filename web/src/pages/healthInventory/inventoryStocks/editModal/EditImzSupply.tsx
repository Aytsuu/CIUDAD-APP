import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import api from "@/pages/api/api";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { ImmunizationStockTransaction } from "../REQUEST/Payload";
import {FormDateInput} from "@/components/ui/form/form-date-input";

// Positive number schema that handles both string and number inputs
const positiveNumberSchema = z.union([
  z.string().min(1, "Value is required").transform(val => parseFloat(val)),
  z.number()
]).refine(val => val > 0, {
  message: "Must be greater than 0"
});

// Schema Definition
export const ImmunizationStocksSchema = z.object({
  imzStck_unit: z.enum(["pcs", "boxes"]),
  boxCount: positiveNumberSchema.optional(),
  pcsCount: positiveNumberSchema.optional(),
  pcsPerBox: positiveNumberSchema.optional(),
}).superRefine((data, ctx) => {
  if (data.imzStck_unit === "boxes") {
    if (!data.boxCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Number of boxes is required",
        path: ["boxCount"],
      });
    }
    if (!data.pcsPerBox) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pieces per box is required",
        path: ["pcsPerBox"],
      });
    }
    if (data.pcsCount !== undefined) {
      data.pcsCount = undefined;
    }
  } else {
    if (!data.pcsCount) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Total pieces is required",
        path: ["pcsCount"],
      });
    }
    if (data.boxCount !== undefined) {
      data.boxCount = undefined;
    }
    if (data.pcsPerBox !== undefined) {
      data.pcsPerBox = undefined;
    }
  }
});

export type ImmunizationStockType = z.infer<typeof ImmunizationStocksSchema>;

interface EditImmunizationFormProps {
  supply: {
    type: "supply";
    id: number;
    item: {
      antigen: string;
      dosage: number;
      unit: string;
    };
    qty: string;
    inv_id: number;
    imzStck_unit?: string;
    imzStck_qty?: number;
    imzStck_pcs?: number;
    imzStck_per_pcs: number;
  };
  setIsDialog?: (isOpen: boolean) => void;
}

export default function EditImmunizationForm({
  supply,
  setIsDialog,
}: EditImmunizationFormProps) {
  UseHideScrollbar();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [formData, setFormData] = useState<ImmunizationStockType | null>(null);
  const [originalUnit] = useState(supply.imzStck_unit || supply.item.unit || "pcs");

  const form = useForm<ImmunizationStockType>({
    resolver: zodResolver(ImmunizationStocksSchema),
    defaultValues: {
      boxCount: supply.imzStck_unit === "boxes" ? supply.imzStck_qty || undefined : undefined,
      pcsCount: supply.imzStck_unit === "pcs" ? supply.imzStck_pcs || undefined : undefined,
      pcsPerBox: supply.imzStck_per_pcs || undefined,
      imzStck_unit: (supply.imzStck_unit === "pcs" || supply.imzStck_unit === "boxes" 
        ? supply.imzStck_unit 
        : (supply.item.unit === "pcs" || supply.item.unit === "boxes" 
          ? supply.item.unit 
          : "pcs"))
        },
  });

  const currentUnit = form.watch("imzStck_unit");
  const pcsPerBox = form.watch("pcsPerBox");

  // Reset fields when unit changes
  useEffect(() => {
    if (currentUnit === "boxes") {
      form.resetField("pcsCount");
    } else {
      form.resetField("boxCount");
    }
  }, [currentUnit, form]);

  // Calculate boxes when pieces are entered and pcsPerBox exists
  useEffect(() => {
    if (currentUnit === "pcs" && pcsPerBox && pcsPerBox > 0) {
      const pcsCount = form.getValues("pcsCount") || 0;
      const fullBoxes = Math.floor(pcsCount / pcsPerBox);
      if (fullBoxes > 0) {
        form.setValue("boxCount", fullBoxes, { shouldValidate: true });
      }
    }
  }, [form.watch("pcsCount"), pcsPerBox, currentUnit]);

  const onSubmit = (data: ImmunizationStockType) => {
    setFormData(data);
    setIsConfirmationOpen(true);
  };

  const handleConfirm = async () => {
    if (!formData) return;
  
    try {
      const currentUnit = formData.imzStck_unit;
      let boxCount = 0;
      let pcsCount = 0;
      let pcsPerBoxValue = supply.imzStck_per_pcs || 0;
      let totalPcsToAdd = 0;
  
      // Get existing supply data
      const res = await api.get(`inventory/immunization_stock/${supply.id}/`);
      const existingSupply = res.data;
  
      if (currentUnit === "boxes") {
        boxCount = Number(formData.boxCount) || 0;
        pcsPerBoxValue = Number(formData.pcsPerBox) || existingSupply.imzStck_per_pcs || 0;
        totalPcsToAdd = boxCount * pcsPerBoxValue;
      } else {
        pcsCount = Number(formData.pcsCount) || 0;
        totalPcsToAdd = pcsCount;
        // Calculate additional boxes if pieces exceed per box count
        if (pcsPerBoxValue > 0) {
          boxCount = Math.floor(pcsCount / pcsPerBoxValue);
        }
      }
  
      // Calculate new totals
      const existingQty = existingSupply.imzStck_qty || 0;
      const existingPcs = existingSupply.imzStck_pcs || 0;
      const existingPerPcs = existingSupply.imzStck_per_pcs || 0;
      const existingAvail = existingSupply.imzStck_avail || 0;
  
      const payload = {
        imzStck_qty: originalUnit === "boxes" ? existingQty + (boxCount || 0) : existingQty,
        imzStck_per_pcs: existingPerPcs,
        imzStck_pcs: existingPcs + totalPcsToAdd,
        imzStck_avail: existingAvail + totalPcsToAdd,
        imzStck_unit: originalUnit // Always keep original unit type
      };
  
      await api.put(`inventory/immunization_stock/${supply.id}/`, payload);
  
      // Create transaction
      const transactionPayload = ImmunizationStockTransaction(
        totalPcsToAdd,
        supply.id,
        originalUnit,
        originalUnit === "boxes" ? boxCount : undefined,
        originalUnit === "boxes" ? pcsPerBoxValue : undefined
      );
      await api.post("inventory/imz_transaction/", transactionPayload);
  
      // Update inventory timestamp
      if (supply.inv_id) {
        await api.put(`inventory/update_inventorylist/${supply.inv_id}/`, {
          updated_at: new Date().toISOString(),
        });
      }
  
      alert("Successfully updated immunization stock");
      
      if (setIsDialog) {
        setIsDialog(false);
      }
    } catch (error: any) {
      console.error("Update error:", {
        message: error.message,
        response: error.response?.data,
      });
      alert(`Update failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsConfirmationOpen(false);
    }
  };

  return (
    <>
      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-2">
            <FormSelect
              control={form.control}
              name="imzStck_unit"
              label="Unit"
              options={[
                { id: "boxes", name: "Boxes" },
                { id: "pcs", name: "Pieces" },
              ]}
            />

            {currentUnit === "boxes" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    control={form.control}
                    name="boxCount"
                    label="Number of Boxes"
                    type="number"
                    placeholder="Number of Boxes"
                  />
                  <FormInput
                    control={form.control}
                    name="pcsPerBox"
                    label="Pieces per Box"
                    type="number"
                    placeholder="Pieces per Box"
                    readOnly={originalUnit === "boxes"} // Read-only if original unit is boxes
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Total Pieces
                  </label>
                  <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {(form.watch("boxCount") || 0) * (form.watch("pcsPerBox") || 0)} pcs
                  </div>
                </div>
              </>
            ) : (
              <>
                <FormInput
                  control={form.control}
                  name="pcsCount"
                  label="Total Pieces"
                  type="number"
                  placeholder="Total Pieces"
                />
                {pcsPerBox && pcsPerBox > 0 && (
                  <div className="text-sm text-gray-500">
                    {form.watch("boxCount") ? `${form.watch("boxCount")} full boxes` : "No full boxes"}
                  </div>
                )}
              </>
            )}

            <div className="flex justify-end gap-3 bottom-0 bg-white pb-2">
              <Button type="submit" className="w-[120px]">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={handleConfirm}
        title="Update Immunization Stock"
        description={`Are you sure you want to update this immunization stock?`}
      />
    </>
  );
}
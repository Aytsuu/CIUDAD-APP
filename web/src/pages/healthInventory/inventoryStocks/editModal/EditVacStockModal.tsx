import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  VaccineStockType,
  VaccineStocksSchema,
} from "@/form-schema/inventory/EditStockSchema";
import { useEffect, useState } from "react"; // Added useState
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import api from "@/pages/api/api";
import { VaccineTransactionPayload } from "../REQUEST/Payload";
import { AntigenTransaction } from "../REQUEST/Post";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal"; // Added import

interface EditVacStockFormProps {
  vaccine: {
    type: "vaccine";
    id: number;
    item: {
      antigen: string;
      dosage: number;
      unit: string;
    };
    qty: string;
    inv_id: number;
    solvent: string;
    dose_ml: number;
    volume: number;
    vac_id: number;
    imz_id: number;
  };
  setIsDialog: (isOpen: boolean) => void;
}

export default function EditVacStockForm({ vaccine, setIsDialog }: EditVacStockFormProps) {
  UseHideScrollbar();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false); // State for confirmation dialog
  const [formData, setFormData] = useState<VaccineStockType | null>(null); // Store form data for submission

  const isDiluent = vaccine.item.unit === "container";
  const isBoxes = vaccine.item.unit === "boxes";

  const form = useForm<VaccineStockType>({
    resolver: zodResolver(VaccineStocksSchema),
    defaultValues: {
      qty: 0,
      dose_ml: isDiluent ? 1 : vaccine.dose_ml || vaccine.item.dosage || 0,
    },
  });

  useEffect(() => {
    const dose_ml = form.watch("dose_ml");
    form.reset({
      dose_ml: dose_ml || (isDiluent ? 1 : vaccine.item.dosage || 0),
    });
  }, [vaccine, form, isDiluent]);

  const onSubmit = (data: VaccineStockType) => {
    setFormData(data); // Store the form data
    setIsConfirmationOpen(true); // Open confirmation dialog
  };

  const handleConfirm = async () => {
    if (!formData) return;
    
    console.log("Submitting:", formData);
    console.log(vaccine);
    
    try {
      const inputQty = Number(formData.qty) || 0;
      const inputDoseMl =
        Number(formData.dose_ml) || (isDiluent ? 1 : vaccine.item.dosage || 0);

      // Validate inputs
      // if (isNaN(inputQty)) {
      //   alert("Please enter a valid quantity");
      //   return;
      // }

      const res = await api.get("inventory/vaccine_stocks/");
      const existingVaccine = res.data.find(
        (vac: any) => vac.vacStck_id === vaccine.id
      );

      if (!existingVaccine) {
        alert("Vaccine ID not found. Please check the ID.");
        return;
      }

      // Convert existing values to numbers safely
      const currentQty = Number(existingVaccine.qty) || 0;
      const currentAvailQty = Number(existingVaccine.vacStck_qty_avail) || 0;

      // Calculate new quantities
      const qty = currentQty + inputQty;
      const availqty =
        existingVaccine.solvent === "doses"
          ? currentAvailQty + inputQty * inputDoseMl
          : currentAvailQty + inputQty;

      // Prepare payload with validated numbers
      const payload = {
        vacStck_id: vaccine.id,
        vac_id: vaccine.vac_id,
        inv_id: vaccine.inv_id,
        qty: qty,
        vacStck_qty_avail: availqty,
      };

      console.log("Submitting payload:", payload);
      await api.put(`inventory/vaccine_stocks/${vaccine.id}/`, payload);

      if (vaccine.inv_id) {
        await api.put(`inventory/update_inventorylist/${vaccine.inv_id}/`, {
          updated_at: new Date().toISOString(),
        });
      }

      const transactionData = VaccineTransactionPayload(
        vaccine.id,
        inputQty.toString(),
        "Added",
        vaccine.solvent,
        vaccine.dose_ml
      );
      await AntigenTransaction(transactionData);
      

      alert("Successfully updated vaccine stock");
      setIsDialog(false); // Close the form dialog on success
    } catch (error: any) {
      console.error("Update error:", {
        message: error.message,
        response: error.response?.data,
      });
      alert(`Update failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsConfirmationOpen(false); // Close the confirmation dialog
    }
  };

  const qty = form.watch("qty") || 0;
  const dose_ml = form.watch("dose_ml") || 0;

  return (
    <>
      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isDiluent ? (
              <FormInput
                control={form.control}
                name="qty"
                label="Quantity (Containers)"
                type="number"
                placeholder="Number of containers"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  control={form.control}
                  name="qty"
                  label={isBoxes ? "pcs" : "Number of Vials"}
                  type="number"
                  placeholder={isBoxes ? "Number of pieces" : "Number of vials"}
                />
                {!isBoxes && (
                  <FormInput
                    control={form.control}
                    name="dose_ml"
                    label="Doses per Vial (ml)"
                    type="number"
                    placeholder="Doses per vial"
                    readOnly
                  />
                )}
              </div>
            )}

            {!isDiluent && !isBoxes && (
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Total Doses
                </label>
                <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {qty * dose_ml} doses
                  <span className="ml-2 text-muted-foreground text-xs">
                    ({qty} vials × {dose_ml} ml/vial)
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 bottom-0 bg-white pb-2">
              <Button type="submit" className="w-[120px]">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={handleConfirm}
        title="Update Vaccine Stock"
        description={`Are you sure you want to update this vaccine stock?`}
      />
    </>
  );
}
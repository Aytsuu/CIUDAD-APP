// src/features/Antigen/components/AddVaccineStock.tsx
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VaccineStockType, VaccineStocksSchema } from "@/form-schema/inventory/stocks/inventoryStocksSchema";
import { useState } from "react";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useSubmitVaccineStock } from "../REQUEST/Antigen/queries/VaccinePostQueries";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { useAuth } from "@/context/AuthContext";
import { Combobox } from "@/components/ui/combobox";
import { fetchVaccines } from "../REQUEST/Antigen/queries/AntigenFetchQueries";
import { useVacBatchNumber } from "../REQUEST/Antigen/restful-api/get";

export default function AddVaccineStock() {
  const { user } = useAuth();
  const staff_id = user?.staff?.staff_id|| "";
  const form = useForm<VaccineStockType>({
    resolver: zodResolver(VaccineStocksSchema),
    defaultValues: {
      vac_id: "",
      batchNumber: "",
      volume: undefined,
      qty: undefined,
      expiry_date: "",
      solvent: "doses",
      inv_type: "Antigen",
      staff: staff_id
    }
  });

  const { data: vaccineOptions, isLoading: isVaccinesLoading } = fetchVaccines();
  const { mutate: submit, isPending } = useSubmitVaccineStock();
  const navigate = useNavigate();
  const solvent = form.watch("solvent");
  const vialBoxCount = form.watch("qty") || 0;
  const dosesPcsCount = form.watch("volume") || 0;
  const totalDoses = solvent === "doses" ? vialBoxCount * dosesPcsCount : null;
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [formData, setFormData] = useState<VaccineStockType | null>(null);
  const { batchNumbers, isLoading: isBatchNumbersLoading } = useVacBatchNumber();

  const isDuplicateBatchNumber = (newBatchNumber: string) => {
    if (isBatchNumbersLoading) return false;
    return batchNumbers.some((stock) => stock.batchNumber?.trim().toLowerCase() === newBatchNumber?.trim().toLowerCase());
  };

  const onSubmit = async (data: VaccineStockType) => {
    // Check if batch number is empty first
    if (!data.batchNumber.trim()) {
      form.setError("batchNumber", {
        type: "manual",
        message: "Batch number is required"
      });
      return;
    }

    if (isDuplicateBatchNumber(data.batchNumber)) {
      form.setError("batchNumber", {
        type: "manual",
        message: "Batch number already exists for this immunization supply"
      });
      return;
    }

    setFormData(data);
    setIsAddConfirmationOpen(true);
  };

  const confirmAdd = async () => {
    if (!formData) return;
    setIsAddConfirmationOpen(false);
    submit({ data: formData });
  };

  return (
    <div className="w-full flex items-center justify-center ">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-5 w-full max-w-[600px] rounded-sm space-y-5">
          <Label className="flex justify-center text-lg font-bold text-darkBlue2 text-center ">Add Stocks</Label>
          <hr className="mb-2" />

          <div className="space-y-6 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vaccine Name Combobox */}
              <div className="mt-2">
                <Label className="block mb-2  text-black/70">Vaccine Name</Label>
                <div className="relative">
                  <Combobox 
                    options={vaccineOptions?.formatted || []} 
                    value={
                      // Find the formatted option that matches the stored vac_id
                      vaccineOptions?.formatted?.find((option: any) => 
                        option.id.startsWith(form.watch("vac_id") + ',')
                      )?.id || ''
                    }
                    onChange={(value) => {
                      // Extract only the vac_id from the concatenated value
                      const vacId = (value ?? '').split(',')[0]; // Get the first part before the comma
                      form.setValue("vac_id", vacId);
                    }}
                    placeholder={isVaccinesLoading ? "Loading vaccines..." : "Select vaccine"} 
                    emptyMessage="No available vaccines" 
                    triggerClassName="w-full" 
                  />
                </div>
              </div>

              <FormInput control={form.control} name="batchNumber" label="Batch Number" placeholder="Batch number" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormDateTimeInput control={form.control} name="expiry_date" label="Expiry Date" type="date" />
              <FormSelect
                control={form.control}
                name="solvent"
                label="Solvent Type"
                options={[
                  { id: "diluent", name: "Diluent" },
                  { id: "doses", name: "Doses" }
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput control={form.control} name="qty" label={solvent === "doses" ? "Number of Vials" : "Number of Containers"} type="number" />
              {solvent === "diluent" ? <FormInput control={form.control} name="volume" label="Dosage (ml)" type="number" /> : <FormInput control={form.control} name="volume" label="Doses per Vial" type="number" />}
            </div>

            {solvent === "doses" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <Label className="text-darkGray mb-2">Total Doses</Label>
                  <div className="border rounded px-3 py-2 ">{totalDoses?.toString() || "0"}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2 pt-6">
            <Button variant="outline" type="button" className="w-[150px]" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" className="w-[150px]" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog isOpen={isAddConfirmationOpen} onOpenChange={setIsAddConfirmationOpen} onConfirm={confirmAdd} title="Add Vaccine Stock" description={`Are you sure you want to add new Stock for Vaccine?`} />
    </div>
  );
}
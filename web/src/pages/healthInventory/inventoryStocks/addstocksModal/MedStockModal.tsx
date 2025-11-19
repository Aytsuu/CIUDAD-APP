import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Form, FormItem, FormLabel } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MedicineStocksSchema, MedicineStockType } from "@/form-schema/inventory/stocks/inventoryStocksSchema";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { Loader2 } from "lucide-react";
import { useSubmitMedicineStock } from "../REQUEST/Medicine/restful-api/MedicineSubmit";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { unitOptions } from "./options";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";

import { fetchMedicines } from "../REQUEST/Medicine/restful-api/MedicineFetchAPI";

export default function AddMedicineStock() {
  const { user } = useAuth();
  const staff = user?.staff?.staff_id || "";
  console.log("STAFFFACKERS", staff);
  const form = useForm<MedicineStockType>({
    resolver: zodResolver(MedicineStocksSchema),
    defaultValues: {
      medicineID: "",
      category: "",
      // dosage: undefined,
      // dsgUnit: "",
      // form: "",
      qty: undefined,
      unit: "pcs",
      pcs: undefined,
      expiry_date: "",
      staff: staff,
      inv_type: "Medicine",
    },
  });

  const navigate = useNavigate();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [formData, setformData] = useState<MedicineStockType | null>(null);
  const { mutate: submit, isPending } = useSubmitMedicineStock();
  const currentUnit = form.watch("unit");
  const qty = form.watch("qty") || 0;
  const pcs = form.watch("pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;
  const { data: medicineOptions, isLoading: isMedicinesLoading } = fetchMedicines();

  const onSubmit = (data: MedicineStockType) => {
    setformData(data);
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
        <form onSubmit={(e) => e.preventDefault()} className="bg-white p-5 w-full max-w-[700px] rounded-sm space-y-5">
          <Label className="flex justify-center text-lg font-bold text-darkBlue2 text-center ">Add Stocks</Label>
          <hr className="mb-2" />

          {/* Medicine Selection Combobox */}
          <div className="mt-2 w-full">
            <Label className="block mb-2 text-black/70">Medicine Name</Label>
            <div className="w-full">
              <Combobox
                options={medicineOptions?.formatted || []}
                value={
                  medicineOptions?.formatted?.find(
                    (option: any) => option.id.startsWith(form.watch("medicineID") + ",") // Note: comma instead of ','
                  )?.id || ""
                }
                onChange={(value) => {
                  const medId = (value ?? "").split(",")[0]; // Make sure this matches your data format
                  form.setValue("medicineID", medId || "");

                  const selectedMedicine = medicineOptions?.default.find((med: any) => med.med_id === medId);
                  if (selectedMedicine) {
                    form.setValue("category", selectedMedicine.catlist || "");
                  }
                }}
                placeholder={isMedicinesLoading ? "Loading medicines..." : "Select medicine"}
                emptyMessage="No available medicines"
                triggerClassName="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            <FormInput control={form.control} name="category" label="Category" readOnly />
            <FormDateTimeInput control={form.control} name="expiry_date" label="Expiry Date" type="date" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput control={form.control} name="qty" label={currentUnit === "boxes" ? "Number of Boxes" : "Quantity"} placeholder="Quantity" type="number" />
            <FormSelect control={form.control} name="unit" label="Unit" options={unitOptions} />
          </div>

          {currentUnit === "boxes" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput control={form.control} name="pcs" label="Pieces per Box" type="number" placeholder="Pieces per box" />
              <div className="sm:col-span-2">
                <FormItem>
                  <FormLabel className="text-black/65">Total Pieces</FormLabel>
                  <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {totalPieces.toLocaleString()} pc/s
                    <span className="ml-2 text-muted-foreground text-xs">
                      ({qty} boxes × {pcs} pc/s)
                    </span>
                  </div>
                </FormItem>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2 pt-8">
            <Button variant="outline" className="w-[150px]" onClick={() => navigate(-1)}>
              Cancel{" "}
            </Button>

            <Button className="w-[150px]" disabled={isPending} onClick={form.handleSubmit(onSubmit)}>
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

      <ConfirmationDialog
        isOpen={isAddConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Add Medicine"
        description="Are you sure you want to add this medicine item?"
      />
    </div>
  );
}

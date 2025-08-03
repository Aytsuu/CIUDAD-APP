import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Form, FormItem, FormLabel } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MedicineStocksSchema,
  MedicineStockType,
} from "@/form-schema/inventory/stocks/inventoryStocksSchema";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { Loader2 } from "lucide-react";
import { fetchMedicines } from "../REQUEST/Medicine/restful-api/MedicineFetchAPI";
import { useSubmitMedicineStock } from "../REQUEST/Medicine/restful-api/MedicineSubmit";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { formOptions, unitOptions, dosageUnitOptions } from "./options";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";

export default function AddMedicineStock() {

  const {user} =useAuth()
  const staff_id = user?.staff?.staff_id
  const form = useForm<MedicineStockType>({
    resolver: zodResolver(MedicineStocksSchema),
    defaultValues: {
      medicineID: "",
      category: "",
      dosage: undefined,
      dsgUnit: "",
      form: "",
      qty: undefined,
      unit: "boxes",
      pcs: undefined,
      expiryDate: new Date().toISOString().split("T")[0],
    },
  });

  const navigate = useNavigate();
  const medicines = fetchMedicines();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [formData, setformData] = useState<MedicineStockType | null>(null);
  const { mutate: submit, isPending } = useSubmitMedicineStock();
  const currentUnit = form.watch("unit");
  const qty = form.watch("qty") || 0;
  const pcs = form.watch("pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;

  // Watch for medicineID changes and update category
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "medicineID" && value.medicineID) {
        const selectedMedicine = medicines.find(
          (med) => med.id === value.medicineID
        );
        if (selectedMedicine) {
          form.setValue("category", selectedMedicine.category);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, medicines]);

  // Watch for unit changes and reset pcs when not boxes
  // useEffect(() => {
  //   const subscription = form.watch((value, { name }) => {
  //     if (name === "unit" && value.unit !== "boxes") {
  //       form.setValue("pcs", 0);
  //     }
  //   });
  //   return () => subscription.unsubscribe();
  // }, [form]);

  const onSubmit = (data: MedicineStockType) => {
    setformData(data);
    setIsAddConfirmationOpen(true);
  };

  const confirmAdd = async () => {
    if (!formData) return;
    setIsAddConfirmationOpen(false);
    submit({ data: formData, staff_id });
  };

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-4">
      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-white p-5 w-full max-w-[600px] rounded-sm space-y-5"
        >
          <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
            <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Add Medicine Stocks
          </Label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="medicineID"
              label="Medicine Name"
              options={medicines}
            />
            <FormInput
              control={form.control}
              name="category"
              label="Category"
              readOnly
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormDateTimeInput
              control={form.control}
              name="expiryDate"
              label="Expiry Date"
              type="date"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              control={form.control}
              name="dosage"
              label="Dosage"
              placeholder="Dsg"
              type="number"
            />
            <FormSelect
              control={form.control}
              name="dsgUnit"
              label="Dosage Unit"
              options={dosageUnitOptions}
            />
            <FormSelect
              control={form.control}
              name="form"
              label="Form"
              options={formOptions}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="qty"
              label={currentUnit === "boxes" ? "Number of Boxes" : "Quantity"}
              placeholder="Quantity"
              type="number"
            />
            <FormSelect
              control={form.control}
              name="unit"
              label="Unit"
              options={unitOptions}
            />
          </div>

          {currentUnit === "boxes" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                control={form.control}
                name="pcs"
                label="Pieces per Box"
                type="number"
                placeholder="Pieces per box"
              />
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
           
             <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
              Cancel{" "}
            </Button>
           
            <Button
              className="w-full "
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
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
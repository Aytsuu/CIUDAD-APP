import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MedicineStocksSchema,
  MedicineStockType,
} from "@/form-schema/inventory/inventoryStocksSchema";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { useCategoriesMedicine } from "../REQUEST/Category/Medcategory";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck, Loader2 } from "lucide-react";
import { fetchMedicines } from "../REQUEST/fetch";
import { submitMedicineStock } from "../REQUEST/Medicine/MedicineSubmit";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { formOptions, unitOptions, dosageUnitOptions } from "./options";

interface MedicineStocksProps {
  setIsDialog: (isOpen: boolean) => void;
}

export default function MedicineStockForm({ setIsDialog }: MedicineStocksProps) {
  UseHideScrollbar();
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

  const { categories, handleDeleteConfirmation, categoryHandleAdd } = useCategoriesMedicine();
  const medicines = fetchMedicines();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [submissionData, setSubmissionData] = useState<MedicineStockType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Watch for unit changes and reset pcs when not boxes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "unit" && value.unit !== "boxes") {
        form.setValue("pcs", 0);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (data: MedicineStockType) => {
    setIsSubmitting(true);
    
    try {
      await submitMedicineStock(data, queryClient);
      
      // Close the dialog first
      setIsDialog(false);
      
      // Use setTimeout to ensure the toast shows after dialog is fully closed
      setTimeout(() => {
        toast.success("Medicine item added successfully", {
          icon: <CircleCheck size={20} className="text-green-500" />,
          duration: 2000,
        });
      }, 100);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast.error(error.message || "Failed to add medicine item", {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: MedicineStockType) => {
    setSubmissionData(data);
    setIsAddConfirmationOpen(true);
  };

  const confirmAdd = () => {
    if (submissionData) {
      setIsAddConfirmationOpen(false);
      handleSubmit(submissionData);
    }
  };

  const currentUnit = form.watch("unit");
  const qty = form.watch("qty") || 0;
  const pcs = form.watch("pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect control={form.control} name="medicineID" label="Medicine Name" options={medicines} />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <SelectLayoutWithAdd
                      placeholder="select"
                      label="Select a Category"
                      options={categories.length > 0 ? categories : [{ id: "loading", name: "Loading..." }]}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      onAdd={(newCategoryName) => {
                        categoryHandleAdd(newCategoryName, (newId) => {
                          field.onChange(newId);
                        });
                      }}
                      onDelete={(id) => handleDeleteConfirmation(Number(id))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormDateInput control={form.control} name="expiryDate" label="Expiry Date" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput control={form.control} name="dosage" label="Dosage" placeholder="Dsg" type="number" />
            <FormSelect control={form.control} name="dsgUnit" label="Dosage Unit" options={dosageUnitOptions} />
            <FormSelect control={form.control} name="form" label="Form" options={formOptions} />
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
                    {totalPieces.toLocaleString()} pieces
                    <span className="ml-2 text-muted-foreground text-xs">
                      ({qty} boxes × {pcs} pieces/box)
                    </span>
                  </div>
                </FormItem>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]" disabled={isSubmitting}>
              {isSubmitting ? (
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
        description={`Are you sure you want to add the medicine?`}
      />
    </div>
  );
}
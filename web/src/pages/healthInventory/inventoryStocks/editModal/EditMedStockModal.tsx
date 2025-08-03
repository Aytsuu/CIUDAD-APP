import React, { useState } from "react";
import { Button } from "@/components/ui/button/button";
import {
  Form,
  FormItem,
  FormLabel,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddMedicineStocksSchema,
  addMedicineStocksType,
} from "@/form-schema/inventory/addStocksSchema";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { useQueryClient } from "@tanstack/react-query";
import { FormInput } from "@/components/ui/form/form-input";
import { toast } from "sonner";
import { CircleCheck, Loader2 } from "lucide-react";
import { updateMedicineStock } from "../REQUEST/Medicine/MedicineSubmit";

interface AddMedProps {
  initialData: {
    id: number;
    medicineInfo: {
      medicineName: string;
      dosage: number;
      dsgUnit: string;
      form: string;
    };
    expiryDate: string;
    category: string;
    qty: {
      qty: number;
      pcs: number;
    };
    minv_qty_unit: string;
    availQty: string;
    distributed: string;
    inv_id: number;
  };
  setIsDialog: (isOpen: boolean) => void;
}

export default function EditMedicineForm({
  initialData,
  setIsDialog,
}: AddMedProps) {
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [submissionData, setSubmissionData] = useState<addMedicineStocksType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<addMedicineStocksType>({
    resolver: zodResolver(AddMedicineStocksSchema),
    defaultValues: {
      minv_qty: undefined,
      minv_qty_unit: initialData.minv_qty_unit,
      minv_pcs: initialData.qty.pcs || 0,
    },
  });

  const currentUnit = form.watch("minv_qty_unit");
  const qty = form.watch("minv_qty") || 0;
  const pcs = form.watch("minv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : 0;

  const handleSubmit = async (data: addMedicineStocksType) => {
    setIsSubmitting(true);
   
    try {
      await updateMedicineStock(
        { id: initialData.id },
        data,
        queryClient,
      );

      // Close dialog first
      setIsDialog(false);
      
      // Then show success toast
      toast.success("Medicine stock updated successfully!", {
        icon: <CircleCheck size={20} className="text-green-500" />,
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Error updating medicine stock:", error);
      toast.error(error.message || "Failed to update medicine stock", {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: addMedicineStocksType) => {
    setSubmissionData(data);
    setIsAddConfirmationOpen(true);
  };

  const confirmSubmit = async () => {
    if (submissionData) {
      setIsAddConfirmationOpen(false);
      await handleSubmit(submissionData);
    }
  };

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput 
              control={form.control}
              name="minv_qty"
              label={currentUnit === "boxes" ? "Number of Boxes" : "Quantity"}
              type="number"
            />

            <FormInput
              control={form.control}
              name="minv_qty_unit"
              label="Unit"
              readOnly
            />
          </div>

          {currentUnit === "boxes" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                control={form.control}
                name="minv_pcs"
                label="Pieces per Box"
                type="number"
                placeholder="pcs"
                readOnly
              />

              <div className="sm:col-span-2">
                <FormItem>
                  <FormLabel>Total Pieces</FormLabel>
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
        onConfirm={confirmSubmit}
        title="Confirm Update"
        description="Are you sure you want to update this medicine stock? This action cannot be undone."
      />
    </div>
  );
} 
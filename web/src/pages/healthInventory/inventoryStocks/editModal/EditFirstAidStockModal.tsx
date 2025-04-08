import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Form, FormLabel } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FirstAidStocksRecord } from "../tables/FirstAidStocks";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import {
  AddFirstAidSchema,
  AddFirstAidStockType,
} from "@/form-schema/inventory/addStocksSchema";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { CircleCheck } from "lucide-react";
import { handleEditFirstAidStock } from "../REQUEST/Post/FirstAid/EditFirstAidPost";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";

interface EditFirstAidStockFormProps {
  initialData: FirstAidStocksRecord;
  setIsDialog: (isOpen: boolean) => void;
}

export default function EditFirstAidStockForm({
  initialData,
  setIsDialog,
}: EditFirstAidStockFormProps) {
  UseHideScrollbar();
  const form = useForm<AddFirstAidStockType>({
    resolver: zodResolver(AddFirstAidSchema),
    defaultValues: {
      finv_qty: 0,
      finv_qty_unit: initialData.finv_qty_unit,
      finv_pcs: initialData.qty.finv_pcs || 0,
    },
  });

  const queryClient = useQueryClient();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [submissionData, setSubmissionData] =
    useState<AddFirstAidStockType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (data: AddFirstAidStockType) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Adding first aid item...", {
      duration: Infinity,
    });
    try {
      await handleEditFirstAidStock(data, initialData.finv_id, queryClient);

      toast.success("First aid item updated successfully", {
        id: toastId,
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 3000, // Increased duration to ensure visibility
        onAutoClose: () => {
          setIsDialog(false);
        },
      });

      // Wait for toast to complete before closing dialog
      setTimeout(() => setIsDialog(false), 3000);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast.error(error.message || "Failed to update first aid item", {
        id: toastId,
        duration: 5000, // Longer duration for errors
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: AddFirstAidStockType) => {
    setSubmissionData(data);
    setIsAddConfirmationOpen(true);
  };

  const confirmAdd = () => {
    if (submissionData) {
      setIsAddConfirmationOpen(false);
      handleSubmit(submissionData);
    }
  };

  const currentUnit = form.watch("finv_qty_unit");
  const qty = form.watch("finv_qty") || 0;
  const pcs = form.watch("finv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Toaster position="top-center" richColors />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="finv_qty"
              label={currentUnit === "boxes" ? "Number of Boxes" : "Quantity"}
              type="number"
            />

            <FormSelect
              control={form.control}
              name="finv_qty_unit"
              label="Unit"
              options={[
                { id: "boxes", name: "Boxes" },
                { id: "bottles", name: "Bottles" },
                { id: "packs", name: "Packs" },
              ]}
              readOnly
            />
          </div>

          {currentUnit === "boxes" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                control={form.control}
                name="finv_pcs"
                label="Pieces per Box"
                type="number"
                placeholder="pcs"
                readOnly
              />

              <div className="sm:col-span-2">
                <FormLabel>Total Pieces</FormLabel>
                <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {totalPieces.toLocaleString()} pieces
                  <span className="ml-2 text-muted-foreground text-xs">
                    ({qty} boxes × {pcs} pieces/box)
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]" disabled={isSubmitting}>
              Save
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isAddConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Confirm Update"
        description="Are you sure you want to update this first aid stock? This action cannot be undone."
      />
    </div>
  );
}

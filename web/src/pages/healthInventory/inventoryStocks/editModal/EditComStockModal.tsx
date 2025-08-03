// EditCommodityStockForm.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddCommoditySchema,
  AddCommodityStockType,
} from "@/form-schema/inventory/addStocksSchema";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { CommodityStocksRecord } from "../tables/CommodityStocks";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { updateCommodityStock } from "../REQUEST/Post/Commodity/EditModalCommodity";

interface EditCommodityStockFormProps {
  initialData: CommodityStocksRecord;
  setIsDialog: (isOpen: boolean) => void;
}

export default function EditCommodityStockForm({initialData, setIsDialog,}: EditCommodityStockFormProps) {
  UseHideScrollbar();
  const [isConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [submissionData, setSubmissionData] =
    useState<AddCommodityStockType | null>(null);  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddCommodityStockType>({
    resolver: zodResolver(AddCommoditySchema),
    defaultValues: {
      cinv_qty: undefined,
      cinv_qty_unit: initialData.cinv_qty_unit,
      cinv_pcs: initialData.qty?.cinv_pcs || 0,
    },
  });

  
  const handleSubmit = async (data: AddCommodityStockType) => {
    setIsSubmitting(true);

    try {
      await updateCommodityStock(data, initialData, queryClient);
      toast.success("First aid item updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 3000,
        onAutoClose: () => {
          setIsDialog(false);
        },
      });

      // Wait for toast to complete before closing dialog
      setTimeout(() => setIsDialog(false), 3000);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast.error(error.message || "Failed to update first aid item", {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  
  const onSubmit = (data: AddCommodityStockType) => {
    setSubmissionData(data);
    setIsAddConfirmationOpen(true);
  };

  const confirmAdd = () => {
    if (submissionData) {
      setIsAddConfirmationOpen(false);
      setIsSubmitting(true); // Set submitting state here
      handleSubmit(submissionData);
    }
  };

  const currentUnit = form.watch("cinv_qty_unit");
  const qty = form.watch("cinv_qty") || 0;
  const pcs = form.watch("cinv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : 0;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="cinv_qty"
              label={currentUnit === "boxes" ? "Number of Boxes" : "Quantity"}
              type="number"
              placeholder="Quantity"
            />
            <FormSelect
              control={form.control}
              name="cinv_qty_unit"
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
                name="cinv_pcs"
                label="Pieces per Box"
                type="number"
                placeholder="pcs"
                readOnly
              />
              <div className="sm:col-span-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                  Total Pieces
                </label>
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
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="loader mr-2"></span> Saving...
                </span>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Confirm Update"
        description="Are you sure you want to update this commodity stock? This action cannot be undone."
      />
    </div>
  );
}

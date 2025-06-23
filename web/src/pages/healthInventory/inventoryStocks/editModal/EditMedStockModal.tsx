import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import {
  Form,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddMedicineStocksSchema,
  addMedicineStocksType,
} from "@/form-schema/inventory/stocks/RestockStocksSchema";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { useQueryClient } from "@tanstack/react-query";
import { FormInput } from "@/components/ui/form/form-input";
import { toast } from "sonner";
import { CircleCheck, Loader2 } from "lucide-react";
import { useUpdateMedicineStock } from "../REQUEST/Medicine/restful-api/MedicineSubmit";
import { Link, useNavigate } from "react-router";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";
import { MedicineStocksRecord } from "../tables/type";

export default function EditMedicineStock() {
  const location = useLocation();
  const initialData = location.state?.params
    ?.initialData as MedicineStocksRecord;
  const form = useForm<addMedicineStocksType>({
    resolver: zodResolver(AddMedicineStocksSchema),
    defaultValues: {
      minv_qty: undefined,
      minv_qty_unit: initialData.minv_qty_unit,
      minv_pcs: initialData.qty.pcs || 0,
    },
  });

  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [formData, setFormData] = useState<addMedicineStocksType | null>(null);
  const navigate = useNavigate();
  const { mutateAsync: submit, isPending } = useUpdateMedicineStock();
  const currentUnit = form.watch("minv_qty_unit");
  const qty = form.watch("minv_qty") || 0;
  const pcs = form.watch("minv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;

  const confirmAdd =  () => {
    if (!formData ) return;
    setIsAddConfirmationOpen(false);

    try {
      submit({ initialData: { id: initialData.id }, data: formData },);
      navigate("/mainInventoryStocks");
      toast.success("Medicine stock updated successfully!", {
        icon: <CircleCheck size={20} className="text-green-500" />,
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Error updating medicine stock:", error);
      toast.error(error.message || "Failed to update medicine stock", {
        duration: 5000,
      });
    }
  };

  const onSubmit = () => {
    setFormData(formData);
    setIsAddConfirmationOpen(true);
  };



  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-4">
      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-white p-5 w-full max-w-[500px] rounded-sm space-y-2"
        >
          <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
            <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Add Medicine Stocks
          </Label>
          <div className="flex flex-col gap-4 pb-8">
            <FormInput
              control={form.control}
              name="minv_qty"
              label={currentUnit === "boxes" ? "Enter Number of Boxes" : "Quantity"}
              type="number"
              placeholder="Number of Boxes or Quantity" 
            />

            <FormInput
              control={form.control}
              name="minv_qty_unit"
              label="Unit"
              
              
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
                    {totalPieces.toLocaleString()} pc/s
                    <span className="ml-2 text-muted-foreground text-xs">
                      ({qty} {currentUnit === "boxes" ? "boxe/s" : "pc/s"} ×{" "}
                      {currentUnit === "boxes" ? `${pcs} pc/s` : "1"})
                    </span>
                  </div>
                </FormItem>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2 pt-8">
            <Button variant="outline" className="w-full ">
              <Link to="/mainInventoryStocks">Cancel</Link>
            </Button>

            <Button
              type="submit"
              className="w-full"
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
        title="Confirm Update"
        description="Are you sure you want to update this medicine stock? This action cannot be undone."
      />
    </div>
  );
}

// src/components/modals/UsedFAModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { FormInput } from "@/components/ui/form/form-input";
import { FirstAidStocksRecord } from "../tables/type";
import { usedFaSchema } from "@/form-schema/inventory/stocks/inventoryStocksSchema";
import { useDeductFirstAidStock } from "../REQUEST/FirstAid/queries/FirstAidUpdateQueries";
import { Label } from "@/components/ui/label";
import { Pill, Loader2 } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { toast } from "sonner";

export default function UsedFirstAidStock() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state?.params
    ?.initialData as FirstAidStocksRecord;
  const displayUnit =
    initialData.finv_qty_unit?.toLowerCase() === "boxes"
      ? "pcs"
      : initialData.finv_qty_unit;

  const form = useForm({
    resolver: zodResolver(usedFaSchema),
    defaultValues: {
      usedItem: 0, // Set a valid default number value
    },
  });

  const [formData, setformData] = useState<z.infer<typeof usedFaSchema> | null>(
    null
  );
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const { mutate: deductFirstAidStock, isPending } = useDeductFirstAidStock();

  const onSubmit = (data: z.infer<typeof usedFaSchema>) => {
    if (data.usedItem > Number(initialData.availQty)) {
      form.setError("usedItem", {
        type: "manual",
        message: "Cannot use more items than available",
      });
      return; // Stop submission if invalid
    }
    setformData(data);
    setIsAddConfirmationOpen(true);
  };

  const confirmAdd = async () => {
    // Use the mutateAsync function from the hook
    deductFirstAidStock(
      {
        data: initialData,
        values: formData ?? { usedItem: 0 }, // Provide a fallback value if formData is null
        displayUnit: displayUnit,
      },
      {
        onSuccess: () => {
          navigate("/mainInventoryStocks");
          toast.success("Added successfully", {
            icon: <CircleCheck size={20} className="text-green-500" />,
            duration: 2000,
          });
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to Add  ", {
            duration: 2000,
          });
        },
      }
    );
  };

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-4">
      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-white p-5 w-full max-w-[500px] rounded-sm space-y-5"
        >
          <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
            <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Used Items
          </Label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-darkGray font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Commodity Name
              </label>
              <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {initialData.firstAidInfo.fa_name}
              </div>
            </div>

            {/* Commodity Category */}
            <div className="space-y-2">
              <label className="text-sm text-darkGray font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Category
              </label>
              <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {initialData.category}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-darkGray font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Available Qty
              </label>
              <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {initialData.availQty}
              </div>
            </div>

            <div>
              <FormInput
                control={form.control}
                name="usedItem"
                label={`Enter Used Items (${displayUnit})`}
                type="number"
                placeholder="Quantity"
              />

              {initialData.finv_qty_unit?.toLowerCase() === "boxes" && (
                <p className="text-sm text-muted-foreground mt-1">
                  Note: Quantities in boxes will be recorded as pieces (pcs) in
                  transactions
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2 pt-8">
            <Button variant="outline" className="w-full">
              <Link to="/mainInventoryStocks">Cancel</Link>
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

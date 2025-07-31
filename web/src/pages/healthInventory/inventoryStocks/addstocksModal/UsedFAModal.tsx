// src/components/modals/UsedFAModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { FormInput } from "@/components/ui/form/form-input";
import { FirstAidStocksRecord } from "../tables/type";
import { useQueryClient } from "@tanstack/react-query";
import { usedFaSchema } from "@/form-schema/inventory/stocks/inventoryStocksSchema";
import { useDeductFirstAidStock } from "../REQUEST/FirstAid/queries/FirstAidUpdateQueries";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";

export default function UsedFirstAidStock() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state?.params
    ?.initialData as FirstAidStocksRecord;

  // Properly call the mutation hook at the top level
  const { mutateAsync: deductFirstAidStock } = useDeductFirstAidStock();
  // Determine the display unit (convert boxes to pcs)
  const displayUnit = initialData.finv_qty_unit?.toLowerCase() === "boxes" ? "pcs" : initialData.finv_qty_unit;

  const form = useForm({
    resolver: zodResolver(usedFaSchema),
    defaultValues: {
      usedItem: 0, // Set a valid default number value
    },
  });

  const onSubmit = async (data: z.infer<typeof usedFaSchema>) => {
    try {
      // Use the mutateAsync function from the hook
      await deductFirstAidStock({
        data: initialData,
        values: data,
        displayUnit: displayUnit,
      });
        navigate("/mainInventoryStocks");
    } catch (error) {
      form.setError("usedItem", {
        type: "manual",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
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
            <Button variant="outline" className="w-full" asChild>
              <Link to="/mainInventoryStocks">Cancel</Link>
            </Button>

            <Button
              type="submit"
              className="w-full"
            >
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
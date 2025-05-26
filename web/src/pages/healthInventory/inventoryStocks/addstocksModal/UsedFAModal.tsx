// src/components/modals/UsedFAModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { FormInput } from "@/components/ui/form/form-input";
import { FirstAidStocksRecord } from "../tables/FirstAidStocks";
import { useQueryClient } from "@tanstack/react-query";
import { usedFaSchema } from "@/form-schema/inventory/EditStockSchema";
import { deductFirstAidStock } from "../REQUEST/FirstAid/UsedFaSubmit"

interface UsedFAModalProps {
  data: FirstAidStocksRecord;
  setIsDialog: (isOpen: boolean) => void;
}

export default function UsedFAModal({ data, setIsDialog }: UsedFAModalProps) {
  const queryClient = useQueryClient();

  // Determine the display unit (convert boxes to pcs)
  const displayUnit =
    data.finv_qty_unit?.toLowerCase() === "boxes" ? "pcs" : data.finv_qty_unit;

  const form = useForm({
    resolver: zodResolver(usedFaSchema),
    defaultValues: {
      usedItem: 0,
    },
  });

  const onSubmit = async (values: z.infer<typeof usedFaSchema>) => {
    try {
      await deductFirstAidStock(data, values, displayUnit);
      
      // Invalidate queries to refresh the data
      await queryClient.invalidateQueries({
        queryKey: ["firstaidinventorylist"],
      });

      setIsDialog(false);
      alert("Successfully updated stock");
    } catch (error) {
      form.setError("usedItem", {
        type: "manual",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <FormInput
            control={form.control}
            name="usedItem"
            label={`Used Items (${displayUnit})`}
            type="number"
            placeholder="Quantity"
          />
          {data.finv_qty_unit?.toLowerCase() === "boxes" && (
            <p className="text-sm text-muted-foreground mt-1">
              Note: Quantities in boxes will be recorded as pieces (pcs) in
              transactions
            </p>
          )}
        </div>

        <div className="w-full flex justify-end mt-4">
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
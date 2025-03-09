// EditCommodityStockForm.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectLayout } from "@/components/ui/select/select-layout";
import {
  CommodityStockType,
  CommodityStocksSchema,
} from "@/form-schema/inventory/inventoryStocksSchema";
import { useEffect } from "react";
import { z } from "zod";

interface EditCommodityStockFormProps {
  initialData: {
    batchNumber: string;
    commodityName: string;
    category: string;
    recevFrom: string;
    qty: string;
    availQty: string;
    expiryDate: string;
    dispensed: string;
  };
  onSave: (data: any) => void;
}

export default function EditCommodityStockForm({
  initialData,
  onSave,
}: EditCommodityStockFormProps) {
  const parseQuantity = (qtyString: string) => {
    // Enhanced parsing with better error handling
    try {
      const boxMatch = qtyString.match(/(\d+) bx\/s \((\d+) pc\/s\)/);
      if (boxMatch && boxMatch[1] && boxMatch[2]) {
        return {
          qty: parseInt(boxMatch[1]),
          pcs: parseInt(boxMatch[2]),
          unit: "boxes" as const
        };
      }
      
      const piecesMatch = qtyString.match(/(\d+)/);
      return {
        qty: piecesMatch ? parseInt(piecesMatch[0]) : 0,
        pcs: 0,
        unit: "pcs" as const
      };
    } catch (error) {
      console.error("Error parsing quantity:", error);
      return { qty: 0, pcs: 0, unit: "pcs" as const };
    }
  };

  const form = useForm<CommodityStockType>({
    resolver: zodResolver(CommodityStocksSchema),
    defaultValues: {
      commodityName: initialData.commodityName,
      category: initialData.category,
      batchNumber: initialData.batchNumber,
      recevFrom: initialData.recevFrom,
      ...parseQuantity(initialData.qty),
      expiryDate: initialData.expiryDate,
    }
  });

  useEffect(() => {
    const parsed = parseQuantity(initialData.qty);
    form.reset({
      commodityName: initialData.commodityName,
      category: initialData.category,
      batchNumber: initialData.batchNumber,
      recevFrom: initialData.recevFrom,
      ...parsed,
      expiryDate: initialData.expiryDate,
    });
  }, [initialData, form]);

  const onSubmit = async (data: CommodityStockType) => {
    try {
      // Validate against schema
      const validatedData = CommodityStocksSchema.parse(data);
      
      // Format the output
      const updatedCommodity = {
        ...initialData,
        ...validatedData,
        qty: validatedData.unit === 'boxes' 
          ? `${validatedData.qty} bx/s (${validatedData.pcs} pc/s)`
          : `${validatedData.qty} pc/s`,
        availQty: validatedData.unit === 'boxes' 
          ? `${validatedData.qty} bx/s (${validatedData.pcs} pc/s)`
          : `${validatedData.qty} pc/s`,
      };

      // Call parent save handler
      onSave(updatedCommodity);
      alert("✅ Data saved successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      if (error instanceof z.ZodError) {
        // Show first validation error
        const firstError = error.errors[0];
        alert(`Validation error: ${firstError.message}`);
      } else {
        alert("❌ Save failed. Please check the form values.");
      }
    }
  };

  const currentUnit = form.watch("unit");
  const qty = form.watch("qty") || 0;
  const pcs = form.watch("pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : 0;

  // Form options
  const commodityOptions = [
    { id: "Condom", name: "Condom" },
    { id: "pills COC", name: "Pills COC" }
  ];

  const categoryOptions = [
    { id: "Condom", name: "Condom" },
    { id: "Pills", name: "Pills" }
  ];

  const recevFromOptions = [
    { id: "DOH", name: "DOH" },
    { id: "CHD", name: "CHD" },
    { id: "OTHERS", name: "OTHERS" },
  ];

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="commodityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commodity Name</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Commodity"
                      options={commodityOptions}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Category"
                      options={categoryOptions}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="batchNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter batch number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value?.split('T')[0] || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="recevFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Received From</FormLabel>
                <FormControl>
                  <SelectLayout
                    label=""
                    className="w-full"
                    placeholder="Select Source"
                    options={recevFromOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="qty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {currentUnit === "boxes" ? "Number of Boxes" : "Quantity"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Unit"
                      options={[
                        { id: "boxes", name: "Boxes" },
                        { id: "pcs", name: "Pieces" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {currentUnit === "boxes" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="pcs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pieces per Box</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem className="sm:col-span-2">
                <FormLabel>Total Pieces</FormLabel>
                <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {totalPieces.toLocaleString()} pieces
                  <span className="ml-2 text-muted-foreground text-xs">
                    ({qty} boxes × {pcs} pieces/box)
                  </span>
                </div>
              </FormItem>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
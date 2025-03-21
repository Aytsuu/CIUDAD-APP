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
import { useEffect } from "react";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import {
  AddMedicineStocksSchema,
  addMedicineStocksType,
} from "@/form-schema/inventory/addStocksSchema";
import { addMedicineStocks } from "../request/Post";
import api from "@/pages/api/api";


interface AddMedProps{
  initialData :number;
}
export default function EditCommodityStockForm({initialData}:AddMedProps) {
  UseHideScrollbar();

  const form = useForm<addMedicineStocksType>({
    resolver: zodResolver(AddMedicineStocksSchema),
    defaultValues: {
      minv_qty: 0, // Align with schema
      minv_qty_unit: "", // Align with schema
      minv_pcs: 0, // Align with schema
    },
  });


  


  

  const onSubmit = async (data: addMedicineStocksType) => {
    try {
      // Fetch the current available quantity
      const res = await api.get(`inventory/update_medicinestocks/${initialData}/`);
      const currentStock = res.data;
      console.log(currentStock)
  
      // Compute the new available quantity
      const newMinvQtyAvail = (currentStock?.minv_qty_avail || 0) + (data.minv_qty * (data.minv_pcs || 1));
  
      // Update the stock with the new available quantity
      const updateRes = await api.put(`inventory/update_medicinestocks/${initialData}/`, {
        minv_qty: data.minv_qty,
        minv_qty_unit: data.minv_qty_unit,
        minv_pcs: data.minv_pcs,
        minv_qty_avail: newMinvQtyAvail, // Updated dynamically
        updated_at: new Date().toISOString(),
      });
  
      console.log("Stock updated successfully", updateRes.data);
    } catch (err) {
      console.error("Error updating stock:", err);
    }
  };


  

  const currentUnit = form.watch("minv_qty_unit"); // Use schema field name
  const qty = form.watch("minv_qty") || 0; // Use schema field name
  const pcs = form.watch("minv_pcs") || 0; // Use schema field name
  const totalPieces = currentUnit === "boxes" ? qty * pcs : 0;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minv_qty" // Updated to match schema
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {currentUnit === "boxes" ? "Number of Boxes" : "Quantity"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? 0 : Number(value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minv_qty_unit" // Updated to match schema
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
                        { id: "bottles", name: "Bottles" },
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {currentUnit === "boxes" && (
              <FormField
                control={form.control}
                name="minv_pcs" // Updated to match schema
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pieces per Box</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="pcs"
                        value={
                          field.value === undefined || field.value === 0
                            ? ""
                            : field.value
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? 0 : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentUnit === "boxes" && (
              <FormItem className="sm:col-span-2">
                <FormLabel>Total Pieces</FormLabel>
                <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {totalPieces.toLocaleString()} pieces
                  <span className="ml-2 text-muted-foreground text-xs">
                    ({qty} boxes × {pcs} pieces/box)
                  </span>
                </div>
              </FormItem>
            )}
          </div>

          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

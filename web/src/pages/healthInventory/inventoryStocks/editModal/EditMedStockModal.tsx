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

interface AddMedProps {
  minv_id: number;
  minv_pcs: number;
  minv_qty_unit: string;
}

export default function EditMedicineForm({ minv_id, minv_pcs, minv_qty_unit }: AddMedProps) {
  UseHideScrollbar();

  const form = useForm<addMedicineStocksType>({
    resolver: zodResolver(AddMedicineStocksSchema),
    defaultValues: {
      minv_qty: 0, // Align with schema
      minv_qty_unit: minv_qty_unit, // Set initial value from props
      minv_pcs: minv_pcs, // Set initial value from props
    },
  });

  const onSubmit = async (data: addMedicineStocksType) => {
    console.log("Form data:", data);

    try {
      const res = await api.get(`inventory/get_medicinestocks/${minv_id}/`);
      const currentStock = res.data[0];
      console.log("Current stock:", currentStock);

      const currentMinvQtyAvail = currentStock?.minv_qty_avail;
      const currentMinvQty = currentStock?.minv_qty;
      const currentMinvPcs = currentStock?.minv_pcs;
      const inv_id = currentStock?.inv_detail?.inv_id;

      if (currentMinvPcs !== data.minv_pcs) {
        form.setError("minv_pcs", {
          type: "manual",
          message: `Pieces per box must match the existing stock which is (${currentMinvPcs}).`,
        });
        return;
      }

      let newMinvQtyAvail = currentMinvQtyAvail;
      let newQty = currentMinvQty;
      if (data.minv_qty_unit === "boxes") {
        newMinvQtyAvail += data.minv_qty * data.minv_pcs;
        newQty += data.minv_qty * data.minv_pcs;
      } else {
        newMinvQtyAvail += data.minv_qty;
        newQty += data.minv_qty;
      }

      const updateRes = await api.put(`inventory/update_medicinestocks/${minv_id}/`, {
        minv_qty: newQty,
        minv_qty_unit: data.minv_qty_unit,
        minv_qty_avail: newMinvQtyAvail,
      });

      if (inv_id) {
        await api.put(`inventory/update_inventorylist/${inv_id}/`, {
          updated_at: new Date().toISOString(),
        });
      }
      console.log("Stock updated successfully:", updateRes.data);
      alert("Stock updated successfully!");
    } catch (err: any) {
      if (err.response) {
        console.error("Error Response:", err.response.status, err.response.data);
        alert(`Failed to update stock: ${err.response.data.detail || "Unknown error"}`);
      } else {
        console.error("Error:", err.message);
        alert("Network error. Please try again.");
      }
    }
  };

  useEffect(() => {
    form.reset((prevValues) => ({
      ...prevValues,
      minv_pcs: minv_pcs || 0,
    }));
  }, [minv_pcs, form]);

  const currentUnit = form.watch("minv_qty_unit");
  const qty = form.watch("minv_qty") || 0;
  const pcs = form.watch("minv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : 0;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minv_qty"
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
{/* 
            <FormField
              control={form.control}
              name="minv_qty_unit"
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
                      disabled={minv_qty_unit !== "boxes"} // Disable if not boxes
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}

<FormField
              control={form.control}
              name="minv_qty_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                  Unit
                  </FormLabel>
                  <FormControl>
                    <Input
                   
                   
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? 0 : Number(value));
                      }}
                      disabled
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
                name="minv_pcs"
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
                        disabled
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
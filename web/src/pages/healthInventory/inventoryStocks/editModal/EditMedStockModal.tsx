import React, { useState } from "react";
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
import {
  AddMedicineStocksSchema,
  addMedicineStocksType,
} from "@/form-schema/inventory/addStocksSchema";
import api from "@/pages/api/api";
import { ConfirmationDialog } from "../../confirmationLayout/ConfirmModal";
import { useQueryClient } from "@tanstack/react-query";

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
  };
}

export default function EditMedicineForm({ initialData }: AddMedProps) {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false); // State for confirmation modal
  const [formData, setFormData] = useState<addMedicineStocksType | null>(null); // Store form data for confirmation
  const queryClient = useQueryClient()

  const form = useForm<addMedicineStocksType>({
    resolver: zodResolver(AddMedicineStocksSchema),
    defaultValues: {
      minv_qty: 0,
      minv_qty_unit: initialData.minv_qty_unit,
      minv_pcs: initialData.qty.pcs,
    },
  });

  const onSubmit = async (data: addMedicineStocksType) => {
    setFormData(data);
    setIsConfirmationOpen(true);
  };

  const handleConfirm = async () => {
    if (!formData) return;
    console.log("Submitting data:", JSON.stringify(formData));

    try {
      console.log("Checking if medicine ID exists:", initialData.id);

      // Fetch the medicine list
      const res = await api.get(`inventory/medicineinventorylist/`);
      const existingMedicine = res.data.find((med: any) => med.minv_id === initialData.id);

      if (!existingMedicine) {
        alert("Medicine ID not found. Please check the ID.");
        return;
      }

      console.log("Medicine found:", existingMedicine);

      const currentMinvQtyAvail = existingMedicine.minv_qty_avail;
      const currentMinvQty = existingMedicine.minv_qty;
      const currentMinvPcs = existingMedicine.minv_pcs;
      const inv_id = existingMedicine.inv_detail?.inv_id;

      console.log("Current Minv Pcs:", currentMinvPcs);

      if (formData.minv_qty_unit === "boxes" && Number(currentMinvPcs) !== Number(formData.minv_pcs)) {
        form.setError("minv_pcs", {
          type: "manual",
          message: `Pieces per box must match the existing stock (${currentMinvPcs}).`,
        });
        return;
      }

      let newMinvQtyAvail = currentMinvQtyAvail;
      let newQty = currentMinvQty;

      if (formData.minv_qty_unit === "boxes") {
        newMinvQtyAvail += formData.minv_qty * (formData.minv_pcs || 0);
        newQty += formData.minv_qty * (formData.minv_pcs || 0);
      } else {
        newMinvQtyAvail += formData.minv_qty;
        newQty += formData.minv_qty;
      }

      const updateRes = await api.put(`inventory/update_medicinestocks/${initialData.id}/`, {
        minv_qty: newQty,
        minv_qty_avail: newMinvQtyAvail,
      });

      if (inv_id) {
        await api.put(`inventory/update_inventorylist/${inv_id}/`, {
          updated_at: new Date().toISOString(),
        });
      }

      console.log("Stock updated successfully:", updateRes.data);
      alert("Stock updated successfully!");
      queryClient.invalidateQueries({queryKey:["medicineStocks"] })


    } catch (err: any) {
      if (err.response) {
        console.error("Error Response:", err.response.status, err.response.data);
        alert(`Failed to update stock: ${err.response.data.detail || "Unknown error"}`);
      } else {
        console.error("Error:", err.message);
        alert("Network error. Please try again.");
      }
    } finally {
      setIsConfirmationOpen(false); // Close the confirmation modal
    }
  };

  const currentUnit = form.watch("minv_qty_unit");
  const qty = form.watch("minv_qty") || 0;
  const pcs = form.watch("minv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : 0;
http://localhost:5173/donation
  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
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

            <FormField
              control={form.control}
              name="minv_qty_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value}
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={handleConfirm}
        title="Confirm Update"
        description="Are you sure you want to update this medicine stock? This action cannot be undone."
      />
    </div>
  );
}
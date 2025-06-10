import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { addInventory } from "../REQUEST/Inventory";
import { getSupplies } from "../REQUEST/Get";
import { InventoryAntigenPayload } from "../REQUEST/Payload";
import { api } from "@/pages/api/api";
import {
  ImmunizationSuppliesSchema,
  ImmunizationSuppliesType,
} from "@/form-schema/inventory/inventoryStocksSchema";
import {  ImmunizationStockTransaction } from "../REQUEST/Payload";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";

export default function ImmunizationStockForm({
  setIsDialog,
}: {
  setIsDialog: (isOpen: boolean) => void;
}) {
  const [supplyOptions, setSupplyOptions] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [formData, setFormData] = useState<ImmunizationSuppliesType | null>(null);

  const form = useForm<ImmunizationSuppliesType>({
    resolver: zodResolver(ImmunizationSuppliesSchema),
    defaultValues: {
      imz_id: "",
      batch_number: "",
      imzStck_qty: undefined,
      imzStck_pcs: undefined,
      imzStck_unit: "boxes",
      expiryDate: "",
    },
  });

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        const options = await getSupplies();
        setSupplyOptions(options);
      } catch (error) {
        console.error("Error fetching supplies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSupplies();
  }, []);

  // Watch form values
  const currentUnit = form.watch("imzStck_unit");
  const qty = form.watch("imzStck_qty");
  const pcs = form.watch("imzStck_pcs");
  const totalPieces = currentUnit === "boxes" ? qty * (pcs || 0) : qty;

  const onSubmit = (data: ImmunizationSuppliesType) => {
    setFormData(data);
    setIsConfirmationOpen(true);
  };
  const handleConfirm = async () => {
    if (!formData) return;
    
    try {
      setIsSubmitting(true);
      
      // Calculate all values as individual constants
      const isBoxes = formData.imzStck_unit === "boxes";
      const imzStck_qty = isBoxes ? formData.imzStck_qty : 0;
      const imzStck_per_pcs = isBoxes ? formData.imzStck_pcs : 0;
      const imzStck_pcs = isBoxes ? formData.imzStck_qty * (formData.imzStck_pcs || 0) : formData.imzStck_qty;
      const imzStck_avail = imzStck_pcs; // Same as above
  
      // Inventory API call
      const inventoryResponse = await addInventory(formData, "Antigen");
      if (!inventoryResponse?.inv_id) {
        alert("Failed to generate inventory ID.");
        return;
      }
      const inv_id = parseInt(inventoryResponse.inv_id, 10);
  
      // Stock API call
      const stockResponse = await api.post("inventory/immunization_stock/", {
        ...formData,
        imzStck_qty,
        imzStck_per_pcs,
        imzStck_pcs,
        imzStck_avail,
        inv_id
      });
  
      if (!stockResponse.data?.imzStck_id) {
        alert("Failed to add immunization stock");
        return;
      }
  
      // Transaction API call
      const transactionResponse = await api.post(
        "inventory/imz_transaction/",
        ImmunizationStockTransaction(
          imzStck_avail,
          stockResponse.data.imzStck_id,
          formData.imzStck_unit,
          isBoxes ? imzStck_qty : undefined,
          isBoxes ? imzStck_per_pcs : undefined
        )
      );
  
      if (!transactionResponse.data?.imzt_id) {
        console.warn("Transaction created but failed to get response");
      }
  
      setIsDialog(false);
      alert("Immunization stock added successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while saving the stock");
    } finally {
      setIsSubmitting(false);
      setIsConfirmationOpen(false);
    }
  };

  return (
    <>
      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6 p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect
                  control={form.control}
                  name="imz_id"
                  label="Immunization Supply"
                  options={supplyOptions}
                />
                <FormInput
                  control={form.control}
                  name="batch_number"
                  label="Batch Number"
                  placeholder="Batch number"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  control={form.control}
                  name="imzStck_qty"
                  label={currentUnit === "boxes" ? "Number of Boxes" : "Quantity (pieces)"}
                  type="number"
                  placeholder="Quantity"
                />
                <FormSelect
                  control={form.control}
                  name="imzStck_unit"
                  label="Unit"
                  options={[
                    { id: "boxes", name: "Boxes" },
                    { id: "pcs", name: "Pieces" },
                  ]}
                />
              </div>

              {currentUnit === "boxes" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    control={form.control}
                    name="imzStck_pcs"
                    label="Pieces per Box"
                    placeholder="Pieces per box"
                    type="number"
                  />
                  <div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none">
                        Total Pieces
                      </label>
                      <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {totalPieces.toLocaleString()} pieces
                        {currentUnit === "boxes" && (
                          <span className="ml-2 text-muted-foreground text-xs">
                            ({qty} boxes × {pcs} pieces/box)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormDateTimeInput
                  control={form.control}
                  name="expiryDate"
                  label="Expiry Date"
                  type="date"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 bottom-0 bg-white pb-2">
              <Button type="submit" className="w-[120px]" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Stock"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={handleConfirm}
        title="Add Immunization Stock"
        description="Are you sure you want to add this immunization stock?"
      />
    </>
  );
}
import { useState, useCallback } from "react";
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
// Removed unused import
import { FirstAidStocksRecord } from "../tables/FirstAidStocks";
import api from "@/pages/api/api";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import {
  AddFirstAidSchema,
  AddFirstAidStockType,
} from "@/form-schema/inventory/addStocksSchema";
import {
  // Removed unused declaration
  FirstAidTransactionPayload,
} from "../REQUEST/Payload";
import { addFirstAidTransaction } from "../REQUEST/Post";
import { error } from "console";
interface EditFirstAidStockFormProps {
  initialData: FirstAidStocksRecord;
  setIsDialog: (isOpen: boolean) => void;
}

export default function EditFirstAidStockForm({
  initialData,
  setIsDialog,
}: EditFirstAidStockFormProps) {
  UseHideScrollbar();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [formData, setFormData] = useState<AddFirstAidStockType | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<AddFirstAidStockType>({
    resolver: zodResolver(AddFirstAidSchema),
    defaultValues: {
      finv_qty: initialData.qty.finv_qty,
      finv_qty_unit: initialData.finv_qty_unit,
      finv_pcs: initialData.qty.finv_pcs || 0,
    },
  });

  const onSubmit = useCallback((data: AddFirstAidStockType) => {
    setFormData(data);
    setIsConfirmationOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!formData) {
      alert("Form data is missing. Please try again.");
      return;
    }

    try {
      // 1. Fetch existing first aid inventory
      const res = await api.get(`inventory/firstaidinventorylist/`);
      const existingFirstAid = res.data.find(
        (item: any) => item.finv_id === initialData.finv_id
      );

      if (!existingFirstAid) {
        throw new Error(
          `First Aid ID ${initialData.finv_id} not found in inventory.`
        );
      }

      const currentQtyAvail = existingFirstAid.finv_qty_avail;
      let qty = existingFirstAid.finv_qty;
      const currentPcs = existingFirstAid.finv_pcs;
      const inv_id = existingFirstAid.inv_detail?.inv_id;

      // Validate pieces per box if adding boxes
      if (
        formData.finv_qty_unit === "boxes" &&
        Number(currentPcs) !== Number(formData.finv_pcs)
      ) {
        form.setError("finv_pcs", {
          type: "manual",
          message: `Pieces per box must match the existing stock (${currentPcs}).`,
        });
        return;
      }

      // Calculate new quantities
      let newQtyAvail = currentQtyAvail;
      if (formData.finv_qty_unit === "boxes") {
        qty += formData.finv_qty;
        newQtyAvail = qty * currentPcs;
      } else {
        qty += formData.finv_qty;
        newQtyAvail = qty;
      }

      const parsefinv_id = parseInt(initialData.finv_id.toString());
      if (isNaN(parsefinv_id)) {
        throw new Error(`Invalid First Aid ID: ${initialData.finv_id}`);
      }

      // 2. Update first aid stocks
      const updateResponse = await api.put(
        `inventory/update_firstaidstocks/${parsefinv_id}/`,
        {
          finv_qty: qty,
          finv_qty_avail: newQtyAvail,
        }
      );

      if (!updateResponse.data) {
        throw new Error("No data received from update_firstaidstocks endpoint");
      }

      // 3. Update inventory list if inv_id exists
      if (inv_id) {
        const inventoryUpdateResponse = await api.put(
          `inventory/update_inventorylist/${inv_id}/`,
          {
            updated_at: new Date().toISOString(),
          }
        );

        if (!inventoryUpdateResponse.data) {
          throw new Error(
            "No data received from update_inventorylist endpoint"
          );
        }
      }

      // 4. Create transaction record
      const string_qty =
        formData.finv_qty_unit === "boxes"
          ? `${formData.finv_qty} boxes (${formData.finv_pcs} pcs per box)`
          : `${formData.finv_qty} ${formData.finv_qty_unit}`;

      const action = "Added";
      const FirstAidTransactionpayload = FirstAidTransactionPayload(
        initialData.finv_id,
        string_qty,
        action
      );

      const firstAidTransactionResponse = await addFirstAidTransaction(
        FirstAidTransactionpayload
      );

      if (!firstAidTransactionResponse || firstAidTransactionResponse.error) {
        throw new Error(
          firstAidTransactionResponse?.error?.message ||
            "Failed to create transaction record"
        );
      }

      setIsDialog(false);
      alert("First Aid stock updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["firstaidinventorylist"] });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsConfirmationOpen(false);
    }
  }, [formData, initialData.finv_id, form, setIsDialog, queryClient]);

  const currentUnit = form.watch("finv_qty_unit");
  const qty = form.watch("finv_qty") || 0;
  const pcs = form.watch("finv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="finv_qty"
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
              name="finv_qty_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input value={field.value} disabled />
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
                name="finv_pcs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pieces per Box</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
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

          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]">
              Save
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={handleConfirm}
        title="Confirm Update"
        description="Are you sure you want to update this first aid stock? This action cannot be undone."
      />
    </div>
  );
}

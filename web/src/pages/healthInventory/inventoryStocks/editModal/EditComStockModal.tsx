// EditCommodityStockForm.tsx
import React, { useState, useCallback } from "react";
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
// import {
//   AddCommodityStockType,
//   CommodityStocksSchema,
// } from "@/form-schema/inventory/inventoryStocksSchema";
import {
  AddCommoditySchema,
  AddCommodityStockType,
} from "@/form-schema/inventory/addStocksSchema";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import api from "@/pages/api/api";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { CommodityStocksRecord } from "../tables/CommodityStocks";
import { CommodityTransactionPayload } from "../REQUEST/Payload";
import { addCommodityTransaction } from "../REQUEST/Post";

interface EditCommodityStockFormProps {
  initialData: CommodityStocksRecord;
  setIsDialog: (isOpen: boolean) => void;
}

export default function EditCommodityStockForm({
  initialData,
  setIsDialog,
}: EditCommodityStockFormProps) {
  UseHideScrollbar();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [formData, setFormData] = useState<AddCommodityStockType | null>(null);
  const queryClient = useQueryClient();

  const form = useForm<AddCommodityStockType>({
    resolver: zodResolver(AddCommoditySchema),
    defaultValues: {
      cinv_qty: 0,
      cinv_qty_unit: initialData.cinv_qty_unit,
      cinv_pcs: initialData.qty?.cinv_pcs || 0,
    },
  });

  const onSubmit = useCallback((data: AddCommodityStockType) => {
    setFormData(data);
    setIsConfirmationOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    console.log("Form", formData);
    if (!formData) return;

    try {
      const res = await api.get(`inventory/commodityinventorylist/`);
      const existingCommodity = res.data.find(
        (item: any) => item.cinv_id === initialData.cinv_id
      );

      if (!existingCommodity) {
        alert("Commodity ID not found. Please check the ID.");
        return;
      }

      const currentQtyAvail = existingCommodity.cinv_qty_avail;
      let qty = existingCommodity.cinv_qty;
      const currentPcs = existingCommodity.cinv_pcs;
      const inv_id = existingCommodity.inv_detail?.inv_id;

      // Validate pieces per box if adding boxes
      if (
        formData.cinv_qty_unit === "boxes" &&
        Number(currentPcs) !== Number(formData.cinv_pcs)
      ) {
        form.setError("cinv_pcs", {
          type: "manual",
          message: `Pieces per box must match the existing stock (${currentPcs}).`,
        });
        return;
      }

      let newQtyAvail = currentQtyAvail;
      console.log("cinv_qty_unit", formData.cinv_qty_unit);

      if (formData.cinv_qty_unit === "boxes") {
        qty += formData.cinv_qty;
        newQtyAvail = qty * currentPcs;
        console.log(newQtyAvail);
      } else {
        qty += formData.cinv_qty;
        newQtyAvail = qty;
      }
      console.log("NewQty", qty);

      await api.put(
        `inventory/update_commoditystocks/${initialData.cinv_id}/`,
        {
          cinv_qty: qty,
          cinv_qty_avail: newQtyAvail,
        }
      );
      

      if (inv_id) {
        await api.put(`inventory/update_inventorylist/${inv_id}/`, {
          updated_at: new Date().toISOString(),
        });
      }

      // Format the quantity string for transaction record
      const string_qty =
        formData.cinv_qty_unit === "boxes"
          ? `${formData.cinv_qty} boxes (${formData.cinv_pcs} pcs per box)`
          : `${formData.cinv_qty} ${formData.cinv_qty_unit}`;

      const action = "Added";
      const commodityTransactionPayload = CommodityTransactionPayload(
        initialData.cinv_id,
        string_qty,
        action
      );
      console.log("Com", formData);
      console.log("CInv", initialData.cinv_id);
      const commodityTransactionResponse = await addCommodityTransaction(
        commodityTransactionPayload
      );

      if (!commodityTransactionResponse || commodityTransactionResponse.error) {
        throw new Error("Failed to add Commodity inventory.");
      }

      setIsDialog(false);
      queryClient.invalidateQueries({ queryKey: ["commodityinventorylist"] });
    } catch (err: any) {
      if (err.response) {
        alert(
          `Failed to update stock: ${
            err.response.data.detail || "Unknown error"
          }`
        );
        console.error(err.response);
      } else {
        alert("Network error. Please try again.");
      }
    } finally {
      setIsConfirmationOpen(false);
    }
  }, [formData, initialData.cinv_id, form, setIsDialog, queryClient]);

  const currentUnit = form.watch("cinv_qty_unit");
  const qty = form.watch("cinv_qty") || 0;
  const pcs = form.watch("cinv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : 0;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="cinv_qty"
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
              name="cinv_qty_unit"
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
                name="cinv_pcs"
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
        description="Are you sure you want to update this commodity stock? This action cannot be undone."
      />
    </div>
  );
}

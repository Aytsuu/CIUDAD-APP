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
import { z } from "zod";
import { useEffect, useState } from "react";
import { addInventory } from "../REQUEST/Post";
import { getSupplies } from "../REQUEST/Get";
import { InventoryAntigenPayload } from "../REQUEST/Payload";
import api from "@/pages/api/api";
import { VaccineTransactionPayload } from "../REQUEST/Payload";
import {
  ImmunizationSuppliesSchema,
  ImmunizationSuppliesType,
} from "@/form-schema/inventory/inventoryStocksSchema";

export interface ImmunizationTransactionPayload {
  imzt_qty: number;
  imzt_type: string;
  imzt_action: string;
  staff: number; // You might want to get this from user session
  imzStck_id: number;
}

export default function ImmunizationStockForm({
  setIsDialog,
}: {
  setIsDialog: (isOpen: boolean) => void;
}) {
  const [supplyOptions, setSupplyOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ImmunizationSuppliesType>({
    resolver: zodResolver(ImmunizationSuppliesSchema),
    defaultValues: {
      imz_id: "",
      batch_number: "",
      imzStck_qty: 0,
      imzStck_pcs: 0,
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
  const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;

  // Updated onSubmit function in your component
  const onSubmit = async (data: ImmunizationSuppliesType) => {
    try {
      setIsSubmitting(true);

      // Validate quantities
      if (data.imzStck_qty <= 0) {
        form.setError("imzStck_qty", {
          type: "manual",
          message: "Quantity must be greater than 0",
        });
        return;
      }

      if (currentUnit === "boxes" && data.imzStck_pcs <= 0) {
        form.setError("imzStck_pcs", {
          type: "manual",
          message: "Pieces per box must be greater than 0",
        });
        return;
      }

      // Convert imz_id to number
      const imz_id = Number(data.imz_id);
      if (isNaN(imz_id)) {
        form.setError("imz_id", {
          type: "manual",
          message: "Invalid immunization supply selection",
        });
        return;
      }

      // 1. First create inventory record
      const inventoryResponse = await addInventory(
        InventoryAntigenPayload(data)
      );

      if (!inventoryResponse?.inv_id) {
        alert("Failed to generate inventory ID.");
        return;
      }
      const inv_id = parseInt(inventoryResponse.inv_id, 10);

      // 2. Prepare and submit immunization stock data
      const imzStck_avail =
        currentUnit === "boxes"
          ? data.imzStck_qty * data.imzStck_pcs
          : data.imzStck_qty;

      const stockPayload = {
        imz_id,
        inv_id,
        batch_number: data.batch_number,
        imzStck_unit: data.imzStck_unit,
        imzStck_qty: data.imzStck_qty,
        imzStck_pcs: data.imzStck_pcs ,
        imzStck_used: 0,
        imzStck_avail,
        expiryDate: data.expiryDate,
      };

      const stockResponse = await api.post(
        "inventory/immunization_stock/",
        stockPayload
      );

      if (!stockResponse.data?.imzStck_id) {
        alert("Failed to add immunization stock");
        return;
      }

      // 3. Create transaction record
      const transactionPayload = {
        imzt_qty: imzStck_avail , // Total pieces added
        imzt_type: "inventory", // or "stock" depending on your needs
        imzt_action: "add", // or "create" depending on your needs
        staff: 1, // Replace with actual staff ID from your auth system
        imzStck_id: stockResponse.data.imzStck_id,
      };

      const transactionResponse = await api.post(
        "inventory/imz_transaction/",
        transactionPayload
      );

      if (!transactionResponse.data?.imzt_id) {
        console.warn("Transaction created but failed to get response");
        // Continue anyway since the main operation succeeded
      }

      form.reset();
      setIsDialog(false);
      alert("Immunization stock added successfully!");
    } catch (error) {
      console.error("Error:", error);
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="imz_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Immunization Supply</FormLabel>
                    <FormControl>
                      {loading ? (
                        <Input placeholder="Loading supplies..." disabled />
                      ) : (
                        <SelectLayout
                          label=""
                          className="w-full"
                          placeholder="Select Supply"
                          options={supplyOptions}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="batch_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Batch number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="imzStck_qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {currentUnit === "boxes"
                        ? "Number of Boxes"
                        : "Quantity (pieces)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? 0 : parseInt(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imzStck_unit"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="imzStck_pcs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pieces per Box</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? 0 : parseInt(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Total Pieces</FormLabel>
                    <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {totalPieces.toLocaleString()} pieces
                      {currentUnit === "boxes" && (
                        <span className="ml-2 text-muted-foreground text-xs">
                          ({qty} boxes × {pcs} pieces/box)
                        </span>
                      )}
                    </div>
                  </FormItem>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Stock"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

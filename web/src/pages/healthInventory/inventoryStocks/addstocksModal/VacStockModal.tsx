// VaccineStockForm.tsx
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
  VaccineStockType,
  VaccineStocksSchema,
} from "@/form-schema/inventory/inventoryStocksSchema";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import { useEffect, useState } from "react";
import { getVaccine } from "../REQUEST/Get";
import { addVaccineStock } from "../REQUEST/Post";
import { VaccineTransactionPayload } from "../REQUEST/Payload";
import { AntigenTransaction } from "../REQUEST/Post";
import { InventoryAntigenPayload } from "../REQUEST/Payload";
import { addInventory } from "../REQUEST/Post";

export default function VaccineStockForm() {
  UseHideScrollbar();
  const [vaccineOptions, setVaccineOptions] = useState<
    { id: string; name: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<VaccineStockType>({
    resolver: zodResolver(VaccineStocksSchema),
    defaultValues: {
      vac_id: "",
      batchNumber: "",
      volume: undefined,
      qty: 0,
      dose_ml: 0,
      expiryDate: "",
      solvent: "doses",
    },
  });

  useEffect(() => {
    const fetchVaccines = async () => {
      try {
        const options = await getVaccine();
        setVaccineOptions(options);
      } catch (error) {
        console.error("Error fetching vaccines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVaccines();
  }, []);

  // Watch form values
  const solvent = form.watch("solvent");
  const vialBoxCount = form.watch("qty") || 0;
  const dosesPcsCount = form.watch("dose_ml") || 0;

  const onSubmit = async (data: VaccineStockType) => {
    console.log("Submitting:", data);
    try {
      setIsSubmitting(true);
      const validatedData = VaccineStocksSchema.parse(data);

      // First create inventory record
      const inventoryResponse = await addInventory(
        InventoryAntigenPayload(data)
      );

      if (!inventoryResponse?.inv_id) {
        throw new Error("Failed to generate inventory ID.");
      }
      const inv_id = parseInt(inventoryResponse.inv_id, 10);

      // Convert vac_id to number
      const vac_id = Number(validatedData.vac_id);
      if (isNaN(vac_id)) {
        alert("Invalid vaccine selection");
        return;
      }

      // Then add the stock using the inventory ID we just created
      const addedStock = await addVaccineStock(validatedData, vac_id, inv_id);

      if (!addedStock || !addedStock.vacStck_id) {
        throw new Error("Failed to get the new stock ID");
      }

      // Then create the transaction record using the new stock's ID
      const transactionData = VaccineTransactionPayload(
        addedStock.vacStck_id, // Use the newly created stock's ID
        validatedData.qty.toString(),
        "Added",
        validatedData.solvent,
        validatedData.dose_ml
      );

      await AntigenTransaction(transactionData);

      form.reset();
      alert("Vaccine stock added successfully!");
    } catch (error) {
      console.error("Full error:", error);
      const errorMessage =
        (error as any)?.response?.data?.error ||
        (error as any)?.response?.data?.details ||
        "Failed to add vaccine stock";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vac_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaccine Name</FormLabel>
                    <FormControl>
                      {loading ? (
                        <Input placeholder="Loading vaccines..." disabled />
                      ) : (
                        <SelectLayout
                          label=""
                          className="w-full"
                          placeholder="Select Vaccine"
                          options={vaccineOptions}
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
                name="batchNumber"
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
                name="solvent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Solvent Type</FormLabel>
                    <FormControl>
                      <SelectLayout
                        label=""
                        className="w-full"
                        placeholder="Select Solvent Type"
                        options={[
                          { id: "diluent", name: "Diluent" },
                          { id: "doses", name: "Doses" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {solvent === "diluent" && (
                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage (ml)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? undefined : Number(value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {solvent === "doses"
                        ? "Number of Vials"
                        : "Number of Containers"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : Number(value)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {solvent === "doses" && (
                <FormField
                  control={form.control}
                  name="dose_ml"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doses per Vial</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? undefined : Number(value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
  );
}

// VaccineStockForm.tsx
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { VaccineStockType, VaccineStocksSchema } from "@/form-schema/inventory/inventoryStocksSchema";

export default function VaccineStockForm() {
  const form = useForm<VaccineStockType>({
    resolver: zodResolver(VaccineStocksSchema),
    defaultValues: {
      antigen: "",
      batchNumber: "",
      volume: 0,
      vialBoxCount: 0,
      dosesPcsCount: 0,
      expiryDate: "",
      category: ""
    },
  });

  // Watch form values
  const category = form.watch("category");
  const vialBoxCount = form.watch("vialBoxCount") || 0;
  const dosesPcsCount = form.watch("dosesPcsCount") || 0;
  const totalUnits = vialBoxCount * dosesPcsCount;

  // Conditional labels based on category
  const quantityUnit = category === "medsupplies" ? "pcs" : "doses";
  const containerLabel = category === "medsupplies" ? "Box" : "Vial";
  const perContainerLabel = category === "medsupplies" ? "Pieces per Box" : "Doses per Vial";

  const onSubmit = async (data: VaccineStockType) => {
    try {
      const validatedData = VaccineStocksSchema.parse(data);
      console.log("Form submitted", validatedData);
      form.reset();
      alert("Stock added successfully!");
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Submission failed. Please check the form for errors.");
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
                name="antigen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <SelectLayout
                        label=""
                        className="w-full"
                        placeholder="Select Item"
                        options={[
                          { id: "covaxin", name: "Covaxin" },
                          { id: "moderna", name: "Moderna" },
                        ]}
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <SelectLayout
                        label=""
                        className="w-full"
                        placeholder="Select Category"
                        options={[
                          { id: "vaccine", name: "Vaccine" },
                          { id: "medsupplies", name: "Medical Supplies" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {category !== "medsupplies" && (
                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume per Dose (ml)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? undefined : Number(value));
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
                name="vialBoxCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{`Number of ${containerLabel}s`}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? undefined : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dosesPcsCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{perContainerLabel}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? undefined : Number(value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>{`Total ${quantityUnit}`}</FormLabel>
              <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                {totalUnits.toLocaleString()} {quantityUnit}
                <span className="ml-2 text-muted-foreground text-xs">
                  ({vialBoxCount} {containerLabel.toLowerCase()}s × {dosesPcsCount} {quantityUnit}/{containerLabel.toLowerCase()})
                </span>
              </div>
            </FormItem>

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

          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]">
              Save Stock
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
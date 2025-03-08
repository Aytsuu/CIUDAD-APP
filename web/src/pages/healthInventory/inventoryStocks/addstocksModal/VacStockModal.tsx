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

export default function VaccineStockForm() {
  const form = useForm<VaccineStockType>({
    resolver: zodResolver(VaccineStocksSchema),
    defaultValues: {
      vaccineName: "",
      batchNumber: "",
      volume: 0,
      vialCount: 0,
      dosesCount: 0,
      expiryDate: "",
    },
  });

  // Watch vial and dose counts for real-time calculation
  const vialCount = form.watch("vialCount") || 0;
  const dosesCount = form.watch("dosesCount") || 0;
  const totalDoses = vialCount * dosesCount;

  const onSubmit = async (data: VaccineStockType) => {
    try {
      const validatedData = VaccineStocksSchema.parse(data);
      console.log("Form submitted", validatedData);
      form.reset();
      alert("Vaccine stock added successfully!");
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Submission failed. Please check the form for errors.");
    }
  };

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Form Content */}
          <div className="space-y-6 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vaccine Name */}
              <FormField
                control={form.control}
                name="vaccineName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaccine Name</FormLabel>
                    <FormControl>
                      <SelectLayout
                        label=""
                        className="w-full"
                        placeholder="Select Vaccine"
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

              {/* Batch Number */}
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
              {/* Volume */}
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vial Count */}
              <FormField
                control={form.control}
                name="vialCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Vials</FormLabel>
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

              {/* Doses per Vial */}
              <FormField
                control={form.control}
                name="dosesCount"
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
            </div>

            <div>
              {/* Total Doses Display */}
              <FormItem>
                <FormLabel>Total Doses</FormLabel>
                <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {totalDoses.toLocaleString()} doses
                </div>
              </FormItem>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Expiry Date */}
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

          {/* Sticky Submit Button */}
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
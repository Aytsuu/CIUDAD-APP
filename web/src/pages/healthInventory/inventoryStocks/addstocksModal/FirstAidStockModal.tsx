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
  FirstAidStockSchema,
  FirstAidStockType,
} from "@/form-schema/inventory/inventoryStocksSchema";

export default function FirstAidStockForm() {
  const form = useForm<FirstAidStockType>({
    resolver: zodResolver(FirstAidStockSchema),
    defaultValues: {
      itemName: "",
      category: "",
      qty: 0,
      expiryDate:""
    },
  });

  const onSubmit = async (data: FirstAidStockType) => {
    try {
      const validatedData = FirstAidStockSchema.parse(data);
      console.log("Form submitted", validatedData);
      form.reset();
      alert("First Aid stock added successfully!");
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
              {/* Item Name Dropdown */}
              <FormField
                control={form.control}
                name="itemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <SelectLayout
                        label=""
                        className="w-full"
                        placeholder="Select Item"
                        options={[
                          { id: "bandage", name: "Bandage" },
                          { id: "antiseptic", name: "Antiseptic" },
                          { id: "gloves", name: "Gloves" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category Dropdown */}
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
                          { id: "consumables", name: "Consumables" },
                          { id: "equipment", name: "Equipment" },
                          { id: "medications", name: "Medications" },
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Quantity Input */}
              <FormField
                control={form.control}
                name="qty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Quantity" 
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
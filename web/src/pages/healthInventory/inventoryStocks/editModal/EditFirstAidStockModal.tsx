  import { useEffect } from "react";
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

  interface EditFirstAidStockFormProps {
    initialData: {
      batchNumber: string;
      itemName: string;
      category: string;
      qty: number;
      expiryDate: string;
      availQty: number;
      usedItem: number;
    };
    onSave: (data: FirstAidStockType & { 
      availQty: number; 
      usedItem: number 
    }) => void;
  }

  export default function EditFirstAidStockForm({ 
    initialData,
    onSave 
  }: EditFirstAidStockFormProps) {
    const itemOptions = [
      { id: "Sterile Gauze Pads", name: "Sterile Gauze Pads" },
      { id: "Adhesive Bandages", name: "Adhesive Bandages" },
      { id: "Antiseptic Solution", name: "Antiseptic Solution" },
    ];

    const categoryOptions = [
      { id: "Dressings", name: "Dressings" },
      { id: "Wound Care", name: "Wound Care" },
      { id: "Cleaning Supplies", name: "Cleaning Supplies" },
    ];

    const form = useForm<FirstAidStockType>({
      resolver: zodResolver(FirstAidStockSchema),
      defaultValues: {
        batchNumber: initialData.batchNumber,
        itemName: initialData.itemName,
        category: initialData.category,
        qty: initialData.qty,
        expiryDate: initialData.expiryDate
      }
    });

    useEffect(() => {
      form.reset({
        batchNumber: initialData.batchNumber,
        itemName: initialData.itemName,
        category: initialData.category,
        qty: initialData.qty,
        expiryDate: initialData.expiryDate
      });
    }, [initialData, form]);

    const onSubmit = async (data: FirstAidStockType) => {
      try {
        const validatedData = FirstAidStockSchema.parse(data);
        
        const updatedData = {
          ...validatedData,
          availQty: initialData.availQty,
          usedItem: initialData.usedItem,
        };
        
        onSave(updatedData);
        alert("First Aid stock updated successfully!");
      } catch (error) {
        console.error("Form submission error:", error);
        alert("Update failed. Please check the form for errors.");
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
                  name="batchNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Batch Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoFocus={true}  // Add this line
                          placeholder="Enter batch number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          options={itemOptions}
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
                          options={categoryOptions}
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
                  name="qty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Quantity"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          value={field.value ? field.value.split('T')[0] : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
              <Button type="submit" className="w-[120px]">
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }
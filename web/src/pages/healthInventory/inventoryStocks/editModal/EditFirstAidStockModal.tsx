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
import { fetchFirstAid } from "../REQUEST/fetch";
import { useCategoriesFirstAid } from "../request/Category/FirstAidCategory";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";

interface EditFirstAidStockFormProps {
  initialData: {
    id: number;
    itemName: string;
    category: string;
    qty: number;
    expiryDate: string;
    availQty: number;
    usedItem: number;
  };
}

export default function EditFirstAidStockForm({
  initialData,
}: // onSave
EditFirstAidStockFormProps) {
  const itemOptions = [
    { id: "Sterile Gauze Pads", name: "Sterile Gauze Pads" },
    { id: "Adhesive Bandages", name: "Adhesive Bandages" },
    { id: "Antiseptic Solution", name: "Antiseptic Solution" },
  ];



  const form = useForm<FirstAidStockType>({
    resolver: zodResolver(FirstAidStockSchema),
    defaultValues: {
      // id: initialData.id,
      itemName: initialData.itemName,
      category: initialData.category,
      qty: initialData.qty,
      expiryDate: initialData.expiryDate,
    },
  });

  useEffect(() => {
    form.reset({
      // id: initialData.id,
      itemName: initialData.itemName,
      category: initialData.category,
      qty: initialData.qty,
      expiryDate: initialData.expiryDate,
    });
  }, [initialData, form]);

  const {
    categories,
    handleDeleteConfirmation,
    categoryHandleAdd,
    ConfirmationDialogs,
  } = useCategoriesFirstAid();
  const firstAid = fetchFirstAid();

  const onSubmit = async (data: FirstAidStockType) => {
    console.log("submitted data:", data);
    alert("First Aid stock updated successfully!");
  };

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        options={firstAid}
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
                      {/* Category Dropdown with Add/Delete */}
                      <SelectLayoutWithAdd
                        placeholder="select"
                        label="Select a Category"
                        options={categories}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        onAdd={(newCategoryName) => {
                          categoryHandleAdd(newCategoryName, (newId) => {
                            field.onChange(newId); // Update the form value with the new category ID
                          });
                        }}
                        onDelete={(id) => handleDeleteConfirmation(Number(id))}
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
                        min={0}
                        placeholder="Enter quantity"
                        value={field.value || ""} // Handle undefined and 0
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
                        value={field.value ? field.value.split("T")[0] : ""}
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
      {ConfirmationDialogs()}
    </div>
  );
}

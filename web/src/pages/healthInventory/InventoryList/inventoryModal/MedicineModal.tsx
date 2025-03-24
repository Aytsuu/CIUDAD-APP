import React, { useState } from "react";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
  FormLabel,
  Form,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import {
  MedicineType,
  MedicineListSchema,
} from "@/form-schema/inventory/inventoryListSchema";
import { Input } from "@/components/ui/input";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button/button";

interface Option {
  id: string;
  name: string;
}

// Initial options for the "Category" dropdown
const initialCategories: Option[] = [
  { id: "tablet", name: "Tablet" },
  { id: "syrup", name: "Syrup" },
  { id: "injection", name: "Injection" },
];

export default function MedicineModal() {
  const form = useForm<MedicineType>({
    resolver: zodResolver(MedicineListSchema),
    defaultValues: {
      medicineName: "",
      category: "",
    },
  }); 

  const [categories, setCategories] = useState<Option[]>(initialCategories);

  // Fixed: Removed unused categories parameter
  const handleSelectChange = (
    selectedValue: string,
    fieldOnChange: (value: string) => void,
    setCategories: React.Dispatch<React.SetStateAction<Option[]>>
  ) => {
    setCategories((prev) =>
      prev.some((opt) => opt.id === selectedValue)
        ? prev
        : [...prev, { id: selectedValue, name: selectedValue }]
    );
    fieldOnChange(selectedValue);
  };

  const onSubmit = (data: MedicineType) => {
    console.log(data);
    // Handle form submission
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Medicine Name Field */}
        <div className="flex flex-col gap-3">
        <FormField
            control={form.control}
            name="medicineName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicine Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={String(field.value)}
                    placeholder="Medicine Name"
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category Field with Dynamic Addition */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <SelectLayoutWithAdd
                    className="w-full"
                    label="Category"
                    placeholder="Select"
                    options={categories}
                    value={field.value}
                    onChange={(selectedValue) =>
                      handleSelectChange(
                        selectedValue,
                        field.onChange,
                        setCategories // Removed categories parameter from call
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /></div> 


          <div className="w-full flex justify-end mt-8">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
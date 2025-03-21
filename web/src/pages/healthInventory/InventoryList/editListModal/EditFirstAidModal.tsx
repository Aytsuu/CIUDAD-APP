import React, { useEffect, useState } from "react";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
  FormLabel,
  Form,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { Button } from "@/components/ui/button";
import {
  FirstAidType,
  FirstAidSchema,
} from "@/form-schema/inventory/inventoryListSchema";

interface FirstAidListProps {
  initialData: {
    id: number;
    itemName: string;
    category: string;
  };
}

interface Option {
  id: string;
  name: string;
}

const initialCategories: Option[] = [
  { id: "Wound Care", name: "Wound Care" },
  { id: "Syrup", name: "Syrup" },
  { id: "Disinfectant", name: "Disinfectant" },
];

export default function EditFirstAidModal({ initialData }: FirstAidListProps) {
  

  const form = useForm<FirstAidType>({
    resolver: zodResolver(FirstAidSchema),
    defaultValues: {
      itemName: initialData.itemName,
      category: initialData.category,
    },
  });

  const [categories, setCategories] = useState<Option[]>(initialCategories);
  const handleSelectChange = (
    selectedValue: string,
    fieldOnChange: (value: string) => void
  ) => {
    console.log("Selected Value:", selectedValue);
    setCategories((prev) =>
      prev.some((opt) => opt.id === selectedValue)
        ? prev
        : [...prev, { id: selectedValue, name: selectedValue }]
    );
    fieldOnChange(selectedValue);
  };

  useEffect(() => {
    form.reset({
      itemName: initialData.itemName,
      category: initialData.category,
    });
  }, [initialData, form]);

  const onSubmit = async (data: FirstAidType) => {
    console.log(data);
    alert("success");
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={field.value}
                      placeholder="Item Name"
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => {
                const selectedCategoryId = categories.find(
                  (opt) => opt.name === field.value
                )?.id;
                return (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <SelectLayoutWithAdd
                        className="w-full"
                        label="Category"
                        placeholder="Select"
                        options={categories}
                        value={selectedCategoryId || field.value}
                        onChange={(selectedValue) =>
                          handleSelectChange(selectedValue, field.onChange)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <div className="w-full flex justify-end mt-8">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

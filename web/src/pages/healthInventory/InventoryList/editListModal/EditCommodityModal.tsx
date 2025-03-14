import React, { useEffect, useState } from "react";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
  FormLabel,
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  CommodityType,
  CommodityListSchema, 
} from "@/form-schema/inventory/inventoryListSchema";
import { Input } from "@/components/ui/input";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";


interface CommodityListProps {
  initialData: {
    id: number;
    commodityName: string;
    category: string;
  };
}
interface Option {
  id: string;
  name: string;
}

const initialCategories: Option[] = [
  { id: "Pharmaceutical", name: "Pharmaceutical" },
  { id: "Antibiotic", name: "Antibiotic" },
];

export default function EditCommodityModal({
  initialData,
}: CommodityListProps) {

  const form = useForm<CommodityType>({
    resolver: zodResolver(CommodityListSchema),
    defaultValues: {
      commodityName: initialData.commodityName,
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
      commodityName: initialData.commodityName,
      category: initialData.category,
    });
  }, [initialData, form]); // Add 

  const onSubmit = async (data: CommodityType) => {
    console.log(data);
    alert("success");
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3">
            {/* Commodity Name Field */}
            <FormField
              control={form.control}
              name="commodityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commodity Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={String(field.value)}
                      placeholder="Commodity Name"
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

            <div className="w-full flex justify-end mt-8">
              <Button type="submit">Submit</Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

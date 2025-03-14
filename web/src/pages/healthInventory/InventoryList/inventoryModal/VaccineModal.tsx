import React from "react";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
  FormLabel,
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button";
import {
  VaccineListSchema,
  VacccineType,
} from "@/form-schema/inventory/inventoryListSchema"; // Adjust the import path as needed
import { useState } from "react";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";

interface Option {
  id: string;
  name: string;
}

// Initial options for the "Category" dropdown
const initialCategories: Option[] = [
  { id: "vaccine", name: "vaccine" },
  { id: "MedicalSupplies", name: "MedicalSupplies" },
];

export default function VaccinationModal() {
  const form = useForm<VacccineType>({
    resolver: zodResolver(VaccineListSchema),
    defaultValues: {
      vaccineName: "",
      category: "",
      interval: 0,
      timeUnits: "",
      noOfDoses: 0,
      ageGroup: "",
      specifyAge: "",
    },
  });


  const timeUnits= [
    { id: "years", name: "Years" },
    { id: "months", name: "Months" },
    { id: "weeks", name: "Weeks" },
  ]
  const [categories, setCategories] = useState<Option[]>(initialCategories);

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

  const onSubmit = (data: VacccineType) => {
    console.log(data);
    alert("success")
  };

  const selectedAgeGroup = form.watch("ageGroup"); // Watch the selected age group

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full ">
            {/* Header content if needed */}
          </div>

          {/* Main Form Content */}
          <div className="space-y-6 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Vaccine Name Field */}
              <FormField
                control={form.control}
                name="vaccineName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaccine Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Vaccine Name"
                        {...field}
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
                            setCategories
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Interval and Time Units */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Interval"
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

              <FormField
                control={form.control}
                name="timeUnits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Units</FormLabel>
                    <FormControl>
                      <SelectLayout
                        className="w-full"
                        label="Time Units"
                        placeholder="Select"
                        options={timeUnits}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Age Group Field */}
            <FormField
              control={form.control}
              name="ageGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Group</FormLabel>
                  <FormControl>
                    <SelectLayout
                      className="w-full"
                      label="Age Group"
                      placeholder="Select"
                      options={[
                        { id: "0-5", name: "0-5 yrs old" },
                        { id: "9-15", name: "9-15 yrs old" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Specify Age Fields */}
            {selectedAgeGroup === "0-5" && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <FormField
                  control={form.control}
                  name="specifyAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specify Age</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Number of Doses */}
            <FormField
              control={form.control}
              name="noOfDoses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Dose/s</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Number of Doses"
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

          {/* Fixed Submit Button */}
          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]">
              Save
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
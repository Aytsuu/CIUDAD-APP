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
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button";
import {
  VaccineSchema,
  VaccineType,
} from "@/form-schema/inventory/inventoryListSchema";
import { Label } from "@/components/ui/label";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";

interface VaccineListProps {
  initialData: {
    id: number;
    category: string;
    vaccineName: string;
    ageGroup: string;
    noOfDoses: number;
    interval: {
      interval: number;
      timeUnits: string;
    };
    specifyAge: string;
  };
}

interface Option {
  id: string;
  name: string;
}

// Initial options for the "Category" dropdown
const initialCategories: Option[] = [
  { id: "MedicalSupplies", name: "MedicalSupplies" },
  { id: "vaccine", name: "vaccine" },
];

export default function EditVaccineListModal({
  initialData,
}: VaccineListProps) {



  const form = useForm<VaccineType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: {
      vaccineName: initialData.vaccineName,
      category: initialData.category,
      noOfDoses: initialData.noOfDoses,
      ageGroup: initialData.ageGroup,
      interval: initialData.interval.interval,
      timeUnits: initialData.interval.timeUnits,
      specifyAge: initialData.specifyAge,
    },
  });

  const timeUnits = [
    { id: "Years", name: "Years" },
    { id: "Months", name: "Months" },
    { id: "Weeks", name: "Weeks" },
  ];
  const ageGroup = [
    { id: "0-5 yrs old", name: "0-5 yrs old" },
    { id: "9-15 yrs old", name: "9-15 yrs old" },
  ];

  const [categories, setCategories] = useState<Option[]>(initialCategories);
  const handleSelectChange = (
    selectedValue: string,
    fieldOnChange: (value: string) => void
  ) => {
    setCategories((prev) =>
      prev.some((opt) => opt.id === selectedValue)
        ? prev
        : [...prev, { id: selectedValue, name: selectedValue }]
    );
    fieldOnChange(selectedValue);
  };

  const onSubmit = async (data: VaccineType) => {
    console.log(data);
    alert("Success");
  };

  const selectedAgeGroup = form.watch("ageGroup"); // Watch the selected age group

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full">
            {/* Header content if needed */}
          </div>

          {/* Main Form Content */}
          <div className="space-y-6 p-2">
            {/* Vaccine Name Field */}
            <FormField
              control={form.control}
              name="vaccineName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vaccine Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Vaccine Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Field */}
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
                        handleSelectChange(selectedValue, field.onChange)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        value={
                          field.value === undefined || field.value === null
                            ? ""
                            : field.value
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? null : Number(value));
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
                      options={ageGroup}
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
                      value={
                        field.value === undefined || field.value === null
                          ? ""
                          : field.value
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value === "" ? null : Number(value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
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

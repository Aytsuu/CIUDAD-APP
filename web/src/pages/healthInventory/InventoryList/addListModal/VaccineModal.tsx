import React, { useState } from "react";
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
import { VaccineListSchema, VacccineType } from "@/form-schema/inventory/inventoryListSchema";
import { Checkbox } from "@/components/ui/checkbox";

export default function VaccinationModal() {
  const form = useForm<VacccineType>({
    resolver: zodResolver(VaccineListSchema),
    defaultValues: {
      vaccineName: "",
      intervals: [],
      timeUnits: [],
      noOfDoses: 0,
      ageGroup: "",
      specifyAge: "",
      administeredOnce: false,
    },
  });

  const timeUnits = [
    { id: "years", name: "Years" },
    { id: "months", name: "Months" },
    { id: "weeks", name: "Weeks" },
  ];

  const [numberOfDoses, setNumberOfDoses] = useState(0);
  const administeredOnce = form.watch("administeredOnce");

  const onSubmit = (data: VacccineType) => {
    console.log(data);
    alert("success");
  };

  const selectedAgeGroup = form.watch("ageGroup");

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full">
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
            </div>

            {/* Number of Doses and Administered Only Once Checkbox */}
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Number of Doses */}
              <FormField
                control={form.control}
                name="noOfDoses"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Required Dose/s</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Number of Doses"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numDoses = value === "" ? 0 : Number(value);
                          field.onChange(numDoses);
                          setNumberOfDoses(numDoses);
                        }}
                        disabled={administeredOnce}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Administered Only Once Checkbox */}
              <FormField
                control={form.control}
                name="administeredOnce"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 mt-8">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            form.setValue("noOfDoses", 1);
                            setNumberOfDoses(1);
                          } else {
                            form.setValue("noOfDoses", 0);
                            setNumberOfDoses(0);
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel>Administered Only Once</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dynamically Render Dose Fields */}
            {!administeredOnce &&
              Array.from({ length: numberOfDoses }).map((_, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dose Label */}
                  <div className="col-span-full">
                    <h3 className="text-lg font-semibold">
                      {index + 1}
                      {index === 0
                        ? "st"
                        : index === 1
                        ? "nd"
                        : index === 2
                        ? "rd"
                        : "th"}{" "}
                      Dose
                    </h3>
                  </div>

                  {/* Interval Field */}
                  <FormField
                    control={form.control}
                    name={`intervals.${index}`}
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
                              field.onChange(value === "" ? undefined : Number(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Time Units Field */}
                  <FormField
                    control={form.control}
                    name={`timeUnits.${index}`}
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
              ))}

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
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Button } from "@/components/ui/button";
import { VaccineSchema, VaccineType } from "@/form-schema/inventory/inventoryListSchema";
import { addVaccine, addVaccineIntervals, addRoutineFrequency } from "../requests/Postrequest";

const timeUnits = [
  { id: "years", name: "Years" },
  { id: "months", name: "Months" },
  { id: "weeks", name: "Weeks" },
  { id: "days", name: "Days" },
];

const ageGroups = [
  { id: "0-5", name: "0-5 yrs old" },
  { id: "6-8", name: "6-8 yrs old" },
  { id: "9-15", name: "9-15 yrs old" },
  { id: "16-20", name: "16-20 yrs old" },
  { id: "21+", name: "21+ yrs old" },
];

const vaccineTypes = [
  { id: "routine", name: "Routine" },
  { id: "primary", name: "Primary Series" },
];

export default function VaccinationModal() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<VaccineType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: {
      vaccineName: "",
      intervals: [],
      timeUnits: [],
      noOfDoses: 1,
      ageGroup: "",
      specifyAge: "",
      type: "routine",
      routineFrequency: {
        interval: 1,
        unit: "years"
      },
    },
  });

  const { watch, setValue, control, handleSubmit, reset } = form;
  const [type, ageGroup, noOfDoses, specifyAge] = watch(["type", "ageGroup", "noOfDoses", "specifyAge"]);

  useEffect(() => {
    if (noOfDoses < watch("noOfDoses") || type !== watch("type")) {
      setValue("intervals", []);
      setValue("timeUnits", []);
    }
    if (type === 'routine') {
      setValue('noOfDoses', 1);
    }
  }, [noOfDoses, type, setValue, watch]);

  const onSubmit = async (data: VaccineType) => {
    setIsSubmitting(true);
    try {
      const vaccineData = {
        vac_type_choices: data.type,
        vac_name: data.vaccineName,
        no_of_doses: Number(data.noOfDoses),
        age_group: data.ageGroup,
        specify_age: data.ageGroup === "0-5" ? String(data.specifyAge) : data.ageGroup, // Use ageGroup value instead of N/A
      };

      const vaccineResponse = await addVaccine(vaccineData);
      const vaccineId = vaccineResponse.vac_id;

      if (data.type === 'primary') {
        await addVaccineIntervals({
          vac_id: vaccineId,
          dose_number: 1,
          interval: data.ageGroup === "0-5" ? 
            Number(data.specifyAge) || 0 : 0,
          time_unit: data.ageGroup === "0-5" ? "months" : "NA"
        });

        if (data.noOfDoses > 1) {
          await Promise.all(
            (data.intervals || []).map((interval, index) => 
              addVaccineIntervals({
                vac_id: vaccineId,
                dose_number: index + 2,
                interval: Number(interval),
                time_unit: (data.timeUnits || [])[index] || 'months'
              })
            )
          );
        }
      }

      if (data.type === 'routine' && data.routineFrequency) {
        await addRoutineFrequency({
          vac_id: vaccineId,
          dose_number: 1,
          interval: Number(data.routineFrequency.interval),
          time_unit: data.routineFrequency.unit
        });
      }

      alert("Vaccine saved successfully!");
      reset();
    } catch (error: any) {
      console.error('Submission error:', error);
      let errorMessage = "Failed to save vaccine. Please try again.";
      if (error.response?.data) {
        errorMessage += `\nError: ${JSON.stringify(error.response.data)}`;
      }
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDoseFields = () => {
    if (type === 'routine') {
      return (
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <p className="text-sm text-blue-600 mb-2">
            This vaccine will be repeated at the specified frequency:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="routineFrequency.interval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat Every</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g., 1"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="routineFrequency.unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency Unit</FormLabel>
                  <FormControl>
                    <SelectLayout
                      options={timeUnits}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select unit"
                      label="Time Unit"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      );
    }

    return Array.from({ length: noOfDoses }).map((_, doseIndex) => {
      const doseNumber = doseIndex + 1;
      const isFirstDose = doseIndex === 0;
      const showInterval = doseIndex > 0;

      const getDoseLabel = () => {
        if (isFirstDose) {
          return ageGroup === "0-5" 
            ? `First dose at ${specifyAge || "specified"} ` 
            : `First dose for ${ageGroup}`;
        }
        
        const interval = watch(`intervals.${doseIndex - 1}`);
        const timeUnit = watch(`timeUnits.${doseIndex - 1}`);
        return interval && timeUnit 
          ? `Dose ${doseNumber} after ${interval} ${timeUnit}`
          : `Dose ${doseNumber}`;
      };

      return (
        <div key={doseIndex} className="bg-gray-50 p-2 rounded-md ">
          <div className="flex justify-between items-center ">
            <h4 className="text-sm bg-blue-100 text-darkBlue3 px-2 py-1 rounded bg-snow">
              {getDoseLabel()}
            </h4>
          </div>

          {showInterval && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
              <FormField
                control={control}
                name={`intervals.${doseIndex - 1}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval After Previous Dose</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="e.g., 4"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`timeUnits.${doseIndex - 1}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Unit</FormLabel>
                    <FormControl>
                      <SelectLayout
                        options={timeUnits}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select unit"
                        label="Time Unit"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={control}
                name="vaccineName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vaccine Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Vaccine Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="ageGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age Group</FormLabel>
                    <FormControl>
                      <SelectLayout
                        options={ageGroups}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select age group"
                        label="Age Group"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vaccine Type</FormLabel>
                  <FormControl>
                    <SelectLayout
                      options={vaccineTypes}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select vaccine type"
                      label="Vaccine Type"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="noOfDoses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Dose/s</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      disabled={type === 'routine'}
                      {...field}
                      onChange={(e) => {
                        if (type !== 'routine') {
                          field.onChange(parseInt(e.target.value) || 1);
                        }
                      }}
                    />
                  </FormControl>
                  {type === 'routine' && (
                    <p className="text-sm text-muted-foreground">
                      Routine vaccines always have 1 required dose
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === "primary" && ageGroup === "0-5" && (
              <FormField
                control={control}
                name="specifyAge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specify Age (months)</FormLabel>
                    <FormControl>
                      <Input
                       
                      
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-darkBlue1">Dose Schedule</h3>
            {renderDoseFields()}
          </div>

          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
import React, { useEffect } from "react";
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
// Constants kept in component file
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
  const form = useForm<VaccineType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: {
      vaccineName: "",
      intervals: [],
      timeUnits: [],
      noOfDoses: 1,
      ageGroup: "",
      specifyAge: "", // Ensure this is empty string, not null or undefined
      type: "routine",
      routineFrequency: {
        interval: 1,
        unit: "years"
      },
    
    },
  });

  const { watch, setValue, control, handleSubmit } = form;
  const [type, ageGroup, noOfDoses, specifyAge] = watch(["type", "ageGroup", "noOfDoses", "specifyAge"]);

  useEffect(() => {
    if (noOfDoses < watch("noOfDoses") || type !== watch("type")) {
      setValue("intervals", []);
      setValue("timeUnits", []);
    }
  }, [noOfDoses, type, setValue, watch]);

  // const onSubmit = (data: VaccineType) => {
  //   console.log(data);
  //   alert("Vaccine saved successfully!");
  // };
  const onSubmit = async (data: VaccineType) => {
    try {
      // Prepare vaccine data with proper types
      const vaccineData = {
        vac_type_choices: data.type,
        vac_name: data.vaccineName,
        no_of_doses: Number(data.noOfDoses),
        age_group: data.ageGroup,
        specify_age: data.specifyAge ? String(data.specifyAge) : 'N/A',
      };
  
      console.log('Submitting vaccine data:', vaccineData);
      
      // Create vaccine
      const vaccineResponse = await addVaccine(vaccineData);
      const vaccineId = vaccineResponse.vac_id;
  
      // Handle intervals for primary vaccines
      if (data.type === 'primary' && data.noOfDoses > 1) {
        const intervals = data.intervals || [];
        const timeUnits = data.timeUnits || [];
        
        await Promise.all(
          intervals.map((interval, index) => 
            addVaccineIntervals({
              vac_id: vaccineId,
              interval: Number(interval),
              time_unit: timeUnits[index] || 'months' // default to months if missing
            })
          )
        );
      }
  
      // Handle routine frequency
      if (data.type === 'routine' && data.routineFrequency) {
        await addRoutineFrequency({
          vac_id: vaccineId,
          interval: Number(data.routineFrequency.interval),
          time_unit: data.routineFrequency.unit
        });
      }
  
      alert("Vaccine saved successfully!");
      form.reset();
    } catch (error) {
      console.error('Submission error:', error);
      let errorMessage = "Failed to save vaccine. Please try again.";
      
      if ((error as any)?.response?.data) {
        if (typeof error === "object" && error !== null && "response" in error && typeof (error as any).response === "object") {
          errorMessage += `\nServer error: ${JSON.stringify((error as any).response.data)}`;
        }
      }
      
      alert(errorMessage);
    }
  };


  const getDoseLabel = (index: number) => {
    const ordinals = ["st", "nd", "rd", "th"];
    return `${index + 1}${ordinals[index] || "th"} Dose`;
  };

  const getFirstDoseLabel = () => {
    if (type === "primary" && ageGroup === "0-5") {
      return `First dose at ${specifyAge || 'specified'} months`;
    }
    return `First dose at ${ageGroup || 'selected age'}`;
  };

  const renderRoutineDoseFields = () => {
    if (noOfDoses === 1) {
      return (
        <div className="bg-gray-50 p-4 rounded-md mb-4">
          <h4 className="font-medium">{getFirstDoseLabel()}</h4>
        </div>
      );
    }

    return Array.from({ length: noOfDoses }).map((_, doseIndex) => {
      const isFirstDose = doseIndex === 0;
      
      return (
        <div key={doseIndex} className="bg-gray-50 p-4 rounded-md mb-4">
          <h4 className="font-medium">
            {isFirstDose ? getFirstDoseLabel() : getDoseLabel(doseIndex)}
          </h4>

          {!isFirstDose && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <FormField
                control={control}
                name={`intervals.${doseIndex - 1}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval After Previous Dose</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
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

  const renderPrimaryDoseFields = () => {
    return Array.from({ length: noOfDoses }).map((_, doseIndex) => {
      const isFirstDose = doseIndex === 0;
      const showInterval = doseIndex > 0;

      return (
        <div key={doseIndex} className="bg-gray-50 p-4 rounded-md mb-4">
          <h4 className="font-medium">
            {isFirstDose ? getFirstDoseLabel() : getDoseLabel(doseIndex)}
          </h4>
          
          {ageGroup === "0-5" && isFirstDose && specifyAge && (
            <p className="text-sm text-gray-600 mt-1">
              Subsequent doses will be scheduled relative to the first dose at {specifyAge} months.
            </p>
          )}

          {showInterval && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
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
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
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
            <h3 className="text-lg font-semibold">Dose Schedule</h3>
            
            {type === "routine" ? renderRoutineDoseFields() : renderPrimaryDoseFields()}

            {type === "routine" && (
              <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                <h4 className="font-medium text-blue-800">Repeat Administration</h4>
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
            )}
          </div>

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
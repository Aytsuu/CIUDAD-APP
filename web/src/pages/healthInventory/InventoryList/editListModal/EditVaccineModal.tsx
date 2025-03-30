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
import {
  VaccineSchema,
  VaccineType,
} from "@/form-schema/inventory/inventoryListSchema";
import api from "@/pages/api/api";
import { toTitleCase } from "../requests/Postrequest";

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

interface EditVaccineModalProps {
  vaccineData: {
    id: number;
    vaccineName: string;
    vaccineType: string;
    ageGroup: string;
    doses: number | string;
    specifyAge: string;
    noOfDoses?: number | string;
    doseDetails: Array<{
      id?: number;
      doseNumber: number;
      interval?: number;
      unit?: string;
      vacInt_id?: number;
      routineF_id?: number;
    }>;
    category: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditVaccineModal({
  vaccineData,
  onClose,
  onSuccess,
}: EditVaccineModalProps) {
  const form = useForm<VaccineType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: {
      vaccineName: vaccineData.vaccineName,
      noOfDoses: vaccineData.noOfDoses === "N/A" ? 1 : Number(vaccineData.noOfDoses),
      ageGroup: vaccineData.ageGroup === "N/A" ? "" : vaccineData.ageGroup,
      specifyAge: vaccineData.specifyAge === "N/A" ? "" : vaccineData.specifyAge,
      type: vaccineData.vaccineType === "Routine" ? "routine" : "primary",
      intervals: vaccineData.doseDetails
        .filter((dose) => dose.doseNumber > 1)
        .map((dose) => dose.interval || 0),
      timeUnits: vaccineData.doseDetails
        .filter((dose) => dose.doseNumber > 1)
        .map((dose) => dose.unit || "months"),
      routineFrequency: {
        interval:
          (vaccineData.vaccineType === "Routine" &&
            vaccineData.doseDetails[0]?.interval) ||
          1,
        unit:
          (vaccineData.vaccineType === "Routine" &&
            vaccineData.doseDetails[0]?.unit) ||
          "years",
      },
    },
  });

  const {
    watch,
    setValue,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = form;
  const [type, ageGroup, noOfDoses, specifyAge] = watch([
    "type",
    "ageGroup",
    "noOfDoses",
    "specifyAge",
  ]);

  useEffect(() => {
    if (type === "routine") {
      setValue("noOfDoses", 1);
      setValue("intervals", []);
      setValue("timeUnits", []);
    } else {
      const currentIntervals = watch("intervals") || [];
      const currentTimeUnits = watch("timeUnits") || [];
      
      if (currentIntervals.length > noOfDoses - 1) {
        setValue("intervals", currentIntervals.slice(0, noOfDoses - 1));
        setValue("timeUnits", currentTimeUnits.slice(0, noOfDoses - 1));
      }
    }
  }, [noOfDoses, type, setValue, watch]);


 
  
const onSubmit = async (data: VaccineType) => {
  console.group("Vaccine Update Submission");
  try {
    // 1. Delete all existing intervals/frequencies
    if (vaccineData.vaccineType.toLowerCase() !== data.type) {
      // Type changed - delete all existing records of the old type
      if (vaccineData.vaccineType.toLowerCase() === 'routine') {
        // Delete all routine frequencies for this vaccine
        const routines: { data: Array<{ routineF_id: number }> } = await api.get(`inventory/routine_freq/`, {
          params: { vac_id: vaccineData.id }
        });
        await Promise.all(routines.data.map((routine: { routineF_id: number }) => 
          api.delete(`inventory/routine_freq/${routine.routineF_id}/`)
        ));
      } else {
        // Delete all intervals for this vaccine
        const intervals = await api.get(`inventory/vac_intervals/`, {
          params: { vac_id: vaccineData.id }
        });
        await Promise.all(intervals.data.map((interval: { vacInt_id: number }) => 
          api.delete(`inventory/vac_intervals/${interval.vacInt_id}/`)
        ));
      }
    } else {
      // Same type - just delete all intervals
      const intervals = await api.get(`inventory/vac_intervals/`, {
        params: { vac_id: vaccineData.id }
      });
      await Promise.all(intervals.data.map((interval: { vacInt_id: number }) => 
        api.delete(`inventory/vac_intervals/${interval.vacInt_id}/`)
      ));
    }

    // 2. Update main vaccine details
    const updateResponse = await api.put(`inventory/vac_list/${vaccineData.id}/`, {
      vac_name: toTitleCase(data.vaccineName),
      vac_type_choices: data.type,
      no_of_doses: Number(data.noOfDoses),
      age_group: data.ageGroup,
      specify_age: data.ageGroup === "0-5" ? String(data.specifyAge) : data.ageGroup,
      vaccat_id: 1,
      updated_at: new Date().toISOString(),
    });

    // 3. Create fresh intervals based on new type
    if (data.type === "routine") {
      // For routine vaccines - create single frequency
      await api.post("inventory/routine_freq/", {
        interval: Number(data.routineFrequency?.interval) || 1,
        time_unit: data.routineFrequency?.unit || "years",
        dose_number: 1,
        vac_id: vaccineData.id,
        updated_at: new Date().toISOString(),
      });
    } else {
      // For primary vaccines - create all doses fresh
      const totalDoses = Number(data.noOfDoses) || 1;
      const intervals = Array.isArray(data.intervals) ? data.intervals : [];
      const timeUnits = Array.isArray(data.timeUnits) ? data.timeUnits : [];

      // Create first dose
      if (totalDoses >= 1) {
        await api.post("inventory/vac_intervals/", {
          interval: data.ageGroup === "0-5" ? Number(data.specifyAge) || 0 : 0,
          time_unit: data.ageGroup === "0-5" ? "months" : "NA",
          dose_number: 1,
          vac_id: vaccineData.id,
          updated_at: new Date().toISOString(),
        });
      }

      // Create subsequent doses
      for (let i = 1; i < totalDoses; i++) {
        await api.post("inventory/vac_intervals/", {
          interval: Number(intervals[i-1]) || 0,
          time_unit: timeUnits[i-1] || "months",
          dose_number: i + 1,
          vac_id: vaccineData.id,
          updated_at: new Date().toISOString(),
        });
      }
    }

    console.log("🎉 Update completed successfully!");
    onSuccess();
    onClose();
  } catch (error: any) {
    console.error("❌ Update error:", error);
    alert(`Failed to update vaccine: ${error.message || "Unknown error"}`);
  } finally {
    console.groupEnd();
  }
};




  const renderDoseFields = () => {
    if (type === "routine") {
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
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
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
        <div key={doseIndex} className="bg-gray-50 p-2 rounded-md">
          <div className="flex justify-between items-center">
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
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
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
                      disabled={type === "routine"}
                      {...field}
                      onChange={(e) => {
                        if (type !== "routine") {
                          field.onChange(parseInt(e.target.value) || 1);
                        }
                      }}
                    />
                  </FormControl>
                  {type === "routine" && (
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-darkBlue1">
              Dose Schedule
            </h3>
            {renderDoseFields()}
          </div>

          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="w-[120px]" 
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
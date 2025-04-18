import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { Button } from "@/components/ui/button/button";
import {
  VaccineSchema,
  VaccineType,
} from "@/form-schema/inventory/inventoryListSchema";
import api from "@/pages/api/api";
import { toTitleCase } from "../requests/case";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";

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
  setIsDialog: (isOpen: boolean) => void;
}

export default function EditVaccineModal({
  vaccineData,
  setIsDialog,
}: EditVaccineModalProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<VaccineType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<VaccineType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: {
      vaccineName: vaccineData.vaccineName,
      noOfDoses:
        vaccineData.noOfDoses === "N/A" ? 1 : Number(vaccineData.noOfDoses),
      ageGroup: vaccineData.ageGroup === "N/A" ? "" : vaccineData.ageGroup,
      specifyAge:
        vaccineData.specifyAge === "N/A" ? "" : vaccineData.specifyAge,
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
    formState: { errors },
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

  const handleFormSubmit = (data: VaccineType) => {
    setFormData(data);
    setIsConfirmOpen(true);
  };

  const confirmUpdate = async () => {
    if (!formData) return;
    setIsSubmitting(true);
    setIsConfirmOpen(false);
    
    try {
      const hasTypeChanged =
        formData.type !== vaccineData.vaccineType.toLowerCase();
      const hasDosesChanged =
        Number(formData.noOfDoses) !==
        Number(vaccineData.noOfDoses === "N/A" ? 1 : vaccineData.noOfDoses);
      const hasSpecifyAgeChanged = formData.specifyAge !== vaccineData.specifyAge;
      const hasRoutineIntervalChanged =
        formData.type === "routine" &&
        (Number(formData.routineFrequency?.interval) !==
          vaccineData.doseDetails[0]?.interval ||
          formData.routineFrequency?.unit !== vaccineData.doseDetails[0]?.unit);

      const shouldUpdateIntervals =
        hasTypeChanged ||
        hasDosesChanged ||
        hasSpecifyAgeChanged ||
        hasRoutineIntervalChanged;

      // Update main vaccine details
      const updatePayload = {
        vac_name: toTitleCase(formData.vaccineName),
        vac_type_choices: formData.type,
        no_of_doses: Number(formData.noOfDoses),
        age_group: formData.ageGroup,
        specify_age:
          formData.ageGroup === "0-5" ? String(formData.specifyAge) : formData.ageGroup,
        vaccat_id: 1,
        updated_at: new Date().toISOString(),
      };

      await api.put(`inventory/vac_list/${vaccineData.id}/`, updatePayload);

      if (shouldUpdateIntervals) {
        if (hasTypeChanged) {
          if (vaccineData.vaccineType.toLowerCase() === "routine") {
            const routines = await api.get(`inventory/routine_freq/`, {
              params: { vac_id: vaccineData.id },
            });
            await Promise.all(
              routines.data.map((routine: { routineF_id: number }) =>
                api.delete(`inventory/routine_freq/${routine.routineF_id}/`)
              )
            );
          } else {
            const intervals = await api.get(`inventory/vac_intervals/`, {
              params: { vac_id: vaccineData.id },
            });
            await Promise.all(
              intervals.data.map((interval: { vacInt_id: number }) =>
                api.delete(`inventory/vac_intervals/${interval.vacInt_id}/`)
              )
            );
          }
        }

        if (formData.type === "routine") {
          const routineResponse = await api.get(`inventory/routine_freq/`, {
            params: { vac_id: vaccineData.id },
          });

          const routineData = {
            interval: Number(formData.routineFrequency?.interval) || 1,
            dose_number: 1,
            time_unit: formData.routineFrequency?.unit || "years",
            vac_id: vaccineData.id,
            updated_at: new Date().toISOString(),
          };

          if (routineResponse.data.length > 0) {
            await api.put(
              `inventory/routine_freq/${routineResponse.data[0].routineF_id}/`,
              routineData
            );
          } else {
            await api.post("inventory/routine_freq/", routineData);
          }
        } else {
          const totalDoses = Number(formData.noOfDoses) || 1;
          const intervals = Array.isArray(formData.intervals) ? formData.intervals : [];
          const timeUnits = Array.isArray(formData.timeUnits) ? formData.timeUnits : [];

          const existingIntervals = await api.get(`inventory/vac_intervals/`, {
            params: { vac_id: vaccineData.id },
          });

          if (existingIntervals.data[0]) {
            await api.put(
              `inventory/vac_intervals/${existingIntervals.data[0].vacInt_id}/`,
              {
                interval:
                  formData.ageGroup === "0-5" ? Number(formData.specifyAge) || 0 : 0,
                time_unit: formData.ageGroup === "0-5" ? "months" : "NA",
                dose_number: 1,
                vac_id: vaccineData.id,
                updated_at: new Date().toISOString(),
              }
            );
          } else {
            await api.post("inventory/vac_intervals/", {
              interval:
                formData.ageGroup === "0-5" ? Number(formData.specifyAge) || 0 : 0,
              time_unit: formData.ageGroup === "0-5" ? "months" : "NA",
              dose_number: 1,
              vac_id: vaccineData.id,
              updated_at: new Date().toISOString(),
            });
          }

          for (let i = 1; i < totalDoses; i++) {
            const existingDose = existingIntervals.data.find(
              (d: any) => d.dose_number === i + 1
            );
            if (existingDose) {
              await api.put(
                `inventory/vac_intervals/${existingDose.vacInt_id}/`,
                {
                  interval: Number(intervals[i - 1]) || 0,
                  time_unit: timeUnits[i - 1] || "months",
                  dose_number: i + 1,
                  vac_id: vaccineData.id,
                  updated_at: new Date().toISOString(),
                }
              );
            } else {
              await api.post("inventory/vac_intervals/", {
                interval: Number(intervals[i - 1]) || 0,
                time_unit: timeUnits[i - 1] || "months",
                dose_number: i + 1,
                vac_id: vaccineData.id,
                updated_at: new Date().toISOString(),
              });
            }
          }
        }
      }

      queryClient.invalidateQueries({ queryKey: ["vaccines"] });
      setIsDialog(false);
    } catch (error: any) {
      console.error("Update error:", error);
      alert(`Failed to update vaccine: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
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
            <FormInput
              control={control}
              name="routineFrequency.interval"
              label="Repeat Every"
              type="number"
              placeholder="e.g., 1"
            />
            <FormSelect
              control={control}
              name="routineFrequency.unit"
              label="Frequency Unit"
              options={timeUnits}
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
              <FormInput
                control={control}
                name={`intervals.${doseIndex - 1}`}
                label="Interval After Previous Dose"
                type="number"
                placeholder="e.g., 4"
              />
              <FormSelect
                control={control}
                name={`timeUnits.${doseIndex - 1}`}
                label="Time Unit"
                options={timeUnits}
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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-6 p-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                control={control}
                name="vaccineName"
                label="Vaccine Name"
                placeholder="Vaccine Name"
              />
              <FormSelect
                control={control}
                name="ageGroup"
                label="Age Group"
                options={ageGroups}
              />
            </div>
            <FormSelect
              control={control}
              name="type"
              label="Vaccine Type"
              options={vaccineTypes}
            />
            <FormInput
              control={control}
              name="noOfDoses"
              label="Required Dose/s"
              type="number"
            />
            {type === "primary" && ageGroup === "0-5" && (
              <FormInput
                control={control}
                name="specifyAge"
                label="Specify Age (months)"
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
              type="submit"
              className="w-[120px]"
              disabled={isSubmitting || Object.keys(errors).length > 0}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmUpdate}
        title="Update Vaccine"
        description={`Are you sure you want to update the vaccine "${formData?.vaccineName}"?`}
      />
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { Button } from "@/components/ui/button/button";
import { VaccineSchema, VaccineType } from "@/form-schema/inventory/inventoryListSchema";
import { addVaccine, handlePrimaryVaccine, handleRoutineVaccine, handleSubmissionError } from "@/pages/healthInventory/InventoryList/requests/post/vaccination";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import {useQueryClient } from "@tanstack/react-query";



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


interface VaccineModalProps {
setIsDialog: (isOpen: boolean) => void;
}
export default function VaccinationModal({setIsDialog}: VaccineModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<VaccineType | null>(null);
  const queryClient = useQueryClient();

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

  const handleFormSubmit = (data: VaccineType) => {
    setFormData(data);
    setIsConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    if (!formData) return;
    setIsDialog(false);
    setIsSubmitting(true);
    setIsConfirmOpen(false);
    
    try {
      if (!formData.vaccineName || !formData.ageGroup) {
        throw new Error("Vaccine name and age group are required");
      }
      
      const vaccinePayload = {
        vac_type_choices: formData.type,
        vac_name: formData.vaccineName,
        vaccat_id: 1,
        no_of_doses: Number(formData.noOfDoses) || 1,
        age_group: formData.ageGroup,
        specify_age: formData.ageGroup === "0-5" ? String(formData.specifyAge || "") : formData.ageGroup,
      };

      const vaccineResponse = await addVaccine(vaccinePayload);
      
      if (!vaccineResponse?.vac_id) {
        throw new Error("Failed to create vaccine record");
      }

      const vaccineId = vaccineResponse.vac_id;
      
      if (formData.type === 'primary') {
        await handlePrimaryVaccine({ ...formData, intervals: formData.intervals || [], timeUnits: formData.timeUnits || [] }, vaccineId);
      } else if (formData.type === 'routine') {
        if (!formData.routineFrequency) {
          throw new Error("Routine frequency is required");
        }
        await handleRoutineVaccine(
          { ...formData, intervals: formData.intervals || [], timeUnits: formData.timeUnits || [] },
          vaccineId
        );
      }

      alert("Vaccine saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["vaccines"] });

      reset();
    } catch (error: unknown) {
      handleSubmissionError(error);
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
            {type === 'routine' && (
              <p className="text-sm text-muted-foreground">
                Routine vaccines always have 1 required dose
              </p>
            )}

            {type === "primary" && ageGroup === "0-5" && (
              <FormInput
                control={control}
                name="specifyAge"
                label="Specify Age (months)"
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

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmSubmit}
        title="Add Vaccine"
        description={`Are you sure you want to add the vaccine "${formData?.vaccineName}"?`}
      />
    </div>
  );
}
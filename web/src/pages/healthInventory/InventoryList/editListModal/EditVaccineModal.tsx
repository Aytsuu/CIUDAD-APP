// src/components/EditVaccineModal.tsx
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
} from "@/form-schema/inventory/lists/inventoryListSchema";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { useLocation } from "react-router";
import { useUpdateVaccine } from "../queries/Antigen/VaccinePutQueries";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router";
import { CircleCheck } from "lucide-react";

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

interface DoseDetail {
  id?: number;
  doseNumber: number;
  interval?: number;
  unit?: string;
  vacInt_id?: number;
  routineF_id?: number;
}

export interface VaccineData {
  id: number;
  vaccineName: string;
  vaccineType: string;
  ageGroup: string;
  doses: number | string;
  specifyAge: string;
  noOfDoses?: number | string;
  doseDetails: DoseDetail[];
  category: string;
}

export default function EditVaccineModal() {
  const location = useLocation();
  const vaccineData = location.state?.initialData as VaccineData;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { updateVaccine, isUpdating } = useUpdateVaccine();
  const navigate = useNavigate();

  // Initialize formData with default values
  const defaultFormData: VaccineType = {
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
  };

  const form = useForm<VaccineType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: defaultFormData,
    mode: "onChange", // Validate on change to show errors immediately
  });

  const {
    watch,
    setValue,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = form;

  const [type, ageGroup, noOfDoses, specifyAge] = watch([
    "type",
    "ageGroup",
    "noOfDoses",
    "specifyAge",
  ]);

  useEffect(() => {
    const currentNoOfDoses = watch("noOfDoses");
    const currentType = watch("type");
    const currentIntervals = watch("intervals");
    const currentTimeUnits = watch("timeUnits");

    if (currentType === "routine") {
      setValue("noOfDoses", 1);
      setValue("intervals", []);
      setValue("timeUnits", []);
    } else {
      // When reducing doses, trim the intervals and timeUnits arrays
      if (currentIntervals.length > currentNoOfDoses - 1) {
        setValue("intervals", currentIntervals.slice(0, currentNoOfDoses - 1));
        setValue("timeUnits", currentTimeUnits.slice(0, currentNoOfDoses - 1));
      }
    }
  }, [noOfDoses, type, setValue, watch]);

  const handleFormSubmit = (data: VaccineType) => {
    console.log("Form submitted with data:", data);
    setIsConfirmOpen(true);
  };

  const confirmUpdate = async () => {
    setIsConfirmOpen(false);
    const currentValues = form.getValues();

    try {
      await updateVaccine({
        formData: currentValues,
        vaccineData: {
          id: vaccineData.id,
          vaccineName: vaccineData.vaccineName,
          vaccineType: vaccineData.vaccineType,
          ageGroup: vaccineData.ageGroup,
          doses: vaccineData.doses,
          specifyAge: vaccineData.specifyAge,
          doseDetails: vaccineData.doseDetails,
          category: vaccineData.category
        }
      });
      navigate("/mainInventoryList");
      toast.success("Updated successfully", {
        icon: (
          <CircleCheck size={18} className="fill-green-500 stroke-white" />
        ),
        duration: 2000,
      });
    } catch (error: any) {
      toast.error("Failed to update vaccine", {
        description: error.message || "An unknown error occurred",
      });
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
            ? `First dose at ${specifyAge || "specified"} months`
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
                type="number"
              />
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-darkBlue1">
              Dose Schedule
            </h3>
            {renderDoseFields()}
          </div>

          {/* Debug information */}
          {Object.keys(errors).length > 0 && (
            <div className="text-red-500 text-sm p-2 border border-red-200 rounded">
              <h4 className="font-bold">Form Errors:</h4>
              <ul className="list-disc pl-5">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>
                    {field}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              type="button"
              asChild
            >
              <Link to="/mainInventoryList">Cancel</Link>
            </Button>
           
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isUpdating || !isValid}
              title={!isValid ? "Please fix all form errors" : ""}
            >
              {isUpdating ? "Updating..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmUpdate}
        title="Update Vaccine"
        description={`Are you sure you want to update the vaccine "${watch("vaccineName")}"?`}
      />
    </div>
  );
}
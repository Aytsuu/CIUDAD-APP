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
import { Label } from "@/components/ui/label";
import { Pill, CircleCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSubmitVaccine } from "../queries/Antigen/VaccinePostQueries";
import { getVaccineList } from "../restful-api/Antigen/VaccineFetchAPI";
import { toast } from "sonner";

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

export default function AddVaccinationList() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<VaccineType | null>(null);
  const { mutateAsync: submitVaccine, isPending: isSubmitting } =
    useSubmitVaccine();
  const navigate = useNavigate();
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
        unit: "years",
      },
    },
  });

  const { watch, setValue, control, handleSubmit, reset } = form;
  const [type, ageGroup, noOfDoses, specifyAge] = watch([
    "type",
    "ageGroup",
    "noOfDoses",
    "specifyAge",
  ]);

  useEffect(() => {
    if (noOfDoses < watch("noOfDoses") || type !== watch("type")) {
      setValue("intervals", []);
      setValue("timeUnits", []);
    }
    if (type === "routine") {
      setValue("noOfDoses", 1);
    }
  }, [noOfDoses, type, setValue, watch]);

  const isDuplicateVaccineList = (
    vaccinelist: any[],
    newVaccinelist: string,
    age_group: string
  ) => {
    return vaccinelist.some(
      (vac) =>
        vac.vac_name.trim().toLowerCase() ===
          newVaccinelist.trim().toLowerCase() &&
        String(vac.age_group) === String(age_group)
    );
  };

  const handleFormSubmit = async (data: VaccineType) => {
    console.log("Form data received:", data); // Debug log

    try {
      console.log("Checking for duplicates..."); // Debug log
      const existingVaccineList = await getVaccineList();
      console.log("Existing vaccine list:", existingVaccineList); // Debug log

      if (!Array.isArray(existingVaccineList)) {
        console.error(
          "Invalid API response - expected array, got:",
          existingVaccineList
        );
        throw new Error("Invalid API response - expected an array");
      }

      const isDuplicate = isDuplicateVaccineList(
        existingVaccineList,
        data.vaccineName,
        data.ageGroup
      );

      console.log("Is duplicate:", isDuplicate); // Debug log

      if (isDuplicate) {
        console.log("Duplicate found, setting error"); // Debug log
        form.setError("vaccineName", {
          type: "manual",
          message: "This vaccine already exists for the selected age group",
        });
        return;
      }
      setFormData(data);
      setIsConfirmOpen(true);
    } catch (error) {
      console.error("Error checking for duplicates:", error);
      toast.error("Failed to verify vaccine", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const confirmSubmit = async () => {
    if (!formData) return;
    setIsConfirmOpen(false);

    try {
      await submitVaccine(formData);
      reset();
      navigate("/mainInventoryList");

      toast.success("Vaccine added successfully", {
        icon: <CircleCheck size={18} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit vaccine", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
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
    <div className="w-full flex items-center justify-center ">
      <Form {...form}>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="bg-white p-4 w-full max-w-[500px] rounded-sm"
        >
          <div className="space-y-2 ">
            <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
              <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Add Vaccine List
            </Label>
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
            {type === "routine" && (
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
            <h3 className="text-lg font-semibold text-darkBlue1">
              Dose Schedule
            </h3>
            {renderDoseFields()}
          </div>

          <div className="w-full flex flex-col sm:flex-row justify-end mt-6 sm:mt-8 gap-2">
            <Button variant="outline" className="w-full sm:w-auto">
              <Link to="/mainInventoryList">Cancel</Link>
            </Button>

            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
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

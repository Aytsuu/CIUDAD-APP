import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button/button";
import {
  VaccineSchema,
  VaccineType,
} from "@/form-schema/inventory/lists/inventoryListSchema";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { Label } from "@/components/ui/label";
import { Pill, CircleCheck, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSubmitVaccine } from "../queries/Antigen/VaccinePostQueries";
import { getVaccineList } from "../restful-api/Antigen/VaccineFetchAPI";
import { toast } from "sonner";
import { FormSelect } from "@/components/ui/form/form-select";
import { getAgegroup } from "@/pages/healthServices/agegroup/restful-api/agepostAPI";
import CardLayout from "@/components/ui/card/card-layout";

const timeUnits = [
  { id: "years", name: "Years" },
  { id: "months", name: "Months" },
  { id: "weeks", name: "Weeks" },
  { id: "days", name: "Days" },
];

const vaccineTypes = [
  { id: "routine", name: "Routine" },
  { id: "primary", name: "Primary Series" },
  { id: "conditional", name: "Conditional" },
];

export const fetchAgeGroups = async () => {
  try {
    const response = await getAgegroup();
    const ageGroupData = Array.isArray(response) ? response : [];
    return {
      default: ageGroupData,
      formatted: ageGroupData.map((ageGroup: any) => ({
        id: `${ageGroup.agegrp_id},${ageGroup.agegroup_name},${ageGroup.min_age},${ageGroup.max_age},${ageGroup.time_unit}`,
        name: `${ageGroup.agegroup_name} (${ageGroup.min_age}-${ageGroup.max_age} ${ageGroup.time_unit})`,
        originalData: ageGroup,
      })),
    };
  } catch (error) {
    console.error("Error fetching age groups:", error);
    toast.error("Failed to load age groups");
    throw error;
  }
};

export default function AddVaccinationList() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<VaccineType | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const { mutateAsync: submitVaccine, isPending: isSubmitting } =
    useSubmitVaccine();
  const navigate = useNavigate();

  const [ageGroups, setAgeGroups] = useState<{
    default: any[];
    formatted: { id: string; name: string }[];
  }>({ default: [], formatted: [] });
  const [loadingAgeGroups, setLoadingAgeGroups] = useState(false);

  useEffect(() => {
    const loadAgeGroups = async () => {
      setLoadingAgeGroups(true);
      try {
        const data = await fetchAgeGroups();
        setAgeGroups(data);
      } catch (error) {
        toast.error("Failed to load age groups");
      } finally {
        setLoadingAgeGroups(false);
      }
    };
    loadAgeGroups();
  }, []);

  const form = useForm<VaccineType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: {
      vaccineName: "",
      intervals: [],
      timeUnits: [],
      noOfDoses: 1,
      ageGroup: "",
      type: "routine",
      routineFrequency: {
        interval: 1,
        unit: "years",
      },
    },
  });

  const {
    watch,
    setValue,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;
  const [type, ageGroup, noOfDoses] = watch(["type", "ageGroup", "noOfDoses"]);

  useEffect(() => {
    if (noOfDoses < watch("noOfDoses") || type !== watch("type")) {
      setValue("intervals", []);
      setValue("timeUnits", []);
    }
    if (type === "routine") {
      setValue("noOfDoses", 1);
    }
    if (type === "conditional") {
      setValue("noOfDoses", 0);
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
        newVaccinelist.trim().toLowerCase()
    );
  };

  const handleFormSubmit = async (data: VaccineType) => {
    const age_id = data.ageGroup.split(",")[0];
    setIsCheckingDuplicate(true);
    try {
      if (!data.ageGroup) {
        form.setError("ageGroup", {
          type: "manual",
          message: "Please select an age group",
        });
        return;
      }
      const existingVaccineList = await getVaccineList();
      if (!Array.isArray(existingVaccineList)) {
        throw new Error("Invalid API response - expected an array");
      }
      const isDuplicate = isDuplicateVaccineList(
        existingVaccineList,
        data.vaccineName,
        age_id
      );
      if (isDuplicate) {
        form.setError("vaccineName", {
          type: "manual",
          message: "This vaccine already exists",
        });
        return;
      }
      setFormData(data);
      setIsConfirmOpen(true);
    } catch (error) {
      toast.error("Failed to verify vaccine", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const confirmSubmit = async () => {
    if (!formData) return;
    setIsConfirmOpen(false);
    submitVaccine(formData);
  };

  const renderDoseFields = () => {
    if (type === "routine") {
      return (
        <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Routine vaccine frequency</p>
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

    if (type === "conditional") {
      const selectedAgeGroup = ageGroups.default.find(
        (group) => group.agegrp_id.toString() === ageGroup.split(",")[0]
      );
      return (
        <div className="space-y-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">Conditional vaccine details</p>
          <div className="bg-white p-4 rounded-lg border">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vaccine Name:</span>
                <span className="text-sm font-medium">
                  {watch("vaccineName") || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Age Group:</span>
                <span className="text-sm font-medium">
                  {selectedAgeGroup
                    ? `${selectedAgeGroup.agegroup_name} (${selectedAgeGroup.min_age}-${selectedAgeGroup.max_age} ${selectedAgeGroup.time_unit})`
                    : "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                  Conditional
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-yellow-800">
            Note: Administered based on healthcare provider assessment.
          </p>
        </div>
      );
    }

    return Array.from({ length: noOfDoses }).map((_, doseIndex) => {
      const doseNumber = doseIndex + 1;
      const isFirstDose = doseIndex === 0;
      return (
        <div
          key={doseIndex}
          className="space-y-3 bg-gray-50 p-4 rounded-lg border"
        >
          <p className="text-sm font-medium text-gray-700">
            {isFirstDose
              ? `First dose for ${
                  ageGroups.default.find(
                    (g) => g.agegrp_id.toString() === ageGroup.split(",")[0]
                  )?.agegroup_name || "selected age group"
                }`
              : `Dose ${doseNumber}`}
          </p>
          {!isFirstDose && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    <>
      <div className=" flex items-center justify-center ">
        <CardLayout
          cardClassName="max-w-2xl w-full p-4 "
          content={
            <>
              <div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-8">
                    <Pill className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-800">
                      Add Vaccine List
                    </h2>
                  </div>
                </div>
                <Form {...form}>
                  <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="space-y-4"
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                          control={control}
                          name="vaccineName"
                          label="Vaccine Name"
                          placeholder="Enter vaccine name"
                        />
                        <div>
                          <Label className="text-darkGray ">Age Group</Label>
                          <Combobox
                            options={ageGroups.formatted}
                            value={ageGroup}
                            onChange={(id) => form.setValue("ageGroup", id)}
                            triggerClassName="w-full mt-2"
                            placeholder={
                              loadingAgeGroups
                                ? "Loading..."
                                : "Select age group"
                            }
                            emptyMessage={
                              <div className="text-center">
                                <p className="text-sm text-gray-600">
                                  No age groups found.
                                </p>
                                <Link
                                  to="/age-group-management"
                                  className="text-sm text-teal-600 hover:underline"
                                >
                                  Add New Age Group
                                </Link>
                              </div>
                            }
                          />
                          {errors.ageGroup && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.ageGroup.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormSelect
                          control={control}
                          name="type"
                          label="Vaccine Type"
                          options={vaccineTypes}
                        />
                        {type !== "conditional" && (
                          <FormInput
                            control={control}
                            name="noOfDoses"
                            label="Required Doses"
                            type="number"
                            placeholder="e.g., 1"
                          />
                        )}
                      </div>

                      {type === "routine" && (
                        <p className="text-sm text-gray-500">
                          Routine vaccines require 1 dose.
                        </p>
                      )}
                    </div>
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold text-gray-700">
                        Dose Schedule
                      </h2>
                      {renderDoseFields()}
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        variant="outline"
                        type="button" // Add this line
                        onClick={() => navigate(-1)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || isCheckingDuplicate}
                      >
                        {isCheckingDuplicate ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Checking...
                          </>
                        ) : isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
                <ConfirmationDialog
                  isOpen={isConfirmOpen}
                  onOpenChange={setIsConfirmOpen}
                  onConfirm={confirmSubmit}
                  title="Confirm Vaccine Addition"
                  description="Are you sure you want to add this vaccine?"
                />
              </div>
            </>
          }
        />
      </div>
    </>
  );
}

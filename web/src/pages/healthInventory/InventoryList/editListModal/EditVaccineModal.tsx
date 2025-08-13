// src/components/EditVaccineModal.tsx
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
import { useLocation } from "react-router";
import { useUpdateVaccine } from "../queries/Antigen/VaccinePutQueries";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router";
import { Loader2, Pill } from "lucide-react";
import { Label } from "@/components/ui/label";
import { getAgegroup } from "@/pages/healthServices/agegroup/restful-api/agepostAPI";
import { FormSelect } from "@/components/ui/form/form-select";
import { getVaccineList } from "../restful-api/Antigen/VaccineFetchAPI";
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
  agegrp_id: string;
}

export const fetchAgeGroups = async () => {
  try {
    const response = await getAgegroup();
    const ageGroupData = Array.isArray(response) ? response : [];

    return {
      default: ageGroupData,
      formatted: ageGroupData.map((ageGroup: any) => ({
        id: String(ageGroup.agegrp_id),
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

const isDuplicateVaccineList = (
  vaccinelist: any[],
  newVaccinelist: string,
  age_group: string,
  currentVaccineId?: number
) => {
  return vaccinelist.some(
    (vac) =>
      vac.id !== currentVaccineId &&
      vac.vac_name.trim().toLowerCase() ===
        newVaccinelist.trim().toLowerCase() &&
      String(vac.agegrp_id) === String(age_group)
  );
};

export default function EditVaccineModal() {
  const location = useLocation();
  const vaccineData = location.state?.initialData as VaccineData;
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const navigate = useNavigate();
  const [initialFormValues, setInitialFormValues] =
    useState<VaccineType | null>(null);
  const [ageGroups, setAgeGroups] = useState<{
    default: any[];
    formatted: { id: string; name: string }[];
  }>({ default: [], formatted: [] });
  const [loadingAgeGroups, setLoadingAgeGroups] = useState(false);
  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState<string>(
    vaccineData.agegrp_id && vaccineData.agegrp_id !== "N/A"
      ? String(vaccineData.agegrp_id)
      : ""
  );

  // Initialize form with default values
  const defaultFormData: VaccineType = {
    vaccineName: vaccineData.vaccineName,
    noOfDoses:
      vaccineData.noOfDoses === "N/A"
        ? vaccineData.vaccineType === "Conditional"
          ? 0
          : 1
        : Number(vaccineData.noOfDoses),
    ageGroup: selectedAgeGroupId,
    type:
      vaccineData.vaccineType === "Routine"
        ? "routine"
        : vaccineData.vaccineType === "Conditional"
        ? "conditional"
        : "primary",
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
    mode: "onChange",
  });

  const {
    watch,
    setValue,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = form;

  const [type, ageGroup, noOfDoses] = watch(["type", "ageGroup", "noOfDoses"]);
  const updateVaccineMutation = useUpdateVaccine();

  // Set initial form values when component mounts
  useEffect(() => {
    setInitialFormValues(defaultFormData);
  }, []);

  // Fetch age groups on component mount
  useEffect(() => {
    const loadAgeGroups = async () => {
      setLoadingAgeGroups(true);
      try {
        const data = await fetchAgeGroups();
        setAgeGroups(data);
        if (selectedAgeGroupId) {
          const isValid = data.formatted.some(
            (group) => group.id === selectedAgeGroupId
          );
          if (!isValid) {
            setSelectedAgeGroupId("");
            form.setValue("ageGroup", "");
            toast.warning(
              "Initial age group not found; please select a valid age group"
            );
          } else {
            form.setValue("ageGroup", selectedAgeGroupId, {
              shouldDirty: false,
            });
          }
        }
      } catch (error) {
        toast.error(
          "Failed to load age groups: " +
            (error instanceof Error ? error.message : "Unknown error")
        );
      } finally {
        setLoadingAgeGroups(false);
      }
    };
    loadAgeGroups();
  }, [vaccineData.agegrp_id]);

  const handleAgeGroupSelection = React.useCallback(
    (id: string) => {
      setSelectedAgeGroupId(id);
      form.setValue("ageGroup", id, { shouldDirty: true });
    },
    [form]
  );

  useEffect(() => {
    const currentNoOfDoses = watch("noOfDoses");
    const currentType = watch("type");
    const currentIntervals = watch("intervals") || [];
    const currentTimeUnits = watch("timeUnits") || [];

    if (currentType === "routine") {
      setValue("noOfDoses", 1, { shouldDirty: true });
      setValue("intervals", [], { shouldDirty: true });
      setValue("timeUnits", [], { shouldDirty: true });
    } else if (currentType === "conditional") {
      setValue("noOfDoses", 0, { shouldDirty: true });
      setValue("intervals", [], { shouldDirty: true });
      setValue("timeUnits", [], { shouldDirty: true });
    } else {
      const expectedIntervals = Math.max(0, currentNoOfDoses - 1);
      if (currentIntervals.length !== expectedIntervals) {
        const newIntervals = Array(expectedIntervals)
          .fill(0)
          .map((_, index) => currentIntervals[index] || 0);
        const newTimeUnits = Array(expectedIntervals)
          .fill("months")
          .map((_, index) => currentTimeUnits[index] || "months");
        setValue("intervals", newIntervals, { shouldDirty: true });
        setValue("timeUnits", newTimeUnits, { shouldDirty: true });
      }
    }
  }, [noOfDoses, type, setValue, watch]);

  const hasFormChanged = () => {
    if (!initialFormValues) return false;
    const currentValues = form.getValues();

    // Convert both values to string for consistent comparison
    const currentAgeGroup = String(currentValues.ageGroup || "");
    const initialAgeGroup = String(initialFormValues.ageGroup || "");

    return (
      currentValues.vaccineName !== initialFormValues.vaccineName ||
      currentValues.type !== initialFormValues.type ||
      currentValues.noOfDoses !== initialFormValues.noOfDoses ||
      currentAgeGroup !== initialAgeGroup ||
      JSON.stringify(currentValues.intervals) !==
        JSON.stringify(initialFormValues.intervals) ||
      JSON.stringify(currentValues.timeUnits) !==
        JSON.stringify(initialFormValues.timeUnits) ||
      currentValues.routineFrequency?.interval !==
        initialFormValues.routineFrequency?.interval ||
      currentValues.routineFrequency?.unit !==
        initialFormValues.routineFrequency?.unit
    );
  };

  const handleFormSubmit = async (data: VaccineType) => {
    const age_id = data.ageGroup.split(",")[0];
    const currentValues = form.getValues();

    if (
      currentValues.vaccineName !== initialFormValues?.vaccineName ||
      currentValues.ageGroup !== initialFormValues?.ageGroup
    ) {
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
          age_id,
          vaccineData.id
        );

        if (isDuplicate) {
          form.setError("vaccineName", {
            type: "manual",
            message: "This vaccine already exists",
          });
          return;
        }
      } catch (error) {
        toast.error("Failed to verify vaccine", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
        });
        return;
      } finally {
        setIsCheckingDuplicate(false);
      }
    }

    setIsConfirmOpen(true);
  };

  const confirmUpdate = async () => {
    setIsConfirmOpen(false);
    const currentValues = form.getValues();
    updateVaccineMutation.mutate({
      formData: {
        ...currentValues,
        ageGroup: selectedAgeGroupId,
      },
      vaccineData: {
        ...vaccineData,
        agegrp_id: selectedAgeGroupId,
      },
    });
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
        (group) => group.agegrp_id.toString() === selectedAgeGroupId
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
      const showInterval = doseIndex > 0;

      const getDoseLabel = () => {
        const selectedAgeGroup = ageGroups.default.find(
          (group) => group.agegrp_id.toString() === selectedAgeGroupId
        );

        const ageGroupLabel = selectedAgeGroup
          ? `${selectedAgeGroup.agegroup_name} (${selectedAgeGroup.min_age}-${selectedAgeGroup.max_age} ${selectedAgeGroup.time_unit})`
          : "selected age group";

        if (isFirstDose) {
          return `First dose for ${ageGroupLabel}`;
        }

        const interval = watch(`intervals.${doseIndex - 1}`);
        const timeUnit = watch(`timeUnits.${doseIndex - 1}`);
        return interval && timeUnit
          ? `Dose ${doseNumber} after ${interval} ${timeUnit}`
          : `Dose ${doseNumber}`;
      };

      return (
        <div
          key={doseIndex}
          className="space-y-3 bg-gray-50 p-4 rounded-lg border"
        >
          <p className="text-sm font-medium text-gray-700">{getDoseLabel()}</p>
          {showInterval && (
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

  const isSaveButtonDisabled =
    !isValid ||
    !hasFormChanged() ||
    isCheckingDuplicate ||
    updateVaccineMutation.isPending;

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
                        <Label className="text-darkGray">Age Group</Label>
                        <Combobox
                          options={ageGroups.formatted}
                          value={loadingAgeGroups ? "" : selectedAgeGroupId}
                          onChange={handleAgeGroupSelection}
                          triggerClassName="w-full mt-2"
                          placeholder={
                            loadingAgeGroups ? "Loading..." : "Select age group"
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
                      onClick={() => {
                        navigate(-1);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaveButtonDisabled}
                      title={
                        !isValid
                          ? "Please fix all form errors"
                          : !hasFormChanged()
                          ? "No changes detected"
                          : ""
                      }
                    >
                      {isCheckingDuplicate ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking...
                        </>
                      ) : updateVaccineMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
              <ConfirmationDialog
                isOpen={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                onConfirm={confirmUpdate}
                title="Confirm Vaccine Update"
                description={`Are you sure you want to update the vaccine "${watch(
                  "vaccineName"
                )}"?`}
              />
            </div>
          </>
        }
      />
      </div>
    </>
  );
}

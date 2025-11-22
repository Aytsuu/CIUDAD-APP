import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { Button } from "@/components/ui/button/button";
import { VaccineSchema, type VaccineType } from "@/form-schema/inventory/lists/inventoryListSchema";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSubmitVaccine } from "../queries/Antigen/post-queries";
import { useUpdateVaccine } from "../queries/Antigen/put-queries";
import { getVaccineList } from "../restful-api/Antigen/fetch-api";
import { toast } from "sonner";
import { FormSelect } from "@/components/ui/form/form-select";
import { timeUnits, vaccineTypes } from "./types";
import { fetchAgeGroups } from "@/pages/healthServices/agegroup/queries/fetch";
import { isDuplicateVaccine, isDuplicateVaccineList } from "./duplicateChecker";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Combobox } from "@/components/ui/combobox";

interface VaccineModalProps {
  mode: "add" | "edit";
  initialData?: any;
  onClose: () => void;
}

export function VaccineModal({ mode, initialData, onClose }: VaccineModalProps) {
  const [formData, setFormData] = useState<VaccineType | null>(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const { mutateAsync: submitVaccine, isPending: isSubmitting } = useSubmitVaccine();
  const { mutateAsync: updateVaccine, isPending: isUpdating } = useUpdateVaccine();
  const isEditMode = mode === "edit";
  const vaccineData = initialData;

  const [ageGroups, setAgeGroups] = useState<{
    default: any[];
    formatted: { id: string; name: string }[];
  }>({ default: [], formatted: [] });
  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState<string>(isEditMode && vaccineData?.agegrp_id && vaccineData.agegrp_id !== "N/A" ? String(vaccineData.agegrp_id) : "");
  const [loadingAgeGroups, setLoadingAgeGroups] = useState(false);

  const defaultFormData: VaccineType =
    isEditMode && vaccineData
      ? {
          vaccineName: vaccineData.vaccineName,
          noOfDoses: vaccineData.noOfDoses === "N/A" ? (vaccineData.vaccineType === "Conditional" ? 0 : 1) : Number(vaccineData.noOfDoses),
          ageGroup: selectedAgeGroupId,
          type: vaccineData.vaccineType === "Routine" ? "routine" : vaccineData.vaccineType === "Conditional" ? "conditional" : "primary",
          intervals: vaccineData.doseDetails.filter((dose: any) => dose.doseNumber > 1).map((dose: any) => dose.interval || 0),
          timeUnits: vaccineData.doseDetails.filter((dose: any) => dose.doseNumber > 1).map((dose: any) => dose.unit || "months"),
          routineFrequency: {
            interval: (vaccineData.vaccineType === "Routine" && vaccineData.doseDetails[0]?.interval) || 1,
            unit: (vaccineData.vaccineType === "Routine" && vaccineData.doseDetails[0]?.unit) || "years",
          },
        }
      : {
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
    formState: { errors },
    getValues,
  } = form;

  const [type, noOfDoses, ageGroup] = watch(["type", "noOfDoses", "ageGroup"]);

  useEffect(() => {
    const loadAgeGroups = async () => {
      setLoadingAgeGroups(true);
      try {
        const data = await fetchAgeGroups();
        setAgeGroups(data);
        if (isEditMode && vaccineData?.agegrp_id && vaccineData.agegrp_id !== "N/A") {
          const ageGroupId = String(vaccineData.agegrp_id);
          const matchingGroup = data.formatted.find((group) => group.id.split(",")[0] === ageGroupId);

          if (matchingGroup) {
            setSelectedAgeGroupId(ageGroupId);
            form.setValue("ageGroup", ageGroupId, {
              shouldDirty: false,
            });
          } else {
            console.log("Age group not found in formatted list:", ageGroupId);
            setSelectedAgeGroupId("");
            form.setValue("ageGroup", "");
            toast.warning("Initial age group not found; please select a valid age group");
          }
        }
      } catch (error) {
        toast.error("Failed to load age groups: " + (error instanceof Error ? error.message : "Unknown error"));
      } finally {
        setLoadingAgeGroups(false);
      }
    };
    loadAgeGroups();
  }, [isEditMode, form, vaccineData?.agegrp_id]);

  const handleAgeGroupSelection = (id: string) => {
    setSelectedAgeGroupId(id);
    form.setValue("ageGroup", id, { shouldDirty: true });
  };

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

  const handleFormSubmit = async (data: VaccineType) => {
    console.log("Form submitted with data:", data); // Debug log
    console.log("FormData state before update:", formData); // Debug log
    setFormData(data);
    console.log("FormData state after update:", data); // Debug log
  };

  const handleConfirmAction = async () => {
    console.log("Confirm action called"); // Debug log
    console.log("FormData state:", formData); // Debug log

    // Get fresh data from form instead of relying on state
    const currentFormData = form.getValues();
    console.log("Current form data from getValues:", currentFormData); // Debug log

    // Validate the form first
    const isValid = await form.trigger();
    console.log("Form validation result:", isValid); // Debug log

    if (!isValid) {
      console.log("Form validation failed:", form.formState.errors);
      toast.error("Please fix form errors before submitting");
      return;
    }

    // Use currentFormData instead of formData to avoid state timing issues
    const dataToSubmit = formData || currentFormData;

    if (!dataToSubmit) {
      console.error("No form data available for submission");
      toast.error("No form data available. Please try again.");
      return;
    }

    console.log("Data to submit:", dataToSubmit); // Debug log
    setIsCheckingDuplicate(true);

    try {
      console.log("Fetching existing vaccine list..."); // Debug log
      const existingVaccineList = await getVaccineList();
      console.log("Existing vaccine list:", existingVaccineList); // Debug log

      if (!Array.isArray(existingVaccineList)) {
        throw new Error("Invalid API response - expected an array");
      }

      const isDuplicate = isEditMode ? isDuplicateVaccine(existingVaccineList, dataToSubmit.vaccineName, vaccineData?.id) : isDuplicateVaccineList(existingVaccineList, dataToSubmit.vaccineName);

      console.log("Duplicate check result:", isDuplicate); // Debug log

      if (isDuplicate) {
        form.setError("vaccineName", {
          type: "manual",
          message: "This vaccine already exists",
        });
        toast.error("This vaccine already exists");
        return;
      }

      console.log("Submitting vaccine data...");

      if (isEditMode) {
        console.log("Updating vaccine...");
        await updateVaccine({
          formData: {
            ...dataToSubmit,
            ageGroup: selectedAgeGroupId,
          },
          vaccineData: {
            ...vaccineData,
            agegrp_id: selectedAgeGroupId,
          },
        });
      } else {
        console.log("Adding new vaccine...");
        await submitVaccine(dataToSubmit);
      }

      console.log("Submission completed, closing modal...");
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error("Failed to process vaccine", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // Adjusted the onSubmit function to match the expected form data types
  const onSubmit = async (data: {
    vaccineName: string;
    noOfDoses: number;
    type: string;
    ageGroup: string;
    intervals: number[];
    timeUnits: string[];
    routineFrequency?: { interval: number; unit: string };
  }) => {
    try {
      // Validate intervals and timeUnits fields
      if (!data.intervals || !Array.isArray(data.intervals) || data.intervals.length === 0) {
        toast.error("Intervals field is required and must contain at least one entry.");
        return;
      }

      if (!data.timeUnits || !Array.isArray(data.timeUnits) || data.timeUnits.length === 0) {
        toast.error("Time Units field is required and must contain at least one entry.");
        return;
      }

      // Proceed with form submission
      await submitVaccine(data);
      toast.success("Form submitted successfully.");
    } catch (error) {
      toast.error("An error occurred during form submission: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const isSaveButtonDisabled = () => {
    const values = getValues();
    const hasRequiredFields = values.vaccineName && values.ageGroup && values.type;

    // In edit mode, disable if form is not dirty (no changes) or if required fields are missing
    if (isEditMode && !form.formState.isDirty) return true;

    if (!hasRequiredFields) return true;
    if (isCheckingDuplicate || isSubmitting || isUpdating) return true;

    return false;
  };

  const renderDoseFields = () => {
    if (type === "routine") {
      return (
        <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Routine vaccine frequency</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput control={control} name="routineFrequency.interval" label="Repeat Every" type="number" placeholder="e.g., 1" />
            <FormSelect control={control} name="routineFrequency.unit" label="Frequency Unit" options={timeUnits} />
          </div>
        </div>
      );
    }

    if (type === "conditional") {
      const selectedAgeGroup = ageGroups.default.find((group) => group.agegrp_id.toString() === (isEditMode ? selectedAgeGroupId : ageGroup.split(",")[0]));
      return (
        <div className="space-y-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">Conditional vaccine details</p>
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between">
              <span className="text-sm font-medium">
                {selectedAgeGroup ? `${selectedAgeGroup.agegroup_name} (${selectedAgeGroup.min_age}-${selectedAgeGroup.max_age} ${selectedAgeGroup.time_unit})` : "No age group selected"}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return Array.from({ length: noOfDoses }).map((_, doseIndex) => {
      const doseNumber = doseIndex + 1;
      const isFirstDose = doseIndex === 0;
      const showInterval = doseIndex > 0;

      const getDoseLabel = () => {
        const selectedAgeGroup = ageGroups.default.find((group) => group.agegrp_id.toString() === (isEditMode ? selectedAgeGroupId : ageGroup.split(",")[0]));

        const ageGroupLabel = selectedAgeGroup ? `${selectedAgeGroup.agegroup_name} (${selectedAgeGroup.min_age}-${selectedAgeGroup.max_age} ${selectedAgeGroup.time_unit})` : "selected age group";

        if (isFirstDose) {
          return `First dose for ${ageGroupLabel}`;
        }

        const interval = watch(`intervals.${doseIndex - 1}`);
        const timeUnit = watch(`timeUnits.${doseIndex - 1}`);
        return interval && timeUnit ? `Dose ${doseNumber} after ${interval} ${timeUnit}` : `Dose ${doseNumber}`;
      };

      return (
        <div key={doseIndex} className="space-y-3 bg-gray-50 p-4 rounded-lg border">
          <p className="text-sm font-medium text-gray-700">{getDoseLabel()}</p>
          {showInterval && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput control={control} name={`intervals.${doseIndex - 1}`} label="Interval After Previous Dose" type="number" placeholder="e.g., 4" />
              <FormSelect control={control} name={`timeUnits.${doseIndex - 1}`} label="Time Unit" options={timeUnits} />
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="max-w-4xl w-full flex flex-col">
      <div className="mb-6 sticky top-0 bg-white z-10 pb-4 border-b flex justify-center text-darkBlue2">
        <Label className="text-lg font-bold">{mode === "edit" ? "Edit Vaccine List" : "Add Vaccine List"}</Label>
        <hr className="mb-2" />
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput control={control} name="vaccineName" label="Vaccine Name" placeholder="Enter vaccine name" />
                <div>
                  <Label className="text-darkGray">Age Group</Label>
                  <Combobox
                    options={ageGroups.formatted}
                    value={loadingAgeGroups ? "" : isEditMode ? selectedAgeGroupId : ageGroup}
                    onChange={(value: string | undefined) => {
                      if (value) {
                        handleAgeGroupSelection(value);
                      }
                    }}
                    triggerClassName="w-full mt-2"
                    placeholder={loadingAgeGroups ? "Loading..." : "Select age group"}
                    emptyMessage={
                      <div className="text-center">
                        <p className="text-sm text-gray-600"> No age groups found.</p>
                        <Link to="/age-group" className="text-sm text-teal-600 hover:underline">
                          Manage Group
                        </Link>
                      </div>
                    }
                  />
                  {errors.ageGroup && <p className="text-red-500 text-xs mt-1">{errors.ageGroup.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormSelect control={control} name="type" label="Vaccine Type" options={vaccineTypes} />
                {type !== "conditional" && <FormInput control={control} name="noOfDoses" label="Required Doses" type="number" placeholder="e.g., 1" />}
              </div>
              {type === "routine" && <p className="text-sm text-gray-500">Routine vaccines require 1 dose.</p>}
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Dose Schedule</h2>
              {renderDoseFields()}
            </div>
          </form>
        </Form>
      </div>

      <div className="sticky bottom-1 bg-white border-t p-4 flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <ConfirmationModal
          trigger={
            <Button
              type="button"
              onClick={() => {
                console.log("Submit button clicked"); // Debug log
                // Trigger form submission first
                handleSubmit(handleFormSubmit)();
              }}
              disabled={isSaveButtonDisabled()}
              title={!getValues().vaccineName || !getValues().ageGroup || !getValues().type ? "Please fill in all required fields" : isEditMode ? "No changes detected" : ""}
            >
              {isCheckingDuplicate || isSubmitting || isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCheckingDuplicate ? "Processing..." : isEditMode ? "Updating..." : "Submitting..."}
                </>
              ) : isEditMode ? (
                "Update"
              ) : (
                "Submit"
              )}
            </Button>
          }
          title={`Confirm Vaccine ${isEditMode ? "Update" : "Addition"}`}
          description={`Are you sure you want to ${isEditMode ? "update" : "add"} the vaccine "${watch("vaccineName")}"?`}
          onClick={handleConfirmAction}
          actionLabel={isCheckingDuplicate || isSubmitting || isUpdating ? "Processing..." : "Confirm"}
        />
      </div>
    </div>
  );
}

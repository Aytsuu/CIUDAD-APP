import { useState, useEffect } from "react";
import { FormField, FormItem, FormMessage, FormControl, FormLabel, Form } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import { useForm } from "react-hook-form";
import { MedicineType, MedicineListSchema } from "@/form-schema/inventory/lists/inventoryListSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddMedicine } from "../queries/medicine/MedicinePostQueries";
import { useUpdateMedicine } from "../queries/medicine/MedicinePutQueries";
import { FormInput } from "@/components/ui/form/form-input";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { useCategoriesMedicine } from "@/pages/healthInventory/inventoryStocks/REQUEST/Category/Medcategory";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { useMedicinesList } from "../queries/medicine/MedicineFetchQueries";
import { formOptions, formMedOptions, dosageUnitOptions } from "./types";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export const isDuplicateMedicine = (medicines: any[], newMedicine: string, medDsg: number, medDsgUnit: string, medForm: string) => {
    return medicines.some((med) => {
      const isNameDuplicate = med?.med_name?.trim()?.toLowerCase() === newMedicine?.trim()?.toLowerCase();
      const isDosageDuplicate = Number(med?.med_dsg) === Number(medDsg);
      const isDosageUnitDuplicate = med?.med_dsg_unit?.trim()?.toLowerCase() === medDsgUnit?.trim()?.toLowerCase();
      const isFormDuplicate = med?.med_form?.trim()?.toLowerCase() === medForm?.trim()?.toLowerCase();
  
      return isNameDuplicate && isDosageDuplicate && isDosageUnitDuplicate && isFormDuplicate;
    });
  };

interface MedicineModalProps {
  mode?: "add" | "edit";
  initialData?: any;
  onClose: () => void;
}

export default function MedicineModal({ mode = "add", initialData, onClose }: MedicineModalProps) {
  const [medicineName, setMedicineName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const { categories, handleDeleteConfirmation, categoryHandleAdd, ConfirmationDialogs } = useCategoriesMedicine();
  const { mutateAsync: addMedicineMutation } = useAddMedicine();
  const { mutateAsync: updateMedicineMutation } = useUpdateMedicine();
  const { data: medicines } = useMedicinesList();

  const form = useForm<MedicineType>({
    resolver: zodResolver(MedicineListSchema),
    defaultValues: {
      medicineName: initialData?.med_name || "",
      cat_id: String(initialData?.cat_id) || "",
      med_type: initialData?.med_type || "",
      med_dsg: initialData?.med_dsg || undefined,
      med_dsg_unit: initialData?.med_dsg_unit || "",
      med_form: initialData?.med_form || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (mode === "edit" && initialData && categories.length > 0 && initialData.cat_id) {
      const catIdString = String(initialData.cat_id);
      const categoryExists = categories.some((cat) => String(cat.id) === catIdString);
      if (categoryExists) {
        form.setValue("cat_id", catIdString);
      } else {
        console.warn(
          "Category not found in options:",
          catIdString,
          "Available:",
          categories.map((c) => c.id)
        );
      }
    }
  }, [categories, mode, initialData, form]);

  // Check if form has changes in edit mode
  const hasFormChanges = () => {
    if (mode !== "edit" || !initialData) return true;
    
    const currentValues = form.getValues();
    
    return (
      currentValues.medicineName !== initialData.med_name ||
      String(currentValues.cat_id) !== String(initialData.cat_id) ||
      currentValues.med_type !== initialData.med_type ||
      Number(currentValues.med_dsg) !== Number(initialData.med_dsg) ||
      currentValues.med_dsg_unit !== initialData.med_dsg_unit ||
      currentValues.med_form !== initialData.med_form
    );
  };

  const handleConfirmAction = async () => {
    // In edit mode, don't proceed if no changes were made
    if (mode === "edit" && !hasFormChanges()) {
      return;
    }

    // Trigger validation before showing confirmation
    const isValid = await form.trigger();
    
    if (!isValid) {
      setShowValidation(true);
      return;
    }

    setIsSubmitting(true);
    const formData = form.getValues();
    formData.cat_id = String(formData.cat_id);

    try {
      if (mode === "add" || (mode === "edit" && formData.medicineName !== initialData?.med_name)) {
        const existingMedicines = medicines || [];

        if (!Array.isArray(existingMedicines)) {
          throw new Error("Invalid API response - expected an array");
        }

        console.log("Checking for duplicates with:", {
          existingMedicines,
          newMedicine: formData.medicineName,
          medDsg: formData.med_dsg,
          medDsgUnit: formData.med_dsg_unit,
          medForm: formData.med_form,
        });

        if (
          isDuplicateMedicine(
            existingMedicines,
            formData.medicineName,
            formData.med_dsg,
            formData.med_dsg_unit,
            formData.med_form
          )
        ) {
          form.setError("medicineName", {
            type: "manual",
            message: "Medicine with the same name, dosage, unit, and form already exists",
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (mode === "edit" && initialData) {
        await updateMedicineMutation({ med_id: initialData.id, data: formData });
        showSuccessToast("Medicine updated successfully");
      } else {
        await addMedicineMutation(formData);
        showSuccessToast("Medicine added successfully");
      }

      onClose();
    } catch (err) {
      console.error("Error during submission:", err);
      showErrorToast("Failed to submit medicine");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: MedicineType) => {
    // This will be called when the form is submitted (before confirmation modal)
    setMedicineName(data.medicineName);
  };

  const getCurrentCategoryName = () => {
    if (mode === "add") return "Select category";

    const currentId = form.watch("cat_id") || initialData?.cat_id;
    if (!currentId) return "Select category";

    const currentIdString = String(currentId);
    const foundCategory = categories.find((cat) => String(cat.id) === currentIdString);
    if (foundCategory) return foundCategory.name;

    if (initialData?.cat_name) return initialData.cat_name;

    return "Select category";
  };

  if (mode === "edit" && !initialData) {
    return null;
  }

  const isEditMode = mode === "edit";
  const hasChanges = hasFormChanges();
  const isFormValid = form.formState.isValid;

  // Determine if button should be disabled
  const isButtonDisabled = 
    isSubmitting || 
    (isEditMode && !hasChanges) || 
    !isFormValid;

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="flex flex-col gap-3">
            <Label className="flex justify-center text-lg font-bold text-darkBlue2 text-center ">{mode === "edit" ? "Edit Medicine" : "Add Medicine List"}</Label>
            <hr className="mb-2" />

            <FormInput 
              control={form.control} 
              name="medicineName" 
              label="Medicine Name" 
              placeholder="Enter medicine name" 
            />

            <FormSelect
              control={form.control}
              name="med_type"
              label="Medicine Type"
              options={formOptions}
            />

            <FormField
              control={form.control}
              name="cat_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-darkGray">Category</FormLabel>
                  <FormControl>
                    <SelectLayoutWithAdd
                      className="w-full"
                      placeholder={getCurrentCategoryName()}
                      label="Select a Category"
                      disabled={isSubmitting}
                      options={
                        categories.length > 0
                          ? categories.map((cat) => ({
                              ...cat,
                              id: String(cat.id),
                              name: cat.name,
                            }))
                          : [] // Empty array when no data
                      }
                      value={field.value || ""}
                      onChange={(value) => {
                        const stringValue = String(value);
                        field.onChange(stringValue);
                      }}
                      onAdd={(newCategoryName) => {
                        categoryHandleAdd(newCategoryName, (newId) => {
                          const stringId = String(newId);
                          field.onChange(stringId);
                        });
                      }}
                      onDelete={(id) => {
                        const numericId = isNaN(Number(id)) ? id : Number(id);
                        handleDeleteConfirmation(Number(numericId));
                      }}
                    />
                  </FormControl>
                  {showValidation && <FormMessage />}
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput 
                control={form.control} 
                name="med_dsg" 
                label="Dosage" 
                placeholder="Dsg" 
                type="number" 
              />
              <FormSelect 
                control={form.control} 
                name="med_dsg_unit" 
                label="Dosage Unit" 
                options={dosageUnitOptions} 
              />
              <FormSelect 
                control={form.control} 
                name="med_form" 
                label="Form" 
                options={formMedOptions} 
              />
            </div>
          </div>

          <div className="w-full flex flex-col sm:flex-row justify-end mt-6 sm:mt-8 gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <ConfirmationModal
              trigger={
                <Button 
                  type="submit" 
                  disabled={isButtonDisabled}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === "edit" ? "Updating..." : "Submitting..."}
                    </>
                  ) : mode === "edit" ? (
                    "Update"
                  ) : (
                    "Submit"
                  )}
                </Button>
              }
              title={mode === "edit" ? "Update Medicine" : "Add Medicine"}
              description={`Are you sure you want to ${mode === "edit" ? "update" : "add"} the medicine "${medicineName}"?`}
              onClick={handleConfirmAction}
              actionLabel={isSubmitting ? "Processing..." : "Confirm"}
            />
          </div>
        </form>
      </Form>

      <ConfirmationDialogs />
    </div>
  );
}
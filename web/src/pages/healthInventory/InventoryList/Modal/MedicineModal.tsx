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
import { toast } from "sonner";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { useMedicines } from "../queries/medicine/MedicineFetchQueries";
import { MedicineData, formOptions } from "./types";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { isDuplicateMedicine } from "./duplicateChecker";

interface MedicineModalProps {
  mode?: "add" | "edit";
  initialData?: MedicineData;
  onClose: () => void;
}

export default function MedicineModal({ mode = "add", initialData, onClose }: MedicineModalProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [medicineName, setMedicineName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { categories, handleDeleteConfirmation, categoryHandleAdd, ConfirmationDialogs } = useCategoriesMedicine();
  const { mutateAsync: addMedicineMutation } = useAddMedicine();
  const { mutateAsync: updateMedicineMutation } = useUpdateMedicine();
  const { data: medicines } = useMedicines();

  const form = useForm<MedicineType>({
    resolver: zodResolver(MedicineListSchema),
    defaultValues: {
      medicineName: "",
      cat_id: "",
      med_type: ""
    }
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.reset({
        medicineName: initialData.medicineName || "",
        cat_id: String(initialData.cat_id),
        med_type: initialData.med_type || ""
      });
      setIsInitialized(true);
    } else if (mode === "add") {
      form.reset({
        medicineName: "",
        cat_id: "",
        med_type: ""
      });
      setIsInitialized(true);
    }
  }, [mode, initialData, form]);

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

  const handleConfirmAction = async () => {
    setIsSubmitting(true);
    const formData = form.getValues();
    formData.cat_id = String(formData.cat_id);

    try {
      if (mode === "add" || (mode === "edit" && formData.medicineName !== initialData?.medicineName)) {
        const existingMedicines = medicines || [];

        if (!Array.isArray(existingMedicines)) {
          throw new Error("Invalid API response - expected an array");
        }

        if (isDuplicateMedicine(existingMedicines, formData.medicineName, mode === "edit" ? initialData?.id : undefined)) {
          form.setError("medicineName", {
            type: "manual",
            message: "Medicine name already exists"
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
    if (!data.cat_id) {
      toast.error("Please select a category");
      form.setError("cat_id", {
        type: "manual",
        message: "Category is required"
      });
      return;
    }


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

  const formValues = form.watch();
  const isEditMode = mode === "edit";
  const hasFormChanges = isEditMode && initialData ? formValues.medicineName !== initialData.medicineName || String(formValues.cat_id) !== String(initialData.cat_id) || formValues.med_type !== initialData.med_type : true;

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="flex flex-col gap-3">
            <Label className="flex justify-center text-lg font-bold text-darkBlue2 text-center ">{mode === "edit" ? "Edit Medicine" : "Add Medicine List"}</Label>
            <hr className="mb-2" />

            <FormInput control={form.control} name="medicineName" label="Medicine Name" placeholder="Enter medicine name" />

            <FormSelect control={form.control} name="med_type" label="Medicine Type" options={formOptions} />

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
                              name: cat.name
                            }))
                          : [{ id: "loading", name: "Loading categories..." }]
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full flex flex-col sm:flex-row justify-end mt-6 sm:mt-8 gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <ConfirmationModal
              trigger={
                <Button type="submit" disabled={isSubmitting || (isEditMode && !hasFormChanges)}>
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

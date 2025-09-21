import { useState, useEffect } from "react";
import { FormField, FormItem, FormMessage, FormControl, FormLabel, Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { FirstAidType, FirstAidSchema } from "@/form-schema/inventory/lists/inventoryListSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddFirstAid } from "../queries/firstAid/post-queries";
import { useUpdateFirstAid } from "../queries/firstAid/put-queries";
import { FormInput } from "@/components/ui/form/form-input";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { useCategoriesFirstAid } from "@/pages/healthInventory/inventoryStocks/REQUEST/Category/FirstAidCategory";
import { toast } from "sonner";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { useFirstAid } from "../queries/firstAid/fetch-queries";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface FirstAidData {
  id: string;
  fa_name: string;
  cat_name: string;
  cat_id: string;
}

interface FirstAidModalProps {
  mode?: "add" | "edit";
  initialData?: FirstAidData;
  onClose: () => void;
}

export function FirstAidModal({ mode = "add", initialData, onClose }: FirstAidModalProps) {
  const [firstAidName, setFirstAidName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const { categories, handleDeleteConfirmation, categoryHandleAdd, ConfirmationDialogs } = useCategoriesFirstAid();
  const { mutateAsync: addFirstAidMutation } = useAddFirstAid();
  const { mutateAsync: updateFirstAidMutation } = useUpdateFirstAid();
  const { data: firstAids } = useFirstAid();

  const form = useForm<FirstAidType>({
    resolver: zodResolver(FirstAidSchema),
    defaultValues: {
      fa_name:  initialData?.fa_name || "",
      cat_id: String(initialData?.cat_id) || ""
    }
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

  useEffect(() => {
    const subscription = form.watch(() => {
      const isValid = form.formState.isValid;
      setIsFormValid(isValid);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleConfirmAction = async () => {
    setIsSubmitting(true);
    const formData = form.getValues();
    formData.cat_id = String(formData.cat_id);

    try {
      if (mode === "add" || (mode === "edit" && formData.fa_name !== initialData?.fa_name)) {
        const existingFirstAids = firstAids || [];

        if (!Array.isArray(existingFirstAids)) {
          throw new Error("Invalid API response - expected an array");
        }

        if (isDuplicateFirstAid(existingFirstAids, formData.fa_name, mode === "edit" ? initialData?.id : undefined)) {
          form.setError("fa_name", {
            type: "manual",
            message: "First Aid name already exists"
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (mode === "edit" && initialData) {
        await updateFirstAidMutation({ fa_id: initialData.id, data: formData });
        showSuccessToast("First Aid updated successfully");
      } else {
        await addFirstAidMutation({ data: formData });
        showSuccessToast("First Aid added successfully");
      }

      onClose();
    } catch (err) {
      console.error("Error during submission:", err);
      showErrorToast("An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDuplicateFirstAid = (firstAids: any[], newFirstAid: string, currentId?: string) => {
    return firstAids.some((fa) => fa.id !== currentId && fa?.fa_name?.trim()?.toLowerCase() === newFirstAid?.trim()?.toLowerCase());
  };

 
  const onSubmit = (data: FirstAidType) => {
    if (!data.cat_id) {
      toast.error("Please select a category");
      form.setError("cat_id", {
        type: "manual",
        message: "Category is required"
      });
      return;
    }
    setFirstAidName(data.fa_name);
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

  const formValues = form.watch();
  const isEditMode = mode === "edit";
  const hasFormChanges = isEditMode && initialData ? formValues.fa_name !== initialData.fa_name || String(formValues.cat_id) !== String(initialData.cat_id) : true;

  if (mode === "edit" && !initialData) {
    return null;
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <div className="flex flex-col gap-3">
            <Label className="flex justify-center text-lg font-bold text-darkBlue2 text-center ">{mode === "edit" ? "Edit First Aid List" : "Add First Aid List"}</Label>
            <hr className="mb-2" />

            <FormInput control={form.control} name="fa_name" label="First Aid Name" placeholder="Enter first aid name" />

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
                <Button type="submit" disabled={isSubmitting || (isEditMode && !hasFormChanges) || !isFormValid}>
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
              title={mode === "edit" ? "Update First Aid" : "Add First Aid"}
              description={`Are you sure you want to ${mode === "edit" ? "update" : "add"} the first aid "${firstAidName}"?`}
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

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
  FormLabel,
  Form,
} from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import { useForm } from "react-hook-form";
import {
  MedicineType,
  MedicineListSchema,
} from "@/form-schema/inventory/lists/inventoryListSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { getMedicines } from "../restful-api/medicine/MedicineFetchAPI";
import { FormInput } from "@/components/ui/form/form-input";
import { useCategoriesMedicine } from "@/pages/healthInventory/inventoryStocks/REQUEST/Category/Medcategory";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { toast } from "sonner";
import { useUpdateMedicine } from "../queries/medicine/MedicinePutQueries";
import { CircleCheck } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";
import { Link,useNavigate } from "react-router-dom";

export const formOptions = [
  { id: "Over The Counter", name: "Over the Counter" },
  { id: "Prescription", name: "Prescription" },
];

interface MedicineData {
  id: string;
  medicineName: string;
  cat_name: string;
  cat_id: string;
  med_type?: string;
}

export default function MedicineListEdit() {
  const location = useLocation();
  const initialData = location.state?.params?.initialData as MedicineData;
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  const form = useForm<MedicineType>({
    resolver: zodResolver(MedicineListSchema),
    defaultValues: {
      medicineName: "",
      cat_id: "",
      med_type: "",
    },
  });

  const queryClient = useQueryClient();
  const {
    categories,
    handleDeleteConfirmation,
    categoryHandleAdd,
    ConfirmationDialogs,
  } = useCategoriesMedicine();

  useEffect(() => {
    if (initialData && categories.length > 0 && !isInitialized) {
      form.reset({
        medicineName: initialData.medicineName,
        cat_id: initialData.cat_id,
        med_type: initialData.med_type,
      });
      setIsInitialized(true);
    }
  }, [initialData, categories, form, isInitialized]);

  const { mutate: updateMedicineMutation, isPending } = useUpdateMedicine();
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState("");

  const confirmUpdate = () => {
    const formData = form.getValues();
    setIsUpdateConfirmationOpen(false);

    updateMedicineMutation(
      {
        med_id: initialData.id,
        data: formData,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["medicines"] });
          toast.success("Medicine updated successfully", {
            icon: (
              <CircleCheck size={18} className="fill-green-500 stroke-white" />
            ),
            duration: 2000,
          });
          navigate("/mainInventoryList"); // Navigate immediately

        },
        onError: (error) => {
          console.error("Error updating medicine:", error);
          toast.error("Failed to update medicine");
        },
      }
    );
  };

  const isDuplicateMedicine = (
    medicines: any[],
    newMedicine: string,
    catId: string,
    currentId?: string
  ) => {
    return medicines.some(
      (med) =>
        med.id !== currentId &&
        med?.med_name?.trim()?.toLowerCase() ===
          newMedicine?.trim()?.toLowerCase() &&
        String(med?.cat) === String(catId)
    );
  };

  const onSubmit = async (data: MedicineType) => {
    try {
      form.clearErrors();
      const existingMedicines = await getMedicines();

      if (!Array.isArray(existingMedicines)) {
        throw new Error("Invalid API response - expected an array");
      }

      if (!data.cat_id) {
        toast.error("Please select a category");
        form.setError("cat_id", {
          type: "manual",
          message: "Category is required",
        });
        return;
      }

      const isNameChanged =
        data.medicineName.trim().toLowerCase() !==
        initialData.medicineName.trim().toLowerCase();
      const isCategoryChanged =
        String(data.cat_id) !== String(initialData.cat_id);
      const isMedTypeChanged = data.med_type !== initialData.med_type;

      if (
        (isNameChanged || isCategoryChanged) &&
        isDuplicateMedicine(
          existingMedicines,
          data.medicineName,
          data.cat_id,
          initialData.id
        )
      ) {
        form.setError("medicineName", {
          type: "manual",
          message: "Medicine name already exists in this category",
        });
        return;
      }
      if (!isNameChanged && !isCategoryChanged && !isMedTypeChanged) {
        toast.info("No changes detected");
        return;
      }

      setNewMedicineName(data.medicineName);
      setIsUpdateConfirmationOpen(true);
    } catch (err) {
      console.error("Error validating input:", err);
      toast.error("Failed to verify medicine uniqueness. Please try again.");
    }
  };

  const getCurrentCategoryName = () => {
    const currentId = form.watch("cat_id");
    if (!currentId) return "Select category";
    const foundCategory = categories.find((cat) => cat.id === currentId);
    return foundCategory?.name || initialData?.cat_name || "Select category";
  };

  if (!initialData) {
    return (
      <div className="w-full flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white p-4 w-full max-w-[500px] rounded-sm">
          <p className="text-red-500">Error: No medicine data provided</p>
          <Button variant="outline" className="mt-4">
            <Link to="/mainInventoryList">Go Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4">
      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-white p-4 w-full max-w-[500px] rounded-sm"
        >
          <div className="flex flex-col gap-3">
            <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
              <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Edit Medicine
            </Label>

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
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="text-darkGray">Category</FormLabel>
                    <FormControl>
                      <SelectLayoutWithAdd
                        className="w-full"
                        placeholder={getCurrentCategoryName()}
                        label="Select a Category"
                        options={
                          categories.length > 0
                            ? categories
                            : [{ id: "loading", name: "Loading..." }]
                        }
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        onAdd={(newCategoryName) => {
                          categoryHandleAdd(newCategoryName, (newId) => {
                            field.onChange(newId);
                          });
                        }}
                        onDelete={(id) => handleDeleteConfirmation(Number(id))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          <div className="w-full flex flex-col sm:flex-row justify-end mt-6 sm:mt-8 gap-2">
            <Button variant="outline" className="w-full sm:w-auto">
              <Link to="/mainInventoryList">Cancel</Link>
            </Button>
            <Button
              className="bg-blue text-white px-4 py-2 rounded w-full sm:w-auto"
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isUpdateConfirmationOpen}
        onOpenChange={setIsUpdateConfirmationOpen}
        title="Update Medicine"
        description={`Are you sure you want to update the medicine "${newMedicineName}"?`}
        onConfirm={confirmUpdate}
      />

      <ConfirmationDialogs />
    </div>
  );
}
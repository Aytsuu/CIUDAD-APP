  import React, { useState } from "react";
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
  import { useAddMedicine } from "../queries/medicine/MedicinePostQueries";
  import { getMedicines } from "../requests/get/getMedicines";
  import { FormInput } from "@/components/ui/form/form-input";
  import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
  import { useCategoriesMedicine } from "@/pages/healthInventory/inventoryStocks/REQUEST/Category/Medcategory";
  import { toast } from "sonner";
  import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
  import { CircleCheck } from "lucide-react";
  import { useQueryClient } from "@tanstack/react-query";
  import { Link, useNavigate } from "react-router-dom";
  import { Button } from "@/components/ui/button/button";
  import { Label } from "@/components/ui/label";
  import { Pill } from "lucide-react";

  export const formOptions = [
    { id: "Over the Counter", name: "Over the Counter" },
    { id: "Prescription", name: "Prescription" },
  ];

  export default function MedicineModal() {
    const form = useForm<MedicineType>({
      resolver: zodResolver(MedicineListSchema),
      defaultValues: {
        medicineName: "",
        cat_id: "",
        med_type: "",
      },
    });

    const {
      categories,
      handleDeleteConfirmation,
      categoryHandleAdd,
      ConfirmationDialogs,
    } = useCategoriesMedicine();

    const { mutate: addMedicineMutation, isPending } = useAddMedicine();
    const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
    const [newMedicineName, setNewMedicineName] = useState<string>("");
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const getCurrentCategoryName = () => {
      const currentId = form.watch("cat_id");

      // If no category is selected (null, undefined, or empty string)
      if (!currentId) return "Select category";

      const foundCategory = categories.find((cat) => cat.id === currentId);

      return foundCategory?.name ?? "Select category";
    };

    const confirmAdd = async () => {
      const formData = form.getValues();
      setIsAddConfirmationOpen(false);

      if (formData.medicineName.trim()) {
        addMedicineMutation(formData, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["medicines"] });
            toast.success("Medicine added successfully", {
              icon: (
                <CircleCheck size={18} className="fill-green-500 stroke-white" />
              ),
              duration: 2000,
            });
            form.reset();
            navigate("/mainInventoryList"); // Navigate immediately

          },
          onError: (error: unknown) => {
            console.error("Failed to add medicine:", error);
            toast.error("Failed to add medicine");
          },
        });
      } else {
        form.setError("medicineName", {
          type: "manual",
          message: "Medicine name is required",
        });
      }
    };

    const isDuplicateMedicine = (
      medicines: any[],
      newMedicine: string,
      catId: string
    ) => {
      return medicines.some(
        (med) =>
          med.med_name.trim().toLowerCase() ===
            newMedicine.trim().toLowerCase() && String(med.cat) === String(catId)
      );
    };

    const onSubmit = async (data: MedicineType) => {
      try {
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

        if (
          isDuplicateMedicine(existingMedicines, data.medicineName, data.cat_id)
        ) {
          form.setError("medicineName", {
            type: "manual",
            message: "Medicine already exists in this category",
          });
          return;
        }

        setNewMedicineName(data.medicineName);
        setIsAddConfirmationOpen(true);
      } catch (err) {
        console.error("Error checking for duplicates:", err);
      }
    };

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
                Add Medicine List
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
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-darkGray">Category</FormLabel>
      <FormControl>
        <SelectLayoutWithAdd
          className="w-full"
          placeholder="Select category"
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
  )}
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
                {isPending ? "Adding..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>

        <ConfirmationDialog
          isOpen={isAddConfirmationOpen}
          onOpenChange={setIsAddConfirmationOpen}
          title="Add Medicine"
          description={`Are you sure you want to add the medicine "${newMedicineName}"?`}
          onConfirm={confirmAdd}
        />

        <ConfirmationDialogs />
      </div>
    );
  }
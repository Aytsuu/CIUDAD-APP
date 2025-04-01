import React, { useEffect, useState } from "react";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
  FormLabel,
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  MedicineType,
  MedicineListSchema,
} from "@/form-schema/inventory/inventoryListSchema";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { getMedicines } from "../requests/get/getMedicines";
import { updateMedicine } from "../requests/update/UpdateMedicine";
import {useQueryClient } from "@tanstack/react-query";
import { FormInput } from "@/components/ui/form/form-input";

interface MedicineListProps {
  initialData: {
    id: number;
    medicineName: string;
  };
  setIsDialog: (isOpen: boolean) => void; // Add this line
}
 
export default function MedicineListEdit({
  initialData,

  setIsDialog,
}: MedicineListProps) {
  const form = useForm<MedicineType>({
    resolver: zodResolver(MedicineListSchema),
    defaultValues: {
      medicineName: initialData.medicineName,
    },
  });

  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState<string>("");
  const queryClient = useQueryClient();

  const confirmAdd = async () => {
    try {
      await updateMedicine(initialData.id, newMedicineName); // Update the medicine
      setIsDialog(false);
      setIsAddConfirmationOpen(false);
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    } catch (err) {
      console.error("Error updating medicine:", err);
    }
  };

  const isDuplicateMedicine = (medicines: any[], newMedicine: string) => {
    return medicines.some(
      (med) => med.med_name.toLowerCase() === newMedicine.toLowerCase()
    );
  };

  const onSubmit = async (data: MedicineType) => {
    setIsDialog(false);

    try {
      const existingMedicines = await getMedicines();
      if (!Array.isArray(existingMedicines))
        throw new Error("Invalid API response");

      if (isDuplicateMedicine(existingMedicines, data.medicineName)) {
        form.setError("medicineName", {
          type: "manual",
          message: "Medicine already exists.",
        });
        return;
      }
      setNewMedicineName(data.medicineName);
      setIsAddConfirmationOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3">         
                <FormInput control={form.control} name="medicineName" label="Medicine Name<" placeholder="Medicine Name<"/>
            {/* Submit Button */}
            <div className="w-full flex justify-end mt-8">
              <Button type="submit">Submit</Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isAddConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Update Medicine"
        description={`Are you sure you want to update the medicine to "${newMedicineName}"?`}
      />
    </div>
  );
}

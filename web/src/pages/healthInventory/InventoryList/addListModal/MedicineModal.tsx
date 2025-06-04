import React from "react";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
  FormLabel,
  Form,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  MedicineType,
  MedicineListSchema,
} from "@/form-schema/inventory/inventoryListSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import {useQueryClient } from "@tanstack/react-query";
import { addMedicine } from "../requests/post/medicine";
import { getMedicines } from "../requests/get/getMedicines";
import { FormInput } from "@/components/ui/form/form-input";
interface MedicineModalProps {
  setIsDialog: (isOpen: boolean) => void;
}
export default function MedicineModal({
  setIsDialog,
}: MedicineModalProps) {
  const form = useForm<MedicineType>({
    resolver: zodResolver(MedicineListSchema),
    defaultValues: { medicineName: "" },
  });

  // State for add confirmation dialog
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState<string>("");
  const queryClient = useQueryClient();

  const confirmAdd = async () => {
    if (newMedicineName.trim()) {
      try {
        if (await addMedicine(newMedicineName)) {
          setIsAddConfirmationOpen(false);
          setIsDialog(false);
          setNewMedicineName(""); 
          // ✅ Invalidate the cache to trigger a refetch
          queryClient.invalidateQueries({ queryKey: ["medicines"] });
        } else {
          console.error("Failed to add medicine.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };
  

  const isDuplicateMedicine = (medicines: any[], newMedicine: string) => {
    return medicines.some(
      (med) => med.med_name.toLowerCase() === newMedicine.toLowerCase()
    );
  };

  const onSubmit = async (data: MedicineType) => {
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
          <FormInput control={form.control} name="medicineName" label="Medicine Name" placeholder="Enter medicine name" />
          </div>
          <div className="w-full flex justify-end mt-8">
            <button type="submit" className="bg-blue text-white px-4 py-2 rounded"> Submit</button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isAddConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Add Medicine"
        description={`Are you sure you want to add the medicine "${newMedicineName}"?`}
      />
    </div>
  );
}
 
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
import { ConfirmationDialog } from "../../confirmationLayout/ConfirmModal";
import { getMedicines } from "../requests/GetRequest";
import { updateMedicine } from "../requests/UpdateRequest";

interface MedicineListProps { 
  initialData: {
    id: number;
    medicineName: string;
  };
  fetchData: () => void; // Add this line
  setIsDialog: (isOpen: boolean) => void; // Add this line
}

export default function MedicineListEdit({
  initialData,
  fetchData,
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

  const confirmAdd = async () => {
    try {
      await updateMedicine(initialData.id, newMedicineName); // Update the medicine
      setIsAddConfirmationOpen(false); // Close the confirmation dialog
      setIsDialog(false); // Close the edit dialog
      fetchData(); // Refresh the table data
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
      setIsDialog(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3">
            {/* Medicine Name Field */}
            <FormField
              control={form.control}
              name="medicineName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicine Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter medicine name"
                      {...field} // Spread field props for better integration
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

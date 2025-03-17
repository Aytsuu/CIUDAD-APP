import React from "react";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
  FormLabel,
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  MedicineType,
  MedicineListSchema,
} from "@/form-schema/inventory/inventoryListSchema";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { getMedicines } from "../REQUEST/GetRequest";
import { addMedicine } from "../REQUEST/postrequest";
import { ConfirmationDialog } from "../../CONFIRMATION MODAL/ConfirmModal";

export default function MedicineModal() {
  const form = useForm<MedicineType>({
    resolver: zodResolver(MedicineListSchema),
    defaultValues: { medicineName: "" },
  });

  // State for add confirmation dialog
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState<string>("");

  const confirmAdd = async () => {
    if (newMedicineName.trim()) {
      try {
        if (await addMedicine(newMedicineName)) {
          console.log("✅ Medicine added successfully");
          form.reset();
        } else {
          console.error("Failed to add medicine.");
        }
      } catch (err) {
        console.error("🔥 Error adding medicine:", err);
      }
      setIsAddConfirmationOpen(false);
      setNewMedicineName("");
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
      console.error("🔥 Error:", err);
      form.setError("medicineName", {
        type: "manual",
        message: "An error occurred.",
      });
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="medicineName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicine Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Medicine Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full flex justify-end mt-8">
            <button
              type="submit"
              className="bg-blue text-white px-4 py-2 rounded"
            >
              Submit
            </button>
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

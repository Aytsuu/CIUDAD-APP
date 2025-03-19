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
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { Button } from "@/components/ui/button";
import {
  FirstAidType,
  FirstAidSchema,
} from "@/form-schema/inventory/inventoryListSchema";
import { getFirstAid } from "../requests/GetRequest";
import { addFirstAid } from "../requests/Postrequest";
import { ConfirmationDialog } from "../../confirmationLayout/ConfirmModal";
import { updateFirstAid, updateMedicine } from "../requests/UpdateRequest";

interface FirstAidListProps {
  initialData: {
    id: number;
    firstAidName: string;
  };
  fetchData: () => void;
  setIsDialog: (isOpen: boolean) => void;
}

export default function EditFirstAidModal({
  initialData,
  fetchData,
  setIsDialog,
}: FirstAidListProps) {
  const form = useForm<FirstAidType>({
    resolver: zodResolver(FirstAidSchema),
    defaultValues: {
      firstAidName: initialData.firstAidName,
    },
  });

  // State for add confirmation dialog
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newFirstAidName, setnewFirstAidName] = useState<string>("");
  
  const confirmAdd = async () => {
    try {
      await updateFirstAid(initialData.id, newFirstAidName); // Update the medicine
      setIsAddConfirmationOpen(false); // Close the confirmation dialog
      setIsDialog(false); // Close the edit dialog
      fetchData(); // Refresh the table data
    } catch (err) {
      console.error("Error updating medicine:", err);
    }
  };

  const isDuplicateFirstAidName = (firstaid: any[], newFirstAid: string) => {
    return firstaid.some(
      (fa) => fa.fa_name.toLowerCase() === newFirstAid.toLowerCase()
    );
  };

  const onSubmit = async (data: FirstAidType) => {
    try {
      const existingMedicines = await getFirstAid();
      if (!Array.isArray(existingMedicines))
        throw new Error("Invalid API response");

      if (isDuplicateFirstAidName(existingMedicines, data.firstAidName)) {
        form.setError("firstAidName", {
          type: "manual",
          message: "FirstAid already exists.",
        });
        return;
      }
      setnewFirstAidName(data.firstAidName);
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
            <FormField
              control={form.control}
              name="firstAidName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={field.value}
                      placeholder="Item Name"
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full flex justify-end mt-8">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isAddConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Add Medicine"
        description={`Are you sure you want to add the medicine "${newFirstAidName}"?`}
      />
    </div>
  );
}

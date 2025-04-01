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
import { Button } from "@/components/ui/button";
import {
  FirstAidType,
  FirstAidSchema,
} from "@/form-schema/inventory/inventoryListSchema";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import {  useQueryClient } from "@tanstack/react-query";
import {getFirstAid} from "../requests/get/getFirstAid";
import { updateFirstAid } from "../requests/update/UpdateFirstAid";
import { FormInput } from "@/components/ui/form/form-input";
interface FirstAidListProps {
  initialData: {
    id: number;
    firstAidName: string;
  };
  setIsDialog: (isOpen: boolean) => void;
}

export default function EditFirstAidModal({
  initialData,
  setIsDialog,
}: FirstAidListProps) {
  const form = useForm<FirstAidType>({
    resolver: zodResolver(FirstAidSchema),
    defaultValues: {
      firstAidName: initialData.firstAidName,
    },
  });

  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newFirstAidName, setnewFirstAidName] = useState<string>("");
  const queryClient = useQueryClient();

  const confirmAdd = async () => {
    try {
      await updateFirstAid(initialData.id, newFirstAidName); // Update the medicine
      setIsDialog(false); // Close the edit dialog
      queryClient.invalidateQueries({ queryKey: ["firstAid"] });
      setIsAddConfirmationOpen(false); // Close the confirmation dialog   
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
            <FormInput control={form.control} name="firstAidName" label="Item Name" placeholder="Item Name"/>      
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

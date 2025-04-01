import React, { useState } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  ImmunizationSchema,
  ImmunizationType,
} from "@/form-schema/inventory/inventoryListSchema";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { useQueryClient } from "@tanstack/react-query";
import { FormInput } from "@/components/ui/form/form-input";
import { updateImzSuppliesList } from "../requests/update/ImzSupplies";
import { getImzSup } from "../requests/get/getAntigen";

interface EditImmunizationSuppliesProps {
  initialData: {
    id: number;
    vaccineName: string;
  };
  setIsDialog: (isOpen: boolean) => void;
}

export default function EditImmunizationSupplies({
  initialData,
  setIsDialog,
}: EditImmunizationSuppliesProps) {
  const form = useForm<ImmunizationType>({
    resolver: zodResolver(ImmunizationSchema),
    defaultValues: {
      imz_name: initialData.vaccineName || "",
    },
  });

  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false);
  const [updatedName, setUpdatedName] = useState<string>("");
  const queryClient = useQueryClient();

  const confirmUpdate = async () => {

    try {
      await updateImzSuppliesList(initialData.id, updatedName);
      queryClient.invalidateQueries({ queryKey: ["vaccines"] });
      setIsUpdateConfirmationOpen(false);
    } catch (err) {
      console.error("Error updating immunization supply:", err);
    }
  };

  const isDuplicateImzSupList = (supplies: any[], newSupply: string) => {
    return supplies.some(
      (supply) => supply.imz_name.toLowerCase() === newSupply.toLowerCase()
    );
  };

  const onSubmit = async (data: ImmunizationType) => {
    setIsDialog(false);
    try {
      const existingSupplies = await getImzSup();
      if (!Array.isArray(existingSupplies)) {
        throw new Error("Invalid API response");
      }
      if (isDuplicateImzSupList(existingSupplies, data.imz_name)) {
        form.setError("imz_name", {
          type: "manual",
          message: "Immunization supply already exists.",
        });
        return;
      }
      setUpdatedName(data.imz_name);
      setIsUpdateConfirmationOpen(true);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3">
            <FormInput 
              control={form.control} 
              name="imz_name" 
              label="Immunization Supply Name"
              placeholder="Enter immunization supply name"
            />
          </div>

          <div className="w-full flex justify-end mt-8">
            <Button type="submit">Update</Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isUpdateConfirmationOpen}
        onOpenChange={setIsUpdateConfirmationOpen}
        onConfirm={confirmUpdate}
        title="Update Immunization Supply"
        description={`Are you sure you want to update this supply to "${updatedName}"?`}
      />
    </div>
  );
}
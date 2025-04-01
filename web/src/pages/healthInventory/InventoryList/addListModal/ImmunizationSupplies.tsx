import React, { useState } from "react";
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
  ImmunizationSchema,
  ImmunizationType,
} from "@/form-schema/inventory/inventoryListSchema";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { addImzSupplies } from "../requests/post/immunization";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getImzSup } from "../requests/get/getAntigen";
import { FormInput } from "@/components/ui/form/form-input";

interface ImmunizationSuppliesProps {
  setIsDialog: (isOpen: boolean) => void;
}

export default function ImmunizationSupplies({
  setIsDialog,
}: ImmunizationSuppliesProps) {
  const form = useForm<ImmunizationType>({
    resolver: zodResolver(ImmunizationSchema),
    defaultValues: {
      imz_name: "",
    },
  });

  // State for add confirmation dialog
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newimz_name, setnewimz_name] = useState<string>("");
  const queryClient = useQueryClient();
  const confirmAdd = async () => {
    if (newimz_name.trim()) {
      try {
        if (await addImzSupplies(newimz_name)) {
          console.log("✅  added successfully");
        } else {
          console.error("Failed to add .");
        }
      } catch (err) {
        console.error(err);
      }
      queryClient.invalidateQueries({ queryKey: ["imz_supplies"] });
      setIsAddConfirmationOpen(false);
      setIsDialog(false);

      setnewimz_name("");
    }
  };

  const isDuplicateImzSup = (ImzSup: any[], newImzSup: string) => {
    return ImzSup.some(
      (imz) => imz.imz_name.toLowerCase() === newImzSup.toLowerCase()
    );
  };

  const onSubmit = async (data: ImmunizationType) => {
    try {
      const existingImzSup = await getImzSup();
      if (!Array.isArray(existingImzSup))
        throw new Error("Invalid API response");

      if (isDuplicateImzSup(existingImzSup, data.imz_name)) {
        form.setError("imz_name", {
          type: "manual",
          message: "already eixst",
        });
        return;
      }
      setnewimz_name(data.imz_name);
      setIsAddConfirmationOpen(true);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3">
            <FormInput control={form.control} name="imz_name" label="Antigen" placeholder="Enter first aid item name"/>
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
        title="Add Antigen Supplies"
        description={`Are you sure you want to add the new  "${newimz_name}"?`}
      />
    </div>
  );
}

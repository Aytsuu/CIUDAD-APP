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
import { Input } from "@/components/ui/input";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { Button } from "@/components/ui/button";
import {
  ImmunizationSchema,
  ImmunizationType,
} from "@/form-schema/inventory/inventoryListSchema";
import { ConfirmationDialog } from "../../confirmationLayout/ConfirmModal";
import { addImzSupplies } from "../requests/Postrequest";
import { getFirstAid } from "../requests/GetRequest";
import { useQuery, useQueryClient } from "@tanstack/react-query";


interface ImmunizationSuppliesProps {
  setIsDialog: (isOpen: boolean) => void;
}

export default function ImmunizationSupplies({  setIsDialog }: ImmunizationSuppliesProps) {
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

  const isDuplicateFirstAid = (firstaid: any[], newFirstAid: string) => {
    return firstaid.some(
      (fa) => fa.fa_name.toLowerCase() === newFirstAid.toLowerCase()
    );
  };

  const onSubmit = async (data: ImmunizationType) => {
    try {
      const existingFirstAid = await getFirstAid();
      if (!Array.isArray(existingFirstAid))
        throw new Error("Invalid API response");

      if (isDuplicateFirstAid(existingFirstAid, data.imz_name)) {
        form.setError("imz_name", {
          type: "manual",
          message: "Fa already eixst",
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
            <FormField
              control={form.control}
              name="imz_name"
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
        title="Add Immunization Supplies"
        description={`Are you sure you want to add the new  "${newimz_name}"?`}
      />
    </div>
  );
}

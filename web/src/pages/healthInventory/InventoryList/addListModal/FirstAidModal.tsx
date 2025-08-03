import React, { useState } from "react";
import {
  Form,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/button";
import {
  FirstAidType,
  FirstAidSchema,
} from "@/form-schema/inventory/inventoryListSchema";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { useQueryClient } from "@tanstack/react-query";
import { addFirstAid } from "../requests/post/firstaid";
import { getFirstAid } from "../requests/get/getFirstAid";
import { FormInput } from "@/components/ui/form/form-input";

interface FirstAidProps {
  setIsDialog: (isOpen: boolean) => void;
}

export default function FirstAidModal({ setIsDialog }: FirstAidProps) {
  const form = useForm<FirstAidType>({
    resolver: zodResolver(FirstAidSchema),
    defaultValues: {
      firstAidName: "",
    },
  });

  // State for add confirmation dialog
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newFirstAidName, setnewFirstAidName] = useState<string>("");
  const queryClient = useQueryClient();
  const confirmAdd = async () => {
    if (newFirstAidName.trim()) {
      try {
        if (await addFirstAid(newFirstAidName)) {
          console.log("✅ Medicine added successfully");
        } else {
          console.error("Failed to add medicine.");
        }
      } catch (err) {
        console.error(err);
      }
      queryClient.invalidateQueries({ queryKey: ["firstAid"] });
      setIsAddConfirmationOpen(false);
      setIsDialog(false);

      setnewFirstAidName("");
    }
  };

  const isDuplicateFirstAid = (firstaid: any[], newFirstAid: string) => {
    return firstaid.some(
      (fa) => fa.fa_name.toLowerCase() === newFirstAid.toLowerCase()
    );
  };

  const onSubmit = async (data: FirstAidType) => {
    try {
      const existingFirstAid = await getFirstAid();
      if (!Array.isArray(existingFirstAid))
        throw new Error("Invalid API response");

      if (isDuplicateFirstAid(existingFirstAid, data.firstAidName)) {
        form.setError("firstAidName", {
          type: "manual",
          message: "Fa already eixst",
        });
        return;
      }
      setnewFirstAidName(data.firstAidName);
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
            <FormInput control={form.control} name="firstAidName" label="Item Name" placeholder="Enter first aid item name"/>
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

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
  FirstAidType,
  FirstAidSchema,
} from "@/form-schema/inventory/inventoryListSchema";
import { ConfirmationDialog } from "../../confirmationLayout/ConfirmModal";
import { addFirstAid } from "../request/Postrequest";

export default function FirstAidModal() {
  const form = useForm<FirstAidType>({
    resolver: zodResolver(FirstAidSchema),
    defaultValues: {
      itemName: "",
    },
  });

 // State for add confirmation dialog
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newFirstAidName, setnewFirstAidName] = useState<string>("");


 const confirmAdd = async () => {
    if (newFirstAidName.trim()) {
      try {
        if (await addFirstAid(newFirstAidName)) {
          console.log("✅ Medicine added successfully");
          form.reset();
        } else {
          console.error("Failed to add medicine.");
        }
      } catch (err) {
        console.error(err);
      }
      setIsAddConfirmationOpen(false);
      setnewFirstAidName("");
    }
  };



  const onSubmit = async (data: FirstAidType) => {
    console.log(data);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3">
            <FormField
              control={form.control}
              name="itemName"
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

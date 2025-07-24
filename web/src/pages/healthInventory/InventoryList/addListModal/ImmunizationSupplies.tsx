import React, { useState } from "react";
import { Form,} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/button";
import {
  ImmunizationSchema,
  ImmunizationType,
} from "@/form-schema/inventory/lists/inventoryListSchema";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { useAddImzSupplies } from "../queries/Antigen/ImzPostQueries";
import { getImzSup } from "../restful-api/Antigen/ImzFetchAPI";
import { FormInput } from "@/components/ui/form/form-input";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";
import { Link } from "react-router";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function AddImmunizationSupplies() {
  const form = useForm<ImmunizationType>({
    resolver: zodResolver(ImmunizationSchema),
    defaultValues: {
      imz_name: "",
    },
  });

  const { mutate: addImzSuppliesMutation, isPending } = useAddImzSupplies();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newImzName, setNewImzName] = useState<string>("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const confirmAdd = async () => {
    const formData = form.getValues();
    setIsAddConfirmationOpen(false);

    if (formData.imz_name.trim()) {
      addImzSuppliesMutation(formData, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["immunizationsupplies"] });
          toast.success("Immunization supply added successfully", {
            icon: (
              <CircleCheck size={18} className="fill-green-500 stroke-white" />
            ),
            duration: 2000,
          });
          form.reset();
          navigate("/mainInventoryList");
        },
        onError: (error: unknown) => {
          console.error("Failed to add immunization supply:", error);
          toast.error("Failed to add immunization supply");
        },
      });
    } else {
      form.setError("imz_name", {
        type: "manual",
        message: "Item name is required",
      });
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

      if (!Array.isArray(existingImzSup)) {
        throw new Error("Invalid API response - expected an array");
      }

      if (isDuplicateImzSup(existingImzSup, data.imz_name)) {
        form.setError("imz_name", {
          type: "manual",
          message: "Item already exists",
        });
        return;
      }

      setNewImzName(data.imz_name);
      setIsAddConfirmationOpen(true);
    } catch (err) {
      console.error("Error checking for duplicates:", err);
      toast.error("An error occurred while checking for duplicates");
    }
  };

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4">
      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-white p-4 w-full max-w-[500px] rounded-sm"
        >
          <div className="flex flex-col gap-3">
            <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
              <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Add Immunization Supply List
            </Label>
            <FormInput
              control={form.control}
              name="imz_name"
              label="Item"
              placeholder="Enter item name"
            />
          </div>

          <div className="w-full flex flex-col sm:flex-row justify-end mt-6 sm:mt-8 gap-2">
            <Button variant="outline" className="w-full sm:w-auto">
              <Link to="/mainInventoryList">Cancel</Link>
            </Button>

            <Button 
              className="bg-blue text-white px-4 py-2 rounded w-full sm:w-auto"
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isPending ? "Adding..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isAddConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Add Immunization Supply"
        description={`Are you sure you want to add the new item "${newImzName}"?`}
      />
    </div>
  );
}
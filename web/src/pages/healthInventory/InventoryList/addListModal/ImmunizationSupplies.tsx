import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pill, CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Components
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { FormInput } from "@/components/ui/form/form-input";
import CardLayout from "@/components/ui/card/card-layout";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";

// Schema and API
import { ImmunizationSchema, ImmunizationType } from "@/form-schema/inventory/lists/inventoryListSchema";
import { useAddImzSupplies } from "../queries/Antigen/ImzPostQueries";
import { getImzSup } from "../restful-api/Antigen/ImzFetchAPI";

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
  const navigate = useNavigate();

  const confirmAdd = async () => {
    const formData = form.getValues();
    setIsAddConfirmationOpen(false);

    if (formData.imz_name.trim()) {
      addImzSuppliesMutation(formData, {
        onSuccess: () => {
          toast.success("Immunization supply added successfully", {
            icon: <CircleCheck className="w-5 h-5 text-green-500" />,
          });
          navigate(-1);
        },
        onError: () => {
          toast.error("Failed to add immunization supply");
        }
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
    <div className=" flex items-center justify-center ">
      <CardLayout
        cardClassName="max-w-md w-full "
        content={
          <div className="px-4 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Pill className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-800">
                      Add Immunization Supply
                    </h2>
                  </div>
                
                </div>

                <div className="space-y-4 pt-6">
                  <FormInput
                    control={form.control}
                    name="imz_name"
                    label="Item Name"
                    placeholder="Enter item name"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={isPending}
                                              >
                    {isPending ? "Submitting..." : "Submit"}
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
        }
      />
    </div>
  );
}
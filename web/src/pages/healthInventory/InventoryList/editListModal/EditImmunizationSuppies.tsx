import { useState, useEffect } from "react";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/button";
import {
  ImmunizationSchema,
  ImmunizationType,
} from "@/form-schema/inventory/lists/inventoryListSchema";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { FormInput } from "@/components/ui/form/form-input";
import { getImzSup } from "../restful-api/Antigen/ImzFetchAPI";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Package, CircleCheck } from "lucide-react";
import { useUpdateImzSupply } from "../queries/Antigen/ImzPutQueries";
import CardLayout from "@/components/ui/card/card-layout";

interface ImmunizationData {
  id: number;
  vaccineName: string;
}

export default function EditImmunizationSupplies() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state?.initialData as ImmunizationData;

  const { mutate: updateImzSupplyMutation, isPending } = useUpdateImzSupply();
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] =
    useState(false);
  const [updatedName, setUpdatedName] = useState<string>("");

  const form = useForm<ImmunizationType>({
    resolver: zodResolver(ImmunizationSchema),
    defaultValues: {
      imz_name: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        imz_name: initialData.vaccineName || "",
      });
    } else {
      toast.error("Missing immunization supply data");
      navigate("/mainInventoryList");
    }
  }, [initialData, form, navigate]);

  const confirmUpdate = async () => {
    if (!initialData) return;

    updateImzSupplyMutation(
      { imz_id: initialData.id, imz_name: updatedName },
      {
        onSuccess: () => {
          toast.success("Updated successfully", {
            icon: (
              <CircleCheck size={18} className="fill-green-500 stroke-white" />
            ),
            duration: 2000,
          });
          navigate(-1); // Changed to navigate(-1) to go back
        },
        onError: () => {
          toast.error("Failed to update immunization supply");
        },
      }
    );
    setIsUpdateConfirmationOpen(false);
  };

  const isDuplicateImzSupList = (supplies: any[], newSupply: string) => {
    return supplies.some(
      (supply) =>
        supply.id !== initialData?.id &&
        supply.imz_name.toLowerCase() === newSupply.toLowerCase()
    );
  };

  const onSubmit = async (data: ImmunizationType) => {
    if (!initialData) return;

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
      toast.error("Failed to verify immunization supply");
    }
  };

  if (!initialData) {
    return (
      <div className="p-4 text-center">
        <p>No immunization supply data found</p>
        <Button onClick={() => navigate(-1)}> {/* Changed to navigate(-1) */}
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <CardLayout
        cardClassName="max-w-md w-full"
        content={
          <div className="px-4 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Package className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-800">
                      Edit Immunization Supply
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
                    onClick={() => navigate(-1)} // Changed to navigate(-1)
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={isPending}
                  >
                    {isPending ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            </Form>

            <ConfirmationDialog
              isOpen={isUpdateConfirmationOpen}
              onOpenChange={setIsUpdateConfirmationOpen}
              onConfirm={confirmUpdate}
              title="Update Immunization Supply"
              description={`Are you sure you want to update this item to "${updatedName}"?`}
            />
          </div>
        }
      />
    </div>
  );
}
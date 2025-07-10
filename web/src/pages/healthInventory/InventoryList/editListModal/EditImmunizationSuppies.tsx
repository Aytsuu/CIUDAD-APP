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
import { Package } from "lucide-react";
import { Link } from "react-router-dom";
import { CircleCheck } from "lucide-react";
import { useUpdateImzSupply } from "../queries/Antigen/ImzPutQueries"; // Make sure this path is correct

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
          navigate("/mainInventoryList");
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
        <Button onClick={() => navigate("/mainInventoryList")}>
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4">
      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-white p-4 w-full max-w-[500px] rounded-sm"
        >
          <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Edit Commodity
          </Label>

          <div className="py-4">
            <FormInput
              control={form.control}
              name="imz_name"
              label="Immunization Supply Name"
              placeholder="Enter immunization supply name"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              type="button"
            >
              <Link to="/mainInventoryList">Cancel</Link>
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
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
        description={`Are you sure you want to update this supply to "${updatedName}"?`}
      />
    </div>
  );
}

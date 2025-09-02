import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { FormInput } from "@/components/ui/form/form-input";
import { ImmunizationSchema, ImmunizationType } from "@/form-schema/inventory/lists/inventoryListSchema";
import { useAddImzSupplies } from "../queries/Antigen/ImzPostQueries";
import { useUpdateImzSupply } from "../queries/Antigen/ImzPutQueries";
import { Loader2 } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useImzSupList } from "../queries/Antigen/ImzFetchQueries";

interface ImmunizationData {
  id: number;
  supplyName: string;
}

interface ImmunizationModalProps {
  mode?: "add" | "edit";
  initialData?: ImmunizationData;
  onClose?: () => void;
}

export default function AddImmunizationSupplies({ mode = "add", initialData, onClose }: ImmunizationModalProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [supplyName, setSupplyName] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);


  const locationInitialData = location.state?.initialData as ImmunizationData;
  const effectiveInitialData = initialData || locationInitialData;

  const { mutateAsync: addImzSuppliesMutation } = useAddImzSupplies();
  const { mutateAsync: updateImzSupplyMutation } = useUpdateImzSupply();
  const { data: immunizationSupplies } = useImzSupList(); // Get existing supplies for duplicate check

  const form = useForm<ImmunizationType>({
    resolver: zodResolver(ImmunizationSchema),
    defaultValues: {
      imz_name: effectiveInitialData?.supplyName || ""
    }
  });

  // Initialize form based on mode
  useEffect(() => {
    if (mode === "edit" && effectiveInitialData) {
      form.reset({
        imz_name: effectiveInitialData.supplyName || ""
      });
    } else if (mode === "add") {
      form.reset({
        imz_name: ""
      });
    }
  }, [mode, effectiveInitialData, form]);

  useEffect(() => {
    const subscription = form.watch(() => {
      const isValid = form.formState.isValid;
      setIsFormValid(isValid);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const hasChanges = (data: ImmunizationType) => {
    if (mode === "add") return true;
    if (!effectiveInitialData || !effectiveInitialData.supplyName) return false;

    const currentName = data.imz_name?.trim()?.toLowerCase() || "";
    const originalName = effectiveInitialData.supplyName?.trim()?.toLowerCase() || "";
    
    return currentName !== originalName;
  };

  const isDuplicateSupply = (supplies: any[], newSupply: string) => {
    return supplies.some((supply) => {
      return supply.imz_name?.trim()?.toLowerCase() === newSupply?.trim()?.toLowerCase();
    });
  };

  const handleConfirmAction = async () => {
    setIsSubmitting(true);
    const formData = form.getValues();

    try {
      // Check for duplicates if name changed
      const existingSupplies = immunizationSupplies || [];

      if (!Array.isArray(existingSupplies)) {
        throw new Error("Invalid API response - expected an array");
      }

      if (isDuplicateSupply(existingSupplies, formData.imz_name)) {
        form.setError("imz_name", {
          type: "manual",
          message: "Item already exists"
        });
        setIsSubmitting(false);
        return;
      }

      if (mode === "edit" && effectiveInitialData) {
        await updateImzSupplyMutation({
          imz_id: effectiveInitialData.id,
          imz_name: formData.imz_name
        });
      } else {
        await addImzSuppliesMutation(formData);
      }

      // Handle navigation/closure
      if (onClose) {
        onClose();
      } else {
        navigate(-1);
      }
    } catch (err) {
      console.error("Error during submission:", err);
      toast.error(`Failed to ${mode === "edit" ? "update" : "add"} immunization supply`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: ImmunizationType) => {
    if (!hasChanges(data)) {
      toast.info("No changes detected");
      return;
    }

    setSupplyName(data.imz_name);
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  if (mode === "edit" && !effectiveInitialData && !onClose) {
    return (
      <div className="p-4 text-center">
        <p>No immunization supply data found</p>
        <Button onClick={() => navigate(-1)}>Back to List</Button>
      </div>
    );
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Label className="flex justify-center text-lg font-bold text-darkBlue2 text-center ">{mode === "edit" ? "Edit Immunization Supply List" : "Add Immunization Supply List"}</Label>
          <hr className="mb-2" />

          <div className="space-y-4 pt-6">
            <FormInput control={form.control} name="imz_name" label="Item Name" placeholder="Enter item name" />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <ConfirmationModal
              trigger={
                <Button 
                  type="submit" 
                  className="w-full sm:w-auto" 
                  disabled={isSubmitting || (mode === "edit" && effectiveInitialData && !hasChanges(form.watch())) || !isFormValid}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {mode === "edit" ? "Updating..." : "Submitting..."}
                    </>
                  ) : mode === "edit" ? (
                    "Update"
                  ) : (
                    "Submit"
                  )}
                </Button>
              }
              title={`${mode === "edit" ? "Update" : "Add"} Immunization Supply`}
              description={`Are you sure you want to ${mode === "edit" ? "update" : "add"} the item "${supplyName}"?`}
              onClick={handleConfirmAction}
              actionLabel={isSubmitting ? "Processing..." : "Confirm"}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
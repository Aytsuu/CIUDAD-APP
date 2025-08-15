import { useState, useEffect } from "react";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CommodityType,
  CommodityListSchema,
} from "@/form-schema/inventory/lists/inventoryListSchema";
import { FormInput } from "@/components/ui/form/form-input";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { FormSelect } from "@/components/ui/form/form-select";
import { useAddCommodity } from "../queries/commodity/CommodityPostQueries";
import { useUpdateCommodity } from "../queries/commodity/CommodityPutQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useCommodities } from "../queries/commodity/CommodityFetchQueries";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { Loader2 } from "lucide-react";
import { showErrorToast,showSuccessToast } from "@/components/ui/toast";

export const user_type_options = [
  { id: "Current user", name: "Current user" },
  { id: "New acceptor", name: "New acceptor" },
  { id: "Both", name: "Both" },
];

export const gender_type_options = [
  { id: "Male", name: "Male" },
  { id: "Female", name: "Female" },
  { id: "Both", name: "Both" },
];

interface CommodityModalProps {
  mode: "add" | "edit";
  initialData?: {
    id: string;
    com_name: string;
    user_type: string;
    gender_type: string;
  };
  onClose: () => void;
}

export function CommodityModal({ mode, initialData, onClose }: CommodityModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [commodityName, setCommodityName] = useState("");
  const { data: commodities } = useCommodities();

  const form = useForm<CommodityType>({
    resolver: zodResolver(CommodityListSchema),
    defaultValues: {
      com_name: "",
      user_type: "",
      gender_type: "",
    },
  });

  const { mutateAsync: addCommodityMutation } = useAddCommodity();
  const { mutateAsync: updateCommodityMutation } = useUpdateCommodity();

  useEffect(() => {
    if (mode === "edit" && initialData) {
      form.reset({
        com_name: initialData.com_name || "",
        user_type: initialData.user_type || "",
        gender_type: initialData.gender_type || "",
      });
    }
  }, [mode, initialData, form]);

  const isDuplicateCommodity = (
    commodities: any[],
    newCommodity: string,
    currentId?: string
  ) => {
    return commodities.some(
      (com) =>
        com.id !== currentId &&
        com?.com_name?.trim()?.toLowerCase() === newCommodity?.trim()?.toLowerCase()
    );
  };

  const hasChanges = (data: CommodityType) => {
    if (mode === 'add') return true;
    if (!initialData) return false;
    
    return (
      data.com_name.trim().toLowerCase() !== initialData.com_name.trim().toLowerCase() ||
      data.user_type !== initialData.user_type ||
      data.gender_type !== initialData.gender_type
    );
  };

  const confirmAction = async () => {
    setIsConfirmationOpen(false);
    setIsSubmitting(true);
    const formData = form.getValues();
    
    try {
      if (mode === 'add' || (mode === 'edit' && formData.com_name !== initialData?.com_name)) {
        const existingCommodities = commodities || [];
        
        if (!Array.isArray(existingCommodities)) {
          throw new Error("Invalid API response - expected an array");
        }
  
        if (isDuplicateCommodity(existingCommodities, formData.com_name, mode === 'edit' ? initialData?.id : undefined)) {
          form.setError("com_name", {
            type: "manual",
            message: "Commodity name already exists",
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (mode === 'edit' && initialData) {
        await updateCommodityMutation({ com_id: initialData.id, data: formData });
        showSuccessToast("Commodity updated successfully");
      } else {
        await addCommodityMutation(formData);
        showSuccessToast("Commodity added successfully");
      }
      
      onClose();
    } catch (error) {
      console.error("Error during submission:", error);
      showErrorToast("Failed to process commodity");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: CommodityType) => {
    if (mode === 'edit' && !hasChanges(data)) {
      showErrorToast("No changes detected");
      return;
    }

    setCommodityName(data.com_name);
    setIsConfirmationOpen(true);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3">
            <Package className="h-5 w-5 mr-2" />
            {mode === "edit" ? "Edit Commodity" : "Add Commodity"}
          </Label>

          <FormInput
            control={form.control}
            name="com_name"
            label="Commodity Name"
            placeholder="Enter commodity name"
          />

          <FormSelect
            control={form.control}
            name="user_type"
            label="User type"
            options={user_type_options}
          />

          <FormSelect
            control={form.control}
            name="gender_type"
            label="For Gender"
            options={gender_type_options}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "edit" ? "Updating..." : "Submitting..."}
                </>
              ) : mode === "edit" ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        title={mode === "edit" ? "Update Commodity" : "Add Commodity"}
        description={`Are you sure you want to ${mode === "edit" ? "update" : "add"} the commodity "${commodityName}"?`}
        onConfirm={confirmAction}
      />
    </div>
  );
}
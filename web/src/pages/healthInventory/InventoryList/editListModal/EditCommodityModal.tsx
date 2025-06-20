import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
  FormLabel,
  Form,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import {
  CommodityType,
  CommodityListSchema,
} from "@/form-schema/inventory/lists/inventoryListSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { getCommodity } from "../restful-api/commodity/CommodityFetchAPI";
import { FormInput } from "@/components/ui/form/form-input";
import { useCategoriesCommodity } from "@/pages/healthInventory/inventoryStocks/REQUEST/Category/CommodityCategory";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { toast } from "sonner";
import { useUpdateCommodity } from "../queries/commodity/CommodityPutQueries";
import { CircleCheck } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { user_type_options } from "../addListModal/CommodityModal";
import { FormSelect } from "@/components/ui/form/form-select";
import { toTitleCase } from "@/helpers/ToTitleCase";

export interface CommodityData {
  id: string;
  com_name: string;
  user_type: string;
}
export default function CommodityListEdit() {
  const location = useLocation();
  const initialData = location.state?.params?.initialData as CommodityData;
  const navigate = useNavigate();

  // Initialize form with default values
  const form = useForm<CommodityType>({
    resolver: zodResolver(CommodityListSchema),
    defaultValues: {
      com_name: '',
      user_type: '',
    },
  });

  // Reset form whenever initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        com_name: initialData.com_name,
        user_type: initialData.user_type,
      });
    }
  }, [initialData, form]);

  const { mutate: updateCommodityMutation, isPending } = useUpdateCommodity();
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false);
  const [newCommodityName, setNewCommodityName] = useState("");

  const confirmUpdate = () => {
    const formData = form.getValues();
    setIsUpdateConfirmationOpen(false);
    updateCommodityMutation({
      com_id: initialData.id,
      data: formData,
    });
  };

  const isDuplicateCommodity = (
    commodities: any[],
    newCommodity: string,
    currentId?: string
  ) => {
    return commodities.some(
      (com) =>
        com.id !== currentId &&
        toTitleCase(com?.com_name?.trim()) === toTitleCase(newCommodity?.trim())
    );
  };

  const onSubmit = async (data: CommodityType) => {
    try {
      form.clearErrors();
      const existingCommodities = await getCommodity();

      if (!Array.isArray(existingCommodities)) {
        throw new Error("Invalid API response - expected an array");
      }

      const isNameChanged =
        toTitleCase(data.com_name.trim()) !==
        toTitleCase(initialData.com_name.trim());
      const isCategoryChanged =
        String(data.user_type) !== String(initialData.user_type);

      if (
        isNameChanged &&
        isDuplicateCommodity(existingCommodities, data.com_name, initialData.id)
      ) {
        form.setError("com_name", {
          type: "manual",
          message: "Commodity name already exists",
        });
        return;
      }
      if (!isNameChanged && !isCategoryChanged) {
        toast.info("No changes detected");
        return;
      }

      setNewCommodityName(data.com_name);
      setIsUpdateConfirmationOpen(true);
    } catch (err) {
      console.error("Error validating input:", err);
      toast.error("Failed to verify commodity uniqueness. Please try again.");
    }
  };

  if (!initialData) {
    return (
      <div className="w-full flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white p-4 w-full max-w-[500px] rounded-sm">
          <p className="text-red-500">Error: No commodity data provided</p>
          <Button variant="outline" className="mt-4">
            <Link to="/mainInventoryList">Go Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center p-2 sm:p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white p-4 w-full max-w-[500px] rounded-sm"
        >
          <div className="flex flex-col gap-3">
            <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
              <Package className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Edit Commodity
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
          </div>

          <div className="w-full flex flex-col sm:flex-row justify-end mt-6 sm:mt-8 gap-2">
            <Button variant="outline" className="w-full sm:w-auto">
              <Link to="/mainInventoryList">Cancel</Link>
            </Button>
            <Button
              type="submit"
              className="bg-blue text-white px-4 py-2 rounded w-full sm:w-auto"
              disabled={isPending}
            >
              Submit
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isUpdateConfirmationOpen}
        onOpenChange={setIsUpdateConfirmationOpen}
        title="Update Commodity"
        description={`Are you sure you want to update the commodity "${newCommodityName}"?`}
        onConfirm={confirmUpdate}
      />
    </div>
  );
}
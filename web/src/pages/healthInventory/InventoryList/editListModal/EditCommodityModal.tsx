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

export interface CommodityData {
  id: string;
  com_name: string;
  cat_name: string;
  cat_id: string;
}

export default function CommodityListEdit() {
  const location = useLocation();
  const initialData = location.state?.params?.initialData as CommodityData;
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  const form = useForm<CommodityType>({
    resolver: zodResolver(CommodityListSchema),
    defaultValues: {
      com_name: "",
      cat_id: "",
    }, 
  });

  const queryClient = useQueryClient();
  const {
    categories,
    handleDeleteConfirmation,
    categoryHandleAdd,
    ConfirmationDialogs,
  } = useCategoriesCommodity();

  useEffect(() => {
    if (initialData && categories.length > 0 && !isInitialized) {
      form.reset({
        com_name: initialData.com_name,
        cat_id: initialData.cat_id,
      });
      setIsInitialized(true);
    }
  }, [initialData, categories, form, isInitialized]);

  const { mutate: updateCommodityMutation, isPending } = useUpdateCommodity();
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false);
  const [newCommodityName, setNewCommodityName] = useState("");

  const confirmUpdate = () => {
    const formData = form.getValues();
    setIsUpdateConfirmationOpen(false);

    updateCommodityMutation(
      {
        com_id: initialData.id,
        data: formData,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["commodities"] });
          toast.success("Commodity updated successfully", {
            icon: (
              <CircleCheck size={18} className="fill-green-500 stroke-white" />
            ),
            duration: 2000,
          });
          navigate("/mainInventoryList");
        },
        onError: (error) => {
          console.error("Error updating commodity:", error);
          toast.error("Failed to update commodity");
        },
      }
    );
  };

  const isDuplicateCommodity = (
    commodities: any[],
    newCommodity: string,
    catId: string,
    currentId?: string
  ) => {
    return commodities.some(
      (com) =>
        com.id !== currentId &&
        com?.com_name?.trim()?.toLowerCase() ===
          newCommodity?.trim()?.toLowerCase() &&
        String(com?.cat) === String(catId)
    );
  };

  const onSubmit = async (data: CommodityType) => {
    try {
      form.clearErrors();
      const existingCommodities = await getCommodity();

      if (!Array.isArray(existingCommodities)) {
        throw new Error("Invalid API response - expected an array");
      }

      if (!data.cat_id) {
        toast.error("Please select a category");
        form.setError("cat_id", {
          type: "manual",
          message: "Category is required",
        });
        return;
      }

      const isNameChanged =
        data.com_name.trim().toLowerCase() !==
        initialData.com_name.trim().toLowerCase();
      const isCategoryChanged =
        String(data.cat_id) !== String(initialData.cat_id);

      if (
        (isNameChanged || isCategoryChanged) &&
        isDuplicateCommodity(
          existingCommodities,
          data.com_name,
          data.cat_id,
          initialData.id
        )
      ) {
        form.setError("com_name", {
          type: "manual",
          message: "Commodity name already exists in this category",
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

  const getCurrentCategoryName = () => {
    const currentId = form.watch("cat_id");
    if (!currentId) return "Select category";
    const foundCategory = categories.find((cat) => cat.id === currentId);
    return foundCategory?.name || initialData?.cat_name || "Select category";
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
          onSubmit={(e) => e.preventDefault()}
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

            <FormField
              control={form.control}
              name="cat_id"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="text-darkGray">Category</FormLabel>
                    <FormControl>
                      <SelectLayoutWithAdd
                        className="w-full"
                        placeholder={getCurrentCategoryName()}
                        label="Select a Category"
                        options={
                          categories.length > 0
                            ? categories
                            : [{ id: "loading", name: "Loading..." }]
                        }
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        onAdd={(newCategoryName) => {
                          categoryHandleAdd(newCategoryName, (newId) => {
                            field.onChange(newId);
                          });
                        }}
                        onDelete={(id) => handleDeleteConfirmation(Number(id))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
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

      <ConfirmationDialogs />
    </div>
  );
}
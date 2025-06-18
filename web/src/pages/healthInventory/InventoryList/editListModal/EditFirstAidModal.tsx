import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
  FormLabel,
  Form,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { FirstAidType, FirstAidSchema } from "@/form-schema/inventory/lists/inventoryListSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { getFirstAid } from "../restful-api/firstAid/FirstAidFetchAPI";
import { FormInput } from "@/components/ui/form/form-input";
import { useCategoriesFirstAid } from "@/pages/healthInventory/inventoryStocks/REQUEST/Category/FirstAidCategory";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { toast } from "sonner";
import { useUpdateFirstAid } from "../queries/firstAid/FirstAidPutQueries";
import { CircleCheck } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

export interface FirstAidData {
  id: string;
  fa_name: string;
  cat_name: string;
  cat_id: string;
}

export default function FirstAidListEdit() {
  const location = useLocation();
  const initialData = location.state?.params?.initialData as FirstAidData;
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FirstAidType>({
    resolver: zodResolver(FirstAidSchema),
    defaultValues: {
      fa_name: "",
      cat_id: "",
    },
  });

  const queryClient = useQueryClient();
  const {
    categories,
    handleDeleteConfirmation,
    categoryHandleAdd,
    ConfirmationDialogs,
  } = useCategoriesFirstAid();

  useEffect(() => {
    if (initialData && categories.length > 0 && !isInitialized) {
      form.reset({
        fa_name: initialData.fa_name,
        cat_id: initialData.cat_id,
      });
      setIsInitialized(true);
    }
  }, [initialData, categories, form, isInitialized]);

  const { mutate: updateFirstAidMutation, isPending } = useUpdateFirstAid();
  const [isUpdateConfirmationOpen, setIsUpdateConfirmationOpen] = useState(false);
  const [newFirstAidName, setNewFirstAidName] = useState("");

  const confirmUpdate = () => {
    const formData = form.getValues();
    setIsUpdateConfirmationOpen(false);

    updateFirstAidMutation(
      {
        fa_id: initialData.id,
        data: formData,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["firstAid"] });
          toast.success("First Aid item updated successfully", {
            icon: (
              <CircleCheck size={18} className="fill-green-500 stroke-white" />
            ),
            duration: 2000,
          });
          navigate("/mainInventoryList");
        },
        onError: (error) => {
          console.error("Error updating first aid item:", error);
          toast.error("Failed to update first aid item");
        },
      }
    );
  };

  const isDuplicateFirstAid = (
    firstAids: any[],
    newFirstAid: string,
    catId: string,
    currentId?: string
  ) => {
    return firstAids.some(
      (fa) =>
        fa.id !== currentId &&
        fa?.fa_name?.trim()?.toLowerCase() ===
          newFirstAid?.trim()?.toLowerCase() &&
        String(fa?.cat_id) === String(catId)
    );
  };

  const onSubmit = async (data: FirstAidType) => {
    try {
      form.clearErrors();
      const existingFirstAids = await getFirstAid();

      if (!Array.isArray(existingFirstAids)) {
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
        data.fa_name.trim().toLowerCase() !==
        initialData.fa_name.trim().toLowerCase();
      const isCategoryChanged =
        String(data.cat_id) !== String(initialData.cat_id);

      if (
        (isNameChanged || isCategoryChanged) &&
        isDuplicateFirstAid(
          existingFirstAids,
          data.fa_name,
          data.cat_id,
          initialData.id
        )
      ) {
        form.setError("fa_name", {
          type: "manual",
          message: "First Aid item name already exists in this category",
        });
        return;
      }
      if (!isNameChanged && !isCategoryChanged) {
        toast.info("No changes detected");
        return;
      }

      setNewFirstAidName(data.fa_name);
      setIsUpdateConfirmationOpen(true);
    } catch (err) {
      console.error("Error validating input:", err);
      toast.error("Failed to verify first aid item uniqueness. Please try again.");
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
          <p className="text-red-500">Error: No first aid item data provided</p>
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
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Edit First Aid Item
            </Label>

            <FormInput
              control={form.control}
              name="fa_name"
              label="First Aid Item Name"
              placeholder="Enter first aid item name"
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
              {isPending ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isUpdateConfirmationOpen}
        onOpenChange={setIsUpdateConfirmationOpen}
        title="Update First Aid Item"
        description={`Are you sure you want to update the first aid item "${newFirstAidName}"?`}
        onConfirm={confirmUpdate}
      />

      <ConfirmationDialogs />
    </div>
  );
}
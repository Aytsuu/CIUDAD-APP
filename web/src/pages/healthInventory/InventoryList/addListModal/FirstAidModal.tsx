import React, { useState } from "react";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
  FormLabel,
  Form,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FirstAidType,
  FirstAidSchema,
} from "@/form-schema/inventory/lists/inventoryListSchema";
import { useAddFirstAid } from "../queries/firstAid/FirstAidPostQueries";
import { getFirstAid } from "../restful-api/firstAid/FirstAidFetchAPI";
import { FormInput } from "@/components/ui/form/form-input";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { useCategoriesFirstAid } from "@/pages/healthInventory/inventoryStocks/REQUEST/Category/FirstAidCategory";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { CircleCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button/button";
import { Link, useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

export default function FirstAidModal() {
  const navigate = useNavigate();
  const form = useForm<FirstAidType>({
    resolver: zodResolver(FirstAidSchema),
    defaultValues: {
      fa_name: "",
      cat_id: "",
    },
  });

  const {
    categories,
    handleDeleteConfirmation,
    categoryHandleAdd,
    ConfirmationDialogs,
  } = useCategoriesFirstAid();

  const { mutate: addFirstAidMutation, isPending } = useAddFirstAid();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newFirstAidName, setNewFirstAidName] = useState<string>("");
  const queryClient = useQueryClient();

  const getCurrentCategoryName = () => {
    const currentId = form.watch("cat_id");
    if (!currentId) return "Select category";
    const foundCategory = categories.find((cat) => cat.id === currentId);
    return foundCategory?.name ?? "Select category";
  };

  const confirmAdd = async () => {
    const formData = form.getValues();
    setIsAddConfirmationOpen(false);
    addFirstAidMutation(formData);
  };

  const isDuplicateFirstAid = (
    firstAidItems: any[],
    newFirstAid: string,
    catId: string
  ) => {
    return firstAidItems.some(
      (item) =>
        item.fa_name.trim().toLowerCase() ===
          newFirstAid.trim().toLowerCase() &&
        String(item.cat_id) === String(catId)
    );
  };

  const onSubmit = async (data: FirstAidType) => {
    try {
      const existingFirstAid = await getFirstAid();

      if (!Array.isArray(existingFirstAid)) {
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

      if (isDuplicateFirstAid(existingFirstAid, data.fa_name, data.cat_id)) {
        form.setError("fa_name", {
          type: "manual",
          message: "First Aid item already exists in this category",
        });
        return;
      }

      setNewFirstAidName(data.fa_name);
      setIsAddConfirmationOpen(true);
    } catch (err) {
      console.error("Error checking for duplicates:", err);
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
              <Plus className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Add First Aid Item
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
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <SelectLayoutWithAdd
                        className="w-full text-darkGray"
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

          <div className="w-full flex justify-end mt-8 gap-2">
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
        title="Add First Aid Item"
        description={`Are you sure you want to add the first aid item "${newFirstAidName}"?`}
        onConfirm={confirmAdd}
      />

      <ConfirmationDialogs />
    </div>
  );
}

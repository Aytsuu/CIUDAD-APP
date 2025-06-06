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
import {
  CommodityType,
  CommodityListSchema,
} from "@/form-schema/inventory/lists/inventoryListSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAddCommodity } from "../queries/commodity/CommodityPostQueries";
import { getCommodity } from "../restful-api/commodity/CommodityFetchAPI";
import { FormInput } from "@/components/ui/form/form-input";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { useCategoriesCommodity } from "@/pages/healthInventory/inventoryStocks/REQUEST/Category/CommodityCategory";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { CircleCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button/button";
import { Link,useNavigate } from "react-router";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";

export default function CommodityModal() {

  const form = useForm<CommodityType>({
    resolver: zodResolver(CommodityListSchema),
    defaultValues: {
      com_name: "",
      cat_id: "",
    },
  });

  const navigate = useNavigate();
  const {categories,handleDeleteConfirmation,categoryHandleAdd, ConfirmationDialogs,} = useCategoriesCommodity();
  const { mutate: addCommodityMutation, isPending } = useAddCommodity();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newCommodityName, setNewCommodityName] = useState<string>("");
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

    if (formData.com_name.trim()) {
      addCommodityMutation(formData, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["commodities"] });
          toast.success("Commodity added successfully", {
            icon: (
              <CircleCheck size={18} className="fill-green-500 stroke-white" />
            ),
            duration: 2000,
          });
          form.reset();
          navigate("/mainInventoryList");
        },
        onError: (error: unknown) => {
          console.error("Failed to add commodity:", error);
          toast.error("Failed to add commodity");
        },
      });
    } else {
      form.setError("com_name", {
        type: "manual",
        message: "Commodity name is required",
      });
    }
  };

  const isDuplicateCommodity = (commodities: any[],newCommodity: string,catId: string) => {
    return commodities.some(
      (com) =>
        com.com_name.trim().toLowerCase() === newCommodity.trim().toLowerCase() && String(com.cat) === String(catId)
    );
  };

  const onSubmit = async (data: CommodityType) => {
    try {
      const existingCommodities = await getCommodity();
      if (!Array.isArray(existingCommodities)) { throw new Error("Invalid API response - expected an array");}

      if (!data.cat_id) {
        toast.error("Please select a category");
        form.setError("cat_id", {
          type: "manual",
          message: "Category is required",
        });
        return;
      }

      if (isDuplicateCommodity(existingCommodities, data.com_name, data.cat_id) ) {
        form.setError("com_name", {
          type: "manual",
          message: "Commodity already exists in this category",
        });
        return;
      }
      setNewCommodityName(data.com_name);
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
              <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />Add Commodity List
        </Label>

            <FormInput control={form.control} name="com_name" label="Commodity Name" placeholder="Enter commodity name" />

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
            <Button variant="outline" className="w-full sm:w-auto"><Link to="/mainInventoryList">Cancel</Link></Button>
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
        title="Add Commodity"
        description={`Are you sure you want to add the commodity "${newCommodityName}"?`}
        onConfirm={confirmAdd}
      />
      <ConfirmationDialogs />
    </div>
  );
}

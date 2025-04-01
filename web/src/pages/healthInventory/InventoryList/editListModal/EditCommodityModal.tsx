import React, { useEffect, useState } from "react";
import {
  FormField,
  FormItem,
  FormMessage,
  FormControl,
  FormLabel,
  Form,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import {
  CommodityType,
  CommodityListSchema,
} from "@/form-schema/inventory/inventoryListSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { getCommodity } from "../requests/get/getCommodity";
import { updateCommodity } from "../requests/update/UpdateCommodity";
import { useQueryClient } from "@tanstack/react-query";
import { FormInput } from "@/components/ui/form/form-input";
interface CommodityListProps {
  initialData: {
    id: number;
    commodityName: string;
  };
  setIsDialog: (isOpen: boolean) => void;
}

export default function EditCommodityModal({
  initialData,
  setIsDialog,
}: CommodityListProps) {


  const form = useForm<CommodityType>({
    resolver: zodResolver(CommodityListSchema),
    defaultValues: {
      commodityName: initialData.commodityName,
    },
  });

  // State for add confirmation dialog
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newCommodityName, setnewCommodityName] = useState<string>("");
  const queryClient = useQueryClient();

  const confirmAdd = async () => {
    try {
      await updateCommodity(initialData.id, newCommodityName); // Update the medicine
      setIsDialog(false);
      setIsAddConfirmationOpen(false);
      queryClient.invalidateQueries({ queryKey: ["commodities"] });
    } catch (err) {
      console.error("Error updating medicine:", err);
    }
  };

  const isDuplicateCOmmodity = (commodity: any[], newCommodityName: string) => {
    return commodity.some(
      (com) => com.com_name.toLowerCase() === newCommodityName.toLowerCase()
    );
  };

  const onSubmit = async (data: CommodityType) => {
    try {
      const existingCommodity = await getCommodity();
      if (!Array.isArray(existingCommodity))
        throw new Error("Invalid API response");

      if (isDuplicateCOmmodity(existingCommodity, data.commodityName)) {
        form.setError("commodityName", {
          type: "manual",
          message: "Medicine already exists.",
        });
        return;
      }
      setnewCommodityName(data.commodityName);
      setIsAddConfirmationOpen(true);
      setIsDialog(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3">
             <FormInput control={form.control} name="commodityName" label="Commodity Name" placeholder="Enter Commodity Name"/>  
            <div className="w-full flex justify-end mt-8">
              <Button type="submit">Submit</Button>
            </div>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        isOpen={isAddConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Add Medicine"
        description={`Are you sure you want to add the medicine "${newCommodityName}"?`}
      />
    </div>
  );
}

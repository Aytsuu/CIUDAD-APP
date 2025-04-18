import React, { useState } from "react";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import {
  CommodityType,
  CommodityListSchema,
} from "@/form-schema/inventory/inventoryListSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button/button";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { useQueryClient } from "@tanstack/react-query";
import { addCommodity } from "../requests/post/commodity";
import { getCommodity } from "../requests/get/getCommodity";
import { FormInput } from "@/components/ui/form/form-input";

interface CommodityProps {
  setIsDialog: (isOpen: boolean) => void;
}

export default function CommodityModal({ setIsDialog }: CommodityProps) {
  const form = useForm<CommodityType>({
    resolver: zodResolver(CommodityListSchema),
    defaultValues: {
      commodityName: "",
    },
  });

  // State for add confirmation dialog
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newCommodityName, setNewCommodityName] = useState<string>("");
  const queryClient = useQueryClient();

  const confirmAdd = async () => {
    if (newCommodityName.trim()) {
      try {
        if (await addCommodity(newCommodityName)) {
          setIsAddConfirmationOpen(false);
          setIsDialog(false);
          queryClient.invalidateQueries({ queryKey: ["commodities"] });
        } else {
          console.error("Failed to add commodity.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const isDuplicateCommodity = (commodities: any[], newCommodity: string) => {
    return commodities.some(
      (com) => com.com_name.toLowerCase() === newCommodity.toLowerCase()
    );
  };

  const onSubmit = async (data: CommodityType) => {
    try {
      const existingCommodities = await getCommodity();
      if (!Array.isArray(existingCommodities))
        throw new Error("Invalid API response");

      if (isDuplicateCommodity(existingCommodities, data.commodityName)) {
        form.setError("commodityName", {
          type: "manual",
          message: "Commodity already exists.",
        });
        return;
      }
      setNewCommodityName(data.commodityName);
      setIsAddConfirmationOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-3">
            {/* Commodity Name Field using FormInput shortcut */}
            <FormInput control={form.control}name="commodityName" label="Commodity Name" placeholder="Enter commodity name"/>

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
        title="Add Commodity"
        description={`Are you sure you want to add the commodity "${newCommodityName}"?`}
      />
    </div>
  );
}
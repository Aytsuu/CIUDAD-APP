import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "../../confirmationLayout/ConfirmModal";
import { addCommodity } from "../requests/Postrequest";
import { getCommodity } from "../requests/GetRequest";

interface CommodityProps {
  fetchData: () => void;
  setIsDialog: (isOpen: boolean) => void;
}

export default function CommodityModal({fetchData,setIsDialog}: CommodityProps) {
  const form = useForm<CommodityType>({
    resolver: zodResolver(CommodityListSchema),
    defaultValues: {
      commodityName: "",
    },
  });
  // State for add confirmation dialog
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newCommodityName, setnewCommodityName] = useState<string>("");

  const confirmAdd = async () => {
    if (newCommodityName.trim()) {
      try {
        if (await addCommodity(newCommodityName)) {
          setIsAddConfirmationOpen(false);
          setnewCommodityName("");
          setIsDialog(false);
          fetchData()
        } else {
          console.error("Failed to add medicine.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const isDuplicateCommodity = (commoodity: any[], newCommodity: string) => {
    return commoodity.some(
      (com) => com.com_name.toLowerCase() === newCommodity.toLowerCase()
    );
  };

  const onSubmit = async (data: CommodityType) => {
    try {
      const existingcommoodity = await getCommodity();
      if (!Array.isArray(existingcommoodity))
        throw new Error("Invalid API response");

      if (isDuplicateCommodity(existingcommoodity, data.commodityName)) {
        form.setError("commodityName", {
          type: "manual",
          message: "Medicine already exists.",
        });
        return;
      }
      setnewCommodityName(data.commodityName);
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
            {/* Commodity Name Field */}
            <FormField
              control={form.control}
              name="commodityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commodity Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={String(field.value)}
                      placeholder="Commodity Name"
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

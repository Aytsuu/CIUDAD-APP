import React, { useState } from "react";
import {
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
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";
import { FormSelect } from "@/components/ui/form/form-select";

export const user_type_options = [
  { id: "Current user", name: "Current user" },
  { id: "New acceptor", name: "New acceptor" },
  { id: "Both", name: "Both" },
];


export default function CommodityModal() {
  const form = useForm<CommodityType>({
    resolver: zodResolver(CommodityListSchema),
    defaultValues: {
      com_name: "",
      user_type: "",
    },
  });


  const { mutate: addCommodityMutation, isPending } = useAddCommodity();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newCommodityName, setNewCommodityName] = useState<string>("");

  const isDuplicateCommodity = (commodities: any[], newCommodity: string) => {
    return commodities.some(
      (com) =>
        com.com_name.trim().toLowerCase() === newCommodity.trim().toLowerCase()
    );
  };

  const confirmAdd = async () => {
    const formData = form.getValues();
    setIsAddConfirmationOpen(false);
    console.log("Confirming add for:", formData); // Log the form data before submission
    addCommodityMutation(formData); 
  };

 
  const onSubmit = async (data: CommodityType) => {
    console.log("Submitting data:", data); // Log the form data
    try {
      const existingCommodities = await getCommodity();
      if (!Array.isArray(existingCommodities)) {
        throw new Error("Invalid API response - expected an array");
      }

      if (isDuplicateCommodity(existingCommodities, data.com_name)) {
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
      toast.error("Error checking for duplicates");
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
              <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Add Commodity List
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
        title="Add Commodity"
        description={`Are you sure you want to add the commodity "${newCommodityName}"?`}
        onConfirm={confirmAdd}
      />
    </div>
  );
}

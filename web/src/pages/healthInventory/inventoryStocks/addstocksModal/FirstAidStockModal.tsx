import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectLayout } from "@/components/ui/select/select-layout";
import {
  FirstAidStockSchema,
  FirstAidStockType,
} from "@/form-schema/inventory/inventoryStocksSchema";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import { fetchCommodity } from "../REQUEST/fetch";
import { useCategoriesCommodity } from "../REQUEST/Category/CommodityCategory";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { addFirstAidInventory, addInventory } from "../REQUEST/Post";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "../../confirmationLayout/ConfirmModal";
import {  FirstAidPayoad } from "../REQUEST/Payload";
import { InventoryCommodityPayload } from "../REQUEST/Payload";

export default function FirstAidStockForm() {
  UseHideScrollbar();
  const form = useForm<FirstAidStockType>({
    resolver: zodResolver(FirstAidStockSchema),
    defaultValues: {
      fa_id: "",
      cat_id: "",
      finv_qty_unit: "boxes", // Ensure a valid default value
      finv_qty: 0,
      finv_pcs: 0,
      expiryDate: new Date().toISOString().split("T")[0], // Default to today's date
    },
  });

  const commodity = fetchCommodity(); // Ensure commodity is an array to avoid errors
  const queryClient = useQueryClient();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [submissionData, setSubmissionData] =
    useState<FirstAidStockType | null>(null);

  const {
    categories,
    handleDeleteConfirmation,
    categoryHandleAdd,
    ConfirmationDialogs,
  } = useCategoriesCommodity();

  const handleSubmit = async (data: FirstAidStockType) => {
    console.log("Form Data Submitted:", data);

    try {
      console.log(data.fa_id);
      const inventoryResponse = await addInventory(
        InventoryCommodityPayload(data)
      );

      if (!inventoryResponse?.inv_id) {
        throw new Error("Failed to generate inventory ID.");
        // Removed unreachable return
      }

      const inv_id = parseInt(inventoryResponse.inv_id, 10);
      const parsefaID = parseInt(data.fa_id, 10);
      if (!data.fa_id) {
        throw new Error("Failed to get commodity ID.");
        return;
      }

      const firstAidPayoad = FirstAidPayoad(data, inv_id, parsefaID);
      console.log("Commodity Payload:", firstAidPayoad);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const commodityInventoryResponse = await addFirstAidInventory(
        firstAidPayoad
      );
      if (!commodityInventoryResponse || commodityInventoryResponse.error) {
        throw new Error("Failed to add commodity inventory.");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["commodityinventorylist"] });

      console.log("Commodity Inventory Added Successfully");
      setIsAddConfirmationOpen(false);
    } catch (error: any) {
      console.error(error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        setIsAddConfirmationOpen(false);
      }
      setIsAddConfirmationOpen(false);
    }
  };

  const onSubmit = (data: FirstAidStockType) => {
    setSubmissionData(data);
    setIsAddConfirmationOpen(true);
  };

  const confirmAdd = () => {
    if (submissionData) {
      handleSubmit(submissionData);
    }
  };

  const currentUnit = form.watch("finv_qty_unit");
  const qty = form.watch("finv_qty");
  const pcs = form.watch("finv_pcs");
  const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Commodity Name */}
            <FormField
              control={form.control}
              name="fa_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Commodity"
                      options={commodity}
                      value={field.value}
                      onChange={(value) => {
                        console.log("Selected Commodity ID:", value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {!field.value && (
                    <p className="text-red-500 text-sm">
                      This field is required.
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Category Dropdown */}
            <FormField
              control={form.control}
              name="cat_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <SelectLayoutWithAdd
                      placeholder="select"
                      label="Select a Category"
                      options={categories}
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
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Expiry Date */}
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <FormField
              control={form.control}
              name="finv_qty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {currentUnit === "boxes" ? "Number of Boxes" : "Quantity"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(
                          value === "" ? undefined : Number(value)
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Storage Unit */}
            <FormField
              control={form.control}
              name="finv_qty_unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Unit"
                      options={[
                        { id: "boxes", name: "Boxes" },
                        { id: "bottles", name: "Bottles" },
                        { id: "packs", name: "Packs" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Pieces per Box and Total Pieces Display */}
          {currentUnit === "boxes" && (
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="finv_pcs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pieces per Box</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : Number(value)
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem className="sm:col-span-2">
                <FormLabel>Total Pieces</FormLabel>
                <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {totalPieces.toLocaleString()} pieces
                  <span className="ml-2 text-muted-foreground text-xs">
                    ({qty} boxes × {pcs} pieces/box)
                  </span>
                </div>
              </FormItem>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]">
              Save Commodity
            </Button>
          </div>
        </form>
      </Form>
      {ConfirmationDialogs()}
      <ConfirmationDialog
        isOpen={isAddConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Add Commodity"
        description={`Are you sure you want to add the commodity?`}
      />
    </div>
  );
}

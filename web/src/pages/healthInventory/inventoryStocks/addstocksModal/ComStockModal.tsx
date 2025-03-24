import { useState, useEffect } from "react";
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
  CommodityStockType,
  CommodityStocksSchema,
} from "@/form-schema/inventory/inventoryStocksSchema";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import { fetchCommodity } from "../REQUEST/fetch";
import { useCategoriesCommodity } from "../REQUEST/Category/CommodityCategory";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { addCommodityInventory, addInventory } from "../REQUEST/Post";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "../../confirmationLayout/ConfirmModal";
import { CommodityPayload } from "../REQUEST/Payload";
import { InventoryCommodityPayload } from "../REQUEST/Payload";

interface CommodiityStockFormProps {  
  setIsDialog:(isOpen: boolean) => void
}

export default function CommodityStockForm({setIsDialog}:CommodiityStockFormProps ) {
  UseHideScrollbar();
  const form = useForm<CommodityStockType>({
    resolver: zodResolver(CommodityStocksSchema),
    defaultValues: {
      com_id: "",
      cat_id: "",
      cinv_qty_unit: "boxes",
      cinv_qty: 0,
      cinv_pcs: undefined,
      cinv_recevFrom: "",
      expiryDate: new Date().toISOString().split("T")[0],
    },
  });

  const commodity = fetchCommodity();
  const queryClient = useQueryClient();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [submissionData, setSubmissionData] =
    useState<CommodityStockType | null>(null);

  const {
    categories,
    handleDeleteConfirmation,
    categoryHandleAdd,
    ConfirmationDialogs,
  } = useCategoriesCommodity();

  // Watch for unit changes and reset pcs when not boxes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "cinv_qty_unit" && value.cinv_qty_unit !== "boxes") {
        form.setValue("cinv_pcs", 0);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (data: CommodityStockType) => {
    console.log("Form Data Submitted:", data);

    try {
      console.log(data.com_id);
      const inventoryResponse = await addInventory(
        InventoryCommodityPayload(data)
      );

      if (!inventoryResponse?.inv_id) {
        throw new Error("Failed to generate inventory ID.");
      }

      const inv_id = parseInt(inventoryResponse.inv_id, 10);
      const parseCommodityID = parseInt(data.com_id, 10);
      if (!data.com_id) {
        throw new Error("Failed to get commodity ID.");
        return;
      }

      const commodityPayload = CommodityPayload(data, inv_id, parseCommodityID);
      console.log("Commodity Payload:", commodityPayload);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const commodityInventoryResponse = await addCommodityInventory(
        commodityPayload
      );
      if (!commodityInventoryResponse || commodityInventoryResponse.error) {
        throw new Error("Failed to add commodity inventory.");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ["commodityinventorylist"] });

      console.log("Commodity Inventory Added Successfully");
      setIsAddConfirmationOpen(false);
      setIsDialog(false)

    } catch (error: any) {
      console.error(error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        setIsAddConfirmationOpen(false);
      }
      setIsAddConfirmationOpen(false);
    }
  };

  const onSubmit = (data: CommodityStockType) => {
    setSubmissionData(data);
    setIsAddConfirmationOpen(true);
  };

  const confirmAdd = () => {
    if (submissionData) {
      handleSubmit(submissionData);
      setIsDialog(false)
    }
  };

  const currentUnit = form.watch("cinv_qty_unit");
  const qty = form.watch("cinv_qty") || 0;
  const pcs = form.watch("cinv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Commodity Name */}
            <FormField
              control={form.control}
              name="com_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commodity Name</FormLabel>
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

            {/* Receive From */}
            <FormField
              control={form.control}
              name="cinv_recevFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receive From</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Source"
                      options={[
                        { id: "DOH", name: "DOH" },
                        { id: "CHD", name: "CHD" },
                        { id: "OTHERS", name: "OTHERS" },
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <FormField
              control={form.control}
              name="cinv_qty"
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
              name="cinv_qty_unit"
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

          {/* Pieces per Box and Total Pieces (only shown when unit is boxes) */}
          {currentUnit === "boxes" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cinv_pcs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pieces per Box</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Pieces per box"
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
                  {currentUnit === "boxes" && (
                    <span className="ml-2 text-muted-foreground text-xs">
                      ({qty} boxes × {pcs} pieces/box)
                    </span>
                  )}
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
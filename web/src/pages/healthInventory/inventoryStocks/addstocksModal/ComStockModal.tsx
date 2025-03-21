import React from "react";
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
import { fetchCommodity } from "../request/Fetch";
import { useCategoriesCommodity } from "../request/Category/CommodityCategory";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";


export default function CommodityStockForm() {
  UseHideScrollbar();
  const form = useForm<CommodityStockType>({
    resolver: zodResolver(CommodityStocksSchema),
    defaultValues: {
      commodityName: "",
      category: "",
      unit: "",
      qty: 0,
      pcs: 0,
      expiryDate: "",
      recevFrom: "", 
    },
  });

  const commodity = fetchCommodity();
  const onSubmit = async (data: CommodityStockType) => {
    try {
      const validatedData = CommodityStocksSchema.parse(data);
      console.log("Form submitted", validatedData);
      form.reset();
      alert("Commodity stock added successfully!");
    } catch (error) {
      console.error("Form submission error:", error);
      alert("Submission failed. Please check the form for errors.");
    }
  };

  const {
    categories,
    handleDeleteConfirmation,
    categoryHandleAdd,
    ConfirmationDialogs,
  } = useCategoriesCommodity();


  // Watch relevant fields for calculation
  const currentUnit = form.watch("unit");
  const qty = form.watch("qty") || 0;
  const pcs = form.watch("pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : 0;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Commodity Name */}
            <FormField
              control={form.control}
              name="commodityName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Commodity Name</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Category"
                      options={commodity}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Dropdown */}
          <FormField
                       control={form.control}
                       name="category"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Category</FormLabel>
                           <FormControl>
                             {/* Category Dropdown with Add/Delete */}
                             <SelectLayoutWithAdd
                               placeholder="select"
                               label="Select a Category"
                               options={categories}
                               value={field.value}
                               onChange={(value) => field.onChange(value)}
                               onAdd={(newCategoryName) => {
                                 categoryHandleAdd(newCategoryName, (newId) => {
                                   field.onChange(newId); // Update the form value with the new category ID
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
          {/* Commodity Name */}
          <FormField
            control={form.control}
            name="recevFrom"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receive From</FormLabel>
                <FormControl>
                  <SelectLayout
                    label=""
                    className="w-full"
                    placeholder="Select Category"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <FormField
              control={form.control}
              name="qty"
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
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select "
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
                name="pcs"
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
    </div>
  );
}

import { useState, useEffect } from "react"; // Add this import
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
  MedicineStocksSchema,
  MedicineStockType,
} from "@/form-schema/inventory/inventoryStocksSchema";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { fetchMedicines } from "../request/fetch";
import { useCategoriesMedicine } from "../request/Medcategory";
import { MedicineInventoryPayload, InventoryPayload, generateID } from "./type";
import { addMedicineInventory, addInventory } from "../request/Post";

export default function MedicineStockForm() {
  UseHideScrollbar();
  const form = useForm<MedicineStockType>({
    resolver: zodResolver(MedicineStocksSchema),
    defaultValues: {
      medicineID: "",
      category: "",
      dosage: 0,
      dsgUnit: "",
      form: "",
      qty: 0,
      unit: "",
      pcs: 0,
      expiryDate: "",
    },
  });

  const {
    categories,
    handleDeleteConfirmation,
    categoryHandleAdd,
    ConfirmationDialogs,
  } = useCategoriesMedicine();
  const medicines = fetchMedicines();

  const onSubmit = async (data: MedicineStockType) => {
    try {
        const inventoryPayload = {
            expiry_date: data.expiryDate,
            inv_type: "Medicine",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Step 1: Create inventory entry
        const inventoryResponse = await addInventory(inventoryPayload);
        console.log("Inventory Response:", inventoryResponse);

        if (!inventoryResponse?.inv_id) {
            throw new Error("Failed to generate inventory ID.");
        }
        
        const inv_id = parseInt(inventoryResponse.inv_id, 10); // Ensure it's an integer
        console.log("Generated inv_id:", inv_id);

        if (!data.medicineID) {
            throw new Error("Medicine ID is required.");
        }

        const med_id = parseInt(data.medicineID, 10); // Convert to integer

        console.log("Creating Inventory Entry:", inventoryPayload);

        const qty = Number(data.qty) || 0;
        const pcs = Number(data.pcs) || 0;
        const minv_qty_avail = data.unit === "boxes" ? qty * pcs : qty;

        const medicinePayload: MedicineInventoryPayload = {
            minv_dsg: Number(data.dosage) || 0,
            minv_dsg_unit: data.dsgUnit || "N/A",
            minv_form: data.form || "N/A",
            minv_qty: qty,
            minv_qty_unit: data.unit || "N/A",
            minv_pcs: pcs,
            minv_distributed: 0,
            minv_qty_avail,
            med_id, // FK from medicine
            cat_id: Number(data.category) || 0,
            inv_id, // FK from inventory (integer)
        };

        console.log("Medicine Payload:", medicinePayload);

        // Add delay to avoid async race conditions
        await new Promise((resolve) => setTimeout(resolve, 500));

        const medicineInventoryResponse = await addMedicineInventory(medicinePayload);
        console.log("Medicine Inventory Response:", medicineInventoryResponse);

    } catch (error: any) {
        console.error("Submission Error:", error);
        if (error.response) {
            console.error("Error response:", error.response.data);
        }
    }
};

  // Watch relevant fields for calculation
  const currentUnit = form.watch("unit");
  const qty = form.watch("qty") || 0;
  const pcs = form.watch("pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : 0;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Form Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Medicine Name Dropdown */}
            <FormField
              control={form.control}
              name="medicineID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">Medicine Name</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Medicine"
                      options={medicines}
                      value={field.value}
                      onChange={(value) => {
                        console.log("Selected Medicine ID:", value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Dropdown with Add/Delete */}
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
                      options={
                        categories.length > 0
                          ? categories
                          : [{ id: "loading", name: "Loading..." }]
                      }
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
                  <FormLabel className="text-black/65">Expiry Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Dosage */}
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">Dosage</FormLabel>
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

            {/* Dosage Unit */}
            <FormField
              control={form.control}
              name="dsgUnit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">Dosage Unit</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Unit"
                      options={[
                        { id: "mg", name: "mg" },
                        { id: "ml", name: "ml" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form */}
            <FormField
              control={form.control}
              name="form"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">Form</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Form"
                      options={[
                        { id: "tablet", name: "Tablet" },
                        { id: "capsule", name: "Capsule" },
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
            {/* Quantity Input */}
            <FormField
              control={form.control}
              name="qty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    {currentUnit === "boxes" ? "Number of Boxes" : "Quantity"}
                  </FormLabel>
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

            {/* Quantity Unit */}
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">Unit</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Unit"
                      options={[
                        { id: "boxes", name: "Boxes" },
                        { id: "bottles", name: "Bottles" },
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pieces per Box (Conditional) */}
            {currentUnit === "boxes" && (
              <FormField
                control={form.control}
                name="pcs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black/65">
                      Pieces per Box
                    </FormLabel>
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
            )}

            {/* Total Pieces Display (Conditional) */}
            {currentUnit === "boxes" && (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-black/65">Total Pieces</FormLabel>
                <div className="flex items-center h-10  rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {totalPieces.toLocaleString()} pieces
                  <span className="ml-2 text-muted-foreground text-xs">
                    ({qty} boxes × {pcs} pieces/box)
                  </span>
                </div>
              </FormItem>
            )}
          </div>

          {/* Sticky Submit Button */}
          <div className="flex justify-end gap-3  bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]">
              Save Stock
            </Button>
          </div>
        </form>
      </Form>
      {ConfirmationDialogs()} //Category
      {/* <ConfirmationDialog
              isOpen={isAddConfirmationOpen}
              onOpenChange={setIsAddConfirmationOpen}
              onConfirm={confirmAdd}
              title="Add Medicine"
              description={`Are you sure you want to add the medicine "${newCommodityName}"?`}
            /> */}
    </div>
  );
}

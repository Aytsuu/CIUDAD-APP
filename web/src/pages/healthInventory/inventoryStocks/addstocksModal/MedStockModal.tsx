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
import { fetchMedicines } from "../request/Fetch";
import { useCategoriesMedicine } from "../request/Category/Medcategory";
import { addMedicineInventory, addInventory } from "../request/Post";
import { ConfirmationDialog } from "../../confirmationLayout/ConfirmModal";
import { InventoryPayload } from "../request/Payload";
import { MedicinePayload } from "../request/Payload";


interface MedicineStocksProps{
  fetchData:()=>void;
  setIsDialog:(isOpen: boolean) => void
}

export default function MedicineStockForm({fetchData,setIsDialog}:MedicineStocksProps) {
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

const {categories,handleDeleteConfirmation, categoryHandleAdd,ConfirmationDialogs,} = useCategoriesMedicine();const medicines = fetchMedicines();
const [isAddConfirmationOpen,setIsAddConfirmationOpen] =useState(false)
const [submissionData, setSubmissionData] = useState<MedicineStockType | null>(null);

const handleSubmit = async (data: MedicineStockType) => {
  try {
    const inventoryResponse = await addInventory(InventoryPayload(data)); 
    if (!inventoryResponse?.inv_id) {
      throw new Error("Failed to generate inventory ID.");
    }
    const inv_id = parseInt(inventoryResponse.inv_id, 10);
    if (!data.medicineID) {
      throw new Error("Medicine ID is required.");
    }
    const medicinePayload = MedicinePayload(data, inv_id);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const medicineInventoryResponse = await addMedicineInventory(medicinePayload);
    if (!medicineInventoryResponse || medicineInventoryResponse.error) {
      throw new Error("Failed to add medicine inventory.");
    }
    console.log("Medicine Inventory Response:", medicineInventoryResponse);
    // Close the confirmation modal only if successful
    setIsAddConfirmationOpen(false); 
    setIsDialog(false)
    
    fetchData()
  } catch (error: any) {
    console.error(error);
    if (error.response) {
      console.error("Error response:", error.response.data);
      setIsAddConfirmationOpen(false);
    }
    setIsAddConfirmationOpen(false);
  }
};

// Open confirmation dialog and store submission data
const onSubmit = (data: MedicineStockType) => {
  setSubmissionData(data);
  setIsAddConfirmationOpen(true);
};

const confirmAdd = () => {
  if (submissionData) {
    handleSubmit(submissionData);
  }
};

 
const currentUnit = form.watch("unit");
const qty = form.watch("qty");
const pcs = form.watch("pcs");
const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;

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
      <ConfirmationDialog
              isOpen={isAddConfirmationOpen}
              onOpenChange={setIsAddConfirmationOpen}
              onConfirm={confirmAdd}
              title="Add Medicine"
              description={`Are you sure you want to add the medicine "?`}
            />
    </div>
  );
}

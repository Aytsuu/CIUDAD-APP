import { useState } from "react"; // Add this import
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
import { useCategories } from "../request/medcategory";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { ConfirmationDialog } from "../../confirmationLayout/ConfirmModal";

export default function MedicineStockForm() {
  UseHideScrollbar();
  const form = useForm<MedicineStockType>({
    resolver: zodResolver(MedicineStocksSchema),
    defaultValues: {
      medicineName: "",
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

    handleAddCategory,
    handleDeleteCategory,
    error,
  } = useCategories();

  // State for delete confirmation dialog
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  // State for add confirmation dialog
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  const handleSelectChange = (
    selectedValue: string,
    fieldOnChange: (value: string) => void
  ) => {
    fieldOnChange(selectedValue);
    form.setValue("category", selectedValue, { shouldValidate: true });
  };

  const onSubmit = async (data: MedicineStockType) => {
    try {
      const validatedData = MedicineStocksSchema.parse(data);
      console.log("Form submitted", validatedData);
      form.reset();
      alert("Medicine stock added successfully!");
    } catch (error) {
      console.error("Form submission error:", form.formState.errors);
      alert("Submission failed. Please check the form for errors.");
    }
  };

  // Watch relevant fields for calculation
  const currentUnit = form.watch("unit");
  const qty = form.watch("qty") || 0;
  const pcs = form.watch("pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : 0;

  
  // Handle delete confirmation
  const handleDeleteConfirmation = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete !== null) {
      await handleDeleteCategory(categoryToDelete);
      setIsDeleteConfirmationOpen(false);
      setCategoryToDelete(null);
    }
  };

  // Handle add confirmation
  const handleAddConfirmation = (categoryName: string) => {
    setNewCategoryName(categoryName);
    setIsAddConfirmationOpen(true);
  };

  const confirmAdd = async () => {
    if (newCategoryName.trim()) {
      await handleAddCategory(newCategoryName, (newId) => {
        form.setValue("category", newId, { shouldValidate: true });
      });
      setIsAddConfirmationOpen(false);
      setNewCategoryName("");
    }
  };

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Form Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Medicine Name Dropdown */}
            <FormField
              control={form.control}
              name="medicineName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">Medicine Name</FormLabel>
                  <FormControl>
                    <SelectLayout
                      label=""
                      className="w-full"
                      placeholder="Select Medicine"
                      options={[
                        { id: "paracetamol", name: "Paracetamol" },
                        { id: "amoxicillin", name: "Amoxicillin" },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
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
                    <SelectLayoutWithAdd
                      className="w-full"
                      label="Category"
                      placeholder="Select a Category"
                      options={categories}
                      value={
                        categories.find((cat) => cat.id === field.value)?.id ||
                        ""
                      }
                      onChange={(selectedValue) =>
                        handleSelectChange(selectedValue, field.onChange)
                      }
                      onAdd={handleAddConfirmation} // Pass the confirmation handler
                      onDelete={(categoryId) => {
                        const parsedCategoryId = Number(categoryId); // Convert to number
                        if (!isNaN(parsedCategoryId)) {
                          handleDeleteConfirmation(parsedCategoryId); // Open delete confirmation dialog
                        } else {
                          console.error("❌ Invalid category ID:", categoryId);
                        }
                      }}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        onConfirm={confirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
      />

      {/* Add Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isAddConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Add Category"
        description={`Are you sure you want to add the category "${newCategoryName}"?`}
      />
    </div>
  );
}

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
import { useForm } from "react-hook-form";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FirstAidStockSchema,
  FirstAidStockType,
} from "@/form-schema/inventory/inventoryStocksSchema";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import { fetchFirstAid } from "../REQUEST/fetch";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { useCategoriesFirstAid } from "../REQUEST/Category/FirstAidCategory";
import { submitFirstAidStock } from "../REQUEST/Post/FirstAid/FirstAidAddPost";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { CircleCheck } from "lucide-react";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateInput } from "@/components/ui/form/form-date-input";

interface FirstAidStockFormProps {  
  setIsDialog:(isOpen: boolean) => void
}

export default function FirstAidStockForm({setIsDialog}:FirstAidStockFormProps) {
  UseHideScrollbar();
  const form = useForm<FirstAidStockType>({
    resolver: zodResolver(FirstAidStockSchema),
    defaultValues: {
      fa_id: "",
      cat_id: "",
      finv_qty_unit: "boxes",
      finv_qty: 0,
      finv_pcs: 0,
      expiryDate: new Date().toISOString().split("T")[0],
    },
  });

  const firstaid = fetchFirstAid();
  const queryClient = useQueryClient();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [submissionData, setSubmissionData] = useState<FirstAidStockType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { categories, handleDeleteConfirmation, categoryHandleAdd, ConfirmationDialogs } = useCategoriesFirstAid();

  const handleSubmit = async (data: FirstAidStockType) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Adding first aid item...', {
      duration: Infinity
    });
    try {
      await submitFirstAidStock(data, queryClient);
      toast.success('First aid item added successfully', {
        id: toastId,
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
        onAutoClose: () => { setIsDialog(false);}});
    } catch (error: any) {
      console.error("Error in handleSubmit:", error);
      toast.error(error.message || "Failed to add first aid item", { id: toastId, duration: 3000});
      setIsSubmitting(false);
    } 
  };

  const onSubmit = (data: FirstAidStockType) => { 
    setSubmissionData(data);
    setIsAddConfirmationOpen(true);};

  const confirmAdd = () => {
    if (submissionData) {
      setIsAddConfirmationOpen(false);
      handleSubmit(submissionData);
    }
  };

  const currentUnit = form.watch("finv_qty_unit");
  const qty = form.watch("finv_qty");
  const pcs = form.watch("finv_pcs");
  const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Toaster position="top-center" richColors />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
            <FormSelect control={form.control} name="fa_id" label="Unit" options={firstaid}/>
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
                      onChange={field.onChange}
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
            <FormDateInput  control={form.control}  name="expiryDate"  label="Expiry Date" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput control={form.control} name="finv_qty" label={currentUnit === "boxes" ? "Number of Boxes" : "Quantity"}   type="number"   placeholder="Quantity"   />
            <FormSelect control={form.control} name="finv_qty_unit" label="Unit" options={[{ id: "boxes", name: "Boxes" },{ id: "bottles", name: "Bottles" },{ id: "packs", name: "Packs" },]}  />
          </div>

          {/* Pieces per Box and Total Pieces Display */}
          {currentUnit === "boxes" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput  control={form.control}  name="finv_pcs"   label="Pieces per Box"   type="number"  placeholder="Pieces per box" />
              <div>
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
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]"disabled={isSubmitting}> Save  </Button> </div>
        </form>
      </Form>
      {ConfirmationDialogs()}
      <ConfirmationDialog
        isOpen={isAddConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Add First Aid"
        description={`Are you sure you want to add the First Aid?`}
      />
    </div>
  );
}
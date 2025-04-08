import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CommodityStockType,
  CommodityStocksSchema,
} from "@/form-schema/inventory/inventoryStocksSchema";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import { fetchCommodity } from "../REQUEST/fetch";
import { useCategoriesCommodity } from "../REQUEST/Category/CommodityCategory";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { submitCommodityStock } from "../REQUEST/Post/Commodity/AddCommodityPost";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { CircleCheck } from "lucide-react";

interface CommodiityStockFormProps {  
  setIsDialog: (isOpen: boolean) => void;
}

export default function CommodityStockForm({ setIsDialog }: CommodiityStockFormProps) {
  UseHideScrollbar();
  const queryClient = useQueryClient();
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
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [submissionData, setSubmissionData] = useState<CommodityStockType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
 

  const onSubmit = (data: CommodityStockType) => {
    setSubmissionData(data);
    setIsAddConfirmationOpen(true);
  };
  
  const confirmAdd = async () => {
    setIsAddConfirmationOpen(false); // Close confirmation dialog first
    setIsSubmitting(true); // Disable the button

    if (!submissionData) return;
  
    const toastId = toast.loading('Adding commodity...', {
      duration: Infinity
    });
    
    try {
      const result = await submitCommodityStock(submissionData, queryClient);
      
      if (result.success) {
        toast.success('Commodity added successfully', {
          id: toastId,
          icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
          duration: 2000,
          onAutoClose: () => {
            setIsDialog(false); // Close main dialog only after toast completes
          }
        });
      } else {
        toast.error(result.error || 'Failed to add commodity', {
          id: toastId,
          duration: 3000
        });
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("An unexpected error occurred", {
        id: toastId,
        duration: 3000
      });
    }
  };

  const currentUnit = form.watch("cinv_qty_unit");
  const qty = form.watch("cinv_qty") || 0;
  const pcs = form.watch("cinv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Toaster position="top-center" richColors />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect 
              control={form.control} 
              name="com_id"  
              label="Commodity Name" 
              options={commodity} 
            />
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
            <FormDateInput 
              control={form.control}  
              name="expiryDate" 
              label="Expiry Date"
            />
            <FormSelect 
              control={form.control} 
              name="cinv_recevFrom" 
              label="Receive From" 
              options={[
                { id: "doh", name: "DOH" },
                { id: "chd", name: "CHD" },
                { id: "others", name: "OTHERS" },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput control={form.control}  name="cinv_qty"  label={currentUnit === "boxes" ? "Number of Boxes" : "Quantity"}   type="number"  placeholder="Quantity"  
            />
            <FormSelect 
              control={form.control}  
              name="cinv_qty_unit"  
              label="Unit"
              options={[
                { id: "boxes", name: "Boxes" }, 
                { id: "bottles", name: "Bottles" }, 
                { id: "packs", name: "Packs" }, 
              ]} 
            />
          </div>
  
          {currentUnit === "boxes" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput 
                control={form.control} 
                name="cinv_pcs"  
                label="Pieces per Box" 
                type="number" 
                placeholder="Pieces per box"
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
  
          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]"  disabled={isSubmitting}
            >
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
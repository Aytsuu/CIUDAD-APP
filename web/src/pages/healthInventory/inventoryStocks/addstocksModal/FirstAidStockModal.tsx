import { useState } from "react";
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
  FirstAidStockSchema,
  FirstAidStockType,
} from "@/form-schema/inventory/inventoryStocksSchema";
import UseHideScrollbar from "@/components/ui/HideScrollbar";
import { fetchFirstAid } from "../REQUEST/fetch";
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { useCategoriesFirstAid } from "../REQUEST/Category/FirstAidCategory";
// import { submitFirstAidStock } from "../REQUEST/FirstAid/FirstAidSubmit";
import { toast } from "sonner";
import { CircleCheck, Loader2 } from "lucide-react";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import {useSubmitFirstAidStock} from "../REQUEST/FirstAid/queries/FirstAidPostQueries";
interface FirstAidStockFormProps {
  setIsDialog: (isOpen: boolean) => void;
}

export default function FirstAidStockForm({
  setIsDialog,
}: FirstAidStockFormProps) {
  UseHideScrollbar();
  const form = useForm<FirstAidStockType>({
    resolver: zodResolver(FirstAidStockSchema),
    defaultValues: {
      fa_id: "",
      cat_id: "",
      finv_qty_unit: "boxes",
      finv_qty: undefined,
      finv_pcs: undefined,
      expiryDate: new Date().toISOString().split("T")[0],
    },
  });

  const firstaid = fetchFirstAid();
  
  const queryClient = useQueryClient();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [submissionData, setSubmissionData] =
    useState<FirstAidStockType | null>(null);

  const { mutate: submitFirstAidStock, isPending: isSubmitting } = useSubmitFirstAidStock();

  const {
    categories,
    handleDeleteConfirmation,
    categoryHandleAdd,
    ConfirmationDialogs,
  } = useCategoriesFirstAid();

  const handleSubmit = (data: FirstAidStockType) => {
    submitFirstAidStock(data, {
      onSuccess: () => {
        setIsDialog(false);
      }
    });
  };
  
  const onSubmit = (data: FirstAidStockType) => {
    setSubmissionData(data);
    setIsAddConfirmationOpen(true);
  };
  
  const confirmAdd = () => {
    if (submissionData) {
      setIsAddConfirmationOpen(false);
      handleSubmit(submissionData);
    }
  }
  const currentUnit = form.watch("finv_qty_unit");
  const qty = form.watch("finv_qty") || 0;
  const pcs = form.watch("finv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * (pcs || 0) : qty;

  return (
    <div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-1 hide-scrollbar">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="fa_id"
              label="Unit"
              options={firstaid}
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
            <FormDateTimeInput
              control={form.control}
              name="expiryDate"
              label="Expiry Date"
              type="date"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="finv_qty"
              label={currentUnit === "boxes" ? "Number of Boxes" : "Quantity"}
              type="number"
              placeholder="Quantity"
            />
            <FormSelect
              control={form.control}
              name="finv_qty_unit"
              label="Unit"
              options={[
                { id: "boxes", name: "Boxes" },
                { id: "bottles", name: "Bottles" },
                { id: "packs", name: "Packs" },
              ]}
            />
          </div>

          {currentUnit === "boxes" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                control={form.control}
                name="finv_pcs"
                label="Pieces per Box"
                type="number"
                placeholder="Pieces per box"
              />
              <div>
                <FormItem className="sm:col-span-2">
                  <FormLabel>Total Pieces</FormLabel>
                  <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {totalPieces.toLocaleString() } pieces
                    <span className="ml-2 text-muted-foreground text-xs">
                      ({qty} boxes × {pcs} pieces/box)
                    </span>
                  </div>
                </FormItem>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2">
            <Button type="submit" className="w-[120px]" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
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
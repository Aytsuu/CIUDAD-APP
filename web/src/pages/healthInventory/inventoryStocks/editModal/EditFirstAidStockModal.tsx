import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Form, FormLabel } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import {
  AddFirstAidSchema,
  AddFirstAidStockType,
} from "@/form-schema/inventory/stocks/RestockStocksSchema";
import { toast } from "sonner";
import { CircleCheck, Pill,Loader2 } from "lucide-react";
import { useEditFirstAidStock } from "../REQUEST/FirstAid/queries/FirstAidUpdateQueries"; // adjust import path
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FirstAidStocksRecord } from "../tables/type";
import { Label } from "@/components/ui/label";
import { Link, useLocation, useNavigate } from "react-router";

export default function EditFirstAidStock() {
  const location = useLocation();
  const initialData = location.state?.params
    ?.initialData as FirstAidStocksRecord;

  const form = useForm<AddFirstAidStockType>({
    resolver: zodResolver(AddFirstAidSchema),
    defaultValues: {
      finv_qty: undefined,
      finv_qty_unit: initialData.finv_qty_unit,
      finv_pcs: initialData.qty.finv_pcs || 0,
    },
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate: submit, isPending } = useEditFirstAidStock();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [formData, setformData] = useState<AddFirstAidStockType | null>(null);
  const currentUnit = form.watch("finv_qty_unit");
  const qty = form.watch("finv_qty") || 0;
  const pcs = form.watch("finv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;


  const onSubmit = (data: AddFirstAidStockType) => {
    setformData(data);
    setIsAddConfirmationOpen(true);
  };

  const confirmAdd = () => {
    if (!formData) return;
    setIsAddConfirmationOpen(false);
    submit({ data: formData, finv_id: initialData.finv_id }, {
      onSuccess: () => {
        navigate("/mainInventoryStocks");
        toast.success("First aid item added successfully", {
          icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
          duration: 2000,
        });
      },
      onError: (error: Error) => {
        console.error("Error adding first aid item:", error);
        toast.error("Failed to add first aid item");
      },
    });
  };

  
  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-4">
      <Form {...form}>
      <form onSubmit={(e)=> e.preventDefault()}

          className="bg-white p-5 w-full max-w-[600px] rounded-sm space-y-5"
        >
          <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
            <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Add FirstAid Stocks
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-darkGray font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Commodity Name
              </label>
              <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {initialData.firstAidInfo.fa_name}
              </div>
            </div>

            {/* Commodity Category */}
            <div className="space-y-2">
              <label className="text-sm text-darkGray font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Category
              </label>
              <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {initialData.category}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-darkGray font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Available Qty
              </label>
              <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                {initialData.availQty}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="finv_qty"
              label={currentUnit === "boxes" ? "Add new boxes" : "Add new quantity"}
              type="number"
              placeholder="Enter quantity"
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
              readOnly
            />
          </div>

          {currentUnit === "boxes" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                control={form.control}
                name="finv_pcs"
                label="Pieces per Box"
                type="number"
                placeholder="pcs"
                readOnly
              />

              <div className="sm:col-span-2">
                <FormLabel>Total Pieces</FormLabel>
                <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {totalPieces.toLocaleString()} pc/s
                  <span className="ml-2 text-muted-foreground text-xs">
                    ({qty} boxes × {pcs} pc/s)
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2 pt-8">
            <Button variant="outline" className="w-full" onClick={form.handleSubmit(onSubmit)}>
              <Link to="/mainInventoryStocks">Cancel</Link>
            </Button>
            <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
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

      <ConfirmationDialog
        isOpen={isAddConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Confirm Update"
        description="Are you sure you want to update this first aid stock? This action cannot be undone."
      />
    </div>
  );
}

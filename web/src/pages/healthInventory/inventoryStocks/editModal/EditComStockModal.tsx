import React, { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AddCommoditySchema,
  AddCommodityStockType,
} from "@/form-schema/inventory/stocks/RestockStocksSchema";
import { CommodityStocksRecord } from "../tables/type";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { CircleCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Pill, Loader2 } from "lucide-react";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { useUpdateCommodityStock } from "../REQUEST/Commodity/queries/CommodityPutQueries";

export default function EditCommodityStock() {
  const location = useLocation();
  const initialData = location.state?.params?.initialData as CommodityStocksRecord;

  const form = useForm<AddCommodityStockType>({
    resolver: zodResolver(AddCommoditySchema),
    defaultValues: {
      cinv_qty: undefined,
      cinv_qty_unit: initialData.cinv_qty_unit,
      cinv_pcs: initialData.qty?.cinv_pcs || 0,
    },
  });

  const navigate = useNavigate();
  const [isConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [formData, setformData] = useState<AddCommodityStockType | null>(null);
  const { mutate: updateStock, isPending } = useUpdateCommodityStock();
  const currentUnit = form.watch("cinv_qty_unit");
  const qty = form.watch("cinv_qty") || 0;
  const pcs = form.watch("cinv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : 0;

  const confirmAdd = () => {
    if (!formData) return;
    setIsAddConfirmationOpen(false);
    updateStock({ formData, initialData });
  };

  const onSubmit = (data: AddCommodityStockType) => {
    setformData(data);
    setIsAddConfirmationOpen(true);
  };

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white p-5 w-full max-w-[600px] rounded-sm space-y-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mt-3">
            {/* Commodity Name */}
            <div className="text-base font-medium text-gray-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-2">
                Commodity Name:
              </span>
              {initialData.commodityInfo.com_name}
            </div>

            {/* Commodity Category */}
            <div className="text-base font-medium text-gray-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-2">
                Category:
              </span>
              {initialData.category}
            </div>

            {/* Available Qty */}
            <div className="text-base font-medium text-gray-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-2">
                Available Qty:
              </span>
              {initialData.cinv_qty_unit.toLowerCase() === "boxes" &&
              initialData.qty?.cinv_pcs > 0 ? (
                <>
                  {Math.ceil(
                    Number(initialData.availQty) /
                      Number(initialData.qty.cinv_pcs)
                  )}{" "}
                  boxe/s ({Number(initialData.availQty)} pc/s)
                </>
              ) : (
                `${initialData.availQty} ${initialData.cinv_qty_unit}`
              )}
            </div>

            {/* Receive From */}
            <div className="text-base font-medium text-gray-900">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-2">
                Receive From:
              </span>
              {initialData.recevFrom}
            </div>
          </div>

          <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
            <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Add Commodity Stocks
          </Label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="cinv_qty"
              label={
                currentUnit === "boxes"
                  ? "Add new number of boxes"
                  : "Add new quantity"
              }
              type="number"
              placeholder="Enter quantity"
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
              readOnly
            />
          </div>

          {currentUnit === "boxes" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                control={form.control}
                name="cinv_pcs"
                label="Pieces per Box"
                type="number"
                placeholder="pcs"
                readOnly
              />
              <div className="sm:col-span-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
                  Total Pieces
                </label>
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
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(-1)}
            >
              Cancel
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
        isOpen={isConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Confirm Update"
        description="Are you sure you want to update this commodity stock? This action cannot be undone."
      />
    </div>
  );
}

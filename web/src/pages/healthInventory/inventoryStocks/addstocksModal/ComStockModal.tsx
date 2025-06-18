import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CommodityStockType,
  CommodityStocksSchema,
} from "@/form-schema/inventory/stocks/inventoryStocksSchema";
import { fetchCommodity } from "../REQUEST/Commodity/restful-api/CommodityFetchAPI";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { useSubmitCommodityStock } from "../REQUEST/Commodity/queries/CommodityPostQueries";
import { toast } from "sonner";
import { CircleCheck, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function AddCommodityStock() {
  const form = useForm<CommodityStockType>({
    resolver: zodResolver(CommodityStocksSchema),
    defaultValues: {
      com_id: "",
      category: "",
      cinv_qty_unit: "boxes",
      cinv_qty: undefined,
      cinv_pcs: undefined,
      cinv_recevFrom: "",
      expiryDate: new Date().toISOString().split("T")[0],
    },
  });

  const commodity = fetchCommodity();
  const { mutate: submit, isPending } = useSubmitCommodityStock();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [formData, setFormData] = useState<CommodityStockType | null>(null);
  const navigate = useNavigate();
  const currentUnit = form.watch("cinv_qty_unit");
  const qty = form.watch("cinv_qty") || 0;
  const pcs = form.watch("cinv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;

  // Watch for com_id changes and update category
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "com_id" && value.com_id) {
        const selectedCommodity = commodity.find(
          (com) => com.id === value.com_id
        );
        if (selectedCommodity) {
          form.setValue("category", selectedCommodity.category);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, commodity]);

  // useEffect(() => {
  //   const subscription = form.watch((value, { name }) => {
  //     if (name === "cinv_qty_unit" && value.cinv_qty_unit !== "boxes") {
  //       form.setValue("cinv_pcs", 0);
  //     }
  //   });
  //   return () => subscription.unsubscribe();
  // }, [form]);

  const onSubmit = (data: CommodityStockType) => {
    console.log("Form submitted, opening confirmation dialog");
    setFormData(data);
    setIsAddConfirmationOpen(true);
  };

  const confirmAdd = async () => {
    if (!formData) return;
    setIsAddConfirmationOpen(false);

    submit(formData, {
      onSuccess: () => {
        toast.success("Added successfully", {
          icon: (
            <CircleCheck size={24} className="fill-green-500 stroke-white" />
          ),
          duration: 2000,
        });
        form.reset();
        navigate("/mainInventoryStocks");
      },
      onError: (error: Error) => {
        console.error("Error in handleSubmit:", error);
        toast.error("Failed to Add new Stocks");
      },
    });
  };

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-4">
      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-white p-5 w-full max-w-[600px] rounded-sm space-y-5"
        >
          <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
            <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Add Commodity Stocks
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="com_id"
              label="Commodity Name"
              options={commodity}
            />

            <FormInput
              control={form.control}
              name="category"
              label="Category"
              readOnly
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormDateTimeInput
              control={form.control}
              name="expiryDate"
              label="Expiry Date"
              type="date"
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
            <FormInput
              control={form.control}
              name="cinv_qty"
              label={currentUnit === "boxes" ? "Number of Boxes" : "Quantity"}
              type="number"
              placeholder="Quantity"
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

          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2 pt-8">
            <Button variant="outline" className="w-full">
              <Link to="/mainInventoryStocks">Cancel</Link>
            </Button>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
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
        title="Add Commodity"
        description={`Are you sure you want to add this commodity item?`}
      />
    </div>
  );
}
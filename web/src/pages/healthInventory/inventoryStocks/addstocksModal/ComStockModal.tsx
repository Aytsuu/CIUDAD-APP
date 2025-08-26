import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Form, FormItem, FormLabel } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommodityStockType, CommodityStocksSchema } from "@/form-schema/inventory/stocks/inventoryStocksSchema";
import { fetchCommodity } from "../REQUEST/Commodity/restful-api/CommodityFetchAPI";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { useSubmitCommodityStock } from "../REQUEST/Commodity/queries/CommodityPostQueries";
import { Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AddCommodityStock() {
  const { user } = useAuth();
  const staff= user?.staff?.staff_id || "";
  const form = useForm<CommodityStockType>({
    resolver: zodResolver(CommodityStocksSchema),
    defaultValues: {
      com_id: "",
      cinv_qty_unit: "boxes",
      cinv_qty: undefined,
      cinv_pcs: undefined,
      cinv_recevFrom: "",
      expiry_date: "",
      staff:staff,
      inv_type:"Commodity"
    }
  });

  const commodity: Array<{ id: string; name: string; category: string; user_type?: string }> = fetchCommodity();
  const { mutate: submit, isPending } = useSubmitCommodityStock();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [formData, setFormData] = useState<CommodityStockType | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const navigate = useNavigate();
  const currentUnit = form.watch("cinv_qty_unit");
  const qty = form.watch("cinv_qty") || 0;
  const pcs = form.watch("cinv_pcs") || 0;
  const comId = form.watch("com_id");
  const totalPieces = currentUnit === "boxes" ? qty * pcs : qty;

  // Update user_type when com_id changes
  useEffect(() => {
    if (comId) {
      const selectedCommodity = commodity.find((item) => item.id === comId);
      setSelectedUserType(selectedCommodity?.user_type ?? "Unknown");
    } else {
      setSelectedUserType(""); // Reset when no commodity is selected
    }
  }, [comId, commodity]);

  const onSubmit = (data: CommodityStockType) => {
    console.log("Form submitted, opening confirmation dialog");
    setFormData(data);
    setIsAddConfirmationOpen(true);
  };

  const confirmAdd = async () => {
    if (!formData) return;
    setIsAddConfirmationOpen(false);
    submit({ data: formData });
  };

  return (
    <div className="w-full flex items-center justify-center">
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="bg-white p-5 w-full max-w-[600px] rounded-sm space-y-5">
          <Label className="flex justify-center text-lg font-bold text-darkBlue2 text-center ">Add Stocks</Label>
          <hr className="mb-2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect control={form.control} name="com_id" label="Commodity Name" options={commodity} />

            <div className="flex flex-col">
              <FormLabel className="text-darkGray">User Type</FormLabel>
              <div className="flex items-center mt-4 h-10 rounded-md border border-input bg-background px-3  text-sm">{selectedUserType || "Select a commodity"}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormDateTimeInput control={form.control} name="expiry_date" label="Expiry Date" type="date" />
            <FormSelect
              control={form.control}
              name="cinv_recevFrom"
              label="Receive From"
              options={[
                { id: "doh", name: "DOH" },
                { id: "chd", name: "CHD" },
                { id: "others", name: "OTHERS" }
              ]}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput control={form.control} name="cinv_qty" label={currentUnit === "boxes" ? "Number of Boxes" : "Quantity"} type="number" placeholder="Quantity" />
            <FormSelect
              control={form.control}
              name="cinv_qty_unit"
              label="Unit"
              options={[
                { id: "boxes", name: "Boxes" },
                { id: "bottles", name: "Bottles" },
                { id: "packs", name: "Packs" }
              ]}
            />
          </div>

          {currentUnit === "boxes" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput control={form.control} name="cinv_pcs" label="Pieces per Box" type="number" placeholder="Pieces per box" />
              <FormItem className="sm:col-span-2">
                <FormLabel>Total Pieces</FormLabel>
                <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {totalPieces.toLocaleString()} pc/s
                  {currentUnit === "boxes" && (
                    <span className="ml-2 text-muted-foreground text-xs">
                      ({qty} boxes × {pcs} pc/s)
                    </span>
                  )}
                </div>
              </FormItem>
            </div>
          )}

          <div className="flex justify-end gap-3 bottom-0 bg-white pb-2 pt-8">
            <Button variant="outline" className="w-[150px]" onClick={() => navigate(-1)}>
              Cancel{" "}
            </Button>

            <Button type="submit" className="w-[150px]" disabled={isPending} onClick={form.handleSubmit(onSubmit)}>
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

      <ConfirmationDialog isOpen={isAddConfirmationOpen} onOpenChange={setIsAddConfirmationOpen} onConfirm={confirmAdd} title="Add Commodity" description={`Are you sure you want to add this commodity item?`} />
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { Form, FormItem, FormLabel } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FirstAidStockSchema,
  FirstAidStockType,
} from "@/form-schema/inventory/stocks/inventoryStocksSchema";
import { fetchFirstAid } from "../REQUEST/FirstAid/restful-api/FirstAidFetchAPI";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { Loader2 } from "lucide-react";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { useSubmitFirstAidStock } from "../REQUEST/FirstAid/queries/FirstAidPostQueries";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function () {
  const {user}=useAuth()
  const staff_id = user?.staff?.staff_id
  const form = useForm<FirstAidStockType>({
    resolver: zodResolver(FirstAidStockSchema),
    defaultValues: {
      fa_id: "",
      category: "",
      finv_qty_unit: "boxes",
      finv_qty: undefined,
      finv_pcs: undefined,
      expiryDate: new Date().toISOString().split("T")[0],
    },
  });
  const firstaid = fetchFirstAid();
  const [isAddConfirmationOpen, setIsAddConfirmationOpen] = useState(false);
  const [formData, setformData] = useState<FirstAidStockType | null>(null);
  const { mutate: submit, isPending } = useSubmitFirstAidStock();
  const currentUnit = form.watch("finv_qty_unit");
  const qty = form.watch("finv_qty") || 0;
  const pcs = form.watch("finv_pcs") || 0;
  const totalPieces = currentUnit === "boxes" ? qty * (pcs || 0) : qty;

  // Watch for com_id changes and update category
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "fa_id" && value.fa_id) {
        const selectedFirstAid = firstaid.find((fa) => fa.id === value.fa_id);
        if (selectedFirstAid) {
          form.setValue("category", selectedFirstAid.category);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, firstaid]);

  const onSubmit = (data: FirstAidStockType) => {
    setformData(data);
    setIsAddConfirmationOpen(true);
  };

  const confirmAdd = () => {
    if (!formData) return;
    setIsAddConfirmationOpen(false);
    submit({ data: formData, staff_id });
    
  };

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-4">
      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-white p-5 w-full max-w-[500px] rounded-sm space-y-5"
        >
          <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
            <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Add First Aid Stocks
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="fa_id"
              label="First Aid Item"
              options={firstaid}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInput
                control={form.control}
                name="finv_pcs"
                label="Pieces per Box"
                type="number"
                placeholder="Pieces per box"
              />

              <FormItem className="sm:col-span-2 w-full">
                <FormLabel>Total Pieces</FormLabel>
                <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {totalPieces.toLocaleString()} pc/s
                  <span className="ml-2 text-muted-foreground text-xs">
                    ({qty} boxes × {pcs} pc/s)
                  </span>
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

      {/* First Aid Add Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isAddConfirmationOpen}
        onOpenChange={setIsAddConfirmationOpen}
        onConfirm={confirmAdd}
        title="Add First Aid Item"
        description={`Are you sure you want to add this first aid item?`}
      />
    </div>
  );
}
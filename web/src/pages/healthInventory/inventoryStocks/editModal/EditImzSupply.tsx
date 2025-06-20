import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { FormInput } from "@/components/ui/form/form-input";
import {
  ImmunizationStockType,
  ImmunizationStocksSchema,
} from "@/form-schema/inventory/stocks/EditAntigenSchema";
import { StockRecords } from "../tables/type";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";
import { Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useSubmitUpdateImmunizationStock } from "../REQUEST/Antigen/queries/ImzSupluPutQueries";

export default function EditImzSupplyStock() {
  const location = useLocation();
  const supply = location.state?.initialData as StockRecords;
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [formData, setFormData] = useState<ImmunizationStockType | null>(null);
  const [originalUnit] = useState(
    supply.imzStck_unit || supply.item.unit || "pcs"
  );
  const navigate = useNavigate();

  const form = useForm<ImmunizationStockType>({
    resolver: zodResolver(ImmunizationStocksSchema),
    defaultValues: {
      boxCount:
        supply.imzStck_unit === "boxes"
          ? supply.qty
            ? Number(supply.qty)
            : 0
          : 0,
      pcsCount:0,
       
      pcsPerBox: supply.imzStck_pcs ? Number(supply.imzStck_pcs) : 0,
      imzStck_unit:
        supply.imzStck_unit === "pcs" || supply.imzStck_unit === "boxes"
          ? supply.imzStck_unit
          : supply.item.unit === "pcs" || supply.item.unit === "boxes"
          ? supply.item.unit
          : "pcs",
    },
  });

  const currentUnit = form.watch("imzStck_unit");
  const pcsPerBox = form.watch("pcsPerBox");

  // Reset fields when unit changes
  useEffect(() => {
    if (currentUnit === "boxes") {
      form.setValue("pcsCount", 0, { shouldValidate: true });
    } else if (currentUnit === "pcs") {
      form.setValue("boxCount", 0, { shouldValidate: true });
    }
  }, [currentUnit, form]);

  // Calculate boxes when pieces are entered and pcsPerBox exists
  useEffect(() => {
    if (currentUnit === "pcs" && pcsPerBox && pcsPerBox > 0) {
      const pcsCount = form.getValues("pcsCount") || 0;
      const fullBoxes = Math.floor(pcsCount / pcsPerBox);
      if (fullBoxes > 0) {
        form.setValue("boxCount", fullBoxes, { shouldValidate: true });
      }
    }
  }, [form.watch("pcsCount"), pcsPerBox, currentUnit]);

  const onSubmit = (data: ImmunizationStockType) => {
    setFormData(data);
    setIsConfirmationOpen(true);
  };

  // In your React component, first get the mutation hook
  const { mutateAsync: submit, isPending } = useSubmitUpdateImmunizationStock();

  const handleConfirm = async () => {
    if (!formData || !supply) return;
    setIsConfirmationOpen(false);

    try {
      await submit({ supply, formData, originalUnit: supply.imzStck_unit });
      navigate("/mainInventoryStocks");
      toast.success("Medicine stock updated successfully!", {
        icon: <CircleCheck size={20} className="text-green-500" />,
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Error updating medicine stock:", error);
      toast.error(error.message || "Failed to update medicine stock", {
        duration: 5000,
      });
    }
  };

  return (
    <>
      <div className="w-full flex items-center justify-center p-4 sm:p-4">
        <Form {...form}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="bg-white p-5 w-full max-w-[500px] rounded-sm space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mt-3">
              {/* Batch Number */}
              <div className="text-base font-medium text-gray-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-2">
                  Batch Number:
                </span>
                {supply.batchNumber}
              </div>

              {/* Name */}
              <div className="text-base font-medium text-gray-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-2">
                  Name:
                </span>
                {supply.item.antigen}
              </div>

              {/* Available Qty */}
              <div className="text-base font-medium text-gray-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-2">
                  Available Qty:
                </span>
                {supply.imzStck_unit === "pcs"
                  ? `${supply.availableStock} pc/s`
                  : `${Math.floor(
                      supply.availableStock / supply.imzStck_pcs
                    )} boxes / ${supply.availableStock}
                        pc/s`}
              </div>

              {/* Expiry Date */}
              <div className="text-base font-medium text-gray-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-2">
                  Expiry Date:
                </span>
                {new Date(supply.expiryDate).toLocaleDateString()}
              </div>
            </div>

            <Label className="flex justify-center text-xl text-darkBlue2 text-center  sm:py-5">
              <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Add Stocks
            </Label>
            

            {currentUnit === "boxes" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    control={form.control}
                    name="boxCount"
                    label="Number of Boxes"
                    type="number"
                    placeholder="Number of Boxes"
                  />
                  <FormInput
                    control={form.control}
                    name="pcsPerBox"
                    label="Pieces per Box"
                    type="number"
                    placeholder="Pieces per Box"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Total Pieces
                  </label>
                  {originalUnit !== "pcs" && (
                    <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {(form.watch("boxCount") || 0) *
                        (form.watch("pcsPerBox") || 0)}{" "}
                      pcs
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <FormInput
                  control={form.control}
                  name="pcsCount"
                  label="Total Pieces"
                  type="number"
                  placeholder="Total Pieces"
                />

               
              </>
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
      </div>

      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={handleConfirm}
        title="Update Immunization Stock"
        description={`Are you sure you want to update this immunization stock?`}
      />
    </>
  );
}

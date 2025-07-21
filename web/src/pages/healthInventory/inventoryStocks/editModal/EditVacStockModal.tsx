import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  VaccineStockType,
  VaccineStocksSchema,
} from "@/form-schema/inventory/stocks/EditAntigenSchema";
import { useEffect, useState } from "react"; // Added useState
import { api } from "@/api/api";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal"; // Added import
import { useLocation } from "react-router-dom";
import { StockRecords } from "../tables/type";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useSubmitUpdateVaccineStock } from "../REQUEST/Antigen/queries/VaccinePutQueries";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function EditVaccineStock() {
  const location = useLocation();
  const vaccine = location.state?.initialData as StockRecords;
  const isDiluent = vaccine.item.unit === "container";

  const form = useForm<VaccineStockType>({
    resolver: zodResolver(VaccineStocksSchema),
    defaultValues: {
      qty: undefined,
      dose_ml: isDiluent ? 1 : vaccine.dose_ml || vaccine.item.dosage || 0,
    },
  });

  const { mutateAsync: submit, isPending } = useSubmitUpdateVaccineStock();
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false); // State for confirmation dialog
  const [formData, setFormData] = useState<VaccineStockType | null>(null); // Store form data for submission
  const navigate = useNavigate();
  const qty = form.watch("qty") || 0;
  const dose_ml = form.watch("dose_ml") || 0;
  // useEffect(() => {
  //   const dose_ml = form.watch("dose_ml");
  //   form.reset({
  //     dose_ml: dose_ml || (isDiluent ? 1 : vaccine.item.dosage || 0),
  //   });
  // }, [vaccine, form, isDiluent]);


  const onSubmit = (data: VaccineStockType) => {
    setFormData(data); // Store the form data
    setIsConfirmationOpen(true); // Open confirmation dialog
  };

  const handleConfirm = async () => {
    try {
      submit({ vaccine, formData, isDiluent });
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
      setIsConfirmationOpen(false);
    }
  };

  return (
    <>
      <div className="w-full flex items-center justify-center p-4 sm:p-4">
        <Form {...form}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="bg-white p-5 w-full max-w-[600px] rounded-sm space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 mt-3">
              {/* Batch Number */}
              <div className="text-base font-medium text-gray-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-2">
                  Batch Number:
                </span>
                {vaccine.batchNumber}
              </div>

              {/* Name */}
              <div className="text-base font-medium text-gray-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-2">
                  Name:
                </span>
                {vaccine.item.antigen}
              </div>

              {/* Available Qty */}
              <div className="text-base font-medium text-gray-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-2">
                  Available Qty:
                </span>
                {isDiluent
                  ? `${vaccine.availableStock} container${
                      vaccine.availableStock > 1 ? "s" : ""
                    }`
                  : (() => {
                      const dosesPerVial = vaccine.item.dosage || 1;
                      const totalDoses = vaccine.availableStock;

                      const vialCount = Math.ceil(totalDoses / dosesPerVial);

                      return `${vialCount} vial${
                        vialCount > 1 ? "s" : ""
                      } (${totalDoses} dose${totalDoses > 1 ? "s" : ""})`;
                    })()}
              </div>

              {/* Expiry Date */}
              <div className="text-base font-medium text-gray-900">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mr-2">
                  Expiry Date:
                </span>
                {new Date(vaccine.expiryDate).toLocaleDateString()}
              </div>
            </div>

            <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
              <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Add Vaccine Stocks
            </Label>

            {isDiluent ? (
              <FormInput
                control={form.control}
                name="qty"
                label="Enter Quantity (Containers)"
                type="number"
                placeholder="Enter Number of containers"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  control={form.control}
                  name="qty"
                  label={"Enter Number of Vials"}
                  type="number"
                  placeholder={"Number of vials"}
                />
                {!isDiluent && (
                  <FormInput
                    control={form.control}
                    name="dose_ml"
                    label="Doses per Vial (ml)"
                    type="number"
                    placeholder="Doses per vial"
                    readOnly
                  />
                )}
              </div>
            )}

            {!isDiluent && (
              <div className="space-y-2">
                <label className="text-sm text-darkGray font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Total Doses
                </label>
                <div className="flex items-center h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {qty * dose_ml} doses
                  <span className="ml-2 text-muted-foreground text-xs">
                    ({qty} vials × {dose_ml} ml/vial)
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 bottom-0 bg-white pb-2 pt-8">
              <Button variant="outline" className="w-full ">
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

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={handleConfirm}
        title="Update Vaccine Stock"
        description={`Are you sure you want to update this vaccine stock?`}
      />
    </>
  );
}

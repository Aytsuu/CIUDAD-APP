// Fixed WastedModal with proper async handling
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { useEffect } from "react";
import { isVaccine, isSupply } from "../tables/VaccineStocks";
import { Pill, X } from "lucide-react";
import { useHandleWaste } from "../REQUEST/Antigen/queries/WastedQueries";
import { useHandleMedicineDeduction } from "../REQUEST/Medicine/queries/wasted-queries";
import { useHandleFirstAidDeduction } from "../REQUEST/FirstAid/queries/wasted-queries";
import { useHandleCommodityDeduction } from "../REQUEST/Commodity/queries/wasted-queries";
import { Loader2 } from "lucide-react";
import { FormInput } from "@/components/ui/form/form-input";
import { useAuth } from "@/context/AuthContext";
import { showErrorToast } from "@/components/ui/toast";

const formSchema = z.object({
  wastedDose: z.coerce.number().min(1, "Wasted dose must be at least 1").int("Must be a whole number"),
  staff_id: z.string().optional()
});

interface WastedModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: any;
  mode: "first-aid" | "medicine" | "commodity" | "antigen";
}

export default function WastedModal({ isOpen, onClose, record, mode }: WastedModalProps) {
  const { user } = useAuth();

  // All mutation hooks
  const { handleVaccineWaste, handleSupplyWaste, vaccineWasteMutation, supplyWasteMutation } = useHandleWaste();
  const { mutateAsync: handleMedicineDeduction, isPending: medicineDeductionPending } = useHandleMedicineDeduction();
  const { mutateAsync: handleFirstAidDeduction, isPending: firstAidDeductionPending } = useHandleFirstAidDeduction();
  const { mutateAsync: handleCommodityDeduction, isPending: commodityDeductionPending } = useHandleCommodityDeduction();

  // Correct isPending logic - check which mutation is actually pending based on mode
  const getIsPending = () => {
    if (mode === "antigen") {
      if (isVaccine(record)) {
        return vaccineWasteMutation.isPending;
      } else if (isSupply(record)) {
        return supplyWasteMutation.isPending;
      }
    } else if (mode === "medicine") {
      return medicineDeductionPending;
    } else if (mode === "first-aid") {
      return firstAidDeductionPending;
    } else if (mode === "commodity") {
      return commodityDeductionPending;
    }

    return false;
  };

  const isPending = getIsPending();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wastedDose: undefined,
      staff_id: user?.staff?.staff_id || undefined
    }
  });

  const wastedDose = form.watch("wastedDose");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        wastedDose: 1,
        staff_id: user?.staff?.staff_id || undefined
      });
    }
  }, [isOpen, form, user?.staff?.staff_id]);

  useEffect(() => {
    if (wastedDose > record?.availableStock) {
      form.setError("wastedDose", {
        type: "manual",
        message: "Wasted dose cannot exceed available stock"
      });
    } else {
      form.clearErrors("wastedDose");
    }
  }, [wastedDose, record?.availableStock, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!data || !record) {
      showErrorToast("Missing form data or record");
      return;
    }

    const wasteData = {
      wastedAmount: data.wastedDose,
      staff_id: data.staff_id
    };

    try {
      if (mode === "antigen") {
        if (isVaccine(record)) {
          await handleVaccineWaste({ record, data: wasteData });
        } else if (isSupply(record)) {
          await handleSupplyWaste({ record, data: wasteData });
        }
      } else if (mode === "medicine") {
        await handleMedicineDeduction({ record, data: wasteData });
      } else if (mode === "first-aid") {
        await handleFirstAidDeduction({ record, data: wasteData });
      } else if (mode === "commodity") {
        await handleCommodityDeduction({ record, data: wasteData });
      }
      onClose(); // Only close after successful submission
    } catch (error) {
      console.error("Error submitting waste:", error);
    }
  };

  const getFormLabel = () => {
    if (isVaccine(record)) {
      return "Wasted (enter doses)";
    }
    return "Wasted (enter pcs)";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={isPending ? undefined : onClose} />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-[500px] mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <Pill className="h-5 w-5 mr-2 text-darkBlue2" />
            <h2 className="text-xl font-semibold text-darkBlue2">Record Wasted Stock</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0" disabled={isPending}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="text-center mb-4">
                <span className="italic text-yellow-600">Note: Current available stock is {record?.availableStock || 0}</span>
              </div>

              <FormInput control={form.control} name="wastedDose" label={getFormLabel()} placeholder={`Enter ${getFormLabel().replace("Wasted (", "").replace(")", "")}`} type="number" />

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" className="flex-1" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending || wastedDose > (record?.availableStock || 0)}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

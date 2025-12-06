// Fixed WastedModal with proper async handling
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { useEffect } from "react";
import { isVaccine, isSupply } from "../tables/type";
import { Pill, X } from "lucide-react";
import { useHandleWaste } from "../REQUEST/Antigen/queries/WastedQueries";
import { useHandleMedicineDeduction } from "../REQUEST/Medicine/queries/wasted-queries";
import { useHandleFirstAidDeduction } from "../REQUEST/FirstAid/queries/wasted-queries";
import { useHandleCommodityDeduction } from "../REQUEST/Commodity/queries/wasted-queries";
import { Loader2 } from "lucide-react";
import { FormInput } from "@/components/ui/form/form-input";
import { useAuth } from "@/context/AuthContext";
import { showErrorToast } from "@/components/ui/toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form/form";

const formSchema = z.object({
  wastedDose: z.coerce.number().min(1, "Quantity must be at least 1").int("Must be a whole number"),
  staff_id: z.string().optional(),
  action_type: z.enum(["deducted", "wasted", "administered"], {
    required_error: "Please select an action type",
  })
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

  // Determine if we should show action type (only for supply waste)
  const showActionType = mode === "antigen" && isSupply(record);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wastedDose: 1,
      staff_id: user?.staff?.staff_id || undefined,
      action_type: showActionType ? "deducted" : "wasted" // Default based on context
    }
  });

  const wastedDose = form.watch("wastedDose");
  const actionType = form.watch("action_type");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        wastedDose: 1,
        staff_id: user?.staff?.staff_id || undefined,
        action_type: showActionType ? "deducted" : "wasted"
      });
    }
  }, [isOpen, form, user?.staff?.staff_id, showActionType]);

  useEffect(() => {
    if (wastedDose > record?.availableStock) {
      form.setError("wastedDose", {
        type: "manual",
        message: "Quantity cannot exceed available stock"
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
      staff_id: data.staff_id,
      action_type: showActionType ? data.action_type : "wasted" // Always send "wasted" for non-supply
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
      if (process.env.NODE_ENV === 'development') {
        console.error("Error submitting:", error);
      }
    }
  };

  const getFormLabel = () => {
    if (isVaccine(record)) {
      return "Wasted (enter doses)";
    }
    
    if (showActionType) {
      switch (actionType) {
        case "deducted":
          return "Deducted (enter pcs)";
        case "administered":
          return "Administered (enter pcs)";
        case "wasted":
          return "Wasted (enter pcs)";
        default:
          return "Quantity (enter pcs)";
      }
    }
    
    return "Wasted (enter pcs)";
  };

  const getModalTitle = () => {
    if (showActionType) {
      switch (actionType) {
        case "deducted":
          return "Record Deducted Stock";
        case "administered":
          return "Record Administered Stock";
        case "wasted":
          return "Record Wasted Stock";
        default:
          return "Record Stock Adjustment";
      }
    }
    return "Record Wasted Stock";
  };

  const getButtonText = () => {
    if (showActionType) {
      switch (actionType) {
        case "deducted":
          return "Confirm Deducted";
        case "administered":
          return "Confirm Administered";
        case "wasted":
          return "Confirm Wasted";
        default:
          return "Confirm";
      }
    }
    return "Confirm Wasted";
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
            <h2 className="text-xl font-semibold text-darkBlue2">{getModalTitle()}</h2>
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

              {/* Action Type Radio Group - Only show for supply waste */}
              {showActionType && (
                <FormField
                  control={form.control}
                  name="action_type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-medium">Action Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="deducted" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Deducted - For items used 
                            </FormLabel>
                          </FormItem>
                         
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="wasted" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Wasted - For items discarded or expired
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <FormInput 
                control={form.control} 
                name="wastedDose" 
                label={getFormLabel()} 
                placeholder={`Enter ${getFormLabel().replace(" (enter doses)", "").replace(" (enter pcs)", "").toLowerCase()}`} 
                type="number" 
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" className="flex-1" onClick={onClose} disabled={isPending}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isPending || wastedDose > (record?.availableStock || 0)}
                  variant={!showActionType || actionType === "wasted" ? "destructive" : "default"}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    getButtonText()
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
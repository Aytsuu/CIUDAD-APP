import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { useState } from "react";
import { isVaccine, isSupply } from "../tables/VaccineStocks";
import { useLocation } from "react-router";
import { Pill } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useHandleWaste } from "../REQUEST/Antigen/queries/WastedQueries";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Loader2, CircleCheck } from "lucide-react";
import { FormInput } from "@/components/ui/form/form-input";
import { useAuth } from "@/context/AuthContext";
import { showErrorToast,showSuccessToast } from "@/components/ui/toast";

const formSchema = z.object({
  wastedDose: z.coerce
    .number()
    .min(1, "Wasted dose must be at least 1")
    .int("Must be a whole number"),
  staff_id: z.string().optional(),
});

export default function WastedAntigen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { record } = location.state || {};
  const { handleVaccineWaste, handleSupplyWaste } = useHandleWaste();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wastedDose: undefined,
      staff_id: user?.staff?.staff_id || undefined,
    },
  });

  const handleConfirm = () => {
    setIsConfirmationOpen(true);
  };


  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!data || !record) {
      toast.error("Missing form data or record");
      return;
    }


    try {
      setIsSubmitting(true);
      
    

      if (isVaccine(record)) {
        await handleVaccineWaste(record, { ...data, wastedAmount: data.wastedDose });
      } else if (isSupply(record)) {
        await handleSupplyWaste(record, { ...data, wastedAmount: data.wastedDose });
      }data
      
      setIsConfirmationOpen(false);

     showSuccessToast("Wasted dose recorded successfully")
    } catch (error: any) {
      console.error("Submission error:", error);
      showErrorToast(error.message || "Failed to record wasted dose");
    } finally {
      setIsSubmitting(false);
      setIsConfirmationOpen(false);
    }
  };

  const getFormLabel = () => {
    if (isVaccine(record)) {
      return "Wasted (enter doses)";
    }
    return "Wasted (enter pcs)";
  };

  const getConfirmationMessage = (amount: number) => {
    if (isVaccine(record)) {
      const unit = record.solvent === "diluent" ? "containers" : "doses";
      return `Record ${amount} ${unit} as wasted?`;
    }
    
    if (record.imzStck_unit === "boxes") {
      const pcsPerBox = record.imzStck_per_pcs || 1;
      return `Record ${amount} boxes (${amount * pcsPerBox} pcs) as wasted?`;
    }
    
    return `Record ${amount} pcs as wasted?`;
  };

  if (!record) {
    navigate(-1);
    return null;
  }

  return (
    <div className="w-full flex items-center justify-center p-4 sm:p-4">
      <Form {...form}>
        <form className="bg-white p-5 w-full max-w-[500px] rounded-sm space-y-5">
          <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
            <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Record Wasted Stock
          </Label>
          
          <FormInput
            control={form.control}
            name="wastedDose"
            label={getFormLabel()}
            placeholder={`Enter ${getFormLabel().replace("Wasted (", "").replace(")", "")}`}
            type="number"
          />

          <div className="flex justify-end gap-3 pt-8">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="button"
              className="w-full"
              disabled={isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isSubmitting ? (
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
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={handleConfirm}
        title="Confirm Wasted Dose"
        description= {getConfirmationMessage(form.getValues("wastedDose"))}
        
      />
    </div>
  );
}
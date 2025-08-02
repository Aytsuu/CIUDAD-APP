import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
} from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { useState } from "react";
import { isVaccine, isSupply } from "../tables/VaccineStocks";
import { useLocation } from "react-router";
import { Pill } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useHandleWaste } from "../REQUEST/Antigen/queries/WastedQueries"; // Import the custom hook
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Loader2, CircleCheck } from "lucide-react";
import { FormInput } from "@/components/ui/form/form-input";
const formSchema = z.object({
  wastedDose: z.coerce
    .number()
    .min(1, "Wasted dose must be at least 1")
    .int("Must be a whole number"),
});

export default function WastedAntigen() {
  const location = useLocation();
  const { wasted, record } = location.state;
  const { handleVaccineWaste, handleSupplyWaste } = useHandleWaste(); // Use the custom hook
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [formData, setFormData] = useState<z.infer<typeof formSchema> | null>(
    null
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      wastedDose: 0,
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setFormData(data);
    setIsConfirmationOpen(true);
  };

  const handleConfirm = async () => {
    if (!formData) return;

    try {
      setIsSubmitting(true);
      setIsConfirmationOpen(false);
      if (isVaccine(record)) {
        await handleVaccineWaste(record, formData.wastedDose);
      } else if (isSupply(record)) {
        await handleSupplyWaste(record, formData.wastedDose);
      }
      navigate(-1);
      toast.success("Added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Error recording wasted dose:", error);
      toast.error(error.message || "Failed to Add"); // Display the actual error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormLabel = () => {
    if (isVaccine(record)) {
      return "Wasted (enter doses)";
    } else {
      return `Wasted (enter pcs)`;
    }
  };

  const getConfirmationMessage = (amount: number) => {
    if (isVaccine(record)) {
      const unit = record.solvent === "diluent" ? "containers" : "doses";
      return `Are you sure you want to record ${amount} ${unit}?`;
    } else {
      if (record.imzStck_unit === "boxes") {
        const pcsPerBox = record.imzStck_per_pcs || 1;
        return `Are you sure you want to record ${amount} boxes (${
          amount * pcsPerBox
        } pcs)?`;
      }
      return `Are you sure you want to record ${amount} pcs?`;
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
            <Label className="flex justify-center text-xl text-darkBlue2 text-center py-3 sm:py-5">
              <Pill className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Add First Aid Stocks
            </Label>
            <FormInput
              control={form.control}
              name="wastedDose"
              label={getFormLabel()}
              placeholder={getFormLabel()
                .replace("Wasted (", "Enter ")
                .replace(")", "")}
              type="number"
            />
            <div className="flex justify-end gap-3 bottom-0 bg-white pb-2 pt-8">
              <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
                Cancel
              </Button>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                onClick={form.handleSubmit(onSubmit)}
              >
                {isSubmitting ? (
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
        title="Confirm Wasted Dose"
        description={
          formData ? getConfirmationMessage(formData.wastedDose) : ""
        }
      />
    </>
  );
}

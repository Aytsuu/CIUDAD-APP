import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import GADAddEntrySchema from "@/form-schema/gad-budget-track-create-form-schema";
import { postdonationreq } from "./requestAPI/BTPostRequest";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

interface GADAddEntryFormProps {
  onSuccess?: () => void; // Add this prop type
}

function GADAddEntryForm({onSuccess}:GADAddEntryFormProps) {
  const form = useForm<z.infer<typeof GADAddEntrySchema>>({
    resolver: zodResolver(GADAddEntrySchema),
    defaultValues: {
      gbud_type: "",
      gbud_add_notes: "",
      gbud_amount: 0,
      gbud_particulars: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof GADAddEntrySchema>) => {
    const toastId = toast.loading('Submitting entry...', {
      duration: Infinity  
    });
    try {
      await postdonationreq(values);
      toast.success('Budget entry recorded successfully', {
        id: toastId, 
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
        onAutoClose: () => {
          window.location.reload();
        }
    });
    if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error submitting GAD budget entry", err);
      toast.error(
        "Failed to submit enrty. Please try again.",
        {
            id: toastId,
            duration: 2000
        }
    );
  }
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      <div className="pb-2">
        <h2 className="text-lg font-semibold">ADD GAD BUDGET ENTRY</h2>
        <p className="text-xs text-black/50">Fill out all necessary fields</p>
      </div>
      <div className="grid gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Entry Type */}
            <FormSelect
              control={form.control}
              name="gbud_type"
              label="Type of Entry"
              options={[
                { id: "Income", name: "Income" },
                { id: "Expense", name: "Expense" },
              ]}
              readOnly={false}
            />

            {/* Amount */}
            <FormInput
              control={form.control}
              name="gbud_amount"
              label="Amount"
              placeholder="Enter amount"
              readOnly={false}
            />

            {/* Particulars */}
            <FormInput
              control={form.control}
              name="gbud_particulars"
              label="Particulars"
              placeholder="Enter particulars"
              readOnly={false}
            />

            {/* Additional Notes */}
            <FormInput
              control={form.control}
              name="gbud_add_notes"
              label="Additional Notes"
              placeholder="Enter additional notes (if there is any)"
              readOnly={false}
            />

            {/* Submit Button */}
            <div className="mt-8 flex justify-end gap-3">
              <Button
                type="submit"
                className="bg-blue hover:bg-blue hover:opacity-[95%]"
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default GADAddEntryForm;
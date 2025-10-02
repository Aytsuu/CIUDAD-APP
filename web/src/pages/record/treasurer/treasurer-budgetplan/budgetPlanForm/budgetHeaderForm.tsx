import { Form } from "@/components/ui/form/form";
import { BudgetPlanStep1Schema } from "@/form-schema/treasurer/budgetplan-schema";
import { z } from "zod";
import { FormInput } from "@/components/ui/form/form-input";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import { ChevronRightIcon } from "lucide-react";

interface BudgetHeaderFormProps {
  form: UseFormReturn<z.infer<typeof BudgetPlanStep1Schema>>;
  onSubmit: () => void;
  onBack?: () => void;
}

function BudgetHeaderForm({ form, onSubmit, onBack }: BudgetHeaderFormProps) {
  const handleSubmit = (_values: z.infer<typeof BudgetPlanStep1Schema>) => {
    onSubmit();
  };

  return (
    <div className="flex items-center justify-center">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          // widened from max-w-md to max-w-2xl
          className="w-full max-w-2xl bg-white p-6 rounded-md shadow-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormInput
                control={form.control}
                name="balance"
                label="Balance From Previous Year"
                type="number"
                placeholder="0.00"
              />
              <FormInput
                control={form.control}
                name="realtyTaxShare"
                label="Realty Tax Share"
                type="number"
                placeholder="0.00"
              />
              <FormInput
                control={form.control}
                name="taxAllotment"
                label="National Tax Allotment"
                type="number"
                placeholder="0.00"
              />
              <FormInput
                control={form.control}
                name="clearanceAndCertFees"
                label="Clearance & Certification Fees"
                type="number"
                placeholder="0.00"
              />
              <FormInput
                control={form.control}
                name="otherSpecificIncome"
                label="Other Specific Income"
                type="number"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-4">
              <FormInput
                control={form.control}
                name="actualIncome"
                label="Actual Income"
                type="number"
                placeholder="0.00"
              />
              <FormInput
                control={form.control}
                name="actualRPT"
                label="Actual RPT Income"
                type="number"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
              >
                Back
              </Button>
            )}
            <Button 
             className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
             type="submit">
                Next
                <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default BudgetHeaderForm;

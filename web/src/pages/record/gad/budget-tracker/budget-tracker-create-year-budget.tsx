import { Button } from "@/components/ui/button/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import GADAddBudgetYearSchema from "@/form-schema/gad-budget-tracker-year-form-schema";
import { useCreateBudgetYear } from "./queries/BTYearQueries"; // Changed import
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";

interface GADAddBudgetYearFormProps {
  onSuccess?: () => void;
}

function GADAddBudgetYearForm({ onSuccess }: GADAddBudgetYearFormProps) {
  const form = useForm<z.infer<typeof GADAddBudgetYearSchema>>({
    resolver: zodResolver(GADAddBudgetYearSchema),
    defaultValues: {
      year: "",
    },
  });

  // Updated to use the year-specific mutation hook
  const { mutate: createYear, isPending } = useCreateBudgetYear();

  const onSubmit = (values: z.infer<typeof GADAddBudgetYearSchema>) => {
    createYear(values.year, {
      onSuccess: () => {
        toast.success("Budget year created successfully", {
          icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        });
        form.reset();
        if (onSuccess) onSuccess();
      },
      onError: (error) => {
        toast.error("Failed to create budget year", {
          description: error.message,
        });
      }
    });
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      <div className="pb-2">
        <h2 className="text-lg font-semibold">ADD NEW BUDGET YEAR</h2>
        <p className="text-xs text-black/50">Fill out all necessary fields</p>
      </div>
      <div className="grid gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Year Input */}
            <FormInput
              control={form.control}
              name="year"
              label="Year"
              placeholder="Enter the year for the budget"
              readOnly={false}
            />

            {/* Submit Button */}
            <div className="mt-8 flex justify-end gap-3">
              <Button
                type="submit"
                className="bg-blue hover:bg-blue hover:opacity-[95%]"
                disabled={isPending}
              >
                {isPending ? "Creating..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default GADAddBudgetYearForm;
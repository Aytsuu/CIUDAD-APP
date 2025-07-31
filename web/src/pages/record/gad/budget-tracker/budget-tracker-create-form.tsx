import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormField } from "@/components/ui/form/form";
import { FormSelect } from "@/components/ui/form/form-select";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  useGADBudgets,
  useExpenseParticulars,
  useIncomeParticulars,
} from "./queries/BTFetchQueries";
import { useGetGADYearBudgets } from "./queries/BTYearQueries";
import { useCreateGADBudget } from "./queries/BTAddQueries";
import GADAddEntrySchema, {
  FormValues,
} from "@/form-schema/gad-budget-track-create-form-schema";

function GADAddEntryForm({ onSuccess }: { onSuccess?: () => void }) {
  const { year } = useParams<{ year: string }>();
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string>("");

  // Data hooks
  const { data: yearBudgets, isLoading: yearBudgetsLoading, refetch: refetchYearBudgets } = useGetGADYearBudgets();
  const { data: budgetEntries = [] } = useGADBudgets(year || "");
  const { data: expenseItems } = useExpenseParticulars();
  const { data: incomeParticulars, isLoading: incomeParticularsLoading } = useIncomeParticulars(year);
  const { mutate: createBudget, isPending } = useCreateGADBudget(yearBudgets || [], budgetEntries);
  
  // Calculate remaining balance using backend totals
  const calculateRemainingBalance = (): number => {
    if (!yearBudgets || !year) return 0;

    const currentYearBudget = yearBudgets.find((b) => b.gbudy_year === year);
    if (!currentYearBudget) return 0;
    const initialBudget = Number(currentYearBudget.gbudy_budget) || 0;
    const totalExpenses = Number(currentYearBudget.gbudy_expenses) || 0;

    return initialBudget - totalExpenses;
    
  };

  // Form setup with custom validation
  const form = useForm<FormValues>({
    resolver: zodResolver(GADAddEntrySchema),
    defaultValues: {
      gbud_type: "Expense",
      gbud_datetime: new Date().toISOString(),
      gbud_add_notes: null,
      gbud_inc_particulars: null,
      gbud_inc_amt: null,
      gbud_exp_particulars: null,
      gbud_proposed_budget: null,
      gbud_actual_expense: null,
      gbud_reference_num: null,
      gbud_remaining_bal: null,
      gbudy: 0,
      gdb_id: null,
    },
    context: {
      calculateRemainingBalance,
    },
  });

  // Watch form values
  const typeWatch = form.watch("gbud_type");
  const actualExpenseWatch = form.watch("gbud_actual_expense");
  const proposedBudgetWatch = form.watch("gbud_proposed_budget");
  const remainingBalance = calculateRemainingBalance();

  // Set year budget when loaded
  useEffect(() => {
    if (yearBudgets && !yearBudgetsLoading) {
      const currentYearBudget = yearBudgets.find((b) => b.gbudy_year === year);
      if (currentYearBudget) {
        form.setValue("gbudy", currentYearBudget.gbudy_num);
      } else {
        form.setError("gbudy", {
          type: "manual",
          message: "No budget found for the selected year",
        });
      }
    }
  }, [yearBudgets, yearBudgetsLoading, year, form]);

  // Validate budget fields when they change
  useEffect(() => {
    if (typeWatch === "Expense") {
      const actualExpense = form.getValues("gbud_actual_expense");
      const proposedBudget = form.getValues("gbud_proposed_budget");

      if (actualExpense && actualExpense > remainingBalance) {
        form.setError("gbud_actual_expense", {
          type: "manual",
          message: `Actual expense cannot exceed remaining balance of ₱${remainingBalance.toLocaleString()}`,
        });
      } else {
        form.clearErrors("gbud_actual_expense");
      }

      if (proposedBudget && proposedBudget > remainingBalance) {
        form.setError("gbud_proposed_budget", {
          type: "manual",
          message: `Proposed budget cannot exceed remaining balance of ₱${remainingBalance.toLocaleString()}`,
        });
      } else {
        form.clearErrors("gbud_proposed_budget");
      }
    }
  }, [actualExpenseWatch, proposedBudgetWatch, remainingBalance, form, typeWatch]);

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    const inputDate = new Date(values.gbud_datetime);
    const inputYear = inputDate.getFullYear().toString();
    
    if (inputYear !== year) {
      form.setError('gbud_datetime', {
        type: 'manual',
        message: `Date must be in ${year}`
      });
      return;
    }
    // Final validation before submission
    if (values.gbud_type === "Expense") {
      if (values.gbud_actual_expense && values.gbud_actual_expense > remainingBalance) {
        form.setError("gbud_actual_expense", {
          type: "manual",
          message: `Actual expense cannot exceed remaining balance of ₱${remainingBalance.toLocaleString()}`,
        });
        return;
      }

      if (values.gbud_proposed_budget && values.gbud_proposed_budget > remainingBalance) {
        form.setError("gbud_proposed_budget", {
          type: "manual",
          message: `Proposed budget cannot exceed remaining balance of ₱${remainingBalance.toLocaleString()}`,
        });
        return;
      }
    }

  const budgetData = {
      gbud_type: values.gbud_type,
      gbud_datetime: new Date(values.gbud_datetime).toISOString(), // Ensures UTC with 'Z'
      gbud_add_notes: values.gbud_add_notes || null,
      ...(values.gbud_type === "Income" && {
        gbud_inc_particulars: values.gbud_inc_particulars,
        gbud_inc_amt: values.gbud_inc_amt,
      }),
      ...(values.gbud_type === "Expense" && {
        gbud_exp_particulars: values.gbud_exp_particulars,
        gbud_proposed_budget: values.gbud_proposed_budget,
        gbud_actual_expense: values.gbud_actual_expense,
        gbud_reference_num: values.gbud_reference_num,
        gbud_remaining_bal: remainingBalance - (values.gbud_actual_expense || 0),
        gdb_id: values.gdb_id,
      }),
      gbudy: values.gbudy,
    };

    createBudget(
      {
        budgetData,
        files: mediaFiles,
      },
      {
        onSuccess: () => {
          refetchYearBudgets();
          onSuccess?.();
        },
        onError: (error) => {
          console.error("Creation failed:", error.response?.data || error.message);
        },
      }
    );
};

  const currentYearBudget = yearBudgets?.find((b) => b.gbudy_year === year);

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      <div className="grid gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <FormSelect
                  control={form.control}
                  name="gbud_type"
                  label="Type of Entry"
                  options={[
                    { id: "Income", name: "Income" },
                    { id: "Expense", name: "Expense" },
                  ]}
                />
              </div>
              <div>
                <FormInput
                  control={form.control}
                  name="gbud_datetime"
                  label={`Date (${year} only)`}
                  type="datetime-local"
                />
              </div>
              <div>
                {typeWatch === "Income" ? (
                  <FormField
                    control={form.control}
                    name="gbud_inc_particulars"
                    render={({ field }) => (
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Income Particulars</label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openCombobox}
                              className="w-full justify-between"
                            >
                              {field.value || "Select particulars..."}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[400px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search particulars..."
                                onValueChange={(value) => {
                                  if (!incomeParticulars?.includes(value)) {
                                    field.onChange(value);
                                  }
                                }}
                              />
                              <CommandList>
                                <CommandEmpty>No particulars found. Enter new value.</CommandEmpty>
                                <CommandGroup>
                                  {incomeParticularsLoading ? (
                                    <CommandItem disabled>Loading...</CommandItem>
                                  ) : (
                                    incomeParticulars?.map((particular: string) => (
                                      <CommandItem
                                        key={particular}
                                        value={particular}
                                        onSelect={() => {
                                          field.onChange(particular);
                                          setOpenCombobox(false);
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            field.value === particular ? "opacity-100" : "opacity-50"
                                          )}
                                        />
                                        {particular}
                                      </CommandItem>
                                    ))
                                  )}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="gbud_exp_particulars"
                    render={({ field }) => (
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Expense Particulars</label>
                        <select
                          {...field}
                          className="w-full p-2 border rounded"
                          onChange={(e) => {
                            const selectedItem = expenseItems?.find(
                              (item: any) => item.gdb_name === e.target.value
                            );
                            field.onChange(e.target.value);
                            form.setValue("gdb_id", selectedItem?.gdb_id || undefined);
                          }}
                        >
                          <option value="">Select expense item...</option>
                          {expenseItems?.map((item: any) => (
                            <option key={item.gdb_id} value={item.gdb_name}>
                              {item.gdb_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <FormInput
                control={form.control}
                name="gbud_add_notes"
                label="Description"
                placeholder="Enter related information (if any)"
              />
              {typeWatch === "Income" ? (
                <FormInput
                  control={form.control}
                  name="gbud_inc_amt"
                  label="Income Amount"
                  type="number"
                />
              ) : (
                <>
                  <FormInput
                    control={form.control}
                    name="gbud_proposed_budget"
                    label="Proposed Budget"
                    type="number"
                  />
                  <FormInput
                    control={form.control}
                    name="gbud_actual_expense"
                    label="Actual Expense"
                    type="number"
                  />
                  <FormInput
                    control={form.control}
                    name="gbud_reference_num"
                    label="Reference Number"
                    placeholder="Enter reference number"
                  />
                  <MediaUpload
                    title="Supporting Documents"
                    description="Upload proof of transaction"
                    mediaFiles={mediaFiles}
                    setMediaFiles={setMediaFiles}
                    activeVideoId={activeVideoId}
                    setActiveVideoId={setActiveVideoId}
                  />
                  {currentYearBudget && (
                    <div className="p-4 border rounded bg-gray-50">
                      <div className="flex justify-between">
                        <span className="font-medium">Current Budget:</span>
                        <span>₱{currentYearBudget.gbudy_budget?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Total Expenses:</span>
                        <span>₱{(currentYearBudget.gbudy_expenses || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Total Income:</span>
                        <span>₱{(currentYearBudget.gbudy_income || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Remaining Balance:</span>
                        <span>₱{remainingBalance.toLocaleString()}</span>
                      </div>
                      {(actualExpenseWatch || proposedBudgetWatch) && (
                        <>
                          <div className="flex justify-between mt-2">
                            <span className="font-medium">After This Entry:</span>
                            <span
                              className={
                                (actualExpenseWatch || 0) > remainingBalance ? "text-red-500" : ""
                              }
                            >
                              ₱{(remainingBalance - (actualExpenseWatch || 0)).toLocaleString()}
                            </span>
                          </div>
                          {(actualExpenseWatch || 0) > remainingBalance && (
                            <div className="mt-2 text-red-500 font-medium">
                              Warning: This expense will exceed your remaining budget!
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="mt-4 flex justify-end gap-3">
              {/* Error displays */}
            {Object.keys(form.formState.errors).length > 0 && (
              <div className="text-red-500 text-sm">
                Please fix double check your input
                {/* <ul>
                  {Object.entries(form.formState.errors).map(([field, error]) => (
                    <li key={field}>
                      {field}: {error?.message}
                    </li>
                  ))}
                </ul> */}
              </div>
            )}
              <Button
                type="submit"
                className=" hover:bg-blue hover:opacity-[95%]"
                // disabled={!isFormValid || isPending}
                disabled={isPending}
              >
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default GADAddEntryForm;
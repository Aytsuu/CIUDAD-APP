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
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
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
  useGADBudgetEntry,
  useExpenseParticulars,
  useIncomeParticulars,
} from "./queries/BTFetchQueries";
import { useGetGADYearBudgets } from "./queries/BTYearQueries";
import { useUpdateGADBudget } from "./queries/BTUpdateQueries";
import {
  GADEditEntrySchema,
  FormValues,
} from "@/form-schema/gad-budget-tracker-edit-form-schema";

type GADEditEntryFormProps = {
  gbud_num: number;
  onSaveSuccess?: () => void;
};

function GADEditEntryForm({ gbud_num, onSaveSuccess }: GADEditEntryFormProps) {
  const { year } = useParams<{ year: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
  const [removedFiles, setRemovedFiles] = useState<string[]>([]); // Track only user-removed file IDs
  const [openCombobox, setOpenCombobox] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string>("");

  // Data hooks
  const {
    data: yearBudgets,
    isLoading: yearBudgetsLoading,
    refetch: refetchYearBudgets,
  } = useGetGADYearBudgets();
  const { data: budgetEntry, isLoading: entryLoading } =
    useGADBudgetEntry(gbud_num);
  const { data: expenseItems } = useExpenseParticulars();
  const { data: incomeParticulars, isLoading: incomeParticularsLoading } =
    useIncomeParticulars(year);
  const { mutate: updateBudget, isPending } = useUpdateGADBudget(
    yearBudgets || []
  );

  // Debug logs
  useEffect(() => {
    if (budgetEntry) {
      console.log("Budget Entry Data:", budgetEntry);
      console.log("Files:", budgetEntry.files);
      console.log("Income Particulars:", budgetEntry.gbud_inc_particulars);
      console.log("Income Amount:", budgetEntry.gbud_inc_amt);
      console.log("Type:", budgetEntry.gbud_type);
    }
  }, [budgetEntry]);

  // Calculate remaining balance
  const calculateRemainingBalance = (): number => {
    if (!yearBudgets || !year) return 0;

    const currentYearBudget = yearBudgets.find((b) => b.gbudy_year === year);
    if (!currentYearBudget) return 0;

    const initialBudget = Number(currentYearBudget.gbudy_budget) || 0;
    const totalExpenses = Number(currentYearBudget.gbudy_expenses) || 0;
    const currentExpense =
      budgetEntry?.gbud_type === "Expense"
        ? Number(budgetEntry.gbud_amount) || 0
        : 0;

    return initialBudget - (totalExpenses - currentExpense);
  };

  const remainingBalance = calculateRemainingBalance();

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(GADEditEntrySchema),
    defaultValues: {
      gbud_type: "Expense",
      gbud_datetime: new Date().toISOString().slice(0, 16),
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
    context: { calculateRemainingBalance },
  });

  // Watch form values
  const typeWatch = form.watch("gbud_type");

  // Debug typeWatch and form state
  useEffect(() => {
    console.log("typeWatch:", typeWatch);
    console.log("Form gbud_type:", form.getValues("gbud_type"));
  }, [typeWatch, form]);

  // Sync gbud_type
  useEffect(() => {
    if (budgetEntry?.gbud_type) {
      console.log("Syncing gbud_type:", budgetEntry.gbud_type);
      form.setValue("gbud_type", budgetEntry.gbud_type as "Income" | "Expense");
    }
  }, [budgetEntry, form]);

  // Populate form
  useEffect(() => {
    if (budgetEntry && yearBudgets) {
      const formattedDate = budgetEntry.gbud_datetime
        ? new Date(budgetEntry.gbud_datetime).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16);

      const formValues: FormValues = {
        gbud_type: (budgetEntry.gbud_type as "Income" | "Expense") || "Expense",
        gbud_datetime: formattedDate,
        gbud_add_notes: budgetEntry.gbud_add_notes || null,
        gbud_inc_particulars: budgetEntry.gbud_inc_particulars || null,
        gbud_inc_amt: budgetEntry.gbud_inc_amt
          ? Number(budgetEntry.gbud_inc_amt)
          : null,
        gbud_exp_particulars: budgetEntry.gbud_exp_particulars || null,
        gbud_proposed_budget: budgetEntry.gbud_proposed_budget
          ? Number(budgetEntry.gbud_proposed_budget)
          : null,
        gbud_actual_expense: budgetEntry.gbud_actual_expense
          ? Number(budgetEntry.gbud_actual_expense)
          : null,
        gbud_reference_num: budgetEntry.gbud_reference_num || null,
        gbud_remaining_bal: budgetEntry.gbud_remaining_bal
          ? Number(budgetEntry.gbud_remaining_bal)
          : null,
        gbudy: yearBudgets.find((b) => b.gbudy_year === year)?.gbudy_num || 0,
        gdb_id: budgetEntry.gdb?.gdb_id || null,
      };

      console.log("Form Values:", formValues);
      form.reset(formValues);

      if (budgetEntry.files?.length) {
        const files = budgetEntry.files.map((file) => {
          const dummyFile = new File([], file.gbf_name, {
            type: file.gbf_type || "image/jpeg",
            lastModified: Date.now(),
          });

          return {
            id: `receipt-${file.gbf_id}`,
            type: "image" as const,
            file: dummyFile,
            publicUrl: file.gbf_url,
            storagePath: file.gbf_path,
            status: "uploaded" as const,
            previewUrl: file.gbf_url,
          };
        });
        setMediaFiles(files);
        setRemovedFiles([]); // Clear removed files on initial load
        console.log("Set Media Files:", files);
      } else {
        setMediaFiles([]);
        setRemovedFiles([]); // Clear removed files if no initial files
        console.log("No Files Found");
      }
    }
  }, [budgetEntry, yearBudgets, year, form]);

  // Set year budget
  useEffect(() => {
    if (yearBudgets && !yearBudgetsLoading && year) {
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

  // Validate budget fields
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
  }, [form, remainingBalance, typeWatch]);

  const handleConfirmSave = (values: FormValues) => {
    setApiError(null);

    const inputDate = new Date(values.gbud_datetime);
    const inputYear = inputDate.getFullYear().toString();

    if (inputYear !== year) {
      form.setError("gbud_datetime", {
        type: "manual",
        message: `Date must be in ${year}`,
      });
      return;
    }

    if (values.gbud_type === "Expense") {
      const actualExpense = values.gbud_actual_expense ?? 0;
      const proposedBudget = values.gbud_proposed_budget ?? 0;

      if (actualExpense > remainingBalance) {
        form.setError("gbud_actual_expense", {
          type: "manual",
          message: `Actual expense cannot exceed remaining balance of ₱${remainingBalance.toLocaleString()}`,
        });
        return;
      }
      if (proposedBudget > remainingBalance) {
        form.setError("gbud_proposed_budget", {
          type: "manual",
          message: `Proposed budget cannot exceed remaining balance of ₱${remainingBalance.toLocaleString()}`,
        });
        return;
      }
    }

    const budgetData = {
      gbud_type: values.gbud_type,
      gbud_datetime: new Date(values.gbud_datetime).toISOString(),
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
        gdb_id: values.gdb_id,
      }),
      gbudy: values.gbudy,
    };

    const filesToDelete = removedFiles
      .filter((id) => id.startsWith("receipt-")) // Only include receipt- IDs
      .map((id) => id.replace("receipt-", "")); // Strip prefix to get numeric gbf_id

    console.log("Update Payload:", {
      gbud_num,
      budgetData,
      files: mediaFiles,
      filesToDelete: removedFiles,
    });

    updateBudget(
      {
        gbud_num,
        budgetData,
        files: mediaFiles,
        filesToDelete, // Use only explicitly removed files
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setRemovedFiles([]); // Clear removed files after successful save
          refetchYearBudgets();
          if (onSaveSuccess) onSaveSuccess();
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.detail ||
            error.message ||
            "Failed to update entry";
          setApiError(errorMessage);
          console.error("Full Error:", error.response?.data);
        },
      }
    );
  };

  if (entryLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!budgetEntry) {
    return <div className="text-center py-8">No budget entry found.</div>;
  }

  const currentYearBudget = yearBudgets?.find((b) => b.gbudy_year === year);

  return (
    <div className="flex flex-col min-h-0 p-4 rounded-lg overflow-auto">
      <div className="grid gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleConfirmSave)}
            className="flex flex-col gap-4"
          >
            {Object.entries(form.formState.errors).length > 0 && (
              <div className="text-red-500 text-sm">
                Please fix double check your input
              </div>
            )}
            {apiError && (
              <div className="text-red-600 text-sm">Error: {apiError}</div>
            )}

            <FormSelect
              control={form.control}
              name="gbud_type"
              label="Type"
              options={[
                { id: "Income", name: "Income" },
                { id: "Expense", name: "Expense" },
              ]}
              readOnly={true}
            />
            <FormInput
              control={form.control}
              name="gbud_datetime"
              label={`Date (${year} only)`}
              type="datetime-local"
              placeholder="Select date"
              readOnly={!isEditing}
            />
            <FormInput
              control={form.control}
              name="gbud_add_notes"
              label="Description"
              placeholder="Enter notes (if any)"
              readOnly={!isEditing}
            />
            {budgetEntry.gbud_type === "Income" ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Income Particulars
                  </label>
                  {!isEditing ? (
                    <div className="p-2 border rounded">
                      {budgetEntry.gbud_inc_particulars || "N/A"}
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="gbud_inc_particulars"
                      render={({ field }) => (
                        <Popover
                          open={openCombobox}
                          onOpenChange={setOpenCombobox}
                        >
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
                                <CommandEmpty>
                                  No particulars found.
                                </CommandEmpty>
                                <CommandGroup>
                                  {incomeParticularsLoading ? (
                                    <CommandItem disabled>
                                      Loading...
                                    </CommandItem>
                                  ) : (
                                    incomeParticulars?.map((particular) => (
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
                                            field.value === particular
                                              ? "opacity-100"
                                              : "opacity-0"
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
                      )}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Income Amount</label>
                  {!isEditing ? (
                    <div className="p-2 border rounded">
                      {budgetEntry.gbud_inc_amt
                        ? `₱${Number(
                            budgetEntry.gbud_inc_amt
                          ).toLocaleString()}`
                        : "N/A"}
                    </div>
                  ) : (
                    <FormInput
                      control={form.control}
                      name="gbud_inc_amt"
                      type="number"
                      placeholder="Enter amount"
                      label=""
                    />
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    Expense Particulars
                  </label>
                  <div className="text-[0.9rem] indent-1">
                    <FormField
                      control={form.control}
                      name="gbud_exp_particulars"
                      render={({ field }) => (
                        <>
                          {isEditing ? (
                            <select
                              {...field}
                              className="w-full p-2 border rounded"
                              value={field.value || ""}
                              onChange={(e) => {
                                const selectedItem = expenseItems?.find(
                                  (item) => item.gdb_name === e.target.value
                                );
                                field.onChange(e.target.value);
                                form.setValue(
                                  "gdb_id",
                                  selectedItem?.gdb_id || null
                                );
                              }}
                            >
                              <option value="">Select expense item...</option>
                              {expenseItems?.map((item) => (
                                <option key={item.gdb_id} value={item.gdb_name}>
                                  {item.gdb_name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="p-2 border rounded">
                              {field.value || "N/A"}
                            </div>
                          )}
                        </>
                      )}
                    />
                  </div>
                </div>
                <FormInput
                  control={form.control}
                  name="gbud_proposed_budget"
                  label="Proposed Budget"
                  type="number"
                  placeholder="Enter proposed budget"
                  readOnly={!isEditing}
                />
                <FormInput
                  control={form.control}
                  name="gbud_actual_expense"
                  label="Actual Expense"
                  type="number"
                  placeholder="Enter actual expense"
                  readOnly={!isEditing}
                />
                <FormInput
                  control={form.control}
                  name="gbud_reference_num"
                  label="Reference Number"
                  placeholder="Enter reference number"
                  readOnly={!isEditing}
                />
                {isEditing ? (
                  <MediaUpload
                    title="Supporting Documents"
                    description="Upload proof of transaction. Note: Removed files are deleted immediately and cannot be undone unless you cancel editing."
                    mediaFiles={mediaFiles}
                    setMediaFiles={setMediaFiles}
                    activeVideoId={activeVideoId}
                    setActiveVideoId={setActiveVideoId}
                    onFileRemoved={(removedId) => {
                      setRemovedFiles((prev) => {
                        if (prev.includes(removedId)) {
                          console.log(
                            `File ID ${removedId} already marked for removal`
                          );
                          return prev;
                        }
                        return [...prev, removedId];
                      });
                    }}
                  />
                ) : mediaFiles.length > 0 ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Supporting Doc(s)
                    </label>
                    {mediaFiles.map((file) => (
                      <div key={file.id} className="border rounded-md p-2">
                        <img
                          src={file.publicUrl}
                          alt="Receipt"
                          className="max-h-60 object-contain w-full"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 border rounded text-sm text-gray-500">
                    No supporting docs uploaded
                  </div>
                )}
                {currentYearBudget && (
                  <div className="p-4 border rounded bg-gray-50">
                    <div className="flex justify-between">
                      <span className="font-medium">Current Budget:</span>
                      <span>
                        ₱
                        {(currentYearBudget.gbudy_budget || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Expenses:</span>
                      <span>
                        ₱
                        {(
                          currentYearBudget.gbudy_expenses || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Income:</span>
                      <span>
                        ₱
                        {(currentYearBudget.gbudy_income || 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Remaining Balance:</span>
                      <span>₱{remainingBalance.toLocaleString()}</span>
                    </div>
                    {(form.watch("gbud_actual_expense") ||
                      form.watch("gbud_proposed_budget")) && (
                      <>
                        <div className="flex justify-between mt-2">
                          <span className="font-medium">After This Entry:</span>
                          <span
                            className={
                              form.watch("gbud_actual_expense") &&
                              form.watch("gbud_actual_expense") >
                                remainingBalance
                                ? "text-red-500"
                                : ""
                            }
                          >
                            ₱
                            {(
                              remainingBalance -
                              (form.watch("gbud_actual_expense") || 0)
                            ).toLocaleString()}
                          </span>
                        </div>
                        {form.watch("gbud_actual_expense") &&
                          form.watch("gbud_actual_expense")>
                            remainingBalance && (
                            <div className="mt-2 text-red-500 font-medium">
                              Warning: This expense will exceed your remaining
                              budget!
                            </div>
                          )}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
            <div className="mt-4 flex justify-end gap-3">
              {isEditing ? (
                <>
                  <Button
                    type="button"
                    onClick={() => {
                      form.reset();
                      setIsEditing(false);
                      setRemovedFiles([]); // Clear removed files on cancel
                      if (budgetEntry?.files?.length) {
                        const files = budgetEntry.files.map((file) => ({
                          id: `receipt-${file.gbf_id}`,
                          type: "image" as const,
                          file: new File([], file.gbf_name, {
                            type: file.gbf_type || "image/jpeg",
                          }),
                          publicUrl: file.gbf_url,
                          storagePath: file.gbf_path,
                          status: "uploaded" as const,
                          previewUrl: file.gbf_url,
                        }));
                        setMediaFiles(files);
                      } else {
                        setMediaFiles([]);
                      }
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <ConfirmationModal
                    trigger={
                      <Button
                        type="button"
                        disabled={
                          isPending ||
                          Object.entries(form.formState.errors).length > 0
                        }
                      >
                        {isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    }
                    title="Confirm Save"
                    description="Are you sure you want to save the changes to this budget entry?"
                    actionLabel="Confirm"
                    onClick={() => form.handleSubmit(handleConfirmSave)()}
                  />
                </>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default GADEditEntryForm;

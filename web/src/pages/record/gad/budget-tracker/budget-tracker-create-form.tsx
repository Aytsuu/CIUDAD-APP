import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { FormField } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import {
  useGADBudgets,
  useProjectProposalsAvailability,
} from "./queries/BTFetchQueries";
import { useGetGADYearBudgets } from "./queries/BTYearQueries";
import { useCreateGADBudget } from "./queries/BTAddQueries";
import GADAddEntrySchema, {
  FormValues,
} from "@/form-schema/gad-budget-track-create-form-schema";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ComboboxInput } from "@/components/ui/form/form-combobox-input";
import { removeLeadingZeros } from "@/helpers/removeLeadingZeros";
import { DateTimePicker } from "@/components/ui/form/form-datetime-picker";
import { useAuth } from "@/context/AuthContext";

function GADAddEntryForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user } = useAuth();
  const { year } = useParams<{ year: string }>();
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
  const [selectedBudgetItems, setSelectedBudgetItems] = useState<
    { name: string; pax: string; amount: number }[]
  >([]);
  const [recordedBudgetItems, setRecordedBudgetItems] = useState<
    { name: string; pax: string; amount: number }[]
  >([]);
  const {
    data: yearBudgets,
    isLoading: yearBudgetsLoading,
    refetch: refetchYearBudgets,
  } = useGetGADYearBudgets();
  const { data: budgetEntries = [] } = useGADBudgets(year || "");
  const { data: projectProposals, isLoading: projectProposalsLoading } =
    useProjectProposalsAvailability(year);
  const {
    mutate: createBudget,
    isPending,
    error: _createError,
  } = useCreateGADBudget(yearBudgets || [], budgetEntries);
  const [activeVideoId, setActiveVideoId] = useState<string>("");

  // Calculate remaining balance
  const calculateRemainingBalance = (): number => {
    if (!yearBudgets || !year) return 0;
    const currentYearBudget = yearBudgets.find((b) => b.gbudy_year === year);
    if (!currentYearBudget) return 0;
    const initialBudget = Number(currentYearBudget.gbudy_budget) || 0;
    const totalExpenses = Number(currentYearBudget.gbudy_expenses) || 0;
    return initialBudget - totalExpenses;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(GADAddEntrySchema),
    defaultValues: {
      gbud_datetime: new Date().toISOString().slice(0, 16),
      gbud_add_notes: "",
      gbud_exp_project: "",
      gbud_exp_particulars: [],
      gbud_actual_expense: 0,
      gbud_proposed_budget: 0,
      gbud_reference_num: null,
      gbud_remaining_bal: 0,
      gbudy: 0,
      staff: user?.staff?.staff_id || null
    },
    context: { calculateRemainingBalance },
  });

  // Watch form values
  const actualExpenseWatch = form.watch("gbud_actual_expense");
  const projectWatch = form.watch("gbud_exp_project");
  const remainingBalance = calculateRemainingBalance();

  useEffect(() => {
    const calculatedProposedBudget = removeLeadingZeros(
      selectedBudgetItems
        .filter(
          (item) => !recordedBudgetItems.some((r) => r.name === item.name)
        )
        .reduce((sum, item) => {
          const pax = parseInt(item.pax) || 1;
          return sum + item.amount * pax;
        }, 0)
    );

    form.setValue("gbud_proposed_budget", calculatedProposedBudget);
  }, [selectedBudgetItems, recordedBudgetItems, form]);

  // Set year budget
  useEffect(() => {
    if (yearBudgets && !yearBudgetsLoading) {
      const currentYearBudget = yearBudgets.find((b) => b.gbudy_year === year);
      if (currentYearBudget) {
        form.setValue("gbudy", currentYearBudget.gbudy_num);
        form.setValue("gbud_remaining_bal", calculateRemainingBalance());
      } else {
        form.setError("gbudy", {
          type: "manual",
          message: "No budget found for the selected year",
        });
      }
      form.trigger();
    }
  }, [yearBudgets, yearBudgetsLoading, year, form]);

  // Update budget items when project is selected
  useEffect(() => {
    if (projectWatch && projectProposals) {
      const selectedProject = projectProposals.find(
        (p) => p.gpr_title === projectWatch
      );
      if (selectedProject && selectedProject.gpr_budget_items?.length > 0) {
        // Use recorded_items and unrecorded_items from API
        const recordedItems = selectedProject.recorded_items
          .map((name) =>
            selectedProject.gpr_budget_items.find((item) => item.name === name)
          )
          .filter(Boolean) as { name: string; pax: string; amount: number }[];
        const unrecordedItems = selectedProject.unrecorded_items || [];

        // Set recorded items (read-only)
        setRecordedBudgetItems(recordedItems);

        // Initialize with recorded items
        form.setValue("gbud_exp_particulars", recordedItems);
        setSelectedBudgetItems(recordedItems);

        // Auto-select single unrecorded item
        if (unrecordedItems.length === 1) {
          form.setValue("gbud_exp_particulars", [
            ...recordedItems,
            ...unrecordedItems,
          ]);
          setSelectedBudgetItems([...recordedItems, ...unrecordedItems]);
        }

        form.clearErrors("gbud_exp_particulars");
        form.clearErrors("gbud_exp_project");
      } else {
        form.setValue("gbud_exp_particulars", []);
        setSelectedBudgetItems([]);
        setRecordedBudgetItems([]);
        form.setError("gbud_exp_particulars", {
          type: "manual",
          message: "No valid budget items found for the selected project",
        });
      }
      form.trigger();
    }
  }, [projectWatch, projectProposals, form]);

  // Handle adding unrecorded budget items
  const handleAddBudgetItem = (item: {
    name: string;
    pax: string;
    amount: number;
  }) => {
    setSelectedBudgetItems((prev) => {
      const newItems = [...prev, item];
      form.setValue("gbud_exp_particulars", newItems);
      form.trigger("gbud_exp_particulars");
      return newItems;
    });
  };

  // Handle removing budget items (only unrecorded items)
  const handleRemoveItem = (index: number) => {
    setSelectedBudgetItems((prev) => {
      const newItems = [...prev];
      newItems.splice(index, 1);
      form.setValue("gbud_exp_particulars", newItems);
      form.trigger("gbud_exp_particulars");
      return newItems;
    });
  };

  const onSubmit = async (values: FormValues) => {
    const inputDate = new Date(values.gbud_datetime);
    const inputYear = inputDate.getFullYear().toString();

    if (inputYear !== year) {
      form.setError("gbud_datetime", {
        type: "manual",
        message: `Date must be in ${year}`,
      });
      return;
    }

    if (
      values.gbud_actual_expense &&
      values.gbud_actual_expense > remainingBalance
    ) {
      form.setError("gbud_actual_expense", {
        type: "manual",
        message: `Actual expense cannot exceed remaining balance of ₱${remainingBalance.toLocaleString()}`,
      });
      return;
    }
    if (
      !values.gbud_exp_particulars ||
      values.gbud_exp_particulars.length === 0
    ) {
      form.setError("gbud_exp_particulars", {
        type: "manual",
        message: "At least one budget item is required for expense entries",
      });
      return;
    }

    const files = mediaFiles.map((media) => ({
      id: media.id,
      name: media.name,
      type: media.type,
      file: media.file, // Base64 string
    }));

    if (mediaFiles.length > 0 && files.every((file) => !file.file)) {
      form.setError("root", {
        type: "manual",
        message: "At least one valid file is required for expense entries",
      });
      return;
    }

    const budgetData = {
      gbud_datetime: new Date(values.gbud_datetime).toISOString(),
    gbud_add_notes: values.gbud_add_notes || null,
    gbud_exp_particulars: values.gbud_exp_particulars,
    gbud_actual_expense: values.gbud_actual_expense,
    gbud_proposed_budget: values.gbud_proposed_budget,
    gbud_reference_num: values.gbud_reference_num,
    gbud_remaining_bal: remainingBalance - (values.gbud_actual_expense || 0),
    dev: selectedProject?.dev_id,
    gbud_project_index: selectedProject?.project_index || 0,
    gbudy: values.gbudy,
    staff: values.staff,
    };

    try {
      await createBudget(
        { budgetData, files },
        {
          onSuccess: () => {
            refetchYearBudgets();
            onSuccess?.();
          },
        }
      );
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  const hasUnrecordedItems = () => {
    return selectedBudgetItems.some(
      (item) =>
        !recordedBudgetItems.some((recorded) => recorded.name === item.name)
    );
  };

  const currentYearBudget = yearBudgets?.find((b) => b.gbudy_year === year);
  const selectedProject = projectProposals?.find(
    (p) => p.gpr_title === projectWatch
  );

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      <div className="grid gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DateTimePicker
                  control={form.control}
                  name="gbud_datetime"
                  label={`Date (${year} only)`}
                  year={year}
                />
              </div>
              <div>
                <FormField
                  control={form.control}
                  name="gbud_exp_project"
                  render={({ field }) => (
                    <ComboboxInput
                      value={field.value || ""}
                      options={projectProposals || []}
                      isLoading={projectProposalsLoading}
                      label="Project Title"
                      placeholder="Select project..."
                      emptyText="No projects found."
                      onSelect={(value, item) => {
                        field.onChange(value);
                        if (item) {
                          form.setValue("dev", item.dev_id);
    form.setValue("gbud_project_index", item.project_index);
                          const recordedItems = item.recorded_items
                            .map((name) =>
                              item.gpr_budget_items.find((b) => b.name === name)
                            )
                            .filter(Boolean) as {
                            name: string;
                            pax: string;
                            amount: number;
                          }[];
                          form.setValue("gbud_exp_particulars", recordedItems);
                          setSelectedBudgetItems(recordedItems);
                          setRecordedBudgetItems(recordedItems);
                        }
                      }}
                      displayKey="gpr_title"
                      valueKey="gpr_id"
                      disabled={projectProposalsLoading}
                    />
                  )}
                />
              </div>
            </div>

            <FormInput
              control={form.control}
              name="gbud_add_notes"
              label="Description"
              placeholder="Enter related information (if any)"
            />

            {selectedProject && (
              <>
                <FormField
                  control={form.control}
                  name="gbud_exp_particulars"
                  render={() => (
                    <ComboboxInput
                      value=""
                      options={(selectedProject.unrecorded_items || []).filter(
                        (item) =>
                          !selectedBudgetItems.some(
                            (selected) => selected.name === item.name
                          )
                      )}
                      isLoading={projectProposalsLoading}
                      label="Add Budget Items"
                      placeholder="Select additional budget items..."
                      emptyText="No unrecorded budget items available."
                      onSelect={(_value, item) => {
                        if (item) {
                          handleAddBudgetItem({
                            name: item.name,
                            pax: item.pax,
                            amount: Number(item.amount),
                          });
                        }
                      }}
                      displayKey="name"
                      valueKey="name"
                      disabled={
                        projectProposalsLoading ||
                        !selectedProject.unrecorded_items?.length
                      }
                    />
                  )}
                />
                {(recordedBudgetItems.length > 0 ||
                  selectedBudgetItems.length > 0) && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-black/70">
                      Budget Items
                    </label>
                    <div className="border rounded p-4">
                      {selectedBudgetItems.map((item, index) => {
                        const isRecorded = recordedBudgetItems.some(
                          (r) => r.name === item.name
                        );
                        return (
                          <div
                            key={item.name}
                            className="flex justify-between items-center py-2 border-b last:border-b-0"
                          >
                            <div>
                              <span className="font-medium">{item.name}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                {item.pax}
                              </span>
                              {isRecorded && (
                                <span className="text-xs text-gray-400 ml-2">
                                  (Recorded)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <span>₱{item.amount.toLocaleString()}</span>
                              {!isRecorded && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <FormInput
                  control={form.control}
                  name="gbud_proposed_budget"
                  label="Proposed Budget"
                  type="number"
                  readOnly={true}
                  placeholder="Calculated from unrecorded budget items"
                />
              </>
            )}

            <>
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
                setMediaFiles={(newFiles) => {
                  setMediaFiles(newFiles);
                }}
                activeVideoId={activeVideoId}
                setActiveVideoId={setActiveVideoId}
                acceptableFiles="all"
                maxFiles={5}
              />
              {currentYearBudget && (
                <div className="p-4 border rounded bg-gray-50">
                  <div className="flex justify-between">
                    <span className="font-medium">Current Budget:</span>
                    <span>
                      ₱{currentYearBudget.gbudy_budget?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total Expenses:</span>
                    <span>
                      ₱
                      {(currentYearBudget.gbudy_expenses || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Remaining Balance:</span>
                    <span>₱{remainingBalance.toLocaleString()}</span>
                  </div>
                  {actualExpenseWatch && (
                    <div className="flex justify-between mt-2">
                      <span className="font-medium">After This Entry:</span>
                      <span
                        className={
                          (actualExpenseWatch || 0) > remainingBalance
                            ? "text-red-500"
                            : ""
                        }
                      >
                        ₱
                        {(
                          remainingBalance - (actualExpenseWatch || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {(actualExpenseWatch || 0) > remainingBalance && (
                    <div className="mt-2 text-red-500 font-medium">
                      Warning: This expense will exceed your remaining budget!
                    </div>
                  )}
                </div>
              )}
            </>

            <div className="mt-4 flex justify-end gap-3">
              {Object.keys(form.formState.errors).length > 0 && (
                <div className="text-red-500 text-sm">
                  Please double check your input
                </div>
              )}
              {selectedBudgetItems.length > 0 && !hasUnrecordedItems() && (
                <p className="text-sm text-red-500 mb-2">
                  Note: Add at least one new budget item to save
                </p>
              )}

              <ConfirmationModal
                trigger={
                  <Button
                    type="button"
                    className="hover:bg-white-100 hover:opacity-[95%]"
                    disabled={
                      isPending ||
                      Object.keys(form.formState.errors).length > 0 ||
                      !hasUnrecordedItems()
                    }
                  >
                    {isPending ? "Saving..." : "Save"}
                  </Button>
                }
                title="Confirm Save"
                description="Are you sure the details are accurate for this new budget entry?"
                actionLabel="Confirm"
                onClick={() => form.handleSubmit(onSubmit)()}
              />
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default GADAddEntryForm;
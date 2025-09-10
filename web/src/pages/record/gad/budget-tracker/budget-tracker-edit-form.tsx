import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ComboboxInput } from "@/components/ui/form/form-combobox-input";
import {
  useGADBudgetEntry,
  useProjectProposalsAvailability,
} from "./queries/BTFetchQueries";
import { useGetGADYearBudgets } from "./queries/BTYearQueries";
import { useUpdateGADBudget } from "./queries/BTUpdateQueries";
import GADAddEntrySchema, {
  FormValues,
} from "@/form-schema/gad-budget-track-create-form-schema";
import { GADEditEntryFormProps } from "./budget-tracker-types";
import { DateTimePicker } from "@/components/ui/form/form-datetime-picker";

function GADEditEntryForm({ gbud_num, onSaveSuccess }: GADEditEntryFormProps) {
  const { year } = useParams<{ year: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType>(() => []);
  const [selectedBudgetItems, setSelectedBudgetItems] = useState<
    { name: string; pax: string; amount: number }[]
  >([]);
  const [_recordedBudgetItems, setRecordedBudgetItems] = useState<
    { name: string; pax: string; amount: number }[]
  >([]);
  const [activeVideoId, setActiveVideoId] = useState<string>("");

  const { data: yearBudgets, refetch: refetchYearBudgets } =
    useGetGADYearBudgets();
  const { data: budgetEntry, isLoading: entryLoading } =
    useGADBudgetEntry(gbud_num);
  const { data: projectProposals } = useProjectProposalsAvailability(year);
  const { mutate: updateBudget, isPending } = useUpdateGADBudget(
    yearBudgets || []
  );

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
      gbud_reference_num: "",
      gbud_remaining_bal: 0,
      gbudy: 0,
      dev: 0,
      gbud_project_index: 0,
    },
    context: { calculateRemainingBalance },
  });
  const remainingBalance = calculateRemainingBalance();

  // Update the useEffect where you set form values
  useEffect(() => {
    if (budgetEntry && projectProposals) {
      const formattedDate = budgetEntry.gbud_datetime
        ? new Date(budgetEntry.gbud_datetime).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16);

    const matchingProject = projectProposals.find(
      (p) => p.dev_id === budgetEntry.dev && p.project_index === budgetEntry.gbud_project_index
    );
    const projectTitle = matchingProject?.gpr_title || budgetEntry.gbud_exp_project || "";

      let recordedItems: { name: string; pax: string; amount: number }[] = [];
    if (budgetEntry.gbud_exp_particulars) {
      if (typeof budgetEntry.gbud_exp_particulars === "string") {
        try {
          recordedItems = JSON.parse(budgetEntry.gbud_exp_particulars);
        } catch (e) {
          console.error("Failed to parse gbud_exp_particulars:", budgetEntry.gbud_exp_particulars);
          recordedItems = [];
        }
      } else if (Array.isArray(budgetEntry.gbud_exp_particulars)) {
        recordedItems = budgetEntry.gbud_exp_particulars;
      }
    }


      const formValues: FormValues = {
        gbud_datetime: formattedDate,
        gbud_add_notes: budgetEntry.gbud_add_notes || "",
        gbud_exp_project: projectTitle,
        gbud_exp_particulars: recordedItems,
        gbud_proposed_budget: budgetEntry.gbud_proposed_budget
          ? Number(budgetEntry.gbud_proposed_budget)
          : 0,
        gbud_actual_expense: budgetEntry.gbud_actual_expense
          ? Number(budgetEntry.gbud_actual_expense)
          : 0,
        gbud_reference_num: budgetEntry.gbud_reference_num || "",
        gbud_remaining_bal: budgetEntry.gbud_remaining_bal
          ? Number(budgetEntry.gbud_remaining_bal)
          : 0,
        gbudy: yearBudgets?.find((b) => b.gbudy_year === year)?.gbudy_num || 0,
        dev: budgetEntry.dev || 0,
        gbud_project_index: budgetEntry.gbud_project_index || 0,
      };

      form.reset(formValues);

      if (budgetEntry.files?.length) {
        const files = budgetEntry.files.map((file) => ({
          id: `existing-${file.gbf_id}`,
          name: file.gbf_name || `file-${file.gbf_id}`,
          type: file.gbf_type || "image/jpeg",
          url: file.gbf_url,
        }));
        setMediaFiles(files);
      }

      setSelectedBudgetItems(recordedItems);
      setRecordedBudgetItems(recordedItems);
    }
  }, [budgetEntry, yearBudgets, year, projectProposals]);

  const handleConfirmSave = (values: FormValues) => {
    const inputDate = new Date(values.gbud_datetime);
    const inputYear = inputDate.getFullYear().toString();

    if (inputYear !== year) {
      form.setError("gbud_datetime", {
        type: "manual",
        message: `Date must be in ${year}`,
      });
      return;
    }

    // Validate actual expense against remaining balance
    if (values.gbud_actual_expense) {
      const actualExpense = Number(values.gbud_actual_expense);
      if (actualExpense > remainingBalance) {
        form.setError("gbud_actual_expense", {
          type: "manual",
          message: `Actual expense exceeds remaining balance of ₱${remainingBalance.toLocaleString()}`,
        });
        return;
      }
      if (actualExpense < 0) {
        form.setError("gbud_actual_expense", {
          type: "manual",
          message: `Actual expense cannot be negative`,
        });
        return;
      }
    }

    const budgetData = {
      gbud_datetime: new Date(values.gbud_datetime).toISOString(),
      gbud_add_notes: values.gbud_add_notes || null,
      ...{
        gbud_exp_project: values.gbud_exp_project,
        gbud_exp_particulars: values.gbud_exp_particulars,
        gbud_proposed_budget: values.gbud_proposed_budget,
        gbud_actual_expense: values.gbud_actual_expense,
        gbud_reference_num: values.gbud_reference_num,
        gbud_remaining_bal: remainingBalance - (values.gbud_actual_expense || 0),
        dev: values.dev,
        gbud_project_index: values.gbud_project_index,
      },
      gbudy: values.gbudy,
    };

    // Map removed files to gbf_id
    const initialFiles = budgetEntry?.files || [];
    const currentFileIds = mediaFiles
      .filter((file) => file.id.startsWith("existing-"))
      .map((file) => file.id.replace("existing-", ""));
    const filesToDelete = initialFiles
      .filter((file) => !currentFileIds.includes(file.gbf_id.toString()))
      .map((file) => file.gbf_id.toString());

    const newFiles = mediaFiles
      .filter((file) => !file.id.startsWith("existing-") && file.file)
      .map((file) => ({
        id: file.id,
        name: file.name,
        type: file.type,
        file: file.file as string | File,
      }));

    updateBudget(
      {
        gbud_num,
        budgetData,
        files: newFiles,
        filesToDelete,
        remainingBalance: calculateRemainingBalance(),
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          refetchYearBudgets();
          if (onSaveSuccess) onSaveSuccess();
        },
      }
    );
  };

  if (entryLoading) return <div className="text-center py-8">Loading...</div>;
  if (!budgetEntry)
    return <div className="text-center py-8">No budget entry found.</div>;

  const currentYearBudget = yearBudgets?.find((b) => b.gbudy_year === year);
  const selectedProject = projectProposals?.find(
  (p) => p.dev_id === budgetEntry.dev && p.project_index === budgetEntry.gbud_project_index
);

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      <div className="grid gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleConfirmSave)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <DateTimePicker
                  control={form.control}
                  name="gbud_datetime"
                  label={`Date (${year} only)`}
                  readOnly={!isEditing}
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
                      label="Program Title"
                      placeholder="Select Program..."
                      onSelect={(value, item) => {
                        field.onChange(value);
                        if (item) {
                        form.setValue("dev", item.dev_id);
                        form.setValue("gbud_project_index", item.project_index);
                       }
                      }}
                      readOnly={true}
                    />
                  )}
                />
              </div>
            </div>

            {selectedProject && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Budget Items</label>
                  <div className="border rounded p-4">
                    {/* Show recorded items from the project */}
                    {selectedBudgetItems.map((item, index) => (
                      <div
                        key={`${item.name}-${index}`}
                        className="flex justify-between items-center py-2 border-b last:border-b-0"
                      >
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {item.pax}
                          </span>
                          {selectedProject.recorded_items.includes(
                            item.name
                          )}
                        </div>
                        <span>₱{item.amount.toLocaleString()}</span>
                      </div>
                    ))}

                    {/* Also show any additional selected budget items */}
                    {selectedBudgetItems
                      .filter(
                        (item) =>
                          !selectedProject.gpr_budget_items.some(
                            (projectItem) => projectItem.name === item.name
                          )
                      )
                      .map((item) => (
                        <div
                          key={item.name}
                          className="flex justify-between items-center py-2 border-b last:border-b-0"
                        >
                          <div>
                            <span className="font-medium">{item.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {item.pax}
                            </span>
                            <span className="text-xs text-blue-400 ml-2">
                              (Added)
                            </span>
                          </div>
                          <span>₱{item.amount.toLocaleString()}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black/70">
                    Proposed Budget
                  </label>
                  <div className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                    ₱
                    {form.watch("gbud_proposed_budget")?.toLocaleString() ||
                      "0"}
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-4">
              <FormInput
                control={form.control}
                name="gbud_add_notes"
                label="Description"
                placeholder="Enter related information (if any)"
                readOnly={!isEditing}
              />

              <>
                <FormInput
                  control={form.control}
                  name="gbud_actual_expense"
                  label="Actual Expense"
                  type="number"
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
                    description="Upload proof of transaction"
                    mediaFiles={mediaFiles}
                    setMediaFiles={setMediaFiles}
                    activeVideoId={activeVideoId}
                    setActiveVideoId={setActiveVideoId}
                  />
                ) : mediaFiles.length > 0 ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Supporting Doc(s)
                    </label>
                    {mediaFiles.map((file) => (
                      <div key={file.id} className="border rounded-md p-2">
                        <img
                          src={file.url}
                          onError={(e) => {
                            console.error("Failed to load image:", {
                              url: file.url,
                              encoded: encodeURI(file.url || ""),
                              decoded: decodeURI(file.url || ""),
                            });
                            e.currentTarget.src = "/placeholder.jpg";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-2 border rounded text-sm text-gray-500">
                    No supporting docs uploaded
                  </div>
                )}
              </>
            </div>

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
                    ₱{(currentYearBudget.gbudy_expenses || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Remaining Balance:</span>
                  <span>₱{remainingBalance.toLocaleString()}</span>
                </div>
              </div>
            )}

            <div className="mt-4 flex justify-end gap-3">
              {Object.keys(form.formState.errors).length > 0 && (
                <div className="text-red-500 text-sm">
                  Please double check your input. Errors in:{" "}
                  {Object.keys(form.formState.errors).join(", ")}
                  {Object.entries(form.formState.errors).map(
                    ([name, error]) => (
                      <div key={name}>
                        {name}: {error.message}
                      </div>
                    )
                  )}
                </div>
              )}

              {isEditing ? (
                <>
                  <Button
                    type="button"
                    onClick={() => {
                      form.reset();
                      setIsEditing(false);
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
                          Object.keys(form.formState.errors).length > 0
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

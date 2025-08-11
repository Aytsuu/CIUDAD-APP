import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button/button";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { ComboboxInput } from "@/components/ui/form/form-combobox-input";
import {
  useGADBudgetEntry,
  useIncomeParticulars,
  useProjectProposalsAvailability,
} from "./queries/BTFetchQueries";
import { useGetGADYearBudgets } from "./queries/BTYearQueries";
import { useUpdateGADBudget } from "./queries/BTUpdateQueries";
import GADAddEntrySchema, {
  FormValues,
} from "@/form-schema/gad-budget-track-create-form-schema";
import { GADEditEntryFormProps } from "./budget-tracker-types";

function GADEditEntryForm({ gbud_num, onSaveSuccess }: GADEditEntryFormProps) {
  const { year } = useParams<{ year: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaUploadType>([]);
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);
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
  const { data: incomeParticulars, isLoading: incomeParticularsLoading } =
    useIncomeParticulars(year);
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
      gbud_type: "Expense",
      gbud_datetime: new Date().toISOString().slice(0, 16),
      gbud_add_notes: "",
      gbud_inc_particulars: "",
      gbud_inc_amt: 0,
      gbud_exp_project: "",
      gbud_exp_particulars: [],
      gbud_actual_expense: 0,
      gbud_reference_num: "",
      gbud_remaining_bal: 0,
      gbudy: 0,
      gpr: 0,
    },
    context: { calculateRemainingBalance },
  });

  const typeWatch = form.watch("gbud_type");
  const projectWatch = form.watch("gbud_exp_project");
  const remainingBalance = calculateRemainingBalance();

  useEffect(() => {
    if (budgetEntry) {
      console.log("Loaded budget entry:", {
        projectTitle: budgetEntry.gbud_exp_project,
        projectId: budgetEntry.gpr,
      });
      const formattedDate = budgetEntry.gbud_datetime
        ? new Date(budgetEntry.gbud_datetime).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16);

      const formValues: FormValues = {
        gbud_type: budgetEntry.gbud_type as "Income" | "Expense",
        gbud_datetime: formattedDate,
        gbud_add_notes: budgetEntry.gbud_add_notes || "",
        gbud_inc_particulars: budgetEntry.gbud_inc_particulars || "",
        gbud_inc_amt: budgetEntry.gbud_inc_amt
          ? Number(budgetEntry.gbud_inc_amt)
          : 0,
        gbud_exp_project: budgetEntry.gbud_exp_project || "",
        gbud_exp_particulars: budgetEntry.gbud_exp_particulars || [],
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
        gpr: budgetEntry.gpr
          ? typeof budgetEntry.gpr === "object"
            ? budgetEntry.gpr.gpr_id
            : budgetEntry.gpr
          : null,
      };

      form.reset(formValues);

      if (budgetEntry.files?.length) {
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
        // setMediaFiles(files);
      }

      if (
        budgetEntry.gbud_type === "Expense" &&
        budgetEntry.gbud_exp_particulars
      ) {
        setSelectedBudgetItems(budgetEntry.gbud_exp_particulars);
        setRecordedBudgetItems(budgetEntry.gbud_exp_particulars);
      }
    }
  }, [budgetEntry, yearBudgets, year, form]);

  const handleConfirmSave = (values: FormValues) => {
    console.log("Form submission data:", values);
    const inputDate = new Date(values.gbud_datetime);
    const inputYear = inputDate.getFullYear().toString();

    if (inputYear !== year) {
      form.setError("gbud_datetime", {
        type: "manual",
        message: `Date must be in ${year}`,
      });
      return;
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
        gbud_exp_project: values.gbud_exp_project,
        gbud_exp_particulars: values.gbud_exp_particulars,
        gbud_proposed_budget: values.gbud_proposed_budget,
        gbud_actual_expense: values.gbud_actual_expense,
        gbud_reference_num: values.gbud_reference_num,
        gbud_remaining_bal:
          remainingBalance - (values.gbud_actual_expense || 0),
        gpr: values.gpr,
      }),
      gbudy: values.gbudy,
    };

    const filesToDelete = removedFiles.map((id) => id.replace("receipt-", ""));

    updateBudget(
      {
        gbud_num,
        budgetData,
        files: mediaFiles,
        filesToDelete,
        remainingBalance: calculateRemainingBalance(),
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setRemovedFiles([]);
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
    (p) => p.gpr_title === projectWatch
  );

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-5 rounded-lg overflow-auto">
      <div className="grid gap-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleConfirmSave)}
            className="flex flex-col gap-4"
          >
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
                  readOnly
                />
              </div>
              <div>
                <FormInput
                  control={form.control}
                  name="gbud_datetime"
                  label={`Date (${year} only)`}
                  type="datetime-local"
                  readOnly={!isEditing}
                />
              </div>
              <div>
                {typeWatch === "Income" ? (
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
                          <ComboboxInput
                            value={field.value || ""}
                            options={incomeParticulars || []}
                            isLoading={incomeParticularsLoading}
                            label=""
                            placeholder="Select particulars..."
                            emptyText="No particulars found. Enter new value."
                            onSelect={(value) => field.onChange(value)}
                            disabled={incomeParticularsLoading}
                          />
                        )}
                      />
                    )}
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="gbud_exp_project"
                    render={({ field }) => (
                      <ComboboxInput
                        value={field.value || ""}
                        options={projectProposals || []}
                        label="Project Title"
                        placeholder="Select project..."
                        onSelect={(value, item) => {
                          field.onChange(value);
                          form.setValue("gpr", item?.gpr_id ?? null);
                        }}
                        readOnly={true}
                      />
                    )}
                  />
                )}
              </div>
            </div>

            {typeWatch === "Expense" && selectedProject && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Budget Items</label>
                  <div className="border rounded p-4">
                    {selectedBudgetItems.map((item) => (
                      <div
                        key={item.name}
                        className="flex justify-between items-center py-2 border-b last:border-b-0"
                      >
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            {item.pax}
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

              {typeWatch === "Income" ? (
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
              ) : (
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
                      onFileRemoved={(removedId) => {
                        setRemovedFiles((prev) => [...prev, removedId]);
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
                </>
              )}
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
                <div className="flex justify-between">
                  <span className="font-medium">Total Income:</span>
                  <span>
                    ₱{(currentYearBudget.gbudy_income || 0).toLocaleString()}
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
                      setRemovedFiles([]);
                      if (budgetEntry.files?.length) {
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
                        // setMediaFiles(files);
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

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateAndTimeInput } from "@/components/ui/form/form-date-time-input";
import { useExpenseParticulars, useIncomeParticulars } from "./queries/fetch";
import { useGetGADYearBudgets } from "./queries/yearqueries";
import { useUpdateGADBudget } from "./queries/update";
import _ScreenLayout from "@/screens/_ScreenLayout";
import MultiImageUploader, { MediaFileType } from "@/components/ui/multi-media-upload";
import BudgetTrackerSchema from "@/form-schema/gad-budget-tracker-schema";
import { ChevronLeft, Loader2 } from "lucide-react-native";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { Modal } from "react-native";
import { z } from "zod";

type FormValues = z.infer<typeof BudgetTrackerSchema>;

function GADViewEditEntryForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.budYear as string;

  const gbud_num = Number(params.gbud_num) || undefined;
  const gbud_datetime = params.gbud_datetime as string | undefined;
  const gbud_type = params.gbud_type as "Income" | "Expense" | undefined;
  const gbud_add_notes = params.gbud_add_notes as string | undefined;
  const gbud_particulars = params.gbud_particulars as string | undefined;
  const gbud_amount = params.gbud_actual_expense != null 
    ? Number(params.gbud_actual_expense) 
    : Number(params.gbud_proposed_budget) || undefined;
  const gbud_proposed_budget = params.gbud_proposed_budget ? Number(params.gbud_proposed_budget) : undefined;
  const gbud_actual_expense = params.gbud_actual_expense ? Number(params.gbud_actual_expense) : undefined;
  const gbud_reference_num = params.gbud_reference_num as string | undefined;
  const gbud_inc_amt = params.gbud_inc_amt ? Number(params.gbud_inc_amt) : undefined;
  const gdb_id = params.gdb_id ? Number(params.gdb_id) : undefined;
  const gbud_is_archive = params.gbud_is_archive

  // Parse files
  let parsedFiles: any[] = [];
  if (params.files) {
    try {
      parsedFiles = typeof params.files === "string" ? JSON.parse(params.files) : params.files;
      if (!Array.isArray(parsedFiles)) {
        console.error("Parsed params.files is not an array:", parsedFiles);
        parsedFiles = [];
      }
      console.log("Parsed params.files:", parsedFiles);
    } catch (error) {
      console.error("Error parsing params.files:", error);
      parsedFiles = [];
    }
  }

  const [isEditing, setIsEditing] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>(
    parsedFiles.map((file: any, index: number) => ({
      id: file.gbf_id ? `existing-${file.gbf_id}` : `temp-${index}`,
      name: file.gbf_name || `file-${index}`,
      type: file.gbf_type || "image",
      uri: file.gbf_url || "",
      path: file.gbf_path || "",
      publicUrl: file.gbf_url || "",
      status: "uploaded" as const,
    }))
  );
  const [showIncomeParticularsModal, setShowIncomeParticularsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  const { data: yearBudgets, isLoading, error } = useGetGADYearBudgets();
  const { data: expenseItems = [] } = useExpenseParticulars();
  const { data: incomeParticulars = [], isLoading: incomeParticularsLoading } = useIncomeParticulars(year);
  const { mutate: updateBudget, isPending } = useUpdateGADBudget(yearBudgets || []);

  useEffect(() => {
    if (yearBudgets) {
      const currentYearBudget = yearBudgets.find((b) => b.gbudy_year === year);
      console.log("Year Budget Data:", {
        year,
        currentYearBudget,
        gbudy_budget: currentYearBudget?.gbudy_budget,
        gbudy_expenses: currentYearBudget?.gbudy_expenses,
        gbudy_income: currentYearBudget?.gbudy_income,
      });
    }
  }, [yearBudgets, year]);

  const isUploading = mediaFiles.some((file) => file.status === "uploading");

  if (!year || !gbud_num) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error: Year and entry ID are required. Received: year={year}, gbud_num={gbud_num}</Text>
        <Button onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading budgets...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error loading budgets: {error.message}</Text>
        <Button onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  const currentYearBudget = Array.isArray(yearBudgets)
    ? yearBudgets.find((b) => b.gbudy_year === year)
    : undefined;

  if (!currentYearBudget) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error: No budget found for year {year}</Text>
        <Button onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  const calculateRemainingBalance = () => {
    if (!currentYearBudget) {
      console.log("No currentYearBudget available");
      return 0;
    }
    const initialBudget = Number(currentYearBudget.gbudy_budget) || 0;
    const totalExpenses = Number(currentYearBudget.gbudy_expenses) || 0;
    const currentExpense =
      gbud_type === "Expense" && gbud_amount ? Number(gbud_amount) || 0 : 0;
    const result = initialBudget - (totalExpenses - currentExpense);
    console.log("calculateRemainingBalance:", {
      initialBudget,
      totalExpenses,
      currentExpense,
      gbud_amount,
      result,
    });
    return result;
  };

  const remainingBalance = calculateRemainingBalance();

  const formatNumericValue = (value: number | undefined) => {
    return value != null ? value.toFixed(2) : "";
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(BudgetTrackerSchema),
    defaultValues: {
      gbud_type: gbud_type || "Expense",
      gbud_datetime: gbud_datetime || new Date().toISOString(),
      gbud_files: [],
      gbud_add_notes: gbud_add_notes || null,
      gbud_inc_particulars: gbud_type === "Income" ? gbud_particulars || null : null,
      gbud_inc_amt: gbud_type === "Income" ? formatNumericValue(gbud_inc_amt) : null,
      gbud_exp_particulars: gbud_type === "Expense" ? gbud_particulars || null : null,
      gbud_proposed_budget: gbud_type === "Expense" ? formatNumericValue(gbud_proposed_budget) : null,
      gbud_actual_expense: gbud_type === "Expense" ? formatNumericValue(gbud_actual_expense) : null,
      gbud_reference_num: gbud_reference_num || null,
      gbud_remaining_bal: null,
      gbudy: currentYearBudget.gbudy_num,
      gdb_id: gdb_id ?? null,
    },
  });

  const initialFormValues = {
    gbud_type: gbud_type || "Expense",
    gbud_datetime: gbud_datetime || new Date().toISOString(),
    gbud_files: [],
    gbud_add_notes: gbud_add_notes || null,
    gbud_inc_particulars: gbud_type === "Income" ? gbud_particulars || null : null,
    gbud_inc_amt: gbud_type === "Income" ? formatNumericValue(gbud_inc_amt) : null,
    gbud_exp_particulars: gbud_type === "Expense" ? gbud_particulars || null : null,
    gbud_proposed_budget: gbud_type === "Expense" ? formatNumericValue(gbud_proposed_budget) : null,
    gbud_actual_expense: gbud_type === "Expense" ? formatNumericValue(gbud_actual_expense) : null,
    gbud_reference_num: gbud_reference_num || null,
    gbud_remaining_bal: null,
    gbudy: currentYearBudget.gbudy_num,
    gdb_id: gdb_id ?? null,
  };

  useEffect(() => {
    console.log("Form state:", form.formState);
    console.log("Form errors:", form.formState.errors);
    console.log("Form values:", form.getValues());
  }, [form.formState, form.watch()]);

  useEffect(() => {
    const filesForForm = mediaFiles
      .filter((file) => file.status === "uploaded" && file.publicUrl)
      .map((file) => ({
        name: file.name,
        type: file.type,
        path: file.path,
        uri: file.publicUrl || file.uri,
      }));
    console.log("Setting gbud_files:", filesForForm);
    form.setValue("gbud_files", filesForForm);

    const errorFiles = mediaFiles.filter((file) => file.status === "error");
    if (errorFiles.length > 0) {
      setFileUploadError(`Upload failed for: ${errorFiles.map((f) => f.name).join(", ")}`);
    } else {
      setFileUploadError(null);
    }
  }, [mediaFiles, form]);

  const typeWatch = form.watch("gbud_type");
  const actualExpenseWatch = form.watch("gbud_actual_expense");
  const proposedBudgetWatch = form.watch("gbud_proposed_budget");

  const normalizeNumericInput = (value: string | null | number | undefined) => {
    if (value == null) return null;
    const num = parseFloat(value.toString());
    return isNaN(num) ? null : Number(num.toFixed(2));
  };

  const filteredIncomeParticulars = incomeParticulars.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectIncomeParticular = (particular: string) => {
    form.setValue("gbud_inc_particulars", particular);
    setShowIncomeParticularsModal(false);
    setSearchTerm("");
  };

  const onSubmit = (values: FormValues) => {
    console.log("Starting submission...", values);
    const inputDate = new Date(values.gbud_datetime);
    const inputYear: string = inputDate.getFullYear().toString();
    console.log("Date validation:", { inputYear, expectedYear: year });

    if (inputYear !== year) {
      form.setError("gbud_datetime", {
        type: "manual",
        message: `Date must be in ${year}`,
      });
      return;
    }

    if (values.gbud_type === "Expense") {
      const currentExpense = values.gbud_actual_expense != null 
        ? Number(values.gbud_actual_expense) 
        : Number(values.gbud_proposed_budget) || 0;
      if (currentExpense > remainingBalance) {
        form.setError(values.gbud_actual_expense != null ? "gbud_actual_expense" : "gbud_proposed_budget", {
          type: "manual",
          message: `Exceeds remaining balance of ₱${remainingBalance.toLocaleString()}`,
        });
        return;
      }
    }

    const invalidFiles = mediaFiles.filter((file) => file.status !== "uploaded" || !file.publicUrl);
    if (invalidFiles.length > 0) {
      form.setError("gbud_files", {
        type: "manual",
        message: `Some files are not uploaded: ${invalidFiles.map((f) => f.name).join(", ")}`,
      });
      return;
    }

    let gbud_remaining_bal = null;
    if (values.gbud_type === "Expense") {
      const currentExpense = values.gbud_actual_expense != null 
        ? Number(values.gbud_actual_expense) 
        : Number(values.gbud_proposed_budget) || 0;
      gbud_remaining_bal = Number(
        (remainingBalance - currentExpense).toFixed(2)
      );
      console.log("gbud_remaining_bal Calculation:", {
        remainingBalance,
        currentExpense,
        gbud_actual_expense: values.gbud_actual_expense,
        gbud_proposed_budget: values.gbud_proposed_budget,
        gbud_remaining_bal,
      });
    }

    const payload = {
      gbud_num: gbud_num,
      budgetData: {
        ...values,
        gbud_proposed_budget:
          values.gbud_type === "Income" ? null : normalizeNumericInput(values.gbud_proposed_budget),
        gbud_actual_expense:
          values.gbud_type === "Income" ? null : normalizeNumericInput(values.gbud_actual_expense),
        gbud_inc_amt:
          values.gbud_type === "Income" ? normalizeNumericInput(values.gbud_inc_amt) : null,
        gbud_inc_particulars:
          values.gbud_type === "Income" ? values.gbud_inc_particulars || null : null,
        gbud_exp_particulars:
          values.gbud_type === "Expense" ? values.gbud_exp_particulars || null : null,
        gbud_reference_num: values.gbud_reference_num || null,
        gbudy: currentYearBudget.gbudy_num,
        gbud_files: undefined,
        gdb_id: values.gdb_id || null,
        gbud_remaining_bal,
      },
      files: mediaFiles.filter((file) => file.status === "uploaded" && file.publicUrl),
      filesToDelete: [],
    };

    console.log("Submission payload:", JSON.stringify(payload, null, 2));

    updateBudget(payload, {
      onSuccess: () => {
        setIsEditing(false);
        router.back();
      },
      onError: (error: any) => {
        console.error("Error updating budget:", error.response?.data || error.message);
        if (error.response?.data) {
          Object.entries(error.response.data).forEach(([field, messages]) => {
            form.setError(field as keyof FormValues, {
              type: "manual",
              message: Array.isArray(messages) ? messages[0] : messages,
            });
          });
        } else {
          form.setError("root", {
            type: "manual",
            message: error.message || "Failed to update entry. Please check all fields and try again.",
          });
        }
      },
    });
  };

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">{isEditing ? "Edit Budget Entry" : "View Budget Entry"}</Text>}
      showExitButton={false}
      headerAlign="left"
      scrollable={true}
      keyboardAvoiding={true}
      contentPadding="medium"
      loading={isPending}
      loadingMessage="Updating entry..."
      footer={
        <View className="px-4 pb-4">
          {!isEditing ? (
            <Button
              onPress={() => setIsEditing(true)}
              className="bg-primaryBlue py-3 rounded-lg"
            >
              <Text className="text-white text-base font-semibold">Edit</Text>
            </Button>
          ) : (
            <View className="flex-row gap-2">
              <Button
                onPress={() => {
                  setIsEditing(false);
                  form.reset(initialFormValues);
                }}
                className="flex-1 bg-white border border-primaryBlue py-3 rounded-lg"
              >
                <Text className="text-primaryBlue text-base font-semibold">Cancel</Text>
              </Button>
              <ConfirmationModal
                trigger={
                  <Button
                    className="flex-1 bg-primaryBlue py-3 rounded-lg flex-row justify-center items-center"
                    disabled={isPending || isUploading || !!fileUploadError}
                  >
                    {isPending || isUploading ? (
                      <>
                        <Loader2 size={20} color="white" className="animate-spin mr-2" />
                        <Text className="text-white text-sm font-semibold">
                          {isUploading ? "Uploading files..." : "Saving..."}
                        </Text>
                      </>
                    ) : (
                      <Text className="text-white text-sm font-semibold">Save</Text>
                    )}
                  </Button>
                }
                title="Confirm Save"
                description="Are you sure you want to save these changes?"
                actionLabel="Confirm"
                onPress={() => form.handleSubmit(onSubmit)()}
              />
            </View>
          )}
          {!form.formState.isValid && isEditing && (
            <Text className="text-red-500 text-xs mt-2">
              Please fill out all required fields correctly.
            </Text>
          )}
          {form.formState.errors.root && (
            <Text className="text-red-500 text-xs mt-2">
              {form.formState.errors.root.message}
            </Text>
          )}
          {form.formState.errors.gbud_files && (
            <Text className="text-red-500 text-xs mt-2">
              {form.formState.errors.gbud_files.message}
            </Text>
          )}
          {fileUploadError && (
            <Text className="text-red-500 text-xs mt-2">{fileUploadError}</Text>
          )}
        </View>
      }
      stickyFooter={true}
    >
      <View className="flex-1 px-4">
        <View className="space-y-4">
          <View className="relative">
            <FormSelect
              control={form.control}
              name="gbud_type"
              label="Entry Type"
              options={[
                { label: "Income", value: "Income" },
                { label: "Expense", value: "Expense" },
              ]}
              disabled={true}
            />
          </View>

          <View className="relative">
            <FormDateAndTimeInput
              control={form.control}
              name="gbud_datetime"
              label={`Date (${year} only)`}
              editable={isEditing}
            />
          </View>

          <View className="relative">
            <FormInput
              control={form.control}
              name="gbud_add_notes"
              label="Description"
              placeholder="Additional notes"
              editable={isEditing}
            />
          </View>

          {typeWatch === "Income" ? (
            <>
              <View className="relative">
                <Controller
                  control={form.control}
                  name="gbud_inc_particulars"
                  render={({ field, fieldState }) => (
                    <View className="mb-2">
                      <Text className="text-sm font-medium mb-2">Income Particulars</Text>
                      <TouchableOpacity
                        onPress={() => isEditing && setShowIncomeParticularsModal(true)}
                        className={`border rounded-lg p-3 ${
                          fieldState.error ? "border-red-500" : "border-gray-300"
                        }`}
                        disabled={!isEditing}
                      >
                        <Text className={field.value ? "text-black" : "text-gray-500"}>
                          {field.value || "Select income..."}
                        </Text>
                      </TouchableOpacity>
                      {fieldState.error && (
                        <Text className="text-red-500 text-xs mt-1">
                          {fieldState.error.message}
                        </Text>
                      )}
                    </View>
                  )}
                />
              </View>

              <Modal
                visible={showIncomeParticularsModal}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setShowIncomeParticularsModal(false)}
              >
                <View className="p-4 flex-1">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold">Select Income Particulars</Text>
                    <Button
                      onPress={() => setShowIncomeParticularsModal(false)}
                      className="bg-gray-200 py-1 rounded-lg"
                    >
                      <Text>Close</Text>
                    </Button>
                  </View>

                  <TextInput
                    placeholder="Search income particulars..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    className="border border-gray-300 rounded-lg p-3 mb-4"
                  />

                  {incomeParticularsLoading ? (
                    <Text>Loading...</Text>
                  ) : (
                    <ScrollView>
                      {filteredIncomeParticulars.length > 0 ? (
                        filteredIncomeParticulars.map((particular, index) => (
                          <TouchableOpacity
                            key={index}
                            onPress={() => handleSelectIncomeParticular(particular)}
                            className="p-3 border-b border-gray-200"
                          >
                            <Text>{particular}</Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View className="p-3">
                          <Text>No matching particulars found</Text>
                          <TouchableOpacity
                            onPress={() => {
                              form.setValue("gbud_inc_particulars", searchTerm);
                              setShowIncomeParticularsModal(false);
                            }}
                            className="mt-4 flex items-center bg-blue-500 p-3 rounded-lg"
                          >
                            <Text className="text-white text-center">Use "{searchTerm}" as new particular</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </ScrollView>
                  )}
                </View>
              </Modal>

              <View className="relative">
                <FormInput
                  control={form.control}
                  name="gbud_inc_amt"
                  label="Income Amount"
                  keyboardType="numeric"
                  placeholder="0.00"
                  editable={isEditing}
                />
              </View>

              <View className="relative">
                <FormInput
                  control={form.control}
                  name="gbud_reference_num"
                  label="Reference Number"
                  placeholder="Reference number"
                  editable={isEditing}
                />
              </View>
            </>
          ) : (
            <>
              <View className="relative">
                <FormSelect
                  control={form.control}
                  name="gbud_exp_particulars"
                  label="Expense Particulars"
                  options={expenseItems.map((item) => ({
                    label: item.gdb_name,
                    value: item.gdb_name,
                  }))}
                  onSelect={(value: string) => {
                    const selected = expenseItems.find((item) => item.gdb_name === value);
                    form.setValue("gdb_id", selected?.gdb_id || null);
                    form.setValue("gbud_exp_particulars", value);
                  }}
                  disabled={!isEditing}
                />
              </View>

              <View className="relative">
                <FormInput
                  control={form.control}
                  name="gbud_proposed_budget"
                  label="Proposed Budget"
                  keyboardType="numeric"
                  placeholder="0.00"
                  editable={isEditing}
                />
              </View>

              <View className="relative">
                <FormInput
                  control={form.control}
                  name="gbud_actual_expense"
                  label="Actual Expense"
                  keyboardType="numeric"
                  placeholder="0.00"
                  editable={isEditing}
                />
              </View>

              <View className="relative">
                <FormInput
                  control={form.control}
                  name="gbud_reference_num"
                  label="Reference Number"
                  placeholder="Reference number"
                  editable={isEditing}
                />
              </View>

              <View className="mb-6 relative">
                <Text className="text-sm font-medium mb-2">Supporting Document</Text>
                <MultiImageUploader
                  mediaFiles={mediaFiles}
                  setMediaFiles={setMediaFiles}
                  maxFiles={5}
                  hideRemoveButton={!isEditing}
                  editable={isEditing}
                />
              </View>
            </>
          )}

          {currentYearBudget && (
            <View className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-2">
              <View className="flex-row justify-between mb-2">
                <Text className="font-medium">Current Budget:</Text>
                <Text>₱{Number(currentYearBudget.gbudy_budget).toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="font-medium">Total Expenses:</Text>
                <Text>₱{Number(currentYearBudget.gbudy_expenses).toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="font-medium">Total Income:</Text>
                <Text>₱{Number(currentYearBudget?.gbudy_income || 0).toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="font-bold">Remaining Balance:</Text>
                <Text className="font-bold">₱{remainingBalance.toLocaleString()}</Text>
              </View>

              {(actualExpenseWatch || proposedBudgetWatch) && (
                <View className="mt-4">
                  <View className="flex-row justify-between">
                    <Text className="font-medium">After This Entry:</Text>
                    <Text
                      className={((Number(actualExpenseWatch) || Number(proposedBudgetWatch)) || 0) > remainingBalance ? "text-red-500" : ""}
                    >
                      ₱{(remainingBalance - (Number(actualExpenseWatch) || Number(proposedBudgetWatch) || 0)).toLocaleString()}
                    </Text>
                  </View>
                  {((Number(actualExpenseWatch) || Number(proposedBudgetWatch)) || 0) > remainingBalance && (
                    <Text className="mt-1 text-red-500 text-xs">
                      Warning: This expense will exceed your remaining budget!
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </_ScreenLayout>
  );
}

export default GADViewEditEntryForm;
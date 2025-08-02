import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateAndTimeInput } from "@/components/ui/form/form-date-time-input";
import { useExpenseParticulars, useIncomeParticulars, useGADBudgetEntry } from "./queries/fetch";
import { useGetGADYearBudgets } from "./queries/yearqueries";
import { useUpdateGADBudget } from "./queries/update";
import MultiImageUploader, { MediaFileType } from "@/components/ui/multi-media-upload";
import BudgetTrackerSchema from "@/form-schema/gad-budget-tracker-schema";
import { ChevronLeft, Loader2 } from "lucide-react-native";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import PageLayout from "@/screens/_PageLayout";
import { FormValues } from "./bt-types";

function GADViewEditEntryForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.budYear as string;
  const gbud_num = Number(params.gbud_num) || undefined;

  const [isEditing, setIsEditing] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>([]);
  const [removedFiles, setRemovedFiles] = useState<string[]>([]);
  const [showIncomeParticularsModal, setShowIncomeParticularsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data hooks
  const { data: yearBudgets, isLoading: yearBudgetsLoading, refetch: refetchYearBudgets } = useGetGADYearBudgets();
  const { data: budgetEntry, isLoading: entryLoading } = useGADBudgetEntry(gbud_num);
  const { data: expenseItems = [] } = useExpenseParticulars();
  const { data: incomeParticulars = [], isLoading: incomeParticularsLoading } = useIncomeParticulars(year);
  const { mutate: updateBudget } = useUpdateGADBudget(yearBudgets || []);

  const isUploading = mediaFiles.some((file) => file.status === "uploading");

  // Calculate remaining balance
  const calculateRemainingBalance = (): number => {
    if (!yearBudgets || !year) return 0;

    const currentYearBudget = yearBudgets.find((b) => b.gbudy_year === year);
    if (!currentYearBudget) return 0;

    const initialBudget = Number(currentYearBudget.gbudy_budget) || 0;
    const totalExpenses = Number(currentYearBudget.gbudy_expenses) || 0;
    const currentExpense = budgetEntry?.gbud_type === "Expense"
      ? Number(budgetEntry.gbud_amount) || 0
      : 0;

    return initialBudget - (totalExpenses - currentExpense);
  };

  const remainingBalance = calculateRemainingBalance();

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(BudgetTrackerSchema),
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
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (budgetEntry && yearBudgets) {
      const formattedDate = budgetEntry.gbud_datetime
        ? budgetEntry.gbud_datetime
        : new Date().toISOString();

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

      form.reset(formValues);

      if (budgetEntry.files?.length) {
        const files = budgetEntry.files.map((file) => ({
          id: `existing-${file.gbf_id}`,
          name: file.gbf_name || `file-${file.gbf_id}`,
          type: file.gbf_type || "image",
          uri: file.gbf_url || "",
          path: file.gbf_path || "",
          publicUrl: file.gbf_url || "",
          status: "uploaded" as const,
        }));
        setMediaFiles(files);
        setRemovedFiles([]);
      } else {
        setMediaFiles([]);
        setRemovedFiles([]);
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
  const typeWatch = form.watch("gbud_type");
  const actualExpenseWatch = form.watch("gbud_actual_expense");
  const proposedBudgetWatch = form.watch("gbud_proposed_budget");

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
  }, [form, remainingBalance, typeWatch, actualExpenseWatch, proposedBudgetWatch]);

  const filteredIncomeParticulars = incomeParticulars.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectIncomeParticular = (particular: string) => {
    form.setValue("gbud_inc_particulars", particular);
    setShowIncomeParticularsModal(false);
    setSearchTerm("");
  };

  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    const inputDate = new Date(values.gbud_datetime);
    const inputYear: string = inputDate.getFullYear().toString();

    if (inputYear !== year) {
      form.setError("gbud_datetime", {
        type: "manual",
        message: `Date must be in ${year}`,
      });
      setIsSubmitting(false);
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
        setIsSubmitting(false);
        return;
      }
    }

    const invalidFiles = mediaFiles.filter((file) => file.status !== "uploaded" || !file.publicUrl);
    if (invalidFiles.length > 0) {
      form.setError("gbud_files", {
        type: "manual",
        message: `Some files are not uploaded: ${invalidFiles.map((f) => f.name).join(", ")}`,
      });
      setIsSubmitting(false);
      return;
    }

    const newRemainingBalance = values.gbud_type === "Expense"
      ? remainingBalance - (values.gbud_actual_expense || 0)
      : null;

  if (typeof gbud_num !== "number") {
    return;
  }
    const payload = {
      gbud_num,
      budgetData: {
        ...values,
        gbud_proposed_budget: values.gbud_type === "Income" ? null : values.gbud_proposed_budget,
        gbud_actual_expense: values.gbud_type === "Income" ? null : values.gbud_actual_expense,
        gbud_inc_amt: values.gbud_type === "Income" ? values.gbud_inc_amt : null,
        gbud_inc_particulars: values.gbud_type === "Income" ? values.gbud_inc_particulars : null,
        gbud_exp_particulars: values.gbud_type === "Expense" ? values.gbud_exp_particulars : null,
        gbud_reference_num: values.gbud_reference_num,
        gbudy: currentYearBudget?.gbudy_num,
        gbud_files: undefined,
        gdb_id: values.gdb_id,
        gbud_remaining_bal: newRemainingBalance,
      },
      files: mediaFiles.filter((file) => file.status === "uploaded" && file.publicUrl),
      filesToDelete: removedFiles.filter(id => id.startsWith("existing-")).map(id => id.replace("existing-", "")),
      remainingBalance: currentYearBudget?.gbud_remaining_bal ?? 0,
    };

    updateBudget(payload, {
      onSuccess: () => {
        setIsSubmitting(false);
        setIsEditing(false);
        refetchYearBudgets();
        router.back();
      },
      onError: (error: any) => {
        setIsSubmitting(false);
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

  if (entryLoading || yearBudgetsLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading budget data...</Text>
      </View>
    );
  }

  if (!budgetEntry || !yearBudgets) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>No budget entry found or error loading data.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentYearBudget = yearBudgets.find((b) => b.gbudy_year === year);
  if (!currentYearBudget) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error: No budget found for year {year}</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initialFormValues = form.getValues();

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" />
        </TouchableOpacity>
      }
      headerTitle={<Text>{isEditing ? "Edit Budget Entry" : "View Budget Entry"}</Text>}
      rightAction={
        <View />
      }
    >
      <ScrollView className="flex-1 p-4 pb-24">
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
                    <TouchableOpacity 
                      onPress={() => setShowIncomeParticularsModal(false)}
                      className="bg-gray-200 px-3 py-1 rounded"
                    >
                      <Text>Close</Text>
                    </TouchableOpacity>
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
                            className="mt-4 bg-blue-500 p-3 rounded-lg"
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
      </ScrollView>

      {/* Sticky footer buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        {!isEditing ? (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            className="bg-primaryBlue py-3 rounded-lg"
          >
            <Text className="text-white text-base font-semibold text-center">Edit</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => {
                setIsEditing(false);
                form.reset(initialFormValues);
              }}
              className="flex-1 bg-white border border-primaryBlue py-3 rounded-lg"
            >
              <Text className="text-primaryBlue text-base font-semibold text-center">Cancel</Text>
            </TouchableOpacity>
            
            <ConfirmationModal
              trigger={
                <TouchableOpacity
                  className="flex-1 bg-primaryBlue py-3 rounded-lg flex-row justify-center items-center"
                  disabled={isSubmitting || isUploading || !!fileUploadError}
                >
                  {isSubmitting || isUploading ? (
                    <>
                      <Loader2 size={20} color="white" className="animate-spin mr-2" />
                      <Text className="text-white text-sm font-semibold">
                        {isUploading ? "Uploading files..." : "Saving..."}
                      </Text>
                    </>
                  ) : (
                    <Text className="text-white text-sm font-semibold">Save</Text>
                  )}
                </TouchableOpacity>
              }
              title="Confirm Save"
              description="Are you sure you want to save these changes?"
              actionLabel="Confirm"
              onPress={() => form.handleSubmit(onSubmit)()}
            />
          </View>
        )}
        
        {!form.formState.isValid && isEditing && (
          <Text className="text-red-500 text-xs mt-2 text-center">
            Please fill out all required fields correctly.
          </Text>
        )}
        {form.formState.errors.root && (
          <Text className="text-red-500 text-xs mt-2 text-center">
            {form.formState.errors.root.message}
          </Text>
        )}
        {form.formState.errors.gbud_files && (
          <Text className="text-red-500 text-xs mt-2 text-center">
            {form.formState.errors.gbud_files.message}
          </Text>
        )}
        {fileUploadError && (
          <Text className="text-red-500 text-xs mt-2 text-center">{fileUploadError}</Text>
        )}
      </View>
    </PageLayout>
  );
}
export default GADViewEditEntryForm;
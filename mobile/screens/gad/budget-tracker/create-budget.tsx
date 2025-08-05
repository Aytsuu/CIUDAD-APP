import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateAndTimeInput } from "@/components/ui/form/form-date-time-input";
import { useExpenseParticulars, useIncomeParticulars } from "./queries/fetch";
import { useGetGADYearBudgets } from "./queries/yearqueries";
import { useCreateGADBudget } from "./queries/add";
import _ScreenLayout from "@/screens/_ScreenLayout";
import MultiImageUploader, { MediaFileType } from '@/components/ui/multi-media-upload';
import BudgetTrackerSchema from "@/form-schema/gad-budget-tracker-schema";
import PageLayout from "@/screens/_PageLayout";
import { FormValues } from "./bt-types";

function GADAddEntryForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.budYear as string;
  const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>([]);
  const [showIncomeParticularsModal, setShowIncomeParticularsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: yearBudgets = [] } = useGetGADYearBudgets();
  const { data: expenseItems = [] } = useExpenseParticulars();
  const { data: incomeParticulars = [], isLoading: incomeParticularsLoading } = useIncomeParticulars(year);
  const { mutate: createBudget } = useCreateGADBudget(yearBudgets, []);

  if (!year) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Error: Year parameter is required</Text>
        <Button onPress={() => router.back()}>
          <Text>Go Back</Text>
        </Button>
      </View>
    );
  }

  const currentYearBudget = yearBudgets.find((b) => b.gbudy_year === year);

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
    if (!currentYearBudget) return 0;
    return (
      Number(currentYearBudget.gbudy_budget) -
      Number(currentYearBudget.gbudy_expenses)
    );
  };

  const remainingBalance = calculateRemainingBalance();

  const form = useForm<FormValues>({
    resolver: zodResolver(BudgetTrackerSchema),
    defaultValues: {
      gbud_type: "Expense",
      gbud_datetime: new Date().toISOString(),
      gbud_files: [],
      gbud_add_notes: null,
      gbud_inc_particulars: null,
      gbud_inc_amt: null,
      gbud_exp_particulars: null,
      gbud_proposed_budget: null,
      gbud_actual_expense: null,
      gbud_reference_num: null,
      gbud_remaining_bal: null,
      gbudy: currentYearBudget.gbudy_num,
      gdb_id: null,
    },
  });

  useEffect(() => {
    form.setValue('gbud_files', mediaFiles.map(file => ({
      name: file.name,
      type: file.type,
      path: file.path,
      uri: file.publicUrl || file.uri,
    })));
  }, [mediaFiles, form]);

  const typeWatch = form.watch("gbud_type");
  const actualExpenseWatch = form.watch("gbud_actual_expense");
  const proposedBudgetWatch = form.watch("gbud_proposed_budget");
  const incomeParticularsWatch = form.watch("gbud_inc_particulars");

  const filteredIncomeParticulars = incomeParticulars.filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectIncomeParticular = (particular: string) => {
    form.setValue("gbud_inc_particulars", particular);
    setShowIncomeParticularsModal(false);
    setSearchTerm("");
  };

  const onSubmit = (values: FormValues) => {
    const inputDate = new Date(values.gbud_datetime);
    const inputYear = inputDate.getFullYear().toString();

    if (inputYear !== year) {
      form.setError('gbud_datetime', {
        type: 'manual',
        message: `Date must be in ${year}`,
      });
      return;
    }

    if (values.gbud_type === 'Expense') {
      if (
        values.gbud_actual_expense &&
        Number(values.gbud_actual_expense) > remainingBalance
      ) {
        form.setError('gbud_actual_expense', {
          type: 'manual',
          message: `Exceeds remaining balance of ₱${remainingBalance.toLocaleString()}`,
        });
        return;
      }
    }

    const payload = {
      budgetData: {
        ...values,
        gbud_proposed_budget: values.gbud_type === "Income" ? null : values.gbud_proposed_budget,
        gbud_actual_expense: values.gbud_type === "Income" ? null : values.gbud_actual_expense,
        gbud_inc_amt: values.gbud_type === "Income" ? values.gbud_inc_amt : "0.00",
        gbudy: currentYearBudget.gbudy_num,
        gbud_files: undefined,
      },
      files: values.gbud_files || [],
    };

    if (values.gbud_files && values.gbud_files.length > 0) {
      const invalidFiles = values.gbud_files.filter(file => !file.uri || !file.name || !file.type);
      if (invalidFiles.length > 0) {
        form.setError('gbud_files', {
          type: 'manual',
          message: 'All uploaded files must have valid name, type, and URI',
        });
        return;
      }
    }

    createBudget(payload, {
      onSuccess: () => router.back(),
      onError: (error) => {
        form.setError('root', {
          type: 'manual',
          message: 'Failed to save entry. Please check uploaded files and try again.',
        });
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
      headerBetweenAction={<Text className="text-[13px]">Create Budget Entry</Text>}
      showExitButton={false}
      headerAlign="left"
      scrollable={true}
      keyboardAvoiding={true}
      contentPadding="medium"
      loading={isPending}
      loadingMessage="Saving entry..."
      footer={
        <View className="px-4 pb-4">
          <Button
            onPress={form.handleSubmit(onSubmit)}
            className="bg-primaryBlue py-3 rounded-lg"
            disabled={isPending || !form.formState.isValid}
          >
            <Text className="text-white text-base font-semibold">
              {isPending ? "Saving..." : "Save Entry"}
            </Text>
          </Button>
          {!form.formState.isValid && (
            <Text className="text-red-500 text-xs mt-2">
              Please fill out all required fields correctly.
            </Text>
          )}
          {form.formState.errors.root && (
            <Text className="text-red-500 text-xs mt-2">
              {form.formState.errors.root.message}
            </Text>
          )}
        </View>
      }
      stickyFooter={true}
    >
      <View className="flex-1 px-4">
        <View className="space-y-4">
          <FormSelect
            control={form.control}
            name="gbud_type"
            label="Entry Type"
            options={[
              { label: "Income", value: "Income" },
              { label: "Expense", value: "Expense" },
            ]}
          />

          <FormDateAndTimeInput
            control={form.control}
            name="gbud_datetime"
            label={`Date (${year} only)`}
          />

          <FormInput
            control={form.control}
            name="gbud_add_notes"
            label="Description"
            placeholder="Additional notes"
          />

          {typeWatch === "Income" ? (
            <>
              <Controller
                control={form.control}
                name="gbud_inc_particulars"
                render={({ field, fieldState }) => (
                  <View className="mb-4">
                    <Text className="text-sm font-medium mb-1">Income Particulars</Text>
                    <TouchableOpacity 
                      onPress={() => setShowIncomeParticularsModal(true)}
                      className={`border rounded-lg p-3 ${
                        fieldState.error ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <Text className={field.value ? "text-black" : "text-gray-400"}>
                        {field.value || "Select income particulars..."}
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
                      className="bg-gray-200 px-3 py-1 rounded"
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

              <FormInput
                control={form.control}
                name="gbud_inc_amt"
                label="Income Amount"
                keyboardType="numeric"
                placeholder="0.00"
              />
            </>
          ) : (
            <>
              <FormSelect
                control={form.control}
                name="gbud_exp_particulars"
                label="Expense Particulars"
                options={expenseItems.map((item) => ({
                  label: item.gdb_name,
                  value: item.gdb_name,
                }))}
              />

              <FormInput
                control={form.control}
                name="gbud_proposed_budget"
                label="Proposed Budget"
                keyboardType="numeric"
                placeholder="0.00"
              />

              <FormInput
                control={form.control}
                name="gbud_actual_expense"
                label="Actual Expense"
                keyboardType="numeric"
                placeholder="0.00"
              />

              <FormInput
                control={form.control}
                name="gbud_reference_num"
                label="Reference Number"
                placeholder="Optional reference number"
              />

              <View className="mb-6 border border-dashed border-gray-300 rounded-lg p-4">
                <Text className="text-sm font-medium mb-2">Supporting Document</Text>
                <MultiImageUploader
                  mediaFiles={mediaFiles}
                  setMediaFiles={setMediaFiles}
                  maxFiles={5}
                />
              </View>
            </>
          )}

          {currentYearBudget && (
            <View className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="font-medium">Current Budget:</Text>
                <Text>
                  ₱{Number(currentYearBudget.gbudy_budget).toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="font-medium">Total Expenses:</Text>
                <Text>
                  ₱{Number(currentYearBudget.gbudy_expenses).toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="font-medium">Total Income:</Text>
                <Text>
                  ₱{Number(currentYearBudget.gbudy_income).toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between font-bold">
                <Text>Remaining Balance:</Text>
                <Text>₱{remainingBalance.toLocaleString()}</Text>
              </View>

              {(actualExpenseWatch || proposedBudgetWatch) && (
                <View className="mt-3">
                  <View className="flex-row justify-between">
                    <Text className="font-medium">After This Entry:</Text>
                    <Text
                      className={
                        (Number(actualExpenseWatch) || 0) > remainingBalance
                          ? "text-red-500"
                          : ""
                      }
                    >
                      ₱
                      {(
                        remainingBalance - (Number(actualExpenseWatch) || 0)
                      ).toLocaleString()}
                    </Text>
                  </View>
                  {(Number(actualExpenseWatch) || 0) > remainingBalance && (
                    <Text className="mt-1 text-red-500 font-medium">
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

export default GADAddEntryForm;
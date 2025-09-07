import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, ActivityIndicator, FlatList } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateAndTimeInput } from "@/components/ui/form/form-date-time-input";
import { useGADBudgetEntry } from "./queries/btracker-fetch";
import { useGetGADYearBudgets } from "./queries/btracker-yearqueries";
import { useUpdateGADBudget } from "./queries/btracker-update";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import BudgetTrackerSchema, { FormValues } from "@/form-schema/gad-budget-tracker-schema";
import PageLayout from "@/screens/_PageLayout";
import { useProjectProposalsAvailability } from "./queries/btracker-fetch";

function GADViewEditEntryForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.budYear as string;
  const gbud_num = Number(params.gbud_num) || undefined;
  const [isEditing, setIsEditing] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: projectProposals } = useProjectProposalsAvailability(year);
  const [displayItems, setDisplayItems] = useState<{ name: string; pax: string; amount: number }[]>([]);

  // Data hooks
  const { data: yearBudgets, isLoading: yearBudgetsLoading, refetch: refetchYearBudgets } = useGetGADYearBudgets();
  const { data: budgetEntry, isLoading: entryLoading } = useGADBudgetEntry(gbud_num);
  const { mutate: updateBudget } = useUpdateGADBudget(yearBudgets || []);

  const calculateRemainingBalance = (): number => {
    if (!yearBudgets || !year) return 0;
    const currentYearBudget = yearBudgets.find((b) => b.gbudy_year === year);
    if (!currentYearBudget) return 0;
    const initialBudget = Number(currentYearBudget.gbudy_budget) || 0;
    const totalExpenses = Number(currentYearBudget.gbudy_expenses) || 0;
    return initialBudget - totalExpenses;
  };

  const remainingBalance = calculateRemainingBalance();

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(BudgetTrackerSchema),
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

  // Populate form when data is loaded
  useEffect(() => {
    if (budgetEntry && yearBudgets) {
      const formattedDate = budgetEntry.gbud_datetime
        ? new Date(budgetEntry.gbud_datetime).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16);

    const matchingProject = projectProposals?.find(
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
    setDisplayItems(recordedItems);
      
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

      // Set media files if they exist
      if (budgetEntry.files?.length) {
        const files = budgetEntry.files.map((file) => ({
          id: file.gbf_id.toString(),
          name: file.gbf_name || `file_${file.gbf_id}`,
          type: file.gbf_type || 'image/jpeg',
          uri: file.gbf_url || '',
          file: '', // This will be populated if we need to re-upload
        }));
        setMediaFiles(files);
      }
    }
  }, [budgetEntry, yearBudgets, year, form, remainingBalance]);

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


const onSubmit = async (values: FormValues) => {
  setIsSubmitting(true);
  const inputDate = new Date(values.gbud_datetime);
  const inputYear = inputDate.getFullYear().toString();

  if (inputYear !== year) {
    form.setError("gbud_datetime", {
      type: "manual",
      message: `Date must be in ${year}`,
    });
    setIsSubmitting(false);
    return;
  }

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

  const files = mediaFiles
    .filter(media => media.file && media.file.length > 0)
    .map((media) => ({
      id: media.id,
      name: media.name || `image_${Date.now()}.jpg`,
      type: media.type || 'image/jpeg',
      file: media.file?.startsWith('data:') ? media.file : `data:${media.type || 'image/jpeg'};base64,${media.file}`,
      uri: media.uri,
    }));

  const initialFiles = budgetEntry?.files || [];
  const currentFileIds = mediaFiles.map(file => file.id);
  const filesToDelete = initialFiles
    .filter(file => !currentFileIds.includes(file.gbf_id.toString()))
    .map(file => ({
      id: file.gbf_id.toString(),
      path: file.gbf_path || `images/file_${file.gbf_id}`,
    }));

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

  try {
    await updateBudget(
      { gbud_num, budgetData, files, filesToDelete },
      {
        onSuccess: () => {
          refetchYearBudgets();
          setIsEditing(false);
          router.back();
        },
        onError: (error) => {
          setIsSubmitting(false);
        },
      }
    );
  } catch (error) {
    setIsSubmitting(false);
  }
};

  if (entryLoading || yearBudgetsLoading) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={30} color="black" />
          </TouchableOpacity>
        }
        headerTitle={<Text>Loading...</Text>}
        rightAction={<View />}
      >
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
        </View>
      </PageLayout>
    );
  }

  if (!budgetEntry || !yearBudgets) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={30} color="black" />
          </TouchableOpacity>
        }
        headerTitle={<Text>Error</Text>}
        rightAction={<View />}
      >
        <View className="flex-1 justify-center items-center">
          <Text>No budget entry found or error loading data.</Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" />
        </TouchableOpacity>
      }
      headerTitle={<Text>{isEditing ? "Edit Budget Entry" : "View Budget Entry"}</Text>}
      rightAction={<View />}
    >
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="space-y-4">  
          <View className="flex-1">
            <FormDateAndTimeInput
              control={form.control}
              name="gbud_datetime"
              label={`Date (${year} only)`}
              editable={isEditing}
            />
          </View>

          <View className="flex-1 mb-4">
              <Controller
                control={form.control}
                name="gbud_exp_project"
                render={({ field, fieldState }) => (
                  <View>
                    <Text className="text-[12px] font-PoppinsRegular">
                      Project Title
                    </Text>
                    <TextInput
                      value={field.value}
                      onChangeText={field.onChange}
                      className={`border rounded p-3 text-[12px] font-PoppinsRegular text-gray-400 ${
                        fieldState.error ? "border-red-500" : "border-gray-300"
                      }`}
                      editable={false}
                      placeholder="Enter project title"
                    />
                  </View>
                )}
              />      
          </View>

          {/* Description */}
          <FormInput
            control={form.control}
            name="gbud_add_notes"
            label="Description"
            placeholder="Enter related information (if any)"
            editable={isEditing}
          />

          {(
            <>
              {/* Budget Items Section */}
              <View>
                <Text className="text-[12px] font-PoppinsRegular mb-2">
                  Budget Items
                </Text>
                {(budgetEntry.gbud_exp_particulars || []).length > 0 ? (
                  <View className="border rounded-lg border-gray-300">
                    {displayItems.map((item, index)  => (
                      <View
                        key={`${item.name}-${index}`}
                        className={`flex-row justify-between items-center p-3 ${
                          index !== (budgetEntry.gbud_exp_particulars || []).length - 1
                            ? "border-b border-gray-300"
                            : ""
                        }`}
                      >
                        <View className="flex-1">
                          <Text className="text-[12px] font-PoppinsRegular text-gray-400">{item.name}</Text>
                          <Text className="text-[12px] font-PoppinsRegular text-gray-400">{item.pax}</Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-[12px] font-PoppinsRegular text-gray-400 mr-4">
                            ₱{parseFloat(item.amount.toString()).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="border border-dashed border-gray-300 rounded-lg p-4 items-center">
                    <Text className="text-gray-400">No budget items</Text>
                  </View>
                )}
              </View>

              {/* Proposed Budget */}
              <View className="mt-4 mb-4">
                <Text className="text-[12px] font-PoppinsRegular">
                  Proposed Budget
                </Text>
                <View className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <Text className="text-[12px] font-PoppinsRegular">
                    ₱{(form.watch("gbud_proposed_budget") || 0).toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Actual Expense */}
              <FormInput
                control={form.control}
                name="gbud_actual_expense"
                label="Actual Expense"
                keyboardType="numeric"
                editable={isEditing}
              />

              {/* Reference Number */}
              <FormInput
                control={form.control}
                name="gbud_reference_num"
                label="Reference Number"
                placeholder="Enter reference number"
                editable={isEditing}
              />

              {/* Supporting Documents */}
              <View className="mt-4">
                <Text className="text-sm font-medium mb-1">
                  Supporting Documents
                </Text>
                <MediaPicker
                  selectedImages={mediaFiles}
                  setSelectedImages={setMediaFiles}
                  multiple={true}
                  maxImages={5}
                  editable={isEditing}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        {!isEditing ? (
          <TouchableOpacity
            className="bg-blue-500 py-3 rounded-lg"
            onPress={() => setIsEditing(true)}
          >
            <Text className="text-white text-base font-semibold text-center">
              Edit Entry
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              className="bg-blue-500 py-3 rounded-lg mb-2"
              onPress={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <View className="flex-row justify-center items-center">
                <Text className="text-white text-base font-semibold">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Text>
                {isSubmitting && (
                  <ActivityIndicator size="small" color="white" className="ml-2" />
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-gray-200 py-3 rounded-lg"
              onPress={() => setIsEditing(false)}
              disabled={isSubmitting}
            >
              <Text className="text-gray-800 text-base font-semibold text-center">
                Cancel
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </PageLayout>
  );
}
export default GADViewEditEntryForm;
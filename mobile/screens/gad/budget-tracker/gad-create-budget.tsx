import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, X } from "lucide-react-native";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateAndTimeInput } from "@/components/ui/form/form-date-time-input";
import {
  useGADBudgets,
  useProjectProposalsAvailability,
} from "./queries/btracker-fetch";
import { useGetGADYearBudgets } from "./queries/btracker-yearqueries";
import { useCreateGADBudget } from "./queries/btracker-add";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import BudgetTrackerSchema, {
  FormValues,
} from "@/form-schema/gad-budget-tracker-schema";
import PageLayout from "@/screens/_PageLayout";
import { removeLeadingZeros } from "./gad-btracker-types";
import { useAuth } from "@/contexts/AuthContext";
import { BudgetYear } from "./gad-btracker-types";
import { LoadingModal } from "@/components/ui/loading-modal";

function GADAddEntryForm() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.budYear as string;
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([]);
  const [selectedBudgetItems, setSelectedBudgetItems] = useState<
    { name: string; pax: string; amount: number }[]
  >([]);
  const [recordedBudgetItems, setRecordedBudgetItems] = useState<
    { name: string; pax: string; amount: number }[]
  >([]);
  const [showIncomeParticularsModal, setShowIncomeParticularsModal] =
    useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showBudgetItemsModal, setShowBudgetItemsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    data: yearBudgets,
    isLoading: yearBudgetsLoading,
    refetch: refetchYearBudgets,
  } = useGetGADYearBudgets();
  const { data: budgetEntriesData } = useGADBudgets(year || "");
  const budgetEntries = budgetEntriesData?.results || [];
  const { data: projectProposals, isLoading: projectProposalsLoading } =
    useProjectProposalsAvailability(year);
  const yearBudgetsArray = yearBudgets?.results || [];
  const {
    mutate: createBudget,
    isPending,
    error: _createError,
  } = useCreateGADBudget(yearBudgetsArray, budgetEntries);

  const calculateRemainingBalance = (): number => {
    if (!yearBudgets || !year) return 0;
    const currentYearBudget = yearBudgets.results?.find(
      (b: BudgetYear) => b.gbudy_year === year
    );
    if (!currentYearBudget) return 0;
    const initialBudget = Number(currentYearBudget.gbudy_budget) || 0;
    const totalExpenses = Number(currentYearBudget.gbudy_expenses) || 0;
    return initialBudget - totalExpenses;
  };

  const calculateProposedBudget = () => {
    return selectedBudgetItems
      .filter((item) => !recordedBudgetItems.some((r) => r.name === item.name))
      .reduce((sum, item) => {
        const pax = parseInt(item.pax) || 1;
        const amount = parseFloat(item.amount.toString()) || 0;
        return sum + amount * pax;
      }, 0);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(BudgetTrackerSchema),
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
      staff: user?.staff?.staff_id || '00001250924',
    },
    context: { calculateRemainingBalance },
  });

  const projectWatch = form.watch("gbud_exp_project");
  const remainingBalance = calculateRemainingBalance();
  const selectedProject = projectProposals?.find(
    (p) => p.gpr_title === projectWatch
  );

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

  useEffect(() => {
    if (yearBudgets && !yearBudgetsLoading) {
      const currentYearBudget = yearBudgets.results?.find(
      (b: BudgetYear) => b.gbudy_year === year
    );
      if (currentYearBudget) {
        form.setValue("gbudy", currentYearBudget.gbudy_num);
        form.setValue("gbud_remaining_bal", calculateRemainingBalance());
      }
    }
  }, [yearBudgets, yearBudgetsLoading, year]);

useEffect(() => {
  if (projectWatch && projectProposals) {
    const selectedProject = projectProposals.find(
      (p) => p.gpr_title === projectWatch
    );
    
    if (selectedProject && selectedProject.gpr_budget_items?.length > 0) {
      // recorded_items are just names, so we need to find the full objects
      const recordedItemNames = selectedProject.recorded_items || [];
      const recordedItems = recordedItemNames
        .map((name) =>
          selectedProject.gpr_budget_items.find((item) => item.name === name)
        )
        .filter((item): item is { name: string; pax: string; amount: number } => 
          item !== undefined
        );

      // unrecorded_items are already full objects
      const unrecordedItems = selectedProject.unrecorded_items || [];

      // Set recorded items (read-only)
      setRecordedBudgetItems(recordedItems);

      // Initialize with recorded items
      form.setValue("gbud_exp_particulars", recordedItems);
      setSelectedBudgetItems(recordedItems);

      // Auto-select single unrecorded item
      if (unrecordedItems.length === 1) {
        const newItems = [...recordedItems, ...unrecordedItems];
        form.setValue("gbud_exp_particulars", newItems);
        setSelectedBudgetItems(newItems);
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
    setShowBudgetItemsModal(false);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedBudgetItems((prev) => {
      const newItems = [...prev];
      newItems.splice(index, 1);
      form.setValue("gbud_exp_particulars", newItems);
      form.trigger("gbud_exp_particulars");
      return newItems;
    });
  };

  const hasUnrecordedItems = () => {
    return selectedBudgetItems.some(
      (item) =>
        !recordedBudgetItems.some((recorded) => recorded.name === item.name)
    );
  };

  const handleSelectProject = (projectTitle: string) => {
    form.setValue("gbud_exp_project", projectTitle);
    setShowProjectModal(false);
  };

  const availableBudgetItems =
    selectedProject?.unrecorded_items?.filter(
      (item) =>
        !selectedBudgetItems.some((selected) => selected.name === item.name)
    ) || [];

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

    const files = mediaFiles
      .filter((media) => media.file && media.file.length > 0)
      .map((media) => ({
        id: media.id,
        name: media.name || `image_${Date.now()}.jpg`,
        type: media.type || "image/jpeg",
        file: `data:${media.type || "image/jpeg"};base64,${media.file}`,
        uri: media.uri,
      }));

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
            router.back();
          },
          onError: (error) => {
            console.error("Submission error:", error);
            setIsSubmitting(false);
          },
        }
      );
    } catch (error) {
      console.error("Error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" />
        </TouchableOpacity>
      }
      headerTitle={<Text>Create Budget Entry</Text>}
      rightAction={<View />}
      footer={ <View >
          {/* {Object.keys(form.formState.errors).length > 0 && (
            <View className="mb-2 p-2 bg-red-50 rounded border border-red-200">
              <Text className="text-red-600 text-xs font-bold mb-1">
                Validation Errors:
              </Text>
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <Text key={field} className="text-red-500 text-xs">
                  {field}: {error?.message}
                </Text>
              ))}
            </View>
          )} */}
        <TouchableOpacity
          className="bg-blue-500 py-3 rounded-lg"
          onPress={form.handleSubmit(onSubmit)}
          disabled={
            isSubmitting ||
            !form.formState.isValid ||
            (!hasUnrecordedItems())
          }
        >
          <View className="flex-row justify-center items-center">
            <Text className="text-white text-base font-semibold">
              {isSubmitting ? "Saving..." : "Save Entry"}
            </Text>
            {isSubmitting && (
               <LoadingModal visible={isSubmitting} />
            )}
          </View>
        </TouchableOpacity>

        {!form.formState.isValid && (
          <Text className="text-red-500 text-xs mt-2 text-center">
            Please fill out all required fields correctly
          </Text>
        )}

        {!hasUnrecordedItems() && (
          <Text className="text-red-500 text-xs mt-2 text-center">
            Note: Add at least one new budget item to save
          </Text>
        )}
      </View>}
    >
      <ScrollView
        className="flex-1 p-4 px-6"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="space-y-4">
          <View className="flex-1">
            <FormDateAndTimeInput
              control={form.control}
              name="gbud_datetime"
              label={`Date (${year} only)`}
            />
          </View>

          {/* Project/Income Field */}
          <View className="flex-1 mb-4">
              <Controller
                control={form.control}
                name="gbud_exp_project"
                render={({ field, fieldState }) => (
                  <View>
                    <Text className="text-[12px] font-PoppinsRegular">
                      Project Title
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowProjectModal(true)}
                      className={`border rounded-lg p-3 ${
                        fieldState.error ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <Text
                        className={field.value ? "text-black" : "text-gray-400"}
                      >
                        {field.value || "Select project..."}
                      </Text>
                    </TouchableOpacity>
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
          />


              <View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-[12px] font-PoppinsRegular">
                    Budget Items
                  </Text>
                  {availableBudgetItems.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setShowBudgetItemsModal(true)}
                      className="bg-blue-500 px-3 py-1 rounded-lg"
                    >
                      <Text className="text-white">Add Item</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {selectedBudgetItems.length > 0 ? (
                  <View className="border rounded-lg border-gray-300">
                    {selectedBudgetItems.map((item, index) => {
                      const isRecorded = recordedBudgetItems.some(
                        (r) => r.name === item.name
                      );
                      return (
                        <View
                          key={`${item.name}-${index}`}
                          className={`flex-row justify-between items-center p-3 ${
                            index !== selectedBudgetItems.length - 1
                              ? "border-b border-gray-200"
                              : ""
                          }`}
                        >
                          <View className="flex-1">
                            <Text className="font-medium">
                              {item.name}
                              {isRecorded && (
                                <Text className="text-xs text-gray-400 ml-2">
                                  {" (Recorded)"}
                                </Text>
                              )}
                            </Text>
                            <Text className="text-sm text-gray-500">
                              {item.pax}
                            </Text>
                          </View>
                          <View className="flex-row items-center">
                            <Text className="mr-4">
                              {`₱${parseFloat(
                                item.amount?.toString() || "0"
                              ).toLocaleString()}`}
                            </Text>
                            {!isRecorded && (
                              <TouchableOpacity
                                onPress={() => handleRemoveItem(index)}
                              >
                                <X size={18} color="#ef4444" />
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View className="border border-dashed border-gray-300 rounded-lg p-4 items-center">
                    <Text className="text-gray-400">
                      {projectWatch
                        ? "No budget items added yet"
                        : "Select a project first"}
                    </Text>
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
                    {`₱${calculateProposedBudget().toLocaleString()}`}
                  </Text>
                </View>
              </View>

              {/* Actual Expense */}
              <FormInput
                control={form.control}
                name="gbud_actual_expense"
                label="Actual Expense"
                keyboardType="numeric"
              />

              {/* Reference Number */}
              <FormInput
                control={form.control}
                name="gbud_reference_num"
                label="Reference Number"
                placeholder="Enter reference number"
              />

              {/* Supporting Documents */}
              <View className="mt-4">
                <Text className="text-sm font-medium mb-1">
                  Supporting Documents
                </Text>
                <MediaPicker
                  selectedImages={mediaFiles}
                  setSelectedImages={setMediaFiles}
                  limit={5}
                />
              </View>
        </View>
      </ScrollView>

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
        </View>
      </Modal>

      <Modal
        visible={showProjectModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowProjectModal(false)}
      >
        <View className="p-4 flex-1">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold">Select Project</Text>
            <TouchableOpacity
              onPress={() => setShowProjectModal(false)}
              className="bg-gray-200 px-3 py-1 rounded"
            >
              <Text>Close</Text>
            </TouchableOpacity>
          </View>

          {projectProposalsLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            <FlatList
              data={projectProposals || []}
              keyExtractor={(item) => item.gpr_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectProject(item.gpr_title)}
                  className="p-3 border-b border-gray-200"
                >
                  <Text>{item.gpr_title}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="p-3">
                  <Text>No projects available</Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>

      <Modal
        visible={showBudgetItemsModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowBudgetItemsModal(false)}
      >
        <View className="p-4 flex-1">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold">Select Budget Items</Text>
            <TouchableOpacity
              onPress={() => setShowBudgetItemsModal(false)}
              className="bg-gray-200 px-3 py-1 rounded"
            >
              <Text>Close</Text>
            </TouchableOpacity>
          </View>

          {availableBudgetItems.length === 0 ? (
            <View className="p-3">
              <Text>No unrecorded budget items available</Text>
            </View>
          ) : (
            <FlatList
              data={availableBudgetItems}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleAddBudgetItem(item)}
                  className="p-3 border-b border-gray-200"
                >
                  <View className="flex-row justify-between">
                    <Text>{item.name}</Text>
                    <Text>₱{item.amount.toLocaleString()}</Text>
                  </View>
                  <Text className="text-sm text-gray-500">{item.pax}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>
    </PageLayout>
  );
}

export default GADAddEntryForm;

import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import {
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  CheckIcon,
} from "lucide-react-native";
import { ComplaintFormData } from "@/form-schema/complaint-schema";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { SearchableSelect } from "../search-layout";
import { useGetResidentLists } from "../api-operations/queries/ComplaintGetQueries";
import { useAuth } from "@/contexts/AuthContext";
import { useResidentSelection } from "@/contexts/ComplaintFormContext";
import { type DropdownOption,} from "@/components/ui/select-layout";

const GENDER_OPTIONS: DropdownOption[] = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
];

interface ResidentData {
  rp_id: number | string;
  name: string;
  age: number;
  gender: string;
  address?: string;
  profile_image?: string;
  number?: string;
}

interface AccusedProps {
  onNext: () => void;
  onPrev: () => void;
  isSubmitting?: boolean;
}

export const Accused: React.FC<AccusedProps> = memo(
  ({ onNext, onPrev, isSubmitting = false }) => {
    const { user } = useAuth();
    const { control, trigger, setValue } = useFormContext<ComplaintFormData>();
    const { fields, append, remove } = useFieldArray({
      control,
      name: "accused",
    });

    const [activeTab, setActiveTab] = useState(0);
    const initializedRef = useRef(false);

    const isStaff = !!user?.staff;

    const {
      data: residentsData,
      isLoading: isLoadingResidents,
      error,
    } = useGetResidentLists();

    // Get resident selection tracking
    const {
      selectedAccusedResidents,
      setSelectedAccusedResidents,
      selectedComplainantResidents,
    } = useResidentSelection();

    // Track selected residents whenever fields change
    useEffect(() => {
      const selectedIds = fields
        .map((field: any) => field.rp_id)
        .filter((id: any) => id !== null && id !== "");
      setSelectedAccusedResidents(selectedIds);
    }, [fields, setSelectedAccusedResidents]);

    // Prepare resident options for the dropdown
    const residentOptions = useMemo((): DropdownOption[] => {
      if (!residentsData) return [];

      return residentsData.map((resident: ResidentData) => {
        const residentId = resident.rp_id?.toString() || "";
        const isSelectedInComplainant =
          selectedComplainantResidents.includes(residentId);
        const isSelectedInOtherAccused =
          selectedAccusedResidents.includes(residentId) &&
          fields[activeTab]?.rp_id !== residentId;

        return {
          label: (
            <View className="flex-row items-center">
              <View className="flex-row items-center flex-1">
                <View className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-3">
                  {resident.profile_image ? (
                    <Image
                      source={{ uri: resident.profile_image }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full items-center justify-center bg-gray-300">
                      <Text className="text-xs text-gray-600">No Img</Text>
                    </View>
                  )}
                </View>

                <Text
                  className={`text-gray-800 font-medium ${
                    isSelectedInComplainant || isSelectedInOtherAccused
                      ? "text-gray-400"
                      : ""
                  }`}
                >
                  {resident.name}
                </Text>
              </View>

              {/* RIGHT SIDE: check icons */}
              {isSelectedInComplainant && (
                <View className="rounded-full bg-green-500 p-1 ml-2">
                  <CheckIcon size={12} color="#ffffff" />
                </View>
              )}

              {isSelectedInOtherAccused && (
                <View className="rounded-full bg-green-500 p-1 ml-2">
                  <CheckIcon size={12} color="#ffffff" />
                </View>
              )}
            </View>
          ),
          value: resident.rp_id?.toString() || "",
          disabled: isSelectedInComplainant || isSelectedInOtherAccused,
          data: {
            name: resident.name,
            age: resident.age,
            gender: resident.gender,
            address: resident.address || "Address not available",
            profile_image: resident.profile_image,
            number: resident.number,
          },
        };
      });
    }, [
      residentsData,
      selectedComplainantResidents,
      selectedAccusedResidents,
      activeTab,
      fields,
    ]);

    // Handle API errors
    useEffect(() => {
      if (error) {
        Alert.alert("Error", "Failed to load residents. Please try again.");
      }
    }, [error]);

    // Initialize with one empty accused for both staff and non-staff
    useEffect(() => {
      if (fields.length === 0 && !initializedRef.current) {
        initializedRef.current = true;
        append({
          acsd_name: "",
          acsd_gender: "",
          acsd_age: "",
          acsd_description: "",
          acsd_address: "",
          rp_id: null,
        });
        setActiveTab(0);
      }
    }, [fields.length, append]);

    // Handle resident selection - auto-fill fields
    const handleResidentSelect = useCallback(
      (index: number, residentId: string) => {
        const selected = residentsData?.find(
          (r: ResidentData) => r.rp_id?.toString() === residentId
        );
        if (!selected) return;

        setValue(`accused.${index}.acsd_name`, selected.name || "", {
          shouldValidate: true,
        });
        setValue(`accused.${index}.acsd_age`, selected.age?.toString() || "", {
          shouldValidate: true,
        });
        setValue(`accused.${index}.acsd_gender`, selected.gender, {
          shouldValidate: true,
        });
        setValue(
          `accused.${index}.acsd_address`,
          selected.address || "Address not available",
          { shouldValidate: true }
        );
      },
      [residentsData, setValue]
    );

    // Add new accused
    const addAccused = useCallback(() => {
      const newIndex = fields.length;
      append({
        acsd_name: "",
        acsd_gender: "",
        acsd_age: "",
        acsd_description: "",
        acsd_address: "",
        rp_id: null,
      });
      setActiveTab(newIndex);
    }, [append, fields.length]);

    // Remove accused
    const removeAccused = useCallback(
      (index: number) => {
        if (fields.length === 1) {
          Alert.alert("Cannot Remove", "At least one respondent is required.");
          return;
        }

        remove(index);
        setActiveTab(Math.max(0, index - 1));
      },
      [remove, fields.length]
    );

    // Handle next
    const handleNext = useCallback(async () => {
      const isValid = await trigger("accused");

      if (!isValid) {
        Alert.alert(
          "Validation Error",
          "Please complete all required respondent fields."
        );
        return;
      }

      onNext();
    }, [trigger, onNext]);

    // Show loading while initializing
    if (fields.length === 0) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="text-gray-600 mt-4">Initializing form...</Text>
        </View>
      );
    }

    return (
      <View className="flex-1 p-4">
        <View className="bg-white rounded-lg mb-10">
          <View className="flex-row items-center mb-2">
            <Text className="text-lg font-semibold text-gray-900">
              Respondent
            </Text>
          </View>
          <Text className="text-sm text-gray-600">
            Person identified as involved in the reported incident.
          </Text>
        </View>

        <View className="border border-gray-100">
          {/* Tabs Header with Add Button */}
          <View className="flex-row items-center bg-white rounded-lg p-2 mb-4">
            {/* Scrollable Respondent Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-1"
              contentContainerStyle={{ alignItems: "center" }}
            >
              {fields.map((field, index) => (
                <TouchableOpacity
                  key={field.id}
                  onPress={() => setActiveTab(index)}
                  className={`px-4 py-2 rounded-lg flex-row items-center ${
                    activeTab === index
                      ? "bg-blue-600"
                      : "bg-gray-100 border border-gray-200"
                  } mr-2`}
                >
                  <Text
                    className={`font-medium ${
                      activeTab === index ? "text-white" : "text-gray-700"
                    }`}
                  >
                    Resp. {index + 1}
                  </Text>
                  
                  {fields.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeAccused(index)}
                      className="ml-2"
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <X size={16} color={activeTab === index ? "#fff" : "#EF4444"} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Add button  */}
            <TouchableOpacity
              onPress={addAccused}
              disabled={isLoadingResidents}
              className="flex-row bg-blue-600 px-4 py-2 rounded-lg shadow-sm ml-2"
            >
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Active Accused Form */}
          {fields[activeTab] && (
            <View className="bg-white rounded-lg p-4">
              {/* Resident Selector - Available for both staff and non-staff */}
              <View className="mb-10">
                <Text className="text-sm font-medium text-gray-900 mb-2">
                  Select Resident {isStaff ? "(Optional)" : "*"}
                </Text>
                {isLoadingResidents ? (
                  <View className="py-3 items-center bg-gray-50 rounded-lg">
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text className="text-sm text-gray-500 mt-2">
                      Loading residents...
                    </Text>
                  </View>
                ) : (
                  <Controller
                    control={control}
                    name={`accused.${activeTab}.rp_id`}
                    render={({
                      field: { onChange, value },
                      fieldState: { error },
                    }) => (
                      <SearchableSelect
                        options={residentOptions}
                        selectedValue={value || ""}
                        onSelect={(option: any) => {
                          // Prevent selection if the option is disabled
                          if (option.disabled) {
                            return;
                          }

                          if (option.value === value) {
                            onChange("");
                            // Clear fields when deselecting
                            setValue(`accused.${activeTab}.acsd_name`, "");
                            setValue(`accused.${activeTab}.acsd_age`, "");
                            setValue(`accused.${activeTab}.acsd_gender`, "");
                            setValue(`accused.${activeTab}.acsd_address`, "");
                          } else {
                            onChange(option.value);
                            handleResidentSelect(activeTab, option.value);
                          }
                        }}
                        placeholder="Select a resident..."
                        searchPlaceholder="Search resident..."
                        error={error?.message}
                        disabled={false}
                        isInModal={false}
                      />
                    )}
                  />
                )}
              </View>

              {/* Conditional Fields based on user type */}
              {isStaff ? (
                <>
                  <FormInput
                    control={control}
                    name={`accused.${activeTab}.acsd_name`}
                    label="Full Name *"
                    placeholder="Enter complete name"
                    editable={true}
                  />

                  <View className="flex-row gap-x-3">
                    <View className="flex-1">
                      <FormSelect
                        control={control}
                        name={`accused.${activeTab}.acsd_gender`}
                        label="Gender *"
                        options={GENDER_OPTIONS}
                        disabled={false}
                      />
                    </View>
                    <View className="flex-1">
                      <FormInput
                        control={control}
                        name={`accused.${activeTab}.acsd_age`}
                        label="Age *"
                        placeholder="Age"
                        keyboardType="numeric"
                        editable={true}
                      />
                    </View>
                  </View>

                  <FormInput
                    control={control}
                    name={`accused.${activeTab}.acsd_address`}
                    label="Complete Address *"
                    placeholder="Street, Barangay, City, Province"
                    editable={true}
                  />
                </>
              ) : (
                <View className="mb-2">
                  <Text className="text-sm text-gray-500 italic">
                    Please select a resident from the dropdown above. The
                    respondent's information will be auto-filled.
                  </Text>
                </View>
              )}

              {/* Physical Description - Always visible for both */}
              <FormTextArea
                control={control}
                name={`accused.${activeTab}.acsd_description`}
                label="Physical Description *"
                placeholder="Describe physical appearance, clothing, distinguishing features..."
                numberOfLines={3}
              />
            </View>
          )}
        </View>

        {/* Navigation Buttons */}
        <View className="flex-row gap-x-4 mt-6">
          <TouchableOpacity
            onPress={onPrev}
            disabled={isSubmitting}
            className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center border border-gray-300 ${
              isSubmitting ? "bg-gray-100" : "bg-white"
            }`}
          >
            <ChevronLeft
              size={20}
              color={isSubmitting ? "#9CA3AF" : "#374151"}
            />
            <Text
              className={`font-medium ml-2 ${
                isSubmitting ? "text-gray-400" : "text-gray-700"
              }`}
            >
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            disabled={isSubmitting || fields.length === 0}
            className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center ${
              isSubmitting || fields.length === 0
                ? "bg-gray-300"
                : "bg-blue-600"
            }`}
          >
            <Text
              className={`font-medium mr-2 ${
                isSubmitting || fields.length === 0
                  ? "text-gray-500"
                  : "text-white"
              }`}
            >
              Next
            </Text>
            <ChevronRight
              size={20}
              color={
                isSubmitting || fields.length === 0 ? "#9CA3AF" : "#FFFFFF"
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

Accused.displayName = "Accused";
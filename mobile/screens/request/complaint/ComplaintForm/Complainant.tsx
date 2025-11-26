import React, { useState, useEffect, useMemo, useCallback, useRef, } from "react";
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image} from "react-native";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import type { ComplaintFormData } from "@/form-schema/complaint-schema";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { type DropdownOption,} from "@/components/ui/select-layout";
import { X, Plus, ChevronRight, CheckIcon } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useGetResidentLists } from "../api-operations/queries/ComplaintGetQueries";
import { SearchableSelect } from "../search-layout";
import { useResidentSelection } from "@/contexts/ComplaintFormContext";

interface ComplainantProps {
  onNext: () => void;
  isSubmitting?: boolean;
}

interface ResidentData {
  rp_id: number | string;
  name: string;
  age: number;
  gender: string;
  address?: string;
  profile_image?: string;
  number?: string;
}

const GENDER_OPTIONS: DropdownOption[] = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
];

function calculateAge(dob?: string | Date): string {
  if (!dob) return "";

  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age.toString();
}

export const Complainant: React.FC<ComplainantProps> = ({
  onNext,
  isSubmitting = false,
}) => {
  const { user } = useAuth();
  const { control, setValue, trigger } = useFormContext<ComplaintFormData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "complainant",
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
    selectedComplainantResidents,
    setSelectedComplainantResidents,
    selectedAccusedResidents,
  } = useResidentSelection();

  // Track selected residents whenever fields change
  useEffect(() => {
    const selectedIds = fields
      .map((field: any) => field.rp_id)
      .filter((id: any) => id !== null && id !== "");
    setSelectedComplainantResidents(selectedIds);
  }, [fields, setSelectedComplainantResidents]);

  // Prepare resident options for the dropdown
  const residentOptions = useMemo((): DropdownOption[] => {
    if (!residentsData) return [];

    return residentsData.map((resident: ResidentData) => {
      const residentId = resident.rp_id?.toString() || "";
      const isSelectedInAccused = selectedAccusedResidents.includes(residentId);
      const isSelectedInOtherComplainant =
        selectedComplainantResidents.includes(residentId) &&
        fields[activeTab]?.rp_id !== residentId;

      return {
        label: (
          <View className="flex-row items-center">
            {/* LEFT SIDE: profile + name */}
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
                  isSelectedInAccused || isSelectedInOtherComplainant
                    ? "text-gray-400"
                    : ""
                }`}
              >
                {resident.name}
              </Text>
            </View>

            {/* RIGHT SIDE: check icons */}
            {(isSelectedInAccused || isSelectedInOtherComplainant) && (
              <View className="flex-row items-center space-x-1">
                {isSelectedInAccused && (
                  <View className="rounded-full bg-green-500 p-1">
                    <CheckIcon size={12} color="#ffffff" />
                  </View>
                )}
                {isSelectedInOtherComplainant && (
                  <View className="rounded-full bg-green-500 p-1">
                    <CheckIcon size={12} color="#ffffff" />
                  </View>
                )}
              </View>
            )}
          </View>
        ),
        value: resident.rp_id?.toString() || "",
        disabled: isSelectedInAccused || isSelectedInOtherComplainant,
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
    selectedAccusedResidents,
    selectedComplainantResidents,
    activeTab,
    fields,
  ]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      Alert.alert("Error", "Failed to load residents. Please try again.");
    }
  }, [error]);

  // Initialize with one empty complainant for staff users
  useEffect(() => {
    if (isStaff && fields.length === 0 && !initializedRef.current) {
      initializedRef.current = true;
      append({
        cpnt_name: "",
        cpnt_gender: "",
        cpnt_age: "",
        cpnt_relation_to_respondent: "",
        cpnt_number: "",
        cpnt_address: "",
        rp_id: null,
      });
      setActiveTab(0);
    }
  }, [isStaff, fields.length, append]);

  // Auto-fill for non-staff users (residents) - silent background fill
  useEffect(() => {
    if (!isStaff && fields.length === 0 && user && !initializedRef.current) {
      initializedRef.current = true;
      const name = [
        user.personal?.per_lname,
        user.personal?.per_fname,
        user.personal?.per_mname,
      ]
        .filter(Boolean)
        .join(" ");

      const address = [
        user.personal?.per_addresses?.add_street,
        user.personal?.per_addresses?.add_external_sitio,
        user.personal?.per_addresses?.add_sitio,
        user.personal?.per_addresses?.add_barangay,
        user.personal?.per_addresses?.add_city,
        user.personal?.per_addresses?.add_province,
      ]
        .filter(Boolean)
        .join(", ");

      const age = calculateAge(user.personal?.per_dob);

      append({
        cpnt_name: name || "",
        cpnt_gender: user.personal?.per_sex || "",
        cpnt_age: age || "",
        cpnt_number: user.phone || "",
        cpnt_address: address || "",
        cpnt_relation_to_respondent: "Self",
        rp_id: user.rp?.toString() || null,
      });

      // Automatically proceed to next step
      setTimeout(() => {
        onNext();
      }, 100);
    }
  }, [isStaff, fields.length, user, append, onNext]);

  // Handle resident selection - auto-fill fields
  const handleResidentSelect = useCallback(
    (index: number, residentId: string) => {
      const selected = residentsData?.find(
        (r: ResidentData) => r.rp_id?.toString() === residentId
      );
      if (!selected) return;
      console.log(selected.gender);
      setValue(`complainant.${index}.cpnt_name`, selected.name || "", {
        shouldValidate: true,
      });
      setValue(
        `complainant.${index}.cpnt_age`,
        selected.age?.toString() || "",
        { shouldValidate: true }
      );
      setValue(`complainant.${index}.cpnt_gender`, selected.gender || "", {
        shouldValidate: true,
      });
      setValue(
        `complainant.${index}.cpnt_address`,
        selected.address || "Address not available",
        { shouldValidate: true }
      );
      setValue(`complainant.${index}.cpnt_number`, selected.number || "", {
        shouldValidate: true,
      });
    },
    [residentsData, setValue]
  );

  // Add new complainant
  const addComplainant = useCallback(() => {
    const newIndex = fields.length;
    append({
      cpnt_name: "",
      cpnt_gender: "",
      cpnt_age: "",
      cpnt_relation_to_respondent: "",
      cpnt_number: "",
      cpnt_address: "",
      rp_id: null,
    });
    setActiveTab(newIndex);
  }, [append, fields.length]);

  const removeComplainant = useCallback(
    (index: number) => {
      if (fields.length === 1) {
        Alert.alert("Cannot Remove", "At least one complainant is required.");
        return;
      }

      remove(index);
      setActiveTab(Math.max(0, index - 1));
    },
    [remove, fields.length]
  );

  const handleNext = useCallback(async () => {
    const isValid = await trigger("complainant");

    if (!isValid) {
      Alert.alert(
        "Validation Error",
        "Please complete all required complainant fields."
      );
      return;
    }

    onNext();
  }, [trigger, onNext]);

  // For non-staff users (residents), show loading state while auto-filling
  if (!isStaff) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4">Loading your information...</Text>
      </View>
    );
  }

  // Show loading while initializing
  if (fields.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4">Initializing form...</Text>
      </View>
    );
  }

  // Staff user interface
  return (
    <View className="flex-1 p-4">
      <View className="bg-white rounded-lg mb-10">
        <View className="flex-row items-center mb-2">
          <Text className="text-lg font-semibold text-gray-900">
            Complainant
          </Text>
        </View>
        <Text className="text-sm text-gray-600">
          Information about the person submitting the complaint.
        </Text>
      </View>

      <View className="border border-gray-100">
        {/* Tabs Header - Always show */}
        <View className="flex-row items-center bg-white rounded-lg p-2 mb-4">
          {/* Scrollable tabs */}
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
                  Comp. {index + 1}
                </Text>

                {fields.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeComplainant(index)}
                    className="ml-2"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X
                      size={16}
                      color={activeTab === index ? "#fff" : "#EF4444"}
                    />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={addComplainant}
            disabled={isLoadingResidents}
            className="flex-row bg-blue-600 px-4 py-2 rounded-lg shadow-sm ml-2"
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Active Complainant Form */}
        {fields[activeTab] && (
          <View className="bg-white rounded-lg p-4">
            {/* Resident Selector - Always enabled for staff */}
            <View className="mb-10">
              <Text className="text-sm font-medium text-gray-900 mb-2">
                Select Resident (Optional)
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
                  name={`complainant.${activeTab}.rp_id`}
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
                          setValue(`complainant.${activeTab}.cpnt_name`, "");
                          setValue(`complainant.${activeTab}.cpnt_age`, "");
                          setValue(`complainant.${activeTab}.cpnt_gender`, "");
                          setValue(`complainant.${activeTab}.cpnt_number`, "");
                          setValue(`complainant.${activeTab}.cpnt_address`, "");
                        } else {
                          onChange(option.value);
                          handleResidentSelect(activeTab, option.value);
                        }
                      }}
                      placeholder="Select a resident to auto-fill..."
                      searchPlaceholder="Search resident..."
                      error={error?.message}
                      disabled={false}
                      isInModal={false}
                    />
                  )}
                />
              )}
            </View>

            <FormInput
              control={control}
              name={`complainant.${activeTab}.cpnt_name`}
              label="Full Name"
              placeholder="Enter complete name"
              editable={true}
            />

            <View className="flex-row gap-x-3">
              <View className="flex-1">
                <FormSelect
                  control={control}
                  name={`complainant.${activeTab}.cpnt_gender`}
                  label="Gender"
                  options={GENDER_OPTIONS}
                  disabled={false}
                />
              </View>
              <View className="flex-1">
                <FormInput
                  control={control}
                  name={`complainant.${activeTab}.cpnt_age`}
                  label="Age"
                  placeholder="Age"
                  keyboardType="numeric"
                  editable={true}
                />
              </View>
            </View>

            <FormInput
              control={control}
              name={`complainant.${activeTab}.cpnt_number`}
              label="Contact Number"
              placeholder="09XXXXXXXXX"
              keyboardType="phone-pad"
              editable={true}
            />

            <FormInput
              control={control}
              name={`complainant.${activeTab}.cpnt_address`}
              label="Complete Address"
              placeholder="Street, Barangay, City, Province"
              editable={true}
            />

            <FormInput
              control={control}
              name={`complainant.${activeTab}.cpnt_relation_to_respondent`}
              label="Relation to Accused *"
              placeholder="e.g., Neighbor, Colleague, Victim, etc."
              editable={true}
            />
          </View>
        )}
      </View>
      {/* Next Button */}
      <View className="mt-6">
        <TouchableOpacity
          onPress={handleNext}
          disabled={isSubmitting || fields.length === 0}
          className={`py-3 px-4 rounded-lg flex-row items-center justify-center ${
            isSubmitting || fields.length === 0 ? "bg-gray-300" : "bg-blue-600"
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
            color={isSubmitting || fields.length === 0 ? "#9CA3AF" : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

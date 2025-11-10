import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import type { ComplaintFormData } from "@/form-schema/complaint-schema";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { SelectLayout, type DropdownOption } from "@/components/ui/select-layout";
import { X, UserPlus, ChevronRight, Info } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useGetResidentLists } from "../api-operations/queries/ComplaintGetQueries";

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
  phone?: string;
}

const GENDER_OPTIONS: DropdownOption[] = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
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
  const [showForm, setShowForm] = useState(false);
  const [manualEntries, setManualEntries] = useState<Set<number>>(new Set());

  const isStaff = !!user?.staff;

  const {
    data: residentsData,
    isLoading: isLoadingResidents,
    error,
  } = useGetResidentLists();

  // Prepare resident options for the dropdown
  const residentOptions = useMemo((): DropdownOption[] => {
    if (!residentsData) return [];
    
    return residentsData.map((resident: ResidentData) => ({
      label: (
        <View className="flex-row items-center">
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
          <Text className="text-gray-800 font-medium">{resident.name}</Text>
        </View>
      ),
      value: resident.rp_id?.toString() || "",
      data: {
        name: resident.name,
        age: resident.age,
        gender: resident.gender,
        address: resident.address || "Address not available",
        profile_image: resident.profile_image,
        phone: resident.phone,
      },
    }));
  }, [residentsData]);

  // Handle API errors
  useEffect(() => {
    if (error) {
      Alert.alert("Error", "Failed to load residents. Please try again.");
    }
  }, [error]);

  // Auto-fill for non-staff users - silent background fill
  useEffect(() => {
    if (!isStaff && fields.length === 0 && user) {
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

  // Handle resident selection
  const handleResidentSelect = useCallback(
    (index: number, residentId: string) => {
      const selected = residentsData?.find(
        (r: ResidentData) => r.rp_id?.toString() === residentId
      );
      
      if (!selected) return;

      setValue(`complainant.${index}.cpnt_name`, selected.name || "");
      setValue(`complainant.${index}.cpnt_age`, selected.age?.toString() || "");
      setValue(`complainant.${index}.cpnt_gender`, selected.gender || "");
      setValue(
        `complainant.${index}.cpnt_address`,
        selected.address || "Address not available"
      );
      setValue(`complainant.${index}.cpnt_number`, selected.phone || "");
    },
    [residentsData, setValue]
  );

  const addComplainant = useCallback(() => {
    append({
      cpnt_name: "",
      cpnt_gender: "Male",
      cpnt_age: "",
      cpnt_relation_to_respondent: "",
      cpnt_number: "",
      cpnt_address: "",
      rp_id: null,
    });
    setActiveTab(fields.length);
    setShowForm(true);
  }, [append, fields.length]);

  const addComplainantManually = useCallback(() => {
    const newIndex = fields.length;
    append({
      cpnt_name: "",
      cpnt_gender: "Male",
      cpnt_age: "",
      cpnt_relation_to_respondent: "",
      cpnt_number: "",
      cpnt_address: "",
      rp_id: null,
    });
    setManualEntries((prev) => new Set([...prev, newIndex]));
    setActiveTab(newIndex);
    setShowForm(true);
  }, [append, fields.length]);

  const removeComplainant = useCallback(
    (index: number) => {
      if (fields.length === 1) {
        Alert.alert("Cannot Remove", "At least one complainant is required.");
        return;
      }

      setManualEntries((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        const adjusted = new Set<number>();
        newSet.forEach((i) => adjusted.add(i > index ? i - 1 : i));
        return adjusted;
      });

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

  // For non-staff users, show loading state
  if (!isStaff) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-600 mt-4">Loading your information...</Text>
      </View>
    );
  }

  // Staff user interface
  return (
    <View className="flex-1 p-4">
      {!showForm ? (
        <View className="flex-1 justify-center items-center">
          <TouchableOpacity
            onPress={addComplainant}
            className="bg-blue-500 mt-4 px-6 py-4 rounded-xl shadow-md flex-row items-center justify-center"
          >
            <UserPlus size={22} color="#fff" />
            <Text className="text-white font-semibold ml-2 text-base">
              Add Complainant
            </Text>
          </TouchableOpacity>
          <View className="flex-row items-center mt-4">
            <Info size={24} color="gray" />
            <Text className="ml-2 text-sm text-gray-400">
              The Process begins by Adding an individual.
            </Text>
          </View>
        </View>
      ) : (
        <>
          <View className="flex-row justify-end mb-3">
            <TouchableOpacity
              onPress={addComplainantManually}
              disabled={isLoadingResidents}
              className="bg-blue-600 px-4 py-3 rounded-lg shadow-sm flex-row items-center"
            >
              <UserPlus size={20} color="#fff" />
              <Text className="text-white font-medium ml-2">Add Manually</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs Header */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row space-x-2 bg-white rounded-lg border border-gray-200 p-2 mb-4"
          >
            {fields.map((field, index) => (
              <TouchableOpacity
                key={field.id}
                onPress={() => setActiveTab(index)}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === index
                    ? "bg-blue-600"
                    : "bg-gray-100 border border-gray-200"
                }`}
              >
                <Text
                  className={`font-medium ${
                    activeTab === index ? "text-white" : "text-gray-700"
                  }`}
                >
                  Comp. {index + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Active Complainant Form */}
          <View className="bg-white rounded-lg p-4 border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-md font-medium text-gray-900">
                Complainant {activeTab + 1}
              </Text>
              <TouchableOpacity
                onPress={() => removeComplainant(activeTab)}
                className="p-2"
                disabled={fields.length === 1}
              >
                <X
                  size={18}
                  color={fields.length === 1 ? "#9CA3AF" : "#EF4444"}
                />
              </TouchableOpacity>
            </View>

            {/* Resident Selector */}
            <View className="mb-3">
              <Text className="text-sm font-medium text-gray-900 mb-2">
                Select Resident
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
                  render={({ field: { onChange, value }, fieldState: { error } }) => (
                    <SelectLayout
                      options={residentOptions}
                      selectedValue={value || ""}
                      onSelect={(option: any) => {
                        if (option.value === value) {
                          onChange("");
                        } else {
                          onChange(option.value);
                          handleResidentSelect(activeTab, option.value);
                        }
                      }}
                      placeholder="Select a resident..."
                      error={error?.message}
                      disabled={manualEntries.has(activeTab)}
                      isInModal={false}
                    />
                  )}
                />
              )}
            </View>

            {/* Full Name */}
            <FormInput
              control={control}
              name={`complainant.${activeTab}.cpnt_name`}
              label="Full Name"
              placeholder={
                manualEntries.has(activeTab)
                  ? "Enter complete name"
                  : "Auto-filled from resident"
              }
              editable={manualEntries.has(activeTab)}
            />

            {/* Gender and Age */}
            <View className="flex-row space-x-3">
              <View className="flex-1">
                <FormSelect
                  control={control}
                  name={`complainant.${activeTab}.cpnt_gender`}
                  label="Gender"
                  options={GENDER_OPTIONS}
                  disabled={!manualEntries.has(activeTab)}
                />
              </View>
              <View className="flex-1">
                <FormInput
                  control={control}
                  name={`complainant.${activeTab}.cpnt_age`}
                  label="Age"
                  placeholder={
                    manualEntries.has(activeTab) ? "Age" : "Auto-filled"
                  }
                  keyboardType="numeric"
                  editable={manualEntries.has(activeTab)}
                />
              </View>
            </View>

            {/* Contact Number */}
            <FormInput
              control={control}
              name={`complainant.${activeTab}.cpnt_number`}
              label="Contact Number"
              placeholder="09XXXXXXXXX"
              keyboardType="phone-pad"
            />

            {/* Address */}
            <FormInput
              control={control}
              name={`complainant.${activeTab}.cpnt_address`}
              label="Complete Address"
              placeholder={
                manualEntries.has(activeTab)
                  ? "Street, Barangay, City, Province"
                  : "Auto-filled from resident"
              }
              editable={manualEntries.has(activeTab)}
            />

            {/* Relation */}
            <FormInput
              control={control}
              name={`complainant.${activeTab}.cpnt_relation_to_respondent`}
              label="Relation to Accused *"
              placeholder="e.g., Neighbor, Colleague, Victim, etc."
            />
          </View>

          {/* Next Button */}
          <View className="mt-6">
            <TouchableOpacity
              onPress={handleNext}
              disabled={isSubmitting || fields.length === 0}
              className={`py-3 px-4 rounded-lg flex-row items-center justify-center ${
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
        </>
      )}
    </View>
  );
};
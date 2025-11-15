import React, { memo, useCallback, useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, X, ChevronRight, ChevronLeft } from "lucide-react-native";
import { ComplaintFormData } from "@/form-schema/complaint-schema";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { useGetResidentLists } from "../api-operations/queries/ComplaintGetQueries";

const GENDER_OPTIONS = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

interface AccusedFormSectionProps {
  control: any;
  index: number;
  onRemove: () => void;
  showRemoveButton: boolean;
  isManual: boolean;
  residentsData: any[];
  isLoadingResidents: boolean;
  onResidentSelect: (index: number, residentId: string) => void;
}

const AccusedFormSection = memo<AccusedFormSectionProps>(
  ({
    control,
    index,
    onRemove,
    showRemoveButton,
    isManual,
    residentsData,
    isLoadingResidents,
    onResidentSelect,
  }) => {
    const residentOptions = useMemo(() => {
      if (!residentsData) return [];
      return residentsData.map((resident: any) => ({
        label: resident.name,
        value: resident.rp_id?.toString(),
        // Store additional data if your FormSelect component supports it
        ...(resident.profile_image && { profileImage: resident.profile_image }),
      }));
    }, [residentsData]);

    return (
      <View className="bg-white rounded-lg p-4 border border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-md font-medium text-gray-900">
            Respondent {index + 1}
          </Text>
          {showRemoveButton && (
            <TouchableOpacity onPress={onRemove} className="p-2">
              <X size={18} className="text-red-500" />
            </TouchableOpacity>
          )}
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
            <FormSelect
              control={control}
              name={`accused.${index}.rp_id`}
              options={residentOptions}
              placeholder="Select a resident..."
              isInModal={false}
              disabled={isManual}
            />
          )}
        </View>

        <View className="space-y-4">
          {/* Name */}
          <FormInput
            control={control}
            name={`accused.${index}.acsd_name`}
            label="Name *"
            placeholder={isManual ? "Enter name" : "Auto-filled from resident"}
            editable={isManual}
          />

          {/* Gender and Age */}
          <View className="flex-row space-x-3">
            <View className="flex-1">
              <FormSelect
                control={control}
                name={`accused.${index}.acsd_gender`}
                label="Gender *"
                options={GENDER_OPTIONS}
                disabled={!isManual}
              />
            </View>
            <View className="flex-1">
              <FormInput
                control={control}
                name={`accused.${index}.acsd_age`}
                label="Age *"
                placeholder={isManual ? "Enter age" : "Auto-filled"}
                keyboardType="numeric"
                editable={isManual}
              />
            </View>
          </View>

          {/* Address */}
          <FormInput
            control={control}
            name={`accused.${index}.acsd_address`}
            label="Address *"
            placeholder={
              isManual ? "Enter address" : "Auto-filled from resident"
            }
            editable={isManual}
          />

          {/* Physical Description */}
          <FormTextArea
            control={control}
            name={`accused.${index}.acsd_description`}
            label="Physical Description *"
            placeholder="Describe physical appearance, clothing, distinguishing features..."
            numberOfLines={3}
          />
        </View>
      </View>
    );
  }
);

AccusedFormSection.displayName = "AccusedFormSection";

interface AccusedProps {
  onNext: () => void;
  onPrev: () => void;
  isSubmitting?: boolean;
}

export const Accused: React.FC<AccusedProps> = memo(
  ({ onNext, onPrev, isSubmitting }) => {
    const { control, trigger, setValue } = useFormContext<ComplaintFormData>();
    const { fields, append, remove } = useFieldArray({
      control,
      name: "accused",
    });

    const [activeTab, setActiveTab] = useState(0);
    const [manualEntries, setManualEntries] = useState<Set<number>>(new Set());

    const {
      data: residentsData,
      isLoading: isLoadingResidents,
      error,
    } = useGetResidentLists();

    useEffect(() => {
      if (error) {
        Alert.alert("Error", "Failed to load residents. Please try again.");
      }
    }, [error]);

    /** Handle selecting a resident for a specific tab */
    const handleResidentSelect = useCallback(
      (index: number, residentId: string) => {
        const selected = residentsData?.find(
          (r: any) => r.rp_id?.toString() === residentId
        );
        if (!selected) return;

        setValue(`accused.${index}.acsd_name`, selected.name);
        setValue(`accused.${index}.acsd_age`, selected.age?.toString() || "");
        setValue(`accused.${index}.acsd_gender`, selected.gender || "");
        setValue(
          `accused.${index}.acsd_address`,
          selected.address || "Address not available"
        );
      },
      [residentsData, setValue]
    );

    /** Remove a respondent */
    const removeAccused = useCallback(
      (index: number) => {
        if (fields.length === 1) {
          Alert.alert("Cannot Remove", "At least one respondent is required.");
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

    /** Add manually */
    const handleAddManually = useCallback(() => {
      const newIndex = fields.length;
      append({
        acsd_name: "",
        acsd_age: "",
        acsd_gender: "",
        acsd_description: "",
        acsd_address: "",
        rp_id: null,
      });
      setManualEntries((prev) => new Set([...prev, newIndex]));
      setActiveTab(newIndex);
    }, [append, fields.length]);

    /** Next step */
    const handleNext = async () => {
      const isValid = await trigger(["accused"]);
      if (!isValid) {
        Alert.alert(
          "Validation Error",
          "Please complete all required respondent fields."
        );
        return;
      }
      onNext();
    };

    return (
      <View className="flex-1 p-4">
        <View className="bg-white rounded-lg p-4 mb-2 border border-gray-100">
          <View className="flex-row items-center mb-2">
            {/* <UserCircle size={20} color="#111111" className="mr-2" /> */}
            <Text className="text-lg font-semibold text-gray-900">Respondent</Text>
          </View>
          <Text className="text-sm text-gray-600">
            Person identified as involved  in the reported incident.
          </Text>
        </View>
        {/* Add Respondent Manually */}
        <View className="flex-row justify-end mb-3">
        <TouchableOpacity
          onPress={handleAddManually}
          disabled={isLoadingResidents}
          className="bg-blue-600 py-3 px-4 rounded-lg flex-row items-center justify-center mb-6"
        >
          <Plus size={20} className="text-white" />
          <Text className="text-white font-medium ml-2">
            Add Res.
          </Text>
        </TouchableOpacity>
        </View>

        {/* Tabs */}
        {fields.length > 0 && (
          <>
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
                    Resp. {index + 1}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Active Respondent Form */}
            <AccusedFormSection
              control={control}
              index={activeTab}
              onRemove={() => removeAccused(activeTab)}
              showRemoveButton={fields.length > 1}
              isManual={manualEntries.has(activeTab)}
              residentsData={residentsData || []}
              isLoadingResidents={isLoadingResidents}
              onResidentSelect={handleResidentSelect}
            />
          </>
        )}

        {/* Navigation */}
        <View className="flex-row space-x-3 mt-auto pt-4">
          <TouchableOpacity
            onPress={onPrev}
            disabled={isSubmitting}
            className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center border border-gray-300 ${
              isSubmitting ? "bg-gray-100" : "bg-white"
            }`}
          >
            <ChevronLeft
              size={20}
              className={isSubmitting ? "text-gray-400" : "text-gray-700"}
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
              className={
                isSubmitting || fields.length === 0
                  ? "text-gray-500"
                  : "text-white"
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

Accused.displayName = "Accused";
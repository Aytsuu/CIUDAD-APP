import React, { memo, useCallback, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useFormContext } from "react-hook-form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { FormDateTimeInput } from "@/components/ui/form/form-date-or-time-input";
import * as ImagePicker from "expo-image-picker";
import { MapPin, FileText, ChevronLeft, Send } from "lucide-react-native";
import { ComplaintFormData } from "@/form-schema/complaint-schema";

// Define your media item type
export interface MediaItem {
  uri: string;
  type?: string;
  name?: string;
}

// Props for the Incident component
interface IncidentProps {
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting?: boolean;
}

const IncidentHeader = memo(() => (
  <View className="bg-white rounded-lg mb-10">
    <View className="flex-row items-center mb-2">
      <Text className="text-lg font-semibold text-gray-900">Incident Details</Text>
    </View>
    <Text className="text-sm text-gray-600">
      Describe what happened and when it occurred
    </Text>
  </View>
));
IncidentHeader.displayName = "IncidentHeader";

const LocationSection = memo(({ control }: { control: any }) => (
  <View>
    <View className="flex-row items-center mb-2">
      <MapPin size={16} color="#4B5563" className="mr-1" />
      <Text className="text-sm font-medium text-gray-900">Location *</Text>
    </View>
    <FormInput
      control={control}
      name="incident.comp_location"
      placeholder="Where did the incident occur?"
    />
  </View>
));
LocationSection.displayName = "LocationSection";

// Reusable MediaPicker section
const EvidenceSection = memo(
  ({
    mediaFiles,
    onMediaSelection,
    disabled,
  }: {
    mediaFiles: MediaItem[];
    onMediaSelection: (files: MediaItem[]) => void;
    disabled?: boolean;
  }) => {
    const pickMedia = async () => {
      if (disabled) return;

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your media library to upload files."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled) {
        const selected = result.assets.map((asset) => ({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || "media",
        }));
        onMediaSelection([...mediaFiles, ...selected]);
      }
    };

    const removeFile = (index: number) => {
      const updated = mediaFiles.filter((_, i) => i !== index);
      onMediaSelection(updated);
    };

    return (
      <View className="bg-white rounded-lg p-4 border border-gray-100">
        <Text className="text-md font-medium text-gray-900 mb-2">
          Supporting Documents (Optional)
        </Text>
        <Text className="text-sm text-gray-600 mb-4">
          Upload photos, videos, or documents related to the incident
        </Text>

        <TouchableOpacity
          onPress={pickMedia}
          disabled={disabled}
          className={`py-3 px-4 rounded-lg ${
            disabled ? "bg-gray-300" : "bg-blue-600"
          }`}
        >
          <Text
            className={`text-center font-medium ${
              disabled ? "text-gray-500" : "text-white"
            }`}
          >
            Select Media
          </Text>
        </TouchableOpacity>

        {mediaFiles.length > 0 && (
          <View className="mt-3">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Selected Files ({mediaFiles.length})
            </Text>
            {mediaFiles.map((file, index) => (
              <View
                key={index}
                className="flex-row items-center justify-between bg-gray-50 p-2 rounded mb-2"
              >
                <Text className="text-sm text-gray-700 flex-1" numberOfLines={1}>
                  {file.name || `File ${index + 1}`}
                </Text>
                {!disabled && (
                  <TouchableOpacity
                    onPress={() => removeFile(index)}
                    className="ml-2 p-1"
                  >
                    <Text className="text-red-500 text-xs">Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }
);
EvidenceSection.displayName = "EvidenceSection";

export const Incident = memo(({ onSubmit, onPrev, isSubmitting }: IncidentProps) => {
  const { control, watch, setValue } = useFormContext<ComplaintFormData>();
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([]);

  const incidentTypeValue = watch("incident.comp_incident_type");

  const incidentTypeOptions = useMemo(
    () => [
      { label: "Theft", value: "Theft" },
      { label: "Assault", value: "Assault" },
      { label: "Property Damage", value: "Property Damage" },
      { label: "Noise", value: "Noise" },
      { label: "Harassment", value: "Harassment" },
      { label: "Trespassing", value: "Trespassing" },
      { label: "Fraud", value: "Fraud" },
      { label: "Other", value: "Other" },
    ],
    []
  );

  const handleMediaSelection = useCallback(
    (files: MediaItem[]) => {
      setMediaFiles(files);
      setValue("files", files, { shouldValidate: true });
    },
    [setValue]
  );

  return (
    <View className="flex-1 p-4 space-y-4">
      {/* Header */}
      <IncidentHeader />

      {/* Incident Form Fields */}
      <View className="bg-white rounded-lg p-4 border border-gray-100 space-y-4">
        {/* Incident Type */}
        <FormSelect
          control={control}
          name="incident.comp_incident_type"
          label="Incident Type *"
          options={incidentTypeOptions}
          placeholder="Select incident type"
        />

        {/* If type is "Other" */}
        {incidentTypeValue === "Other" && (
          <FormInput
            control={control}
            name="incident.comp_other_type"
            label="Specify Incident Type *"
            placeholder="Please specify the type of incident"
          />
        )}

        {/* Location */}
        <LocationSection control={control} />

        {/* Date and Time */}
        <View>
          <Text className="text-sm font-medium text-gray-900 mb-2">
            Date and Time of Incident *
          </Text>
          <FormDateTimeInput
            control={control}
            name="incident.comp_datetime"
            type="date"
            label="Date"
            placeholder="Select date"
          />
          <FormDateTimeInput
            control={control}
            name="incident.comp_datetime_time"
            type="time"
            label="Time"
            placeholder="Select time"
          />
        </View>

        {/* Description */}
        <View>
          <Text className="text-sm font-medium text-gray-900 mb-2">
            Detailed Description (Allegation) *
          </Text>
          <FormTextArea
            control={control}
            name="incident.comp_allegation"
            placeholder="Provide a detailed account of what happened. Include sequence of events, any witnesses, and relevant details..."
            numberOfLines={6}
          />
          <Text className="text-xs text-gray-500 mt-1">
            Minimum 20 characters, maximum 1000 characters
          </Text>
        </View>
      </View>

      {/* Evidence Upload */}
      <EvidenceSection
        mediaFiles={mediaFiles}
        onMediaSelection={handleMediaSelection}
        disabled={isSubmitting}
      />

      {/* Action Buttons */}
      <View className="flex-row gap-x-4 mt-4">
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
          onPress={onSubmit}
          disabled={isSubmitting}
          className={`flex-1 py-3 px-4 rounded-lg flex-row items-center justify-center ${
            isSubmitting ? "bg-blue-400" : "bg-blue-600"
          }`}
        >
          <Send color="#ffffff"/>
          <Text
            className={`font-semibold ml-2 text-white`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});
Incident.displayName = "Incident";
import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UseFormReturn } from 'react-hook-form';
import { ComplaintFormData } from '@/form-schema/complaint-schema';
import { FormInput } from '@/components/ui/form/form-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormDateTimeInput } from '@/components/ui/form/form-date-or-time-input';
import MediaPicker, { MediaItem } from '@/components/ui/media-picker';
import { MapPin, FileText } from 'lucide-react-native';

interface IncidentStepProps {
  form: UseFormReturn<ComplaintFormData>;
}

// Memoized header component to prevent unnecessary re-renders
const IncidentHeader = memo(() => (
  <View className="bg-white rounded-lg p-4 border border-gray-100">
    <View className="flex-row items-center mb-2">
      <FileText size={20} className="text-orange-600 mr-2" color={"#111111"}/>
      <Text className="text-lg font-semibold text-gray-900">
        Incident Details
      </Text>
    </View>
    <Text className="text-sm text-gray-600">
      Describe what happened and when it occurred
    </Text>
  </View>
));

IncidentHeader.displayName = 'IncidentHeader';

// Memoized location component
const LocationSection = memo(({ control }: { control: any }) => (
  <View>
    <View className="flex-row items-center mb-2">
      <MapPin size={16} className="text-gray-600 mr-1" />
      <Text className="text-sm font-medium text-gray-900">Location</Text>
    </View>
    <FormInput
      control={control}
      name="incident.comp_location"
      placeholder="Where did the incident occur?"
      rules={{ required: "Location is required" }}
    />
  </View>
));

LocationSection.displayName = 'LocationSection';

// Memoized evidence upload section
const EvidenceSection = memo(({ 
  mediaFiles, 
  onMediaSelection 
}: { 
  mediaFiles: MediaItem[]; 
  onMediaSelection: (files: MediaItem[]) => void; 
}) => (
  <View className="bg-white rounded-lg p-4 border border-gray-100">
    <Text className="text-md font-medium text-gray-900 mb-2">
      Supporting Documents (Optional)
    </Text>
    <Text className="text-sm text-gray-600 mb-4">
      Upload photos, videos, or documents related to the incident
    </Text>
    
    <MediaPicker
      selectedImages={mediaFiles}
      setSelectedImages={onMediaSelection}
      multiple={true}
      maxImages={10}
      editable={true}
    />
  </View>
));

EvidenceSection.displayName = 'EvidenceSection';

export const Incident: React.FC<IncidentStepProps> = memo(({ form }) => {
  const { control, watch, setValue } = form;
  
  const incidentType = watch('incident.comp_incident_type');
  const [mediaFiles, setMediaFiles] = React.useState<MediaItem[]>([]);

  // Memoize incident type options to prevent recreation on every render
  const incidentTypeOptions = useMemo(() => [
    { label: 'Theft', value: 'Theft' },
    { label: 'Assault', value: 'Assault' },
    { label: 'Property Damage', value: 'Property Damage' },
    { label: 'Noise', value: 'Noise' },
    { label: 'Other', value: 'Other' },
  ], []);

  // Memoize media selection handler
  const handleMediaSelection = useCallback((files: MediaItem[]) => {
    setMediaFiles(files);
    setValue('documents', files, { shouldValidate: true });
  }, [setValue]);

  // Memoize the Other Type Input component to only re-render when incidentType changes
  const OtherTypeInput = useMemo(() => {
    if (incidentType === 'Other') {
      return (
        <FormInput
          control={control}
          name="incident.comp_other_type"
          label="Specify Incident Type"
          placeholder="Please specify the type of incident"
        />
      );
    }
    return null;
  }, [incidentType, control]);

  return (
    <View className="space-y-4">
      <IncidentHeader />
      
      <View className="bg-white rounded-lg p-4 border border-gray-100 space-y-4">
        {/* Incident Type */}
        <FormSelect
          control={control}
          name="incident.comp_incident_type"
          label="Incident Type"
          options={incidentTypeOptions}
          placeholder="Select incident type"
        />

        {/* Other Type Input - Conditionally rendered */}
        {OtherTypeInput}

        {/* Location */}
        <LocationSection control={control} />

        {/* Date and Time - Using DateTimePicker */}
        <View>
          <View className="flex-row items-center mb-2">
            <Text className="text-sm font-medium text-gray-900">Date and Time of Incident</Text>
          </View>
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
            Detailed Description (Allegation)
          </Text>
          <FormTextArea
            control={control}
            name="incident.comp_allegation"
            placeholder="Provide a detailed account of what happened. Include sequence of events, any witnesses, and relevant details..."
            numberOfLines={6}
            rules={{
              required: "Description is required",
              minLength: {
                value: 20,
                message: "Description must be at least 20 characters"
              },
              maxLength: {
                value: 1000,
                message: "Description cannot exceed 1000 characters"
              }
            }}
          />
          <Text className="text-xs text-gray-500 mt-1">
            Minimum 20 characters, maximum 1000 characters
          </Text>
        </View>
      </View>

      {/* Evidence Upload Section */}
      <EvidenceSection 
        mediaFiles={mediaFiles} 
        onMediaSelection={handleMediaSelection} 
      />
    </View>
  );
});

Incident.displayName = 'Incident';
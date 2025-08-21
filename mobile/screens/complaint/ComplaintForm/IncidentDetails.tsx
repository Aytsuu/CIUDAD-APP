import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UseFormReturn } from 'react-hook-form';
import { ComplaintFormData } from '@/form-schema/complaint-schema';
import { FormInput } from '@/components/ui/form/form-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { Calendar, Clock, MapPin, FileText } from 'lucide-react-native';

interface IncidentStepProps {
  form: UseFormReturn<ComplaintFormData>;
}

export const Incident: React.FC<IncidentStepProps> = ({ form }) => {
  const { control, watch } = form;
  
  const incidentType = watch('incident.type');

  const incidentTypeOptions = [
    { label: 'Theft', value: 'Theft' },
    { label: 'Assault', value: 'Assault' },
    { label: 'Property Damage', value: 'Property Damage' },
    { label: 'Noise', value: 'Noise' },
    { label: 'Other', value: 'Other' },
  ];

  return (
    <View className="space-y-4">
      {/* Header */}
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

      <View className="bg-white rounded-lg p-4 border border-gray-100 space-y-4">
        {/* Incident Type */}
        <FormSelect
          control={control}
          name="incident.type"
          label="Incident Type"
          options={incidentTypeOptions}
          placeholder="Select incident type"
        />

        {/* Other Type Input */}
        {incidentType === 'Other' && (
          <FormInput
            control={control}
            name="incident.otherType"
            label="Specify Incident Type"
            placeholder="Please specify the type of incident"
          />
        )}

        {/* Location */}
        <View>
          <View className="flex-row items-center mb-2">
            <MapPin size={16} className="text-gray-600 mr-1" />
            <Text className="text-sm font-medium text-gray-900">Location</Text>
          </View>
          <FormInput
            control={control}
            name="incident.location"
            placeholder="Where did the incident occur?"
          />
        </View>

        {/* Date and Time */}
        <View className="flex-row space-x-3">
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Calendar size={16} className="text-gray-600 mr-1" />
              <Text className="text-sm font-medium text-gray-900">Date</Text>
            </View>
            <FormInput
              control={control}
              name="incident.date"
              placeholder="MM/DD/YYYY"
            />
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Clock size={16} className="text-gray-600 mr-1" />
              <Text className="text-sm font-medium text-gray-900">Time</Text>
            </View>
            <FormInput
              control={control}
              name="incident.time"
              placeholder="HH:MM AM/PM"
            />
          </View>
        </View>

        {/* Description */}
        <View>
          <Text className="text-sm font-medium text-gray-900 mb-2">
            Detailed Description
          </Text>
          <FormTextArea
            control={control}
            name="incident.description"
            placeholder="Provide a detailed account of what happened. Include sequence of events, any witnesses, and relevant details..."
            numberOfLines={6}
          />
          <Text className="text-xs text-gray-500 mt-1">
            Minimum 20 characters, maximum 1000 characters
          </Text>
        </View>
      </View>

      {/* Evidence Upload Section */}
      <View className="bg-white rounded-lg p-4 border border-gray-100">
        <Text className="text-md font-medium text-gray-900 mb-2">
          Supporting Documents (Optional)
        </Text>
        <Text className="text-sm text-gray-600 mb-4">
          Upload photos, videos, or documents related to the incident
        </Text>
        
        <TouchableOpacity className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex-col items-center justify-center">
          <FileText size={24} className="text-gray-400 mb-2" />
          <Text className="text-sm font-medium text-gray-700">Upload Files</Text>
          <Text className="text-xs text-gray-500 mt-1">
            PDF, DOC, Images, Videos (Max 10MB each)
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { UseFormReturn } from 'react-hook-form';
import { ComplaintFormData } from '@/form-schema/complaint-schema';
import { CheckCircle, User, UserX, FileText, Edit } from 'lucide-react-native';

interface ReviewStepProps {
  form: UseFormReturn<ComplaintFormData>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const Review: React.FC<ReviewStepProps> = ({ form, onSubmit, isSubmitting }) => {
  const { watch } = form;
  const formData = watch();

  const formatAddress = (address: any) => {
    const parts = [
      address.street,
      address.sitio,
      address.barangay,
      address.city,
      address.province
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <View className="space-y-4">
      {/* Header */}
      <View className="bg-white rounded-lg p-4 border border-gray-100">
        <View className="flex-row items-center mb-2">
          <CheckCircle size={20} className="text-green-600 mr-2" color={"#111111"}/>
          <Text className="text-lg font-semibold text-gray-900">
            Review & Submit
          </Text>
        </View>
        <Text className="text-sm text-gray-600">
          Please review all information before submitting your complaint
        </Text>
      </View>

      {/* Complainant Review */}
      <View className="bg-white rounded-lg border border-gray-100">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
          <View className="flex-row items-center">
            <User size={18} className="text-blue-600 mr-2" />
            <Text className="font-medium text-gray-900">Complainant(s)</Text>
          </View>
          <TouchableOpacity>
            <Edit size={16} className="text-blue-600" />
          </TouchableOpacity>
        </View>
        
        {formData.complainant?.map((complainant, index) => (
          <View key={index} className="p-4 border-b border-gray-50 last:border-b-0">
            <Text className="font-medium text-gray-900 mb-1">
              {complainant.fullName}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">
              {complainant.gender}, {complainant.age} years old
            </Text>
            <Text className="text-sm text-gray-600 mb-1">
              {complainant.contactNumber}
            </Text>
            <Text className="text-sm text-gray-600">
              {formatAddress(complainant.address)}
            </Text>
          </View>
        ))}
      </View>

      {/* Accused Review */}
      <View className="bg-white rounded-lg border border-gray-100">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
          <View className="flex-row items-center">
            <UserX size={18} className="text-red-600 mr-2" />
            <Text className="font-medium text-gray-900">Accused</Text>
          </View>
          <TouchableOpacity>
            <Edit size={16} className="text-blue-600" />
          </TouchableOpacity>
        </View>
        
        {formData.accused?.map((accused, index) => (
          <View key={index} className="p-4 border-b border-gray-50 last:border-b-0">
            <Text className="font-medium text-gray-900 mb-1">
              {accused.alias}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">
              {accused.gender}, {accused.age} years old
            </Text>
            <Text className="text-sm text-gray-600 mb-2">
              {accused.description}
            </Text>
            <Text className="text-sm text-gray-600">
              {formatAddress(accused.address)}
            </Text>
          </View>
        ))}
      </View>

      {/* Incident Review */}
      <View className="bg-white rounded-lg border border-gray-100">
        <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
          <View className="flex-row items-center">
            <FileText size={18} className="text-orange-600 mr-2" />
            <Text className="font-medium text-gray-900">Incident Details</Text>
          </View>
          <TouchableOpacity>
            <Edit size={16} className="text-blue-600" />
          </TouchableOpacity>
        </View>
        
        <View className="p-4">
          <View className="space-y-3">
            <View>
              <Text className="text-sm font-medium text-gray-900">Type</Text>
              <Text className="text-sm text-gray-600">
                {formData.incident?.type === 'Other' 
                  ? formData.incident?.otherType 
                  : formData.incident?.type}
              </Text>
            </View>
            
            <View>
              <Text className="text-sm font-medium text-gray-900">Location</Text>
              <Text className="text-sm text-gray-600">{formData.incident?.location}</Text>
            </View>
            
            <View className="flex-row space-x-4">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">Date</Text>
                <Text className="text-sm text-gray-600">{formData.incident?.date}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-900">Time</Text>
                <Text className="text-sm text-gray-600">{formData.incident?.time}</Text>
              </View>
            </View>
            
            <View>
              <Text className="text-sm font-medium text-gray-900">Description</Text>
              <Text className="text-sm text-gray-600 mt-1">
                {formData.incident?.description}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Documents Review */}
      {formData.documents && formData.documents.length > 0 && (
        <View className="bg-white rounded-lg border border-gray-100">
          <View className="p-4 border-b border-gray-100">
            <Text className="font-medium text-gray-900">Supporting Documents</Text>
          </View>
          
          <View className="p-4">
            {formData.documents.map((doc, index) => (
              <View key={index} className="flex-row items-center py-2">
                <FileText size={16} className="text-gray-600 mr-2" />
                <Text className="text-sm text-gray-600 flex-1">{doc.name}</Text>
                <Text className="text-xs text-gray-500">
                  {(doc.size / 1024 / 1024).toFixed(1)} MB
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Terms and Submit */}
      <View className="bg-white rounded-lg p-4 border border-gray-100">
        <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <Text className="text-sm text-yellow-800 font-medium mb-1">
            Important Notice
          </Text>
          <Text className="text-xs text-yellow-700">
            By submitting this complaint, you acknowledge that all information provided is true and accurate to the best of your knowledge. False reporting may result in legal consequences.
          </Text>
        </View>

        <TouchableOpacity
          onPress={onSubmit}
          disabled={isSubmitting}
          className={`min-h-[56px] rounded-lg flex-row items-center justify-center ${
            isSubmitting ? 'bg-gray-400' : 'bg-green-600'
          }`}
        >
          <CheckCircle size={20} className="text-white mr-2" />
          <Text className="text-white text-base font-semibold">
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </Text>  
        </TouchableOpacity>

        <Text className="text-xs text-gray-500 text-center mt-2">
          Your complaint will be reviewed by the barangay officials
        </Text>
      </View>
    </View>
  );
};
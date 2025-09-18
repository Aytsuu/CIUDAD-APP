import React, { memo, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { ComplaintFormData } from '@/form-schema/complaint-schema';
import { CheckCircle, User, UserX, FileText, Edit } from 'lucide-react-native';

interface ReviewStepProps {
  form: UseFormReturn<ComplaintFormData>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

// Memoized header component
const ReviewHeader = memo(() => (
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
));

ReviewHeader.displayName = 'ReviewHeader';

// Memoized complainant section
const ComplainantSection = memo(({ complainants }: { complainants: any[] }) => (
  <View className="bg-white rounded-lg border border-gray-100">
    <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
      <View className="flex-row items-center">
        <User size={18} className="text-blue-600 mr-2" />
        <Text className="font-medium text-gray-900">Complainant(s)</Text>
      </View>
    </View>
    
    {complainants?.map((complainant, index) => (
      <View key={index} className="p-4 border-b border-gray-50 last:border-b-0">
        <Text className="font-medium text-gray-900 mb-1">
          {complainant.cpnt_name}
        </Text>
        <Text className="text-sm text-gray-600 mb-1">
          {complainant.cpnt_gender === 'Other' && complainant.cpnt_custom_gender 
            ? complainant.cpnt_custom_gender 
            : complainant.cpnt_gender}, {complainant.cpnt_age} years old
        </Text>
        <Text className="text-sm text-gray-600 mb-1">
          {complainant.cpnt_number}
        </Text>
        <Text className="text-sm text-gray-600 mb-1">
          Relation: {complainant.cpnt_relation_to_respondent}
        </Text>
        <Text className="text-sm text-gray-600">
          {complainant.cpnt_address}
        </Text>
        {complainant.rp_id && (
          <Text className="text-xs text-gray-500 mt-1">
            Resident ID: {complainant.rp_id}
          </Text>
        )}
      </View>
    ))}
  </View>
));

ComplainantSection.displayName = 'ComplainantSection';

// Memoized accused section
const AccusedSection = memo(({ accused }: { accused: any[] }) => (
  <View className="bg-white rounded-lg border border-gray-100">
    <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
      <View className="flex-row items-center">
        <UserX size={18} className="text-red-600 mr-2" />
        <Text className="font-medium text-gray-900">Accused</Text>
      </View>
    </View>
    
    {accused?.map((accusedPerson, index) => (
      <View key={index} className="p-4 border-b border-gray-50 last:border-b-0">
        <Text className="font-medium text-gray-900 mb-1">
          {accusedPerson.acsd_name}
        </Text>
        <Text className="text-sm text-gray-600 mb-1">
          {accusedPerson.acsd_gender === 'Other' && accusedPerson.acsd_custom_gender 
            ? accusedPerson.acsd_custom_gender 
            : accusedPerson.acsd_gender}, {accusedPerson.acsd_age} years old
        </Text>
        <Text className="text-sm text-gray-600 mb-2">
          {accusedPerson.acsd_description}
        </Text>
        <Text className="text-sm text-gray-600">
          {accusedPerson.acsd_address}
        </Text>
        {accusedPerson.rp_id && (
          <Text className="text-xs text-gray-500 mt-1">
            Resident ID: {accusedPerson.rp_id}
          </Text>
        )}
      </View>
    ))}
  </View>
));

AccusedSection.displayName = 'AccusedSection';

// Memoized incident section
const IncidentSection = memo(({ incident }: { incident: any }) => (
  <View className="bg-white rounded-lg border border-gray-100">
    <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
      <View className="flex-row items-center">
        <FileText size={18} className="text-orange-600 mr-2" />
        <Text className="font-medium text-gray-900">Incident Details</Text>
      </View>
    </View>
    
    <View className="p-4">
      <View className="space-y-3">
        <View>
          <Text className="text-sm font-medium text-gray-900">Type</Text>
          <Text className="text-sm text-gray-600">
            {incident?.comp_incident_type === 'Other' 
              ? incident?.comp_other_type 
              : incident?.comp_incident_type}
          </Text>
        </View>
        
        <View>
          <Text className="text-sm font-medium text-gray-900">Location</Text>
          <Text className="text-sm text-gray-600">{incident?.comp_location}</Text>
        </View>
        
        <View>
          <Text className="text-sm font-medium text-gray-900">Date and Time</Text>
          <Text className="text-sm text-gray-600">
            {incident?.comp_datetime} {incident?.comp_datetime_time}
          </Text>
        </View>
        
        <View>
          <Text className="text-sm font-medium text-gray-900">Description (Allegation)</Text>
          <Text className="text-sm text-gray-600 mt-1">
            {incident?.comp_allegation}
          </Text>
        </View>
      </View>
    </View>
  </View>
));

IncidentSection.displayName = 'IncidentSection';

// Memoized documents section
const DocumentsSection = memo(({ documents }: { documents: any[] }) => {
  if (!documents || documents.length === 0) return null;

  return (
    <View className="bg-white rounded-lg border border-gray-100">
      <View className="p-4 border-b border-gray-100">
        <Text className="font-medium text-gray-900">Supporting Documents</Text>
      </View>
      
      <View className="p-4">
        {documents.map((doc, index) => (
          <View key={index} className="flex-row items-center py-2">
            <FileText size={16} className="text-gray-600 mr-2" />
            <Text className="text-sm text-gray-600 flex-1">{doc.name}</Text>
            <Text className="text-xs text-gray-500">
              {doc.size ? `${(doc.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

DocumentsSection.displayName = 'DocumentsSection';

// Memoized submit section
const SubmitSection = memo(({ onSubmit, isSubmitting }: { onSubmit: () => void; isSubmitting: boolean }) => (
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
));

SubmitSection.displayName = 'SubmitSection';

export const Review: React.FC<ReviewStepProps> = memo(({ form, onSubmit, isSubmitting }) => {
  const { control } = form;
  
  // Use useWatch for specific fields to minimize re-renders
  const complainants = useWatch({ control, name: 'complainant' });
  const accused = useWatch({ control, name: 'accused' });
  const incident = useWatch({ control, name: 'incident' });
  const documents = useWatch({ control, name: 'documents' });

  return (
    <ScrollView className="space-y-4" showsVerticalScrollIndicator={false}>
      <ReviewHeader />
      
      <ComplainantSection complainants={complainants} />
      
      <AccusedSection accused={accused} />
      
      <IncidentSection incident={incident} />
      
      <DocumentsSection documents={documents} />
      
      <SubmitSection onSubmit={onSubmit} isSubmitting={isSubmitting} />
    </ScrollView>
  );
});

Review.displayName = 'Review';
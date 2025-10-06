import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { ComplaintFormData } from '@/form-schema/complaint-schema';
import { FormInput } from '@/components/ui/form/form-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { Plus, X, User, UserCheck, UserPlus, Search } from 'lucide-react-native';
import { SearchInput } from '@/components/ui/search-input';
import { useGetResidentLists } from '../api-operations/queries/ComplaintGetQueries';

interface RegisteredUser {
  rp_id: string;
  cpnt_name: string;
  cpnt_age: string;
  cpnt_gender: string;
  cpnt_number: string;
  cpnt_address: string;
}

interface ComplainantStepProps {
  form: UseFormReturn<ComplaintFormData>;
}

export const Complainant: React.FC<ComplainantStepProps> = ({ form }) => {
  const { control, setValue, getValues } = form;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RegisteredUser[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'complainant',
  });

  const { data: residents = [], isLoading, error } = useGetResidentLists();

  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];

  // Filter residents based on search query
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const filteredResults = residents.filter((resident: RegisteredUser) =>
      resident.cpnt_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.rp_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.cpnt_number.includes(searchQuery)
    );

    setSearchResults(filteredResults);
    setShowSearchResults(true);
  }, [searchQuery, residents]);

  const addManualComplainant = () => {
    const newComplainant = {
      cpnt_name: '',
      cpnt_gender: 'Male' as const,
      cpnt_age: '',
      cpnt_relation_to_respondent: '',
      cpnt_number: '',
      cpnt_address: '',
      cpnt_custom_gender: '',
      rp_id: null,
      is_registered_user: false,
    };
    
    append(newComplainant);
  };

  const removeComplainant = (index: number) => {
    if (fields.length === 1) {
      Alert.alert(
        "Cannot Remove",
        "At least one complainant is required."
      );
      return;
    }
    remove(index);
  };

  const handleSelectRegisteredUser = (user: RegisteredUser) => {
    const newComplainant = {
      rp_id: user.rp_id,
      cpnt_name: user.cpnt_name,
      cpnt_age: user.cpnt_age,
      cpnt_gender: user.cpnt_gender,
      cpnt_number: user.cpnt_number,
      cpnt_address: user.cpnt_address,
      cpnt_relation_to_respondent: '',
      cpnt_custom_gender: '',
      is_registered_user: true,
    };
    
    append(newComplainant);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleClearRegisteredUser = (index: number) => {
    Alert.alert(
      "Clear Registered User",
      "Are you sure you want to clear this registered user and switch to manual input?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setValue(`complainant.${index}.rp_id`, null);
            setValue(`complainant.${index}.cpnt_name`, '');
            setValue(`complainant.${index}.cpnt_age`, '');
            setValue(`complainant.${index}.cpnt_gender`, 'Male');
            setValue(`complainant.${index}.cpnt_number`, '');
            setValue(`complainant.${index}.cpnt_address`, '');
            setValue(`complainant.${index}.cpnt_custom_gender`, '');
          }
        }
      ]
    );
  };

  const renderUserSearchResult = ({ item }: { item: RegisteredUser }) => (
    <TouchableOpacity
      className="p-4 border-b border-gray-100 bg-white"
      onPress={() => handleSelectRegisteredUser(item)}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900">{item.cpnt_name}</Text>
          <Text className="text-sm text-gray-600 mt-1">ID: {item.rp_id}</Text>
          <Text className="text-sm text-gray-600">
            {item.cpnt_age} years old • {item.cpnt_gender}
          </Text>
          <Text className="text-sm text-gray-600">{item.cpnt_number}</Text>
          <Text className="text-sm text-gray-500 mt-1">{item.cpnt_address}</Text>
        </View>
        <UserCheck size={20} className="text-blue-600" />
      </View>
    </TouchableOpacity>
  );

  if (error) {
    return (
      <View className="bg-white rounded-lg p-4 border border-red-200">
        <Text className="text-red-600 text-center">
          Failed to load resident data. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <View className="space-y-4">
      {/* Header */}
      <View className="bg-white rounded-lg p-4 border border-gray-100">
        <View className="flex-row items-center mb-2 gap-x-2">
          <User size={20} className="text-blue-600" color="#2563eb" />
          <Text className="text-lg font-semibold text-gray-900">
            Complainant Information
          </Text>
        </View>
        <Text className="text-sm text-gray-600">
          Search for registered residents or add complainants manually
        </Text>
      </View>

      {/* Search Interface */}
      <View className="bg-white rounded-lg border border-gray-100">
        <View className="p-4 border-b border-gray-100">
          <View className="flex-row items-center mb-2">
            <Search size={18} className="text-blue-600 mr-2" />
            <Text className="text-md font-medium text-gray-900">
              Search Registered Residents
            </Text>
          </View>
          <Text className="text-sm text-gray-600 mb-3">
            {isLoading ? 'Loading residents...' : 'Search by name, ID, or contact number'}
          </Text>
        </View>
        
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={() => {}}
        />
        
        {/* Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <View className="max-h-64 border-t border-gray-100">
            <FlatList
              data={searchResults}
              renderItem={renderUserSearchResult}
              keyExtractor={(item) => item.rp_id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
        
        {showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && !isLoading && (
          <View className="p-4 text-center border-t border-gray-100">
            <Text className="text-gray-500">No residents found matching "{searchQuery}"</Text>
          </View>
        )}
      </View>

      {/* Add Manual Complainant Button */}
      <TouchableOpacity
        onPress={addManualComplainant}
        className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300 flex-row items-center justify-center"
      >
        <UserPlus size={20} className="text-blue-600 mr-2" />
        <Text className="text-blue-600 font-medium">Add Manual Complainant</Text>
      </TouchableOpacity>

      {/* Complainant Forms */}
      {fields.map((field, index) => {
        const currentComplainant = getValues(`complainant.${index}`);
        const isRegisteredUser = currentComplainant?.rp_id && currentComplainant.rp_id.trim() !== '';

        return (
          <View key={field.id} className="bg-white rounded-lg p-4 border border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-md font-medium text-gray-900">
                Complainant {index + 1}
                {isRegisteredUser && (
                  <Text className="text-sm text-green-600 font-normal"> (Registered)</Text>
                )}
              </Text>
              <TouchableOpacity 
                onPress={() => removeComplainant(index)} 
                className="p-2"
                disabled={fields.length === 1}
              >
                <X size={18} className={fields.length === 1 ? "text-gray-400" : "text-red-500"} />
              </TouchableOpacity>
            </View>

            {/* Registered User Info Display */}
            {isRegisteredUser && (
              <View className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-green-700">
                    ✓ Registered Resident Selected
                  </Text>
                  <TouchableOpacity 
                    onPress={() => handleClearRegisteredUser(index)}
                    className="px-3 py-1 bg-red-50 rounded-md"
                  >
                    <Text className="text-red-600 text-sm">Clear</Text>
                  </TouchableOpacity>
                </View>
                <View className="bg-white p-3 rounded border">
                  <Text className="font-medium text-gray-900">{currentComplainant.cpnt_name}</Text>
                  <Text className="text-sm text-gray-600">ID: {currentComplainant.rp_id}</Text>
                  <Text className="text-sm text-gray-600">
                    {currentComplainant.cpnt_age} years old • {currentComplainant.cpnt_gender}
                  </Text>
                  <Text className="text-sm text-gray-600">{currentComplainant.cpnt_number}</Text>
                  <Text className="text-sm text-gray-500 mt-1">{currentComplainant.cpnt_address}</Text>
                </View>
              </View>
            )}

            <View className="space-y-4">
              {/* Relation to Accused - Always Required */}
              <FormInput
                control={control}
                name={`complainant.${index}.cpnt_relation_to_respondent`}
                label="Relation to Accused *"
                placeholder="e.g., Neighbor, Colleague, Victim, etc."
              />

              {/* Manual Input Fields - Only show for unregistered users */}
              {!isRegisteredUser && (
                <>
                  <FormInput
                    control={control}
                    name={`complainant.${index}.cpnt_name`}
                    label="Full Name *"
                    placeholder="Enter complete name"
                  />

                  <View className="flex-row space-x-3">
                    <View className="flex-1">
                      <FormSelect
                        control={control}
                        name={`complainant.${index}.cpnt_gender`}
                        label="Gender *"
                        options={genderOptions}
                      />
                    </View>
                    <View className="flex-1">
                      <FormInput
                        control={control}
                        name={`complainant.${index}.cpnt_age`}
                        label="Age *"
                        placeholder="Age"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  {/* Custom Gender Input - Show when Other is selected */}
                  {currentComplainant?.cpnt_gender === 'Other' && (
                    <FormInput
                      control={control}
                      name={`complainant.${index}.cpnt_custom_gender`}
                      label="Specify Gender *"
                      placeholder="Please specify your gender"
                    />
                  )}

                  <FormInput
                    control={control}
                    name={`complainant.${index}.cpnt_number`}
                    label="Contact Number *"
                    placeholder="09XXXXXXXXX"
                    keyboardType="phone-pad"
                  />

                  <FormInput
                    control={control}
                    name={`complainant.${index}.cpnt_address`}
                    label="Complete Address *"
                    placeholder="Street, Barangay, City, Province"
                    // multiline={true}
                    // numberOfLines={3}
                  />
                </>
              )}
            </View>
          </View>
        );
      })}

      {/* Summary */}
      {fields.length > 0 && (
        <View className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <Text className="text-sm font-medium text-blue-900 mb-1">
            Summary: {fields.length} Complainant{fields.length > 1 ? 's' : ''} Added
          </Text>
          <Text className="text-sm text-blue-700">
            {fields.filter((_field, index) => {
              const complainant = getValues(`complainant.${index}`);
              return complainant?.rp_id && complainant.rp_id.trim() !== '';
            }).length} registered user(s), {fields.length - fields.filter((_field, index) => {
              const complainant = getValues(`complainant.${index}`);
              return complainant?.rp_id && complainant.rp_id.trim() !== '';
            }).length} manual input(s)
          </Text>
        </View>
      )}
    </View>
  );
};
// components/FamilyHistoryTab.tsx
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, FlatList, Modal } from "react-native";
import { Search, Users, X, ChevronRight } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { LoadingState } from "@/components/ui/loading-state";

interface FamilyHistoryTabProps {
  pat_id: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  famHistoryData: any;
  isFamHistoryLoading: boolean;
  isFamHistoryError: boolean;
}

// Family History Search Component
const FamilyHistorySearch = ({ 
  searchValue, 
  onSearchChange, 
  onClearSearch 
}: { 
  searchValue: string; 
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}) => {
  return (
    <View className="flex-row items-center mb-3">
      <View className="flex-1 flex-row items-center px-3 py-2 border border-gray-300 bg-gray-50 rounded-lg">
        <Search size={18} color="#6B7280" />
        <TextInput
          className="flex-1 ml-2 text-gray-800 text-sm"
          placeholder="Search family history..."
          placeholderTextColor="#9CA3AF"
          value={searchValue}
          onChangeText={onSearchChange}
        />
        {searchValue && (
          <TouchableOpacity onPress={onClearSearch} className="ml-2 p-1">
            <X size={16} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// PH Illness Card Component - Only for illnesses with family history
const PHIllnessCard = ({ illness }: { illness: any }) => {
  return (
    <View className="border border-red-200 rounded-lg p-3 mb-2 bg-red-50">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="font-medium text-sm text-red-800">
            {illness.illname}
          </Text>
          {illness.ill_description && (
            <Text className="text-xs text-gray-600 mt-1">
              {illness.ill_description}
            </Text>
          )}
        </View>
        <View className="w-6 h-6 rounded-full items-center justify-center ml-2 bg-red-100">
          <X size={12} color="#EF4444" />
        </View>
      </View>
      
    </View>
  );
};

// Other Illnesses Card
const OtherIllnessesCard = ({ otherIllnesses }: { otherIllnesses: string }) => {
  if (!otherIllnesses || otherIllnesses === "None") return null;

  const illnesses = otherIllnesses.split(", ");

  return (
    <View className="border border-amber-200 rounded-lg p-3 mb-2 bg-amber-50">
      <Text className="font-medium text-sm text-amber-800 mb-2">
        Other Family History
      </Text>
      
      <View className="space-y-1">
        {illnesses.map((illness, index) => (
          <View key={index} className="flex-row items-center">
            <View className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-2" />
            <Text className="text-xs text-amber-700">{illness}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// Family Summary Card - Simplified
const FamilySummaryCard = ({ data }: { data: any }) => {
  return (
    <View className="border border-blue-200 rounded-lg p-3 mb-2 bg-blue-50">
      <View className="flex-row items-center mb-2">
        <Users size={16} color="#2563EB" />
        <Text className="ml-2 font-medium text-sm text-blue-800">
          Family Summary
        </Text>
      </View>
      
      <View className="flex-row justify-between">
        <View className="items-center">
          <Text className="text-xs text-blue-600">Members</Text>
          <Text className="text-sm font-semibold text-blue-800">{data.family_members_count || 0}</Text>
        </View>
        
        <View className="items-center">
          <Text className="text-xs text-blue-600"> Medical Condition</Text>
          <Text className="text-sm font-semibold text-blue-800">
            {data.ph_illnesses_with_history || 0}
          </Text>
        </View>
        
        {data.other_illnesses_distinct_count > 0 && (
          <View className="items-center">
            <Text className="text-xs text-blue-600">Other</Text>
            <Text className="text-sm font-semibold text-blue-800">{data.other_illnesses_distinct_count}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Full Family History Modal
const FamilyHistoryModal = ({
  visible,
  onClose,
  processedData,
  searchValue,
  onSearchChange,
  onClearSearch,
  isLoading
}: {
  visible: boolean;
  onClose: () => void;
  processedData: any;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  isLoading: boolean;
}) => {
  const { phIllnesses, otherIllnesses, summary } = processedData;
  const hasData = phIllnesses.length > 0 || otherIllnesses !== "None";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white pt-4">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 pb-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <Users size={20} color="#0EA5E9" />
            <Text className="text-lg font-semibold text-gray-800 ml-2">
              Family History
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-4 py-3 border-b border-gray-100">
          <FamilyHistorySearch 
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            onClearSearch={onClearSearch}
          />
        </View>

        {/* Content Count */}
        {searchValue && hasData && (
          <View className="px-4 py-2 bg-gray-50">
            <Text className="text-sm text-gray-600">
              {phIllnesses.length} record{phIllnesses.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        )}

        {/* Family History List */}
        <View className="flex-1">
          {isLoading ? (
            <View className="py-8 items-center justify-center">
              <LoadingState />
              <Text className="text-gray-500 text-sm mt-2">Loading family history...</Text>
            </View>
          ) : hasData ? (
            <FlatList
              data={[
                { type: 'summary', data: summary, id: 'summary' },
                { type: 'other', data: otherIllnesses, id: 'other-illnesses' },
                ...phIllnesses.map((illness: any) => ({ 
                  type: 'ph-illness', 
                  data: illness, 
                  id: illness.ill_id || illness.ill_code 
                }))
              ]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                if (item.type === 'summary') {
                  return <FamilySummaryCard data={item.data} />;
                } else if (item.type === 'other') {
                  return <OtherIllnessesCard otherIllnesses={item.data} />;
                } else {
                  return <PHIllnessCard illness={item.data} />;
                }
              }}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={true}
            />
          ) : (
            <View className="py-16 items-center justify-center px-4">
              <Users size={48} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-4 text-base">
                {searchValue 
                  ? `No family history found for "${searchValue}"` 
                  : "No family history records"
                }
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export const FamilyHistoryTab: React.FC<FamilyHistoryTabProps> = ({
  pat_id,
  searchValue,
  onSearchChange,
  onClearSearch,
  famHistoryData,
  isFamHistoryLoading,
  isFamHistoryError
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Process family history data - ONLY include illnesses with family history
  const getProcessedData = () => {
    if (!famHistoryData || typeof famHistoryData !== 'object') {
      return {
        phIllnesses: [],
        otherIllnesses: "None",
        summary: null
      };
    }

    // Filter to ONLY include PH illnesses that have family history
    let phIllnesses = famHistoryData.ph_illnesses?.data || [];
    phIllnesses = phIllnesses.filter((illness: any) => illness.has_family_history === true);

    // Apply search filter if needed
    if (searchValue && Array.isArray(phIllnesses)) {
      phIllnesses = phIllnesses.filter((illness: any) => 
        illness.illname?.toLowerCase().includes(searchValue.toLowerCase()) ||
        illness.ill_description?.toLowerCase().includes(searchValue.toLowerCase()) ||
        illness.ill_code?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    // Filter other illnesses by search if needed
    let otherIllnesses = famHistoryData.other_illnesses || "None";
    if (searchValue && otherIllnesses !== "None") {
      const illnesses = otherIllnesses.split(", ").filter((illness: string) =>
        illness.toLowerCase().includes(searchValue.toLowerCase())
      );
      otherIllnesses = illnesses.length > 0 ? illnesses.join(", ") : "None";
    }

    return {
      phIllnesses,
      otherIllnesses,
      summary: {
        family_members_count: famHistoryData.family_members_count,
        ph_illnesses_with_history: phIllnesses.length, // Only count illnesses with history
        other_illnesses_distinct_count: famHistoryData.other_illnesses_distinct_count
      }
    };
  };

  const processedData = getProcessedData();
  const { phIllnesses, otherIllnesses, summary } = processedData;
  const hasData = phIllnesses.length > 0 || otherIllnesses !== "None";

  // Show limited preview (2 items max for PH illnesses)
  const previewPHIllnesses = phIllnesses.slice(0, 2);
  const hasMoreItems = phIllnesses.length > 2;

  if (isFamHistoryLoading) {
    return (
      <View className="flex-1">
        <FamilyHistorySearch 
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onClearSearch={onClearSearch}
        />
        <View className="py-6 items-center">
          <LoadingState />
          <Text className="text-gray-500 text-sm mt-2">Loading family history...</Text>
        </View>
      </View>
    );
  }

  if (isFamHistoryError) {
    return (
      <View className="flex-1">
        <FamilyHistorySearch 
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          onClearSearch={onClearSearch}
        />
        <View className="py-8 items-center justify-center flex-1">
          <Users size={40} color="#D1D5DB" />
          <Text className="text-gray-500 text-center mt-2 text-sm">
            Failed to load family history
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Search Bar */}
      <FamilyHistorySearch 
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
      />

      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Users size={18} color="#0EA5E9" />
          <Text className="text-base font-semibold text-gray-800 ml-2">
            Family History
          </Text>
        </View>
        {searchValue && hasData && (
          <Text className="text-xs text-gray-500">
            {phIllnesses.length} found
          </Text>
        )}
      </View>

      {/* Preview Content with limited items */}
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        className="border border-gray-200 rounded-lg bg-white overflow-hidden"
      >
        <View className="flex-1">
          {!hasData ? (
            <View className="py-8 items-center justify-center">
              <Users size={32} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-2 text-sm">
                {searchValue 
                  ? `No family history found for "${searchValue}"` 
                  : "No family history records"
                }
              </Text>
            </View>
          ) : (
            <>
              {/* Preview Cards */}
              <View className="p-3">
                {summary && <FamilySummaryCard data={summary} />}
                {otherIllnesses !== "None" && (
                  <OtherIllnessesCard otherIllnesses={otherIllnesses} />
                )}
                {previewPHIllnesses.map((illness: any) => (
                  <PHIllnessCard key={illness.ill_id || illness.ill_code} illness={illness} />
                ))}
              </View>
              
              {/* Show More Footer */}
              {hasMoreItems && (
                <View className="border-t border-gray-100 bg-gray-50 px-4 py-3 flex-row items-center justify-between">
                  <Text className="text-sm text-blue-600 font-medium">
                    Show all {phIllnesses.length} records
                  </Text>
                  <ChevronRight size={16} color="#0EA5E9" />
                </View>
              )}
            </>
          )}
        </View>
      </TouchableOpacity>

      {/* Full History Modal */}
      <FamilyHistoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        processedData={processedData}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
        isLoading={isFamHistoryLoading}
      />
    </View>
  );
};
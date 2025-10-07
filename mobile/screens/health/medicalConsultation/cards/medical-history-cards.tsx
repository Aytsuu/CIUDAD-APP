// components/MedicalHistoryTab.tsx
import React, { useMemo, useCallback, useState } from "react";
import { View, TextInput, TouchableOpacity, FlatList, Modal, ScrollView } from "react-native";
import { Search, HeartPulse, Calendar, X, AlertCircle, ChevronRight } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { LoadingState } from "@/components/ui/loading-state";
import { ServiceTypeBadge } from "./service-type-badge";

interface MedicalHistoryTabProps {
  pat_id: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  medHistoryData: any;
  isMedHistoryLoading: boolean;
  isMedHistoryError: boolean;
  medHistoryError: any;
}

// Medical History Search Component
const MedicalHistorySearch = ({ 
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
          placeholder="Search illness, diagnosis..."
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

// Medical History Card Component
const MedicalHistoryCard = ({ history }: { history: any }) => {
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "Not specified") return "No date";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  return (
    <View className={`border rounded-lg p-3 mb-2 ${history.isError ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
      {/* Main Content Row */}
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 mr-2">
          <View className="flex-row justify-between items-center mb-1">
            <Text className={`font-semibold text-sm mb-1 ${history.isError ? "text-red-600" : "text-gray-800"}`}>
              {history.illness}
            </Text>
            {!history.isError && (
              <View className="flex-row items-center ml-2 bg-gray-100 px-2 py-1 rounded">
                <Calendar size={12} color="#6B7280" />
                <Text className="text-xs text-gray-700 ml-1">
                  {formatDate(history.ill_date)}
                </Text>
              </View>
            )}
          </View>

          {/* Service Type and Date */}
          <View className="flex-row items-center flex-wrap">
            <Text className="text-xs text-gray-600 mr-2">recorded from:</Text>
            <ServiceTypeBadge type={history.patrec_type} size="sm" />
          </View>
        </View>
      </View>
    </View>
  );
};

// Full Medical History Modal
const MedicalHistoryModal = ({
  visible,
  onClose,
  medicalHistoryCards,
  searchValue,
  onSearchChange,
  onClearSearch,
  isMedHistoryLoading
}: {
  visible: boolean;
  onClose: () => void;
  medicalHistoryCards: any[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  isMedHistoryLoading: boolean;
}) => {
  const hasData = medicalHistoryCards.length > 0;

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
            <HeartPulse size={20} color="#0EA5E9" />
            <Text className="text-lg font-semibold text-gray-800 ml-2">
              Medical History
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} className="p-2">
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="px-4 py-3 border-b border-gray-100">
          <MedicalHistorySearch 
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            onClearSearch={onClearSearch}
          />
        </View>

        {/* Content Count */}
        {searchValue && hasData && (
          <View className="px-4 py-2 bg-gray-50">
            <Text className="text-sm text-gray-600">
              {medicalHistoryCards.length} record{medicalHistoryCards.length !== 1 ? 's' : ''} found
            </Text>
          </View>
        )}

        {/* Medical History List */}
        <View className="flex-1">
          {isMedHistoryLoading ? (
            <View className="py-8 items-center mt-10 justify-center">
              <LoadingState />
            </View>
          ) : hasData ? (
            <FlatList
              data={medicalHistoryCards}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <MedicalHistoryCard history={item} />}
              contentContainerStyle={{ padding: 16 }}
              showsVerticalScrollIndicator={true}
            />
          ) : (
            <View className="py-16 items-center justify-center px-4">
              <HeartPulse size={48} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-4 text-base">
                {searchValue 
                  ? `No medical history found for "${searchValue}"` 
                  : "No medical history records"
                }
              </Text>
              {!searchValue && (
                <Text className="text-gray-400 text-center text-sm mt-2">
                  Medical history will appear here when available
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export const MedicalHistoryTab: React.FC<MedicalHistoryTabProps> = ({
  pat_id,
  searchValue,
  onSearchChange,
  onClearSearch,
  medHistoryData,
  isMedHistoryLoading,
  isMedHistoryError,
  medHistoryError
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Process medical history data
  const getMedicalHistoryCardsData = useCallback(() => {
    if (isMedHistoryLoading) {
      return [];
    }

    if (isMedHistoryError) {
      return [
        {
          id: "error-card",
          illness: "Error loading medical history",
          patrec_type: "Error",
          isError: true
        }
      ];
    }

    if (!medHistoryData || typeof medHistoryData !== "object") {
      return [];
    }

    const historyList = Array.isArray(medHistoryData.medical_history) 
      ? medHistoryData.medical_history 
      : Array.isArray(medHistoryData) 
        ? medHistoryData 
        : [];

    return historyList.map((history: any) => ({
      id: history.medhist_id || history.id || Math.random().toString(36).substring(2, 9),
      illness: history.illness_name || history.ill?.illname || history.diagnosis || "N/A",
      ill_date: history.ill_date ? String(history.ill_date) : "Not specified",
      patrec_type: history.patrec_type || history.service_type || history.record_type || "Medical Record",
      additional_info: history.notes || history.description || history.additional_info,
      severity: history.severity || history.status,
      isError: false
    }));
  }, [medHistoryData, isMedHistoryLoading, isMedHistoryError, medHistoryError]);

  const medicalHistoryCards = useMemo(() => getMedicalHistoryCardsData(), [getMedicalHistoryCardsData]);
  const hasData = medicalHistoryCards.length > 0;
  const isEmptyState = !isMedHistoryLoading && !hasData;

  // Show limited preview (3 items max)
  const previewCards = medicalHistoryCards.slice(0, 3);
  const hasMoreItems = medicalHistoryCards.length > 3;

  return (
    <View className="flex-1">
      {/* Search Bar */}
      <MedicalHistorySearch 
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
      />

      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <HeartPulse size={18} color="#0EA5E9" />
          <Text className="text-base font-semibold text-gray-800 ml-2">
            Medical History
          </Text>
        </View>
        {searchValue && hasData && (
          <Text className="text-xs text-gray-500">
            {medicalHistoryCards.length} found
          </Text>
        )}
      </View>

      {/* Preview Content with limited items */}
      <TouchableOpacity 
        onPress={() => setModalVisible(true)}
        className="border border-gray-200 rounded-lg bg-white overflow-hidden"
      >
        <View className="flex-1">
          {isMedHistoryLoading ? (
            <View className="py-6 items-center">
              <LoadingState />
              <Text className="text-gray-500 text-sm mt-2">Loading medical history...</Text>
            </View>
          ) : hasData ? (
            <>
              {/* Preview Cards */}
              <View className="p-3">
                {previewCards.map((item:any) => (
                  <MedicalHistoryCard key={item.id} history={item} />
                ))}
              </View>
              
              {/* Show More Footer */}
              {hasMoreItems && (
                <View className="border-t border-gray-100 bg-gray-50 px-4 py-3 flex-row items-center justify-between">
                  <Text className="text-sm text-blue-600 font-medium">
                    Show all {medicalHistoryCards.length} records
                  </Text>
                  <ChevronRight size={16} color="#0EA5E9" />
                </View>
              )}
            </>
          ) : (
            <View className="py-8 items-center justify-center">
              <HeartPulse size={32} color="#D1D5DB" />
              <Text className="text-gray-500 text-center mt-2 text-sm">
                {searchValue 
                  ? `No medical history found for "${searchValue}"` 
                  : "No medical history records"
                }
              </Text>
              {!searchValue && (
                <Text className="text-gray-400 text-center text-xs mt-1">
                  Medical history will appear here when available
                </Text>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Full History Modal */}
      <MedicalHistoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        medicalHistoryCards={medicalHistoryCards}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
        isMedHistoryLoading={isMedHistoryLoading}
      />
    </View>
  );
};
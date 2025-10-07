import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Syringe, CheckCircle, Clock, AlertCircle, User, FileChartColumn, Activity } from 'lucide-react-native';

interface VaccinationStatusCardsProps {
  vaccinations: any[];
  unvaccinatedVaccines: any[];
}

export function VaccinationStatusCards({
  vaccinations = [],
  unvaccinatedVaccines = [],
}: VaccinationStatusCardsProps) {
  const [activeTab, setActiveTab] = useState<'unvaccinated' | 'completed' | 'partial'>('unvaccinated');

  // Group vaccinations
  const groupedVaccinations = vaccinations.reduce((acc, record) => {
    const vaccineId = record.vaccine_stock?.vaccinelist?.vac_id || record.vac_details?.vac_id;
    if (!vaccineId) return acc;

    if (!acc[vaccineId] || new Date(record.date_administered) > new Date(acc[vaccineId].date_administered)) {
      acc[vaccineId] = record;
    }
    return acc;
  }, {});

  // Categorize vaccines
  const categorizedVaccines = {
    completed: Object.values(groupedVaccinations).filter(
      (record: any) => record.vachist_doseNo === record.vacrec_details?.vacrec_totaldose
    ),
    partial: Object.values(groupedVaccinations).filter(
      (record: any) => record.vachist_doseNo < record.vacrec_details?.vacrec_totaldose
    ),
    unvaccinated: unvaccinatedVaccines,
  };

  const TabButton = ({ active, type, count, onPress }: { active: boolean; type: string; count: number; onPress: () => void }) => {
    const colors =
      {
        unvaccinated: { icon: active ? 'text-red-500' : 'text-gray-400', border: active ? 'border-b-2 border-red-500' : 'border-b-2 border-transparent', text: active ? 'text-red-700 font-medium' : 'text-gray-500', bg: active ? 'bg-red-100' : 'bg-gray-100' },
        partial: { icon: active ? 'text-yellow-500' : 'text-gray-400', border: active ? 'border-b-2 border-yellow-500' : 'border-b-2 border-transparent', text: active ? 'text-yellow-700 font-medium' : 'text-gray-500', bg: active ? 'bg-yellow-100' : 'bg-gray-100' },
        completed: { icon: active ? 'text-green-500' : 'text-gray-400', border: active ? 'border-b-2 border-green-500' : 'border-b-2 border-transparent', text: active ? 'text-green-700 font-medium' : 'text-gray-500', bg: active ? 'bg-green-100' : 'bg-gray-100' },
      }[type] ||
      { icon: 'text-gray-400', border: 'border-b-2 border-transparent', text: 'text-gray-500', bg: 'bg-gray-100' };


    return (
      <TouchableOpacity
        onPress={onPress}
        className={`flex-1 py-3 items-center justify-center flex-row ${colors.border}`}
      >
        <Text className={`ml-2 text-sm capitalize ${colors.text}`}>
          {type === 'partial' ? 'Partial' : type}
        </Text>
        <View className={`ml-2 px-2 py-1 rounded-md ${colors.bg}`}>
          <Text className={`text-xs ${active ? 'text-' + type + '-800' : 'text-gray-600'}`}>
            {count}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderVaccineCard = ({ item }: { item: any }) => {
    if (activeTab === 'unvaccinated') {
      return (
        <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-red-500 rounded-full mr-3" />
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">{item.vac_name}</Text>
              {item.age_group && (
                <View className="flex-row items-center mt-1">
                  <Text className="text-xs text-gray-500 font-medium">Age Group: </Text>
                  <Text className="text-xs text-gray-500 ml-1">
                    {item.age_group.name}
                    {item.age_group.range && ` (${item.age_group.range})`}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      );
    }

    const vaccineData = item.vaccine_stock?.vaccinelist || item.vac_details || {};
    const ageGroup = vaccineData.age_group || {};

    return (
      <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
        <View className="flex-row justify-between items-start">
          <View className="flex-row items-start flex-1">
            <View className={`w-3 h-3 rounded-full mr-3 mt-1 ${activeTab === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <View className="flex-1">
              <Text className="font-semibold text-gray-800">{vaccineData.vac_name}</Text>
              <View className="flex-row flex-wrap mt-1">
                <View className="flex-row items-center mr-4">
                  <Text className="text-xs text-gray-500 font-medium">Dose: </Text>
                  <Text className="text-xs text-gray-500 ml-1">
                    {item.vachist_doseNo} of {item.vacrec_details?.vacrec_totaldose}
                  </Text>
                </View>
                {ageGroup && (
                  <View className="flex-row items-center">
                    <Text className="text-xs text-gray-500 font-medium">Age Group: </Text>
                    <Text className="text-xs text-gray-500 ml-1">
                      {ageGroup.agegroup_name}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          {item.date_administered && (
            <Text className="text-xs text-gray-500">
              {new Date(item.date_administered).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    const Icon = {
      completed: CheckCircle,
      partial: Clock,
      unvaccinated: AlertCircle,
    }[activeTab];

    const text = {
      completed: 'No completed vaccines',
      partial: 'No partially vaccinated',
      unvaccinated: 'No unvaccinated vaccines',
    }[activeTab];

    return (
      <View className="flex-1 items-center justify-center py-10">
        <View className="bg-gray-100 rounded-full p-5 mb-4">
          <Icon size={32} className="text-gray-500" />
        </View>
        <Text className="text-gray-600 font-medium">{text}</Text>
      </View>
    );
  };

  return (
    <View className="bg-white rounded-lg p-4 border border-gray-200">
      {/* Header */}
      <View className="flex-row items-center mb-5">
        <View className="bg-blue-100 p-2 rounded-lg mr-3">
          <Activity size={20} className="text-blue-600" />
        </View>
        <Text className="text-lg font-semibold text-gray-800">Vaccination Status</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-200 mb-4">
        <TabButton
          active={activeTab === 'unvaccinated'}
          type="unvaccinated"
          count={categorizedVaccines.unvaccinated.length}
          onPress={() => setActiveTab('unvaccinated')}
        />
        <TabButton
          active={activeTab === 'partial'}
          type="partial"
          count={categorizedVaccines.partial.length}
          onPress={() => setActiveTab('partial')}
        />
        <TabButton
          active={activeTab === 'completed'}
          type="completed"
          count={categorizedVaccines.completed.length}
          onPress={() => setActiveTab('completed')}
        />
      </View>

      {/* Content */}
      <View className="min-h-[250px]">
        <FlatList
          data={
            activeTab === 'unvaccinated'
              ? categorizedVaccines.unvaccinated
              : activeTab === 'partial'
              ? categorizedVaccines.partial
              : categorizedVaccines.completed
          }
          renderItem={renderVaccineCard}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}
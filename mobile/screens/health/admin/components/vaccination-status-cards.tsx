// components/vaccination-status-cards.tsx
import React, { useState } from "react";
import { View, TouchableOpacity, ScrollView } from "react-native";
import { Syringe, CheckCircle, Clock, AlertCircle } from "lucide-react-native";
import { Text } from "@/components/ui/text";

interface VaccinationStatusCardsProps {
  unvaccinatedVaccines: any[];
  vaccinations: any[];
}

export function VaccinationStatusCards({
  unvaccinatedVaccines = [],
  vaccinations = [],
}: VaccinationStatusCardsProps) {
  const [activeTab, setActiveTab] = useState<"unvaccinated" | "completed" | "partial">("unvaccinated");

  // Filter out vaccinations with "in queue" status
  const filteredVaccinations = vaccinations.filter(
    (record) => record.vachist_status !== "in queue"
  );

  // Group filtered vaccinations by vaccine ID and find the latest record for each vaccine
  const latestVaccinationsByVaccine = filteredVaccinations.reduce((acc, record) => {
    const vaccineId = record.vac?.vac_id || 
                     record.vaccine_stock?.vaccinelist?.vac_id || 
                     record.vac_details?.vac_id;
    
    if (!vaccineId) return acc;

    // If we haven't seen this vaccine yet, or this record is newer, update it
    if (!acc[vaccineId] || 
        new Date(record.date_administered) > new Date(acc[vaccineId].date_administered)) {
      acc[vaccineId] = record;
    }
    
    return acc;
  }, {});

  // For each vaccine, find the maximum dose number administered from filtered vaccinations
  const maxDoseByVaccine = filteredVaccinations.reduce((acc, record) => {
    const vaccineId = record.vac?.vac_id || 
                     record.vaccine_stock?.vaccinelist?.vac_id || 
                     record.vac_details?.vac_id;
    
    if (!vaccineId) return acc;

    if (!acc[vaccineId] || record.vachist_doseNo > acc[vaccineId]) {
      acc[vaccineId] = record.vachist_doseNo;
    }
    return acc;
  }, {});

  // Categorize the vaccines (only non-"in queue" status)
  const categorizedVaccines = {
    completed: Object.values(latestVaccinationsByVaccine).filter((record: any) => {
      const vaccineId = record.vac?.vac_id || 
                       record.vaccine_stock?.vaccinelist?.vac_id || 
                       record.vac_details?.vac_id;
      
      const maxDose = maxDoseByVaccine[vaccineId];
      const totalDose = record.vacrec_details?.vacrec_totaldose || 
                       record.vacrec?.vacrec_totaldose;
      
      return maxDose === totalDose;
    }),
    
    partial: Object.values(latestVaccinationsByVaccine).filter((record: any) => {
      const vaccineId = record.vac?.vac_id || 
                       record.vaccine_stock?.vaccinelist?.vac_id || 
                       record.vac_details?.vac_id;
      
      const maxDose = maxDoseByVaccine[vaccineId];
      const totalDose = record.vacrec_details?.vacrec_totaldose || 
                       record.vacrec?.vacrec_totaldose;
      
      return maxDose < totalDose;
    }),
    
    unvaccinated: unvaccinatedVaccines,
  };

  // Compact tab button component
  const TabButton = ({
    active,
    type,
    count,
    onClick,
  }: {
    active: boolean;
    type: "unvaccinated" | "completed" | "partial";
    count: number;
    onClick: () => void;
  }) => {
    const config = {
      unvaccinated: { icon: AlertCircle, color: "#ef4444", bgColor: "bg-red-50", textColor: "text-red-700" },
      partial: { icon: Clock, color: "#f59e0b", bgColor: "bg-yellow-50", textColor: "text-yellow-700" },
      completed: { icon: CheckCircle, color: "#10b981", bgColor: "bg-green-50", textColor: "text-green-700" },
    }[type];

    const displayText = type === "partial" ? "Partial" : type === "unvaccinated" ? "Missing" : "Done";

    return (
      <TouchableOpacity
        onPress={onClick}
        className={`flex-1 py-2 px-3 rounded-lg mx-1 ${
          active ? config.bgColor : "bg-gray-100"
        }`}
      >
        <View className="flex flex-row items-center justify-center gap-1">
          <config.icon
            size={14}
            color={active ? config.color : "#6b7280"}
          />
          <Text className={`text-xs font-medium ${active ? config.textColor : "text-gray-600"}`}>
            {displayText}
          </Text>
          <View className={`px-1.5 py-0.5 rounded-full ${active ? "bg-white" : "bg-gray-200"}`}>
            <Text className={`text-xs ${active ? config.textColor : "text-gray-600"}`}>
              {count}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Compact empty state
  const EmptyState = ({ type }: { type: "unvaccinated" | "completed" | "partial" }) => {
    const messages = {
      unvaccinated: "No missing vaccines",
      partial: "No partial vaccines",
      completed: "No completed vaccines",
    }[type];

    return (
      <View className="flex items-center justify-center py-8">
        <Text className="text-sm text-gray-500">{messages}</Text>
      </View>
    );
  };

  // Compact vaccine item component
  const VaccineItem = ({ record, type, index }: { record: any; type: "unvaccinated" | "completed" | "partial"; index: number }) => {
    const statusConfig = {
      unvaccinated: { color: "bg-red-100", dot: "bg-red-500" },
      partial: { color: "bg-yellow-100", dot: "bg-yellow-500" },
      completed: { color: "bg-green-100", dot: "bg-green-500" },
    }[type];

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    // For unvaccinated vaccines
    if (type === "unvaccinated") {
      return (
        <View key={index} className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
          <View className="flex flex-row items-start gap-3">
            <View className={`w-2 h-2 rounded-full mt-2 ${statusConfig.dot}`} />
            
            <View className="flex-1">
              <Text className="font-medium text-gray-800 text-sm mb-1">
                {record.vac_name}
              </Text>
              
              {record.age_group && (
                <View className={`px-2 py-1 rounded text-xs ${statusConfig.color} self-start`}>
                  <Text className="text-xs text-gray-700">
                    {record.age_group.name}
                    {record.age_group.range && ` (${record.age_group.range})`}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      );
    }

    // For completed/partial vaccines
    const vaccineData = record.vac || 
                       record.vaccine_stock?.vaccinelist || 
                       record.vac_details || {};
    
    const ageGroup = vaccineData.age_group || {};
    const vaccineId = vaccineData.vac_id;
    const maxDose = maxDoseByVaccine[vaccineId];
    const totalDose = record.vacrec_details?.vacrec_totaldose || 
                     record.vacrec?.vacrec_totaldose;

    return (
      <View key={index} className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
        <View className="flex flex-row items-start gap-3">
          <View className={`w-2 h-2 rounded-full mt-2 ${statusConfig.dot}`} />
          
          <View className="flex-1">
            <Text className="font-medium text-gray-800 text-sm mb-1">
              {vaccineData.vac_name}
            </Text>
            
            <View className="flex flex-row flex-wrap gap-1 mb-1">
              {/* Dose information */}
              <View className={`px-2 py-1 rounded text-xs ${statusConfig.color}`}>
                <Text className="text-xs text-gray-700">
                  Dose: {maxDose}/{totalDose}
                </Text>
              </View>

              {/* Age group */}
              {ageGroup.agegroup_name && (
                <View className="px-2 py-1 rounded text-xs bg-gray-100">
                  <Text className="text-xs text-gray-600">
                    {ageGroup.agegroup_name}
                  </Text>
                </View>
              )}
            </View>

            {/* Date */}
            {record.date_administered && (
              <Text className="text-xs text-gray-500">
                {formatDate(record.date_administered)}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderVaccineList = (vaccines: any[]) => {
    if (vaccines.length === 0) {
      return <EmptyState type={activeTab} />;
    }

    return (
      <View className="max-h-80">
        <ScrollView nestedScrollEnabled>
          {vaccines.map((record: any, index: number) => (
            <VaccineItem
              key={index}
              record={record}
              type={activeTab}
              index={index}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1">
      <View className="">
        <View className="bg-white rounded-xl border border-gray-200">
          {/* Header */}
          <View className="p-4 border-b border-gray-100">
            <View className="flex flex-row items-center gap-2">
              <Syringe size={18} color="#3b82f6" />
              <Text className="font-semibold text-gray-800">Vaccination Status</Text>
             
            </View>
          </View>

          {/* Content */}
          <View className="p-4">
            {/* Compact tabs */}
            <View className="flex flex-row mb-4 bg-gray-50 rounded-lg p-1">
              <TabButton
                active={activeTab === "unvaccinated"}
                type="unvaccinated"
                count={categorizedVaccines.unvaccinated.length}
                onClick={() => setActiveTab("unvaccinated")}
              />
              <TabButton
                active={activeTab === "partial"}
                type="partial"
                count={categorizedVaccines.partial.length}
                onClick={() => setActiveTab("partial")}
              />
              <TabButton
                active={activeTab === "completed"}
                type="completed"
                count={categorizedVaccines.completed.length}
                onClick={() => setActiveTab("completed")}
              />
            </View>

            {/* Vaccine list */}
            {activeTab === "unvaccinated" &&
              renderVaccineList(categorizedVaccines.unvaccinated)}
            {activeTab === "partial" &&
              renderVaccineList(categorizedVaccines.partial)}
            {activeTab === "completed" &&
              renderVaccineList(categorizedVaccines.completed)}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
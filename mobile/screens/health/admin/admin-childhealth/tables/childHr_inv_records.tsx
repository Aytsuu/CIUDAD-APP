
import React, { useState, useMemo, useEffect, useContext } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft,Activity,Heart,AlertCircle,Clock,Stethoscope,} from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import { FollowUpsCard } from "@/components/healthcomponents/ch-vax-followup";
import { ChildHealthRecordCard } from "@/components/healthcomponents/childInfoCard";
import { VaccinationStatusCards } from "@/components/healthcomponents/vaccination-status";
import { VaccinationStatusCardsSkeleton } from "@/components/healthcomponents/vaccinationstatus-skeleton";

// Hooks and types
import { useChildHealthHistory } from "../forms/queries/fetchQueries";
import { ChrRecords } from "./types";
import { useFollowupChildHealthandVaccines, usePatientVaccinationDetails, useUnvaccinatedVaccines } from "../../../vaccination/queries/fetch";
// import { LoadingContext } from "@/contexts/LoadingContext";
import { HorizontalDataTable } from "@/components/healthcomponents/data-table";
import { getChildHealthColumns } from "./columns/indiv_col";

export default function InvChildHealthRecords() {
  const router = useRouter();
  const params = useLocalSearchParams();
  console.log('InvChildHealthRecords: Received params via useLocalSearchParams:', params);
  console.log('InvChildHealthRecords: Expected route prop:', arguments[0]?.route);

  const loadingContext = useContext(LoadingContext);
  const { isLoading: globalLoading, showLoading, hideLoading } = loadingContext || {
    isLoading: false,
    showLoading: () => console.warn("LoadingProvider not found"),
    hideLoading: () => console.warn("LoadingProvider not found"),
  };

  // Parse ChildHealthRecord with robust validation
  let ChildHealthRecord = null;
  try {
    if (!params || !params.ChildHealthRecord) {
      console.error("Params or ChildHealthRecord is missing", { params });
    } else {
      ChildHealthRecord = JSON.parse(params.ChildHealthRecord as string);
      if (!ChildHealthRecord?.chrec_id || !ChildHealthRecord?.pat_id || !ChildHealthRecord?.dob) {
        console.error("Parsed ChildHealthRecord is missing required fields", {
          chrec_id: ChildHealthRecord?.chrec_id,
          pat_id: ChildHealthRecord?.pat_id,
          dob: ChildHealthRecord?.dob,
          ChildHealthRecord,
        });
      }
    }
  } catch (error) {
    console.error("Failed to parse ChildHealthRecord from params", {
      // error: message,
      params,
    });
  }

  const [childData] = useState(ChildHealthRecord);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
 const columns = useMemo(() => getChildHealthColumns(childData), [childData]);
  const { data: unvaccinatedVaccines = [], isLoading: isUnvaccinatedLoading } =
    useUnvaccinatedVaccines(childData?.pat_id, childData?.dob);
  const { data: followUps = [], isLoading: followupLoading } =
    useFollowupChildHealthandVaccines(childData?.pat_id);
  const {
    data: historyData = [],
    isLoading: childHistoryLoading,
    isError,
    error,
  } = useChildHealthHistory(childData?.chrec_id);
  const { data: vaccinations = [], isLoading: isCompleteVaccineLoading } =
    usePatientVaccinationDetails(childData?.pat_id);

  const combinedLoading =
    followupLoading ||
    isUnvaccinatedLoading ||
    isCompleteVaccineLoading ||
    childHistoryLoading;

  useEffect(() => {
    if (!childData || !childData.chrec_id) {
      console.error("ChildHealthRecord or chrec_id is missing", { childData });
    }
  }, [childData]);

  useEffect(() => {
    if (combinedLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [combinedLoading, showLoading, hideLoading]);

  if (!childData || !childData.chrec_id || !childData.pat_id || !childData.dob) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <Text className="text-lg font-semibold text-red-600 text-center mb-2">
          Record Not Found
        </Text>
        <Text className="text-gray-600 text-center">
          Child health record data is missing or incomplete. Please ensure the record is correctly selected.
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Button className="bg-blue-600 mt-4">
            <Text className="text-white">Go Back</Text>
          </Button>
        </TouchableOpacity>
      </View>
    );
  }

  const processedHistoryData: ChrRecords[] = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];
    const mainRecord = historyData[0];
    if (!mainRecord || !mainRecord.child_health_histories) {
      return [];
    }
    const sortedHistories = [...mainRecord.child_health_histories].sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return sortedHistories.map((record: any, index: number) => {
      let bmi = "N/A";
      if (record.child_health_vital_signs?.length > 0) {
        const vital = record.child_health_vital_signs[0];
        if (vital.bm_details?.height && vital.bm_details?.weight) {
          const heightInM = vital.bm_details.height / 100;
          const bmiValue = (
            vital.bm_details.weight /
            (heightInM * heightInM)
          ).toFixed(1);
          bmi = bmiValue;
        }
      }

      let latestNoteContent: string | null = null;
      let followUpDescription = "";
      let followUpDate = "";
      let followUpStatus = "";

      if (record.child_health_notes && record.child_health_notes.length > 0) {
        const sortedNotes = [...record.child_health_notes].sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        latestNoteContent = sortedNotes[0].chn_notes || null;

        if (sortedNotes[0].followv_details) {
          followUpDescription =
            sortedNotes[0].followv_details.followv_description || "";
          followUpDate = sortedNotes[0].followv_details.followv_date || "";
          followUpStatus = sortedNotes[0].followv_details.followv_status || "";
        }
      }

      const nutritionStatus = record.nutrition_statuses?.[0] || {
        wfa: "N/A",
        lhfa: "N/A",
        wfl: "N/A",
        muac: "N/A",
        edemaSeverity: "none",
      };

      return {
        chrec_id: mainRecord.chrec_id,
        patrec: mainRecord.patrec_id,
        status: record.status || "N/A",
        chhist_id: record.chhist_id,
        id: index + 1,
        temp: record.child_health_vital_signs?.[0]?.temp || 0,
        age: record.child_health_vital_signs?.[0]?.bm_details?.age || "N/A",
        wt: record.child_health_vital_signs?.[0]?.bm_details?.weight || 0,
        ht: record.child_health_vital_signs?.[0]?.bm_details?.height || 0,
        bmi,
        latestNote: latestNoteContent,
        followUpDescription,
        followUpDate,
        followUpStatus,
        vaccineStat: record.tt_status || "N/A",
        nutritionStatus: {
          wfa: nutritionStatus.wfa || "N/A",
          lhfa: nutritionStatus.lhfa || "N/A",
          wfl: nutritionStatus.wfl || "N/A",
          muac: nutritionStatus.muac || "N/A",
          edemaSeverity: nutritionStatus.edemaSeverity || "none",
        },
        updatedAt: new Date(record.created_at).toLocaleDateString(),
        rawCreatedAt: record.created_at,
      };
    });
  }, [historyData]);

  const latestRecord = useMemo(() => {
    if (processedHistoryData.length === 0) return null;
    return processedHistoryData[0];
  }, [processedHistoryData]);

  const isLatestRecordImmunizationOrCheckup = useMemo(() => {
    if (!latestRecord) return false;
    return (
      latestRecord.status === "immunization" ||
      latestRecord.status === "check-up"
    );
  }, [latestRecord]);

  const filteredData = useMemo(() => {
    return processedHistoryData.filter((item: any) => {
      const searchText = `${item.age} ${item.wt} ${item.ht} ${item.bmi} ${
        item.vaccineStat
      } ${item.nutritionStatus.wfa} ${item.nutritionStatus.lhfa} ${
        item.nutritionStatus.wfl
      } ${item.updatedAt} ${item.latestNote || ""} ${
        item.followUpDescription || ""
      }`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, processedHistoryData]);

  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    return filteredData.slice(startIndex, startIndex + recordsPerPage);
  }, [currentPage, filteredData]);

  const totalPages = Math.ceil(filteredData.length / recordsPerPage);

  const handleNewRecordPress = () => {
    router.push({
      pathname: '/admin/childhealth/individual',
      params: { mode: 'newchildhealthrecord' },
    });
  };

  const handleGoBack = () => {
    router.back();
  };

  const getStatusColor = (status: string) => {
  const lowerStatus = status.toLowerCase();
  
  if (lowerStatus === 'immunization') return 'bg-blue-100 text-blue-700';
  if (lowerStatus === 'check-up') return 'bg-green-100 text-green-700';
  if (lowerStatus === 'follow-up') return 'bg-orange-100 text-orange-700';
  
  return 'bg-gray-100 text-gray-700';
};
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'immunization':
        return <Activity size={14} className="text-blue-600" />;
      case 'check-up':
        return <Stethoscope size={14} className="text-green-600" />;
      case 'follow-up':
        return <Clock size={14} className="text-orange-600" />;
      default:
        return <Heart size={14} className="text-gray-600" />;
    }
  };

  const getNutritionStatusColor = (status: string) => {
  if (!status || status === 'N/A') return 'text-gray-500';
  
  const lowerStatus = status.toLowerCase();
  
  if (lowerStatus.includes('normal')) return 'text-green-600';
  if (lowerStatus.includes('mild')) return 'text-yellow-600';
  if (lowerStatus.includes('moderate')) return 'text-orange-600';
  if (lowerStatus.includes('severe')) return 'text-red-600';
  
  return 'text-gray-600';
};

  const LoadMoreButton = () => {
    if (currentPage >= totalPages) return null;
    
    return (
      <TouchableOpacity
        onPress={() => setCurrentPage(prev => prev + 1)}
        className="mt-4 mb-6"
      >
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4 items-center">
            <Text className="text-blue-700 font-medium">Load More Records</Text>
            <Text className="text-xs text-blue-600 mt-1">
              Showing {currentData.length} of {filteredData.length} records
            </Text>
          </CardContent>
        </Card>
      </TouchableOpacity>
    );
  };

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <Text className="text-lg font-semibold text-red-600 text-center mb-2">
          Error Loading Data
        </Text>
        <Text className="text-gray-600 text-center mb-4">
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Button className="bg-blue-600">
            <Text className="text-white">Go Back</Text>
          </Button>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 py-3 border-b mt-10 border-gray-200">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity
            onPress={handleGoBack}
            className="mr-3 p-2 -ml-2"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900">Health History</Text>
            <Text className="text-sm text-gray-600">
              Complete medical records and checkups
            </Text>
          </View>
        </View>
      </View>

      <View className="p-4 space-y-6 gap-4">
        <ChildHealthRecordCard child={childData} />

        {globalLoading ? (
          <VaccinationStatusCardsSkeleton />
        ) : (
          <View className="space-y-4 mb-5">
            <VaccinationStatusCards
              unvaccinatedVaccines={unvaccinatedVaccines}
              vaccinations={vaccinations}
            />
            <View className="mt-5">
              <FollowUpsCard childHealthFollowups={followUps} />
            </View>
            <HorizontalDataTable columns={columns} data={currentData} />
          </View>
        )}
        
      </View>
    </ScrollView>
  );
}

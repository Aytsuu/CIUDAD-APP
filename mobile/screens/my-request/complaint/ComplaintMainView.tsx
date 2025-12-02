import React, { useState, useEffect } from "react";
import { TouchableOpacity, View, Text,} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ChevronLeft, AlertCircle, } from "lucide-react-native";
import PageLayout from "@/screens/_PageLayout";
import ComplaintDetails from "./ComplaintDetails";
import { ComplaintData } from "./types";
import { useGetComplaintById } from "./queries/ComplaintGetQueries";
import { LoadingState } from "@/components/ui/loading-state";
import CaseTrackingScreen from "./caseTracking";

interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

type TabType = 'details' | 'tracking';

interface ComplaintParams {
  complaint?: string;
  comp_id?: string;
}

export default function ComplaintMainView(): React.JSX.Element {
  const router = useRouter();
  const params = useLocalSearchParams() as ComplaintParams;
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [complaintData, setComplaintData] = useState<ComplaintData | null>(null);

  // Load complaint from params (if passed directly)
  useEffect(() => {
    if (params.complaint) {
      try {
        const parsed: ComplaintData = JSON.parse(params.complaint);
        setComplaintData(parsed);
        console.log('✅ Complaint data loaded from params');
      } catch (error) {
        console.error('❌ Error parsing complaint data:', error);
      }
    }
  }, [params.complaint]);

  // Determine if we need to fetch
  const shouldFetch = !complaintData && !!params.comp_id;

  // Fetch complaint by ID if needed
  const { 
    data: fetchedComplaint, 
    isLoading, 
    isError,
    error 
  } = useGetComplaintById(params.comp_id || '', { 
    enabled: shouldFetch 
  });

  // Update state when fetched
  useEffect(() => {
    if (fetchedComplaint) {
      setComplaintData(fetchedComplaint as ComplaintData);
    }
  }, [fetchedComplaint]);

  // Loading state
  const isDataLoading = isLoading || (!complaintData && shouldFetch);

  // Tab Button Component
  const TabButton: React.FC<TabButtonProps> = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 py-4 items-center border-b-2 ${isActive ? "border-blue-500" : "border-transparent"}`}
    >
      <Text className={`font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const RightHeader = <View className="w-10 h-10" />;

  // Render Loading State
  if (isDataLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <LoadingState/>
      </View>
    );
  }

  // Render Error / No Data State
  if (!complaintData) {
    const errorMessage = error instanceof Error ? error.message : "Something went wrong";
    
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={20} color="#374151" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 font-medium">Blotter Request</Text>}
        rightAction={RightHeader}
        wrapScroll={false}
      >
        <View className="flex-1 justify-center items-center px-4 bg-gray-50">
          <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
            <AlertCircle size={32} color="#EF4444" />
          </View>
          <Text className="text-gray-900 font-PoppinsSemiBold text-lg">
            {isError ? "Failed to load complaint" : "No complaint data available"}
          </Text>
          <Text className="text-gray-500 text-center mt-2 font-PoppinsRegular px-8">
            {isError 
              ? errorMessage 
              : "The complaint you're looking for doesn't exist or couldn't be loaded."}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-blue-500 px-8 py-3 rounded-xl shadow-sm"
            activeOpacity={0.8}
          >
            <Text className="text-white font-PoppinsSemiBold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  // Main Render
  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="flex items-start text-gray-900 font-medium">Blotter Request</Text>}
      rightAction={RightHeader}
      wrapScroll={false}
    >
      <View className="flex-1 bg-gray-50">
        {/* Tab Navigation */}
        <View className="bg-white border-b border-gray-200">
          <View className="flex-row">
            <TabButton
              title="Complaint Details"
              isActive={activeTab === 'details'}
              onPress={() => setActiveTab('details')}
            />
            <TabButton
              title="Case Tracking"
              isActive={activeTab === 'tracking'}
              onPress={() => setActiveTab('tracking')}
            />
          </View>
        </View>

        {/* Tab Content */}
        <View className="flex-1">
          {activeTab === 'details' && (
            <ComplaintDetails data={complaintData} />
          )}

          {activeTab === 'tracking' && (
            <CaseTrackingScreen 
              comp_id={params.comp_id}
              isRaised={fetchedComplaint?.comp_status}
            />
          )}
        </View>
      </View>
    </PageLayout>
  );
}

import { useState } from "react";
import { 
  TouchableOpacity, 
  View, 
  Text, 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  AlertCircle,
} from "lucide-react-native";
import PageLayout from "@/screens/_PageLayout";
import ComplaintDetails from "./complaintDetails";
import { ComplaintData } from "./types";
import CaseTracking from "./caseTracking";

interface TabButtonProps {
  title: string;
  isActive: boolean;
  onPress: () => void;
}

type TabType = 'details' | 'tracking';

export default function ComplaintMainView(): JSX.Element {
  const router = useRouter();
  const { complaint } = useLocalSearchParams<{ complaint: string }>();
  
  // State
  const [activeTab, setActiveTab] = useState<TabType>('details');

  // Parse complaint data
  const data: ComplaintData | null = complaint ? JSON.parse(complaint) : null;

  // Tab Button Component - Updated to match DriverTasksMain style
  const TabButton: React.FC<TabButtonProps> = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 py-4 items-center border-b-2 ${
        isActive ? "border-blue-500" : "border-transparent"
      }`}
    >
      <Text className={`font-medium ${isActive ? "text-blue-600" : "text-gray-500"}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  // Render Error State
  if (!data) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 font-medium">Complaint View</Text>}
        rightAction={<View className="w-10 h-10" />}
      >
        <View className="flex-1 justify-center items-center">
          <AlertCircle size={48} className="text-gray-400 mb-4" />
          <Text className="text-gray-500 text-center">No complaint data available</Text>
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
          className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 font-medium">Complaint View</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 bg-gray-50">
        {/* Tab Navigation - Updated to match DriverTasksMain style */}
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
          {activeTab === 'details' ? (
            <ComplaintDetails data={data} />
          ) : (
            <CaseTracking comp_id = {String(data.comp_id)} isRaised={data.comp_status}/>
          )}
        </View>
      </View>
    </PageLayout>
  );
}
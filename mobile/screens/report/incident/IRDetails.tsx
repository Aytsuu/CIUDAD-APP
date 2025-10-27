import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import PageLayout from "@/screens/_PageLayout";
import { formatDate } from "@/helpers/dateHelpers";
import { LoadingState } from "@/components/ui/loading-state";
import ImageCarousel from "@/components/ui/imageCarousel";

export default function IRDetails() {
  // ============ STATE INITIALIZATION ============
  const router = useRouter();
  const params = useLocalSearchParams();

  const report = React.useMemo(() => {
    try {
      return JSON.parse(params.report as string);
    } catch (error) {
      return null;
    }
  }, [params.report]);

  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);

  // ============ HANDLERS ============
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Add refetch logic here if needed
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // ============ RENDER HELPERS ============
  const InfoRow = ({
    label,
    value,
    valueColor = "text-gray-900",
  }: {
    label: string;
    value: string | number;
    valueColor?: string;
  }) => (
    <View className="py-3 border-b border-gray-100">
      <Text className="text-gray-500 text-xs mb-1 uppercase">{label}</Text>
      <Text className={`text-sm ${valueColor}`}>{value}</Text>
    </View>
  );

  const severity_color_bg: Record<string, any> = {
    LOW: "bg-green-100 border-green-400",
    MEDIUM: "bg-amber-100 border-amber-400",
    HIGH: "bg-red-100 border-red-400",
  };

  const severity_color_text: Record<string, any> = {
    LOW: "text-green-700",
    MEDIUM: "text-amber-700",
    HIGH: "text-red-700",
  };

  const Details = React.memo(({ item }: { item: Record<string, any> }) => {
    const incidentType = item?.ir_type || "N/A";
    const reportedBy = item?.ir_reported_by || "N/A";
    const area = item?.ir_area || "N/A";
    const incidentDate = item?.ir_date
      ? formatDate(item?.ir_date, "long")
      : "N/A";
    const incidentTime = item?.ir_time || "N/A";
    const severity = item?.ir_severity || "N/A";
    const involved = item?.ir_involved || "N/A";
    const additionalDetails = item?.ir_add_details || "None";
    const createdAt = formatDate(item?.ir_created_at, "short");
    const reportFiles = item?.files || [];

    return (
      <View className="px-6">
        {/* Report Header */}
        <View className="pt-4 pb-6 border-b border-gray-100">
          <Text className="text-gray-900 font-semibold text-lg mb-2">
            {incidentType}
          </Text>
          <View className="flex-row items-center gap-2">
            <View
              className={`px-3 py-1 rounded-full ${severity_color_bg[severity]}`}
            >
              <Text
                className={`text-xs font-medium ${severity_color_text[severity]}`}
              >
                {severity} SEVERITY
              </Text>
            </View>
          </View>
        </View>

        {/* Report Information */}
        <View className="">
          <InfoRow label="who reported" value={reportedBy} />
          <InfoRow label="where" value={area} />
          <View className="py-3 border-b border-gray-100">
            <Text className="text-gray-500 text-xs mb-1">WHEN</Text>
            <Text className="text-gray-900 text-sm">
              {incidentDate} at {incidentTime}
            </Text>
          </View>
          <InfoRow label="People Involved" value={involved} />
        </View>

        {/* Additional Details */}
        <View className="py-4">
          <Text className="text-gray-900 font-medium text-sm mb-3">
            Additional Details
          </Text>
          <View className="py-3 bg-gray-50 rounded-lg px-4">
            <Text className="text-gray-700 text-sm leading-5">
              {additionalDetails}
            </Text>
          </View>
        </View>

        {/* Documents/Images */}
        {reportFiles.length > 0 && (
          <View className="py-4">
            <ImageCarousel images={reportFiles} />
          </View>
        )}

        <View className="flex-row justify-center mb-6">
          <Text className="text-gray-500 text-xs">
            Report received on {createdAt}
          </Text>
        </View>
      </View>
    );
  });

  // ============ MAIN RENDER ============
  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-gray-900 text-[13px]">Incident Report</Text>
      }
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
    >
      <FlatList
        maxToRenderPerBatch={1}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        overScrollMode="never"
        windowSize={1}
        removeClippedSubviews
        data={[report]}
        renderItem={({ item }) => <Details item={item} />}
        keyExtractor={(item, index) => `ir-${index}`}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#0084f0"]}
          />
        }
      />
    </PageLayout>
  );
}

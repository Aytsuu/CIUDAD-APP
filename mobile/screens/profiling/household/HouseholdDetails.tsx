import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import PageLayout from "@/screens/_PageLayout";
import { formatDate } from "@/helpers/dateHelpers";
import { LoadingState } from "@/components/ui/loading-state";
import { Users } from "lucide-react-native";
import HouseholdIcon from "@/assets/icons/essentials/house-icon.svg";
import { useFamFilteredByHouse, useHouseholdData } from "../queries/profilingGetQueries";

const tabs = [
  { id: 1, name: "General" },
  { id: 2, name: "Families" },
];

export default function HouseholdDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [currentTab, setCurrentTab] = React.useState<number>(1);
  const [refreshing, setRefreshing] = React.useState(false);

  const household = React.useMemo(() => {
    try {
      return JSON.parse(params.household as string);
    } catch (error) {
      return null;
    }
  }, [params.household]);

  const { data: houseData, isLoading: isLoadingHouseData, refetch: refetchHouseData } = useHouseholdData(household.hh_id)
  const { data: families, isLoading: isLoadingFamilies, refetch: refetchFamilies } = useFamFilteredByHouse(household.hh_id)

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchHouseData();
    setRefreshing(false);
  };

  const handleViewFamily = (family: any) => {
    router.push({
      pathname: "/(profiling)/family/details",
      params: {
        family: JSON.stringify(family),
      },
    });
  };

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <View className="flex-row justify-between items-center py-4 border-b border-gray-50">
      <Text className="text-gray-500 text-xs font-primary-medium flex-shrink">
        {label}
      </Text>
      <Text className="text-gray-900 text-xs font-primary-medium text-right flex-1 ml-4">
        {value}
      </Text>
    </View>
  );

  const FamilyCard = ({ family }: { family: any }) => (
    <View className="mb-4 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Header */}
      <View className="bg-blue-100 px-4 py-3 border-b border-gray-100">
        <Text className="text-gray-900 font-primary-medium text-xs">
          {family.fam_id}
        </Text>
      </View>

      {/* Info Rows */}
      <TouchableOpacity
        onPress={() => handleViewFamily(family)}
        activeOpacity={0.7}
        className="px-4"
      >
        <View className="flex-row justify-between items-center py-3 border-b border-gray-50">
          <Text className="text-gray-600 text-xs font-primary-medium">
            Members
          </Text>
          <Text className="text-gray-900 text-xs font-primary-medium">
            {family.members || 0} {family.members === 1 ? "member" : "members"}
          </Text>
        </View>

        {family.father && (
          <View className="flex-row justify-between items-center py-3 border-b border-gray-50">
            <Text className="text-gray-600 text-xs font-primary-medium">
              Head
            </Text>
            <Text className="text-gray-900 text-xs font-primary-medium" numberOfLines={1}>
              {family.father}
            </Text>
          </View>
        )}

        <View className="flex-row justify-between items-center py-3">
          <Text className="text-gray-600 text-xs font-primary-medium">
            View Details
          </Text>
          <ChevronRight size={16} className="text-gray-400" />
        </View>
      </TouchableOpacity>
    </View>
  );

  const formatRegisteredBy = (info: string) => {
    const infoArray = info?.split("-");
    const staff_name = infoArray[1];
    const staff_type = infoArray[2];
    return `${staff_name} (${staff_type})`;
  };

  if (isLoadingHouseData || isLoadingFamilies) {
    return <LoadingState />;
  }

  if (!houseData && !isLoadingHouseData) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center"
            onPress={() => router.back()}
          >
            <ChevronLeft size={24} className="text-white" />
          </TouchableOpacity>
        }
        headerTitle={
          <Text className="text-white text-[13px] font-primary-medium">
            Household
          </Text>
        }
        rightAction={<View className="w-10 h-10" />}
        wrapScroll={false}
        backgroundColor="bg-blue-600"
      >
        <View className="items-center justify-center py-12">
          <Text className="text-white text-sm">No household data</Text>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} className="text-white" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-white text-[13px] font-primary-medium">
          Household
        </Text>
      }
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
      backgroundColor="bg-blue-600"
    >
      <View className="flex-1">
        {/* Fixed Household Header - Blue Background */}
        <View className="pt-4 pb-6 bg-blue-600">
          <View className="items-center">
            <View className="p-4 rounded-full bg-blue-500 shadow-lg mb-4">
              <HouseholdIcon width={35} height={35} />
            </View>
            <View className="gap-2">
              <Text className="text-white text-base font-primary-medium border-b border-white">
                {houseData.hh_id}
              </Text>
              <Text className="text-xs text-white opacity-60 text-center font-primary-medium">
                Household ID
              </Text>
            </View>
          </View>
        </View>

        {/* Fixed Tabs */}
        <View className="bg-white">
          <View className="flex-row border-b border-gray-100">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                className={`py-3 px-4 ${
                  currentTab === tab.id && "border-b-2 border-primaryBlue"
                }`}
                onPress={() => setCurrentTab(tab.id)}
              >
                <Text
                  className={`text-xs font-primary-medium ${
                    currentTab === tab.id ? "text-primaryBlue" : "text-gray-600"
                  }`}
                >
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Scrollable Tab Content */}
        <View className="flex-1 bg-white">
          {currentTab === 1 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              overScrollMode="never"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={["#0084f0"]}
                />
              }
            >
              <View className="px-6 py-4">
                <InfoRow label="Household ID" value={houseData.hh_id} />
                <InfoRow
                  label="Household Head"
                  value={houseData.head.split('-')[1] || "Not specified"}
                />
                <InfoRow
                  label="Location"
                  value={`SITIO ${houseData.sitio}${
                    houseData.street !== "N/A" ? `, ${houseData.street}` : ""
                  }`}
                />
                {houseData.barangay && (
                  <InfoRow label="Barangay" value={houseData.barangay} />
                )}
                {houseData.municipality && (
                  <InfoRow label="Municipality" value={houseData.municipality} />
                )}
                {houseData.province && (
                  <InfoRow label="Province" value={houseData.province} />
                )}
                <InfoRow
                  label="NHTS Beneficiary"
                  value={houseData.nhts ? "Yes" : "No"}
                />
                <InfoRow
                  label="Date Registered"
                  value={
                    formatDate(
                      houseData.hh_date_registered,
                      "long"
                    )?.toUpperCase() as string
                  }
                />
                {household.registered_by && (
                  <InfoRow
                    label="Registered By"
                    value={formatRegisteredBy(houseData.registered_by)}
                  />
                )}
              </View>
            </ScrollView>
          )}

          {currentTab === 2 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              overScrollMode="never"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={["#0084f0"]}
                />
              }
            >
              <View className="px-6">
                {families.length > 0 ? (
                  <View className="py-4">
                    {families.map((family: any, index: number) => (
                      <FamilyCard key={family.fam_id || index} family={family} />
                    ))}
                  </View>
                ) : (
                  <View className="items-center py-12">
                    <Users size={40} color="#D1D5DB" />
                    <Text className="text-gray-400 text-xs mt-3">
                      No families found
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </PageLayout>
  );
}
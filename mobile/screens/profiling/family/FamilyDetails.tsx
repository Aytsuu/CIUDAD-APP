import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import PageLayout from "@/screens/_PageLayout";
import { router, useLocalSearchParams } from "expo-router";
import {
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { LoadingState } from "@/components/ui/loading-state";
import { Users } from "lucide-react-native";
import { formatDate } from "@/helpers/dateHelpers";
import React from "react";
import FamilyIcon from "@/assets/icons/essentials/family-icon.svg";
import { useFamilyData, useGetFamilyMembers } from "../queries/profilingGetQueries";

const tabs = [
  { id: 1, name: "General" },
  { id: 2, name: "Parents" },
  { id: 3, name: "Dependents" },
];

export default () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = React.useState<number>(1);
  const [refreshing, setRefreshing] = React.useState(false);
  const params = useLocalSearchParams();

  const family = React.useMemo(() => {
    try {
      return JSON.parse(params.family as string);
    } catch (error) {
      return null;
    }
  }, [params.family]);

  const {
      data: familyData,
      isLoading: isLoadingFam,
      refetch: refetchFamily,
    } = useFamilyData(family?.fam_id);

  const {
      data: familyMembers,
      isLoading: isLoadingMembers,
      refetch: refetchMembers,
    } = useGetFamilyMembers(familyData?.fam_id);
  

  const members = familyMembers?.results || [];
  const parents = members.filter((member: any) =>
    ["mother", "father"].includes(member.fc_role.toLowerCase())
  );
  const dependents = members.filter(
    (member: any) => member.fc_role == "DEPENDENT"
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchFamily(),refetchMembers()]);
    setRefreshing(false);
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

  const MemberCard = ({ member }: { member: any }) => (
    <View className="mb-4 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Header */}
      <View className="bg-blue-100 px-4 py-3 border-b border-gray-100">
        <Text className="text-gray-900 font-primary-medium text-xs">
          {member.name}
        </Text>
      </View>

      {/* Info Rows */}
      <View className="px-4">
        <View className="flex-row justify-between items-center py-3 border-b border-gray-50">
          <Text className="text-gray-600 text-xs font-primary-medium">
            Role
          </Text>
          <Text className="text-gray-900 text-xs font-primary-medium">
            {member.fc_role}
          </Text>
        </View>

        <View className="flex-row justify-between items-center py-3 border-b border-gray-50">
          <Text className="text-gray-600 text-xs font-primary-medium">
            Resident ID
          </Text>
          <Text className="text-gray-900 text-xs font-primary-medium font-mono">
            {member.rp_id}
          </Text>
        </View>

        {!["MOTHER", "FATHER"].includes(member.fc_role) && (
          <>
            <View className="flex-row justify-between items-center py-3 border-b border-gray-50">
              <Text className="text-gray-600 text-xs font-primary-medium">
                Sex
              </Text>
              <Text className="text-gray-900 text-xs font-primary-medium">
                {member.sex}
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-3 border-b border-gray-50">
              <Text className="text-gray-600 text-xs font-primary-medium">
                Status
              </Text>
              <Text className="text-gray-900 text-xs font-primary-medium">
                {member.status}
              </Text>
            </View>
          </>
        )}

        {member.dob && (
          <View className="flex-row justify-between items-center py-3">
            <Text className="text-gray-600 text-xs font-primary-medium">
              Date of Birth
            </Text>
            <Text className="text-gray-900 text-xs font-primary-medium">
              {formatDate(member.dob, "short")}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (isLoadingFam) {
    return <LoadingState />;
  }

  if (!familyData) {
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
            Family Information
          </Text>
        }
        rightAction={<View className="w-10 h-10" />}
        wrapScroll={false}
        backgroundColor="bg-blue-600"
      >
        <View className="items-center justify-center py-12">
          <Text className="text-white text-sm">No family registered</Text>
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
          Family Information
        </Text>
      }
      rightAction={<View className="w-10 h-10" />}
      wrapScroll={false}
      backgroundColor="bg-blue-600"
    >
      <View className="flex-1">
        {/* Fixed Family Header - Blue Background */}
        <View className="pt-4 pb-6 bg-blue-600">
          <View className="items-center">
            <View className="p-4 rounded-full bg-blue-500 shadow-lg mb-4">
              <FamilyIcon width={35} height={35} />
            </View>
            <View className="gap-2">
              <Text className="text-white text-base font-primary-medium border-b border-white">
                {familyData.fam_id}
              </Text>
              <Text className="text-xs text-white opacity-60 text-center font-primary-medium">
                Family ID
              </Text>
            </View>
          </View>
        </View>

        {/* Fixed Tabs */}
        <View className="bg-white">
          <View className="flex-row border-b border-gray-100">
            {tabs.map((tab: Record<string, any>) => (
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
                <InfoRow label="Family ID" value={familyData.fam_id} />
                <InfoRow label="Household ID" value={familyData.household_no} />
                <InfoRow
                  label="Location"
                  value={`SITIO ${familyData.sitio}${
                    familyData.street !== "N/A" ? `, ${familyData.street}` : ""
                  }`}
                />
                <InfoRow
                  label="Building Status"
                  value={familyData.fam_building || "N/A"}
                />
                <InfoRow
                  label="Indigenous"
                  value={familyData.fam_indigenous === "YES" ? "Yes" : "No"}
                />
                <InfoRow
                  label="Date Registered"
                  value={
                    formatDate(
                      familyData.fam_date_registered,
                      "long"
                    )?.toUpperCase() as string
                  }
                />
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
                {isLoadingMembers ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="text-gray-500 text-xs mt-2">
                      Loading parents...
                    </Text>
                  </View>
                ) : parents.length > 0 ? (
                  <View className="py-4">
                    {parents.map((member: any, index: number) => (
                      <MemberCard key={member.rp_id || index} member={member} />
                    ))}
                  </View>
                ) : (
                  <View className="items-center py-12">
                    <Users size={40} color="#D1D5DB" />
                    <Text className="text-gray-400 text-xs mt-3">
                      No parents found
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}

          {currentTab === 3 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={["#0084f0"]}
                />
              }
            >
              <View className="px-6">
                {isLoadingMembers ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="text-gray-500 text-xs mt-2">
                      Loading dependents...
                    </Text>
                  </View>
                ) : dependents.length > 0 ? (
                  <View className="py-4">
                    {dependents.map((member: any, index: number) => (
                      <MemberCard key={member.rp_id || index} member={member} />
                    ))}
                  </View>
                ) : (
                  <View className="items-center py-12">
                    <Users size={40} color="#D1D5DB" />
                    <Text className="text-gray-400 text-xs mt-3">
                      No dependents found
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
};
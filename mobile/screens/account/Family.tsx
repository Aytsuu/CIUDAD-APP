import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import PageLayout from "@/screens/_PageLayout";
import { router } from "expo-router";
import {
  TouchableOpacity,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useGetResidentFamily } from "./queries/accountGetQueries";
import { LoadingState } from "@/components/ui/loading-state";
import { useGetFamilyMembers } from "../profiling/queries/profilingGetQueries";
import { Home, Users } from "lucide-react-native";
import { formatDate } from "@/helpers/dateHelpers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import React from "react";

export default () => {
  const { user } = useAuth();
  const {
    data: familyData,
    isLoading: isLoadingFam,
    refetch: refetchFamily,
  } = useGetResidentFamily(user?.rp as string);
  const {
    data: familyMembers,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useGetFamilyMembers(familyData?.fam_id);

  const members = familyMembers?.results || [];
  const totalMembers = familyMembers?.count || 0;

  const handleRefresh = () => {
    refetchFamily();
    refetchMembers();
  };

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => (
    <View className="py-3 border-b border-gray-100">
      <Text className="text-gray-500 text-xs mb-1">{label}</Text>
      <Text className="text-gray-900 text-sm">{value}</Text>
    </View>
  );

  const MemberCard = ({ member }: { member: any }) => (
    <View className="py-3 border-b border-gray-100">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-gray-900 font-medium text-sm">
            {member.name}
          </Text>
          <Text className="text-blue-600 text-xs mt-0.5">{member.fc_role}</Text>
        </View>
        <Text className="text-gray-400 text-xs">{member.rp_id}</Text>
      </View>
      <View className="flex-row gap-4">
        <Text className="text-gray-600 text-xs">{member.sex}</Text>
        <Text className="text-gray-600 text-xs">{member.status}</Text>
        {member.dob && (
          <Text className="text-gray-600 text-xs">
            {formatDate(member.dob, "short")}
          </Text>
        )}
      </View>
    </View>
  );

  const Details = React.memo(({ item }: { item: Record<string, any> }) => (
    <View className="px-6">
      {/* Family Header */}
      <View className="pt-4 pb-6 border-b border-gray-100">
        <View className="flex-row items-center mb-3">
          <Home size={20} color="#3b82f6" />
          <Text className="text-gray-900 font-semibold text-lg ml-2">
            {item.fam_id}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="bg-primaryBlue px-3 py-1 rounded-full">
            <Text className="text-white text-xs">
              {item.members} {item.members === 1 ? "member" : "members"}
            </Text>
          </View>
          <View
            className={`${
              item.fam_indigenous === "YES" ? "bg-orange-500" : "bg-gray-200"
            } px-3 py-1 rounded-full`}
          >
            <Text
              className={`${
                item.fam_indigenous === "YES" ? "text-white" : "text-gray-600"
              } text-xs`}
            >
              {item.fam_indigenous === "YES" ? "Indigenous" : "Not Indigenous"}
            </Text>
          </View>
        </View>
      </View>

      {/* Basic Information */}
      <View className="py-4">
        <Text className="text-gray-900 font-medium text-sm mb-3">
          Family Details
        </Text>
        <InfoRow label="Family ID" value={item.fam_id} />
        <InfoRow label="Household Number" value={item.household_no} />
        <InfoRow
          label="Location"
          value={`SITIO ${item.sitio}${
            item.street !== "N/A" ? `, ${item.street}` : ""
          }`}
        />
        <InfoRow label="Building Status" value={item.fam_building || "N/A"} />
        {item.fam_date_registered && (
          <View className="py-3">
            <Text className="text-gray-500 text-xs mb-1">Date Registered</Text>
            <Text className="text-gray-900 text-sm">
              {formatDate(item.fam_date_registered, "long")}
            </Text>
          </View>
        )}
      </View>

      {/* Family Heads */}
      {(item.father || item.mother || item.guardian) && (
        <View className="py-4">
          <Text className="text-gray-900 font-medium text-sm mb-3">
            Family Heads
          </Text>
          {item.father && <InfoRow label="Father" value={item.father} />}
          {item.mother && <InfoRow label="Mother" value={item.mother} />}
          {item.guardian && <InfoRow label="Guardian" value={item.guardian} />}
        </View>
      )}

      {/* Family Members */}
      {members.length > 0 && (
        <View>
          <Accordion type="single" className="border-0">
            <AccordionItem value="family-members" className="border-0">
              <AccordionTrigger className="py-3">
                <View className="flex-row justify-between items-center flex-1 mr-2">
                  <View className="flex-row items-center">
                    <Users size={16} color="#374151" />
                    <Text className="text-gray-900 font-medium text-sm ml-2">
                      Family Members
                    </Text>
                  </View>
                  {!isLoadingMembers && totalMembers > 0 && (
                    <Text className="text-gray-500 text-xs">{totalMembers}</Text>
                  )}
                </View>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {isLoadingMembers ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="text-gray-500 text-xs mt-2">
                      Loading members...
                    </Text>
                  </View>
                ) : members.length > 0 ? (
                  <View className="max-h-96">
                    {members.map((member: any, index: number) => (
                      <MemberCard key={member.rp_id || index} member={member} />
                    ))}
                  </View>
                ) : (
                  <View className="items-center py-8">
                    <Users size={40} color="#D1D5DB" />
                    <Text className="text-gray-400 text-xs mt-3">
                      No family members found
                    </Text>
                  </View>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </View>
      )}
    </View>
  ));

  if (isLoadingFam) {
    return <LoadingState />;
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          onPress={() => router.back()}
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-gray-900 text-[13px]">Family Information</Text>
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
        data={familyData ? [familyData] : []}
        renderItem={({ item }) => <Details item={item} />}
        keyExtractor={(item, index) => `family-${index}`}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            colors={["#0084f0"]}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500 text-sm">No family registered</Text>
          </View>
        }
      />
    </PageLayout>
  );
};
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import PageLayout from "@/screens/_PageLayout";
import { formatDate } from "@/helpers/dateHelpers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useGetFamilyMembers } from "../queries/profilingGetQueries";
import { LoadingState } from "@/components/ui/loading-state";

export default function FamilyDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const family = React.useMemo(() => {
    try {
      return JSON.parse(params.family as string);
    } catch (error) {
      return null;
    }
  }, [params.family]);

  const {
    data: familyMembers,
    isLoading: loadingFam,
    refetch: refetchMembers,
  } = useGetFamilyMembers(family?.fam_id);
  const members = familyMembers?.results || [];
  const totalCount = familyMembers?.count || 0;

  const handleViewMember = (member: any) => {
    router.push({
      pathname: "/(profiling)/resident/details",
      params: {
        resident: JSON.stringify(member),
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
    <View className="py-3 border-b border-gray-100">
      <Text className="text-gray-500 text-xs mb-1">{label}</Text>
      <Text className="text-gray-900 text-sm">{value}</Text>
    </View>
  );

  const FamilyMemberCard = ({ member }: { member: any }) => (
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
          <Text className="text-gray-600 text-xs">{member.dob}</Text>
        )}
      </View>
    </View>
  );

  const formatRegisteredBy = (info: string) => {
    const infoArray = info?.split("-");
    const staff_name = infoArray[1];
    const staff_type = infoArray[2];
    return (
      <View className="py-3 border-y border-gray-100">
        <Text className="text-gray-500 text-xs mb-1">Registered By</Text>
        <View className="flex-row justify-between">
          <Text className="text-gray-700 text-sm leading-5">{staff_name}</Text>
          <View className="px-4 bg-green-500 flex-row items-center rounded-full">
            <Text className="text-white text-xs">{staff_type}</Text>
          </View>
        </View>
      </View>
    );
  };

  const Details = React.memo(({ item }: { item: Record<string, any> }) => (
    <View className="px-6">
      <View className="pt-4 pb-6 border-b border-gray-100">
        <Text className="text-gray-900 font-semibold text-lg mb-2">
          {family.fam_id}
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="bg-primaryBlue px-3 py-1 rounded-full">
            <Text className="text-white text-xs">
              {family.members} {family.members === 1 ? "member" : "members"}
            </Text>
          </View>
          <View
            className={`${
              family.fam_indigenous == "YES" ? "bg-orange-500" : "bg-gray-200"
            } px-3 py-1 rounded-full`}
          >
            <Text
              className={`${
                family.fam_indigenous == "YES" ? "text-white" : "text-gray-600"
              } text-xs`}
            >
              {family.fam_indigenous == "YES" ? "Indigenous" : "Not Indigenous"}
            </Text>
          </View>
        </View>
      </View>

      {/* Basic Information */}
      <View className="py-4">
        <InfoRow label="Household Number" value={item.household_no} />
        <InfoRow
          label="Location"
          value={`SITIO ${item.sitio}${
            item.street !== "N/A" ? `, ${item.street}` : ""
          }`}
        />
        {item.fam_date_registered && (
          <View className="py-3">
            <Text className="text-gray-500 text-xs mb-1">Date Registered</Text>
            <Text className="text-gray-900 text-sm">
              {formatDate(family.fam_date_registered, "long")}
            </Text>
          </View>
        )}
        {item.registered_by && formatRegisteredBy(item.registered_by)}
      </View>

      {/* Family Heads */}
      {(family.father || family.mother || family.guardian) && (
        <View className="py-4">
          <Text className="text-gray-900 font-medium text-sm mb-3">
            Family Heads
          </Text>
          {family.father && <InfoRow label="Father" value={family.father} />}
          {family.mother && <InfoRow label="Mother" value={family.mother} />}
          {family.guardian && (
            <InfoRow label="Guardian" value={family.guardian} />
          )}
        </View>
      )}

      {/* Family Members */}
      {members.length > 0 && (
        <View>
          <Accordion type="single" className="border-0">
            <AccordionItem value="family-members" className="border-0">
              <AccordionTrigger className="py-3">
                <View className="flex-row justify-between items-center flex-1 mr-2">
                  <Text className="text-gray-900 font-medium text-sm">
                    Family Members
                  </Text>
                  {!loadingFam && totalCount > 0 && (
                    <Text className="text-gray-500 text-xs">{totalCount}</Text>
                  )}
                </View>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {loadingFam ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="text-gray-500 text-xs mt-2">
                      Loading...
                    </Text>
                  </View>
                ) : members.length > 0 ? (
                  <ScrollView
                    className="max-h-96"
                    showsVerticalScrollIndicator={false}
                    overScrollMode="never"
                    nestedScrollEnabled={true}
                  >
                    {members.map((member: any, index: number) => (
                      <FamilyMemberCard
                        key={member.rp_id || index}
                        member={member}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View className="items-center py-8">
                    <Text className="text-gray-400 text-xs">
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

  if (loadingFam) {
    return <LoadingState />;
  }

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Family</Text>}
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
        data={[{ ...family, members: familyMembers }]}
        renderItem={({ item }) => <Details item={item} />}
        keyExtractor={({ index }) => index}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              refetchMembers();
            }}
            colors={["#0084f0"]}
          />
        }
      />
    </PageLayout>
  );
}

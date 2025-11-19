import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
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
import { useGetFamilyMembers } from "../queries/healthProfilingQueries";
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
    <View className="flex-row items-center justify-between py-3.5">
      <Text className="text-gray-600 text-xs font-medium uppercase tracking-wide flex-1">
        {label}
      </Text>
      <Text className="text-gray-900 text-sm font-semibold flex-[2] text-right">
        {value}
      </Text>
    </View>
  );

  const FamilyMemberCard = ({ member }: { member: any }) => (
    <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base mb-1">
            {member.name}
          </Text>
          <View className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 self-start">
            <Text className="text-blue-700 text-xs font-medium">
              {member.fc_role}
            </Text>
          </View>
        </View>
        <View className="bg-gray-100 rounded-lg px-3 py-1.5">
          <Text className="text-gray-700 text-xs font-mono font-medium">
            {member.rp_id}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-3 pt-2 border-t border-gray-100">
        <View className="flex-1">
          <Text className="text-gray-500 text-xs mb-0.5">Gender</Text>
          <Text className="text-gray-900 text-sm font-medium">{member.sex}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-xs mb-0.5">Status</Text>
          <Text className="text-gray-900 text-sm font-medium">{member.status}</Text>
        </View>
        {member.dob && (
          <View className="flex-1">
            <Text className="text-gray-500 text-xs mb-0.5">DOB</Text>
            <Text className="text-gray-900 text-sm font-medium">{member.dob}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const formatRegisteredBy = (info: string) => {
    const infoArray = info?.split("-");
    const staff_name = infoArray[1];
    const staff_type = infoArray[2];
    return { staff_name, staff_type };
  };

  const Details = React.memo(({ item }: { item: Record<string, any> }) => (
    <View className="flex-1 bg-gray-50">
      {/* Profile Header Card */}
      <View className="mx-4 mt-4 mb-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <Text className="text-gray-900 font-bold text-2xl mb-3">
          {family.fam_id}
        </Text>
        <View className="flex-row items-center gap-2 flex-wrap">
          <View className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
            <Text className="text-blue-700 text-xs font-semibold">
              {family.members} {family.members === 1 ? "Member" : "Members"}
            </Text>
          </View>
          <View
            className={`${
              family.fam_indigenous == "YES" 
                ? "bg-orange-50 border-orange-200" 
                : "bg-gray-50 border-gray-200"
            } border rounded-full px-3 py-1.5`}
          >
            <Text
              className={`${
                family.fam_indigenous == "YES" 
                  ? "text-orange-700" 
                  : "text-gray-600"
              } text-xs font-semibold`}
            >
              {family.fam_indigenous == "YES" ? "Indigenous" : "Not Indigenous"}
            </Text>
          </View>
        </View>
      </View>

      {/* Basic Information Card */}
      <View className="mx-4 mb-3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <View className="flex-row items-center mb-4">
          <View className="w-1 h-6 bg-blue-500 rounded-full mr-3" />
          <Text className="text-gray-900 font-bold text-base">
            Basic Information
          </Text>
        </View>
        <InfoRow label="Household Number" value={item.household_no} />
        <View className="h-px bg-gray-100 my-1" />
        <InfoRow
          label="Location"
          value={`SITIO ${item.sitio}${
            item.street !== "N/A" ? `, ${item.street}` : ""
          }`}
        />
        {item.fam_date_registered && (
          <>
            <View className="h-px bg-gray-100 my-1" />
            <View className="flex-row items-center justify-between py-3.5">
              <Text className="text-gray-600 text-xs font-medium uppercase tracking-wide flex-1">
                Date Registered
              </Text>
              <Text className="text-gray-900 text-sm font-semibold flex-[2] text-right">
                {formatDate(family.fam_date_registered, "long")}
              </Text>
            </View>
          </>
        )}
        {item.registered_by && (
          <>
            <View className="h-px bg-gray-100 my-1" />
            <View className="flex-row items-center justify-between py-3.5">
              <Text className="text-gray-600 text-xs font-medium uppercase tracking-wide flex-1">
                Registered By
              </Text>
              <View className="flex-[2] items-end">
                <Text className="text-gray-900 text-sm font-semibold text-right mb-1">
                  {item.registered_by.split("-")[1]}
                </Text>
                <View className="bg-green-100 border border-green-200 rounded-full px-3 py-1">
                  <Text className="text-green-700 text-xs font-medium">
                    {item.registered_by.split("-")[2]}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Family Heads Card */}
      {(family.father || family.mother || family.guardian) && (
        <View className="mx-4 mb-3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="w-1 h-6 bg-green-500 rounded-full mr-3" />
            <Text className="text-gray-900 font-bold text-base">
              Family Heads
            </Text>
          </View>
          {family.father && (
            <>
              <InfoRow label="Father" value={family.father} />
              {(family.mother || family.guardian) && (
                <View className="h-px bg-gray-100 my-1" />
              )}
            </>
          )}
          {family.mother && (
            <>
              <InfoRow label="Mother" value={family.mother} />
              {family.guardian && <View className="h-px bg-gray-100 my-1" />}
            </>
          )}
          {family.guardian && (
            <InfoRow label="Guardian" value={family.guardian} />
          )}
        </View>
      )}

      {/* Family Members Accordion Card */}
      {members.length > 0 && (
        <View className="mx-4 mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <Accordion type="single" className="border-0">
            <AccordionItem value="family-members" className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 active:bg-gray-100">
                <View className="flex-row items-center justify-between flex-1 mr-2">
                  <View className="flex-row items-center flex-1">
                    <View className="w-1 h-6 bg-purple-500 rounded-full mr-3" />
                    <Text className="text-gray-900 font-bold text-base">
                      Family Members
                    </Text>
                  </View>
                  {!loadingFam && totalCount > 0 && (
                    <View className="bg-purple-100 rounded-full px-3 py-1.5 ml-2">
                      <Text className="text-purple-700 text-xs font-bold">
                        {totalCount}
                      </Text>
                    </View>
                  )}
                </View>
              </AccordionTrigger>
              <AccordionContent className="px-6 pt-2 pb-6 bg-gray-50">
                {loadingFam ? (
                  <View className="items-center py-12">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="text-gray-500 text-xs mt-3">
                      Loading family members...
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
                  <View className="items-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-3">
                      <Text className="text-gray-400 text-lg">👥</Text>
                    </View>
                    <Text className="text-gray-500 text-sm font-medium">
                      No family members found
                    </Text>
                  </View>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </View>
      )}

      <View className="h-6" />
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
      headerTitle={<Text className="text-gray-900 text-lg font-semibold">Family</Text>}
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

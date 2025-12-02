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
import { ChevronRight } from "@/lib/icons/ChevronRight";
import PageLayout from "@/screens/_PageLayout";
import { formatDate } from "@/helpers/dateHelpers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LoadingState } from "@/components/ui/loading-state";

export default function HouseholdDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const household = React.useMemo(() => {
    try {
      return JSON.parse(params.household as string);
    } catch (error) {
      return null;
    }
  }, [params.household]);

  // Add your query hook here for fetching household families
  // const {
  //   data: householdFamilies,
  //   isLoading: loadingFamilies,
  //   refetch: refetchFamilies,
  // } = useGetHouseholdFamilies(household?.hh_id);
  
  // For now, using the data from params
  const families = household?.families || [];
  const totalFamilies = families.length;
  const loadingFamilies = false;

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
    <View className="py-3 border-b border-gray-100">
      <Text className="text-gray-500 text-xs mb-1">{label}</Text>
      <Text className="text-gray-900 text-sm">{value}</Text>
    </View>
  );

  const FamilyCard = ({ family }: { family: any }) => (
    <TouchableOpacity
      onPress={() => handleViewFamily(family)}
      className="py-3 border-b border-gray-100"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-gray-900 font-medium text-sm mb-1">
            {family.fam_id}
          </Text>
          <Text className="text-gray-500 text-xs">
            {family.members || 0}{" "}
            {family.members === 1 ? "member" : "members"}
          </Text>
          {family.father && (
            <Text className="text-gray-600 text-xs mt-1" numberOfLines={1}>
              Head: {family.father}
            </Text>
          )}
        </View>
        <ChevronRight size={16} className="text-gray-400" />
      </View>
    </TouchableOpacity>
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

  console.log(household)

  const Details = React.memo(({ item }: { item: Record<string, any> }) => (
    <View className="px-6">
      {/* Household Header */}
      <View className="pt-4 pb-6 border-b border-gray-100">
        <Text className="text-gray-900 font-semibold text-lg mb-2">
          {item.hh_id}
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="bg-primaryBlue px-3 py-1 rounded-full">
            <Text className="text-white text-xs">
              {item.total_families > 0 ? `${item.total_families} ` : ""}
              {item.total_families > 0 ? item.total_families === 1 ? "family" : "families" : "No family registered"}
            </Text>
          </View>
          {item.nhts && (
            <View className="bg-green-500 px-3 py-1 rounded-full">
              <Text className="text-white text-xs">NHTS</Text>
            </View>
          )}
        </View>
      </View>

      {/* Basic Information */}
      <View className="py-4">
        <InfoRow
          label="Household Head"
          value={item.head || "Not specified"}
        />
        <InfoRow
          label="Location"
          value={`SITIO ${item.sitio}${
            item.street !== "N/A" ? `, ${item.street}` : ""
          }`}
        />
        {item.date_registered && (
          <View className="py-3">
            <Text className="text-gray-500 text-xs mb-1">Date Registered</Text>
            <Text className="text-gray-900 text-sm">
              {formatDate(item.date_registered, "long")}
            </Text>
          </View>
        )}
        {item.registered_by && formatRegisteredBy(item.registered_by)}
      </View>

      {/* Location Details */}
      <View className="">
        <Text className="text-gray-900 font-medium text-sm mb-3">
          Location Details
        </Text>
        {item.street && <InfoRow label="Street" value={item.street} />}
        {item.sitio && <InfoRow label="Sitio" value={item.sitio} />}
        {item.barangay && <InfoRow label="Barangay" value={item.barangay} />}
        {item.municipality && (
          <InfoRow label="Municipality" value={item.municipality} />
        )}
        {item.province && (
          <View className="py-3">
            <Text className="text-gray-500 text-xs mb-1">Province</Text>
            <Text className="text-gray-900 text-sm">{item.province}</Text>
          </View>
        )}
      </View>

      {/* NHTS Information */}
      {item.nhts && (
        <View className="py-4">
          <Text className="text-green-600 font-medium text-sm mb-2">
            NHTS Beneficiary
          </Text>
          <Text className="text-gray-600 text-xs mb-3">
            This household is registered as a beneficiary of the National
            Household Targeting System for Poverty Reduction (NHTS-PR).
          </Text>
        </View>
      )}

      {/* Families in Household */}
      {families.length > 0 && (
        <View>
          <Accordion type="single" className="border-0">
            <AccordionItem value="household-families" className="border-0">
              <AccordionTrigger className="py-3">
                <View className="flex-row justify-between items-center flex-1 mr-2">
                  <Text className="text-gray-900 font-medium text-sm">
                    Families in Household
                  </Text>
                  {!loadingFamilies && totalFamilies > 0 && (
                    <Text className="text-gray-500 text-xs">{totalFamilies}</Text>
                  )}
                </View>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {loadingFamilies ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="text-gray-500 text-xs mt-2">
                      Loading...
                    </Text>
                  </View>
                ) : families.length > 0 ? (
                  <ScrollView
                    className="max-h-96"
                    showsVerticalScrollIndicator={false}
                    overScrollMode="never"
                    nestedScrollEnabled={true}
                  >
                    {families.map((family: any, index: number) => (
                      <FamilyCard
                        key={family.fam_id || index}
                        family={family}
                      />
                    ))}
                  </ScrollView>
                ) : (
                  <View className="items-center py-8">
                    <Text className="text-gray-400 text-xs">
                      No families found
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

  if (loadingFamilies) {
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
      headerTitle={
        <Text className="text-gray-900 text-[13px]">Household</Text>
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
        data={[household]}
        renderItem={({ item }) => <Details item={item} />}
        keyExtractor={({ index }) => index}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              // refetchFamilies();
            }}
            colors={["#0084f0"]}
          />
        }
      />
    </PageLayout>
  );
}
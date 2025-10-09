import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import PageLayout from "@/screens/_PageLayout";

export default function HouseholdDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const household = React.useMemo(() => {
    try {
      return JSON.parse(params.household as string);
    } catch (error) {
      console.error("Error parsing household data:", error);
      return null;
    }
  }, [params.household]);

  React.useEffect(() => {
    if (!household) {
      Alert.alert("Error", "Household data not found", [
        { text: "OK", onPress: () => router.back() },
      ]);
    }
  }, [household]);

  if (!household) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={
          <Text className="text-gray-900 text-sm font-medium">
            Household Details
          </Text>
        }
      >
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading...</Text>
        </View>
      </PageLayout>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
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
    <View className="py-3 border-b border-gray-100">
      <Text className="text-gray-500 text-xs mb-1">{label}</Text>
      <Text className="text-gray-900 text-sm">{value}</Text>
    </View>
  );

  const fullAddress =
    [household.street, household.sitio].filter(Boolean).join(", ") ||
    "Address not specified";
  const registeredDate = formatDate(household.date_registered);
  const registeredBy = household.registered_by || "N/A";

  const householdFamilies = household.families || [];

  const renderFamilyCard = ({ item }: { item: any }) => {
    const memberCount = item.members || 0;

    return (
      <TouchableOpacity
        onPress={() => handleViewFamily(item)}
        className="py-4 border-b border-gray-100"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-gray-900 font-medium text-sm mb-1">
              Family {item.fam_id}
            </Text>
            <Text className="text-gray-500 text-xs">
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </Text>
            {item.father && (
              <Text className="text-gray-600 text-xs mt-1" numberOfLines={1}>
                Head: {item.father}
              </Text>
            )}
          </View>
          <ChevronRight size={16} className="text-gray-400" />
        </View>
      </TouchableOpacity>
    );
  };

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
        <Text className="text-gray-900 text-[13px]">Household Details</Text>
      }
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView
        className="flex-1"
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Household Header */}
        <View className="px-5 pt-6 pb-6 border-b border-gray-200">
          <Text className="text-gray-900 font-semibold text-lg mb-2">
            {household.hh_id}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-gray-600 text-sm">
              {household.total_families}{" "}
              {household.total_families === 1 ? "family" : "families"}
            </Text>
            {household.nhts && (
              <>
                <Text className="text-gray-400">•</Text>
                <Text className="text-green-600 text-sm">NHTS</Text>
              </>
            )}
          </View>
        </View>

        {/* Basic Information */}
        <View className="px-5 py-5 border-b border-gray-200">
          <InfoRow
            label="Household Head"
            value={household.head || "Not specified"}
          />
          <InfoRow label="Address" value={fullAddress} />
          <InfoRow label="Date Registered" value={registeredDate} />
          <View className="py-3">
            <Text className="text-gray-500 text-xs mb-1">Registered By</Text>
            <Text className="text-gray-900 text-sm">{registeredBy}</Text>
          </View>
        </View>

        {/* Location Details */}
        <View className="px-5 py-5 border-b border-gray-200">
          <Text className="text-gray-900 font-medium text-sm mb-4">
            Location Details
          </Text>
          {household.street && (
            <InfoRow label="Street" value={household.street} />
          )}
          {household.sitio && <InfoRow label="Sitio" value={household.sitio} />}
          {household.barangay && (
            <InfoRow label="Barangay" value={household.barangay} />
          )}
          {household.municipality && (
            <InfoRow label="Municipality" value={household.municipality} />
          )}
          {household.province && (
            <View className="py-3">
              <Text className="text-gray-500 text-xs mb-1">Province</Text>
              <Text className="text-gray-900 text-sm">
                {household.province}
              </Text>
            </View>
          )}
        </View>

        {/* NHTS Information */}
        {household.nhts && (
          <View className="px-5 py-5 border-b border-gray-200">
            <Text className="text-green-600 font-medium text-sm mb-3">
              NHTS Beneficiary
            </Text>
            <Text className="text-gray-600 text-xs mb-4">
              This household is registered as a beneficiary of the National
              Household Targeting System for Poverty Reduction (NHTS-PR).
            </Text>
            {household.nhts_date && (
              <View className="py-3">
                <Text className="text-gray-500 text-xs mb-1">
                  NHTS Registration Date
                </Text>
                <Text className="text-gray-900 text-sm">
                  {formatDate(household.nhts_date)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Families in Household */}
        {householdFamilies.length > 0 && (
          <View className="px-5 py-5">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 font-medium text-sm">
                Families in Household
              </Text>
              <Text className="text-gray-500 text-xs">
                {householdFamilies.length}
              </Text>
            </View>

            <FlatList
              data={householdFamilies}
              renderItem={renderFamilyCard}
              keyExtractor={(item, index) => `family-${index}`}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </PageLayout>
  );
}

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
import { Card } from "@/components/ui/card";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import PageLayout from "@/screens/_PageLayout";
import { Home } from "@/lib/icons/Home";
import { UsersRound } from "@/lib/icons/UsersRound";
import { MapPin } from "@/lib/icons/MapPin";
import { capitalize } from "@/helpers/capitalize";

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

  const formatAddress = (address: any) => {
    const parts = [
      address.add_street || address.street,
      address.sitio ? "SITIO " + capitalize(address.sitio) : "",
      address.add_external_sitio,
      address.add_barangay || address.barangay,
      address.add_city || address.municipality,
      address.add_province || address.province,
    ].filter((part) => part && part.trim() !== "");

    return parts.join(", ");
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

  const FamilyCard = ({ family }: { family: any }) => {
    const memberCount = family.members || 0;
    
    return (
      <TouchableOpacity
        onPress={() => handleViewFamily(family)}
        className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm"
        activeOpacity={0.7}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold text-base mb-1">
              Family {family.fam_id}
            </Text>
            <View className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 self-start">
              <Text className="text-blue-700 text-xs font-medium">
                {memberCount} {memberCount === 1 ? "Member" : "Members"}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} className="text-gray-400" />
        </View>
        {family.father && (
          <View className="flex-row items-center pt-2 border-t border-gray-100">
            <UsersRound size={14} className="text-gray-400 mr-2" />
            <Text className="text-gray-500 text-xs">Head: </Text>
            <Text className="text-gray-900 text-sm font-medium flex-1" numberOfLines={1}>
              {family.father}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const fullAddress = formatAddress(household);
  const registeredDate = formatDate(household.date_registered);
  const registeredBy = household.registered_by || "N/A";
  const householdFamilies = household.families || [];
  const isNHTS = household.nhts && (household.nhts.toUpperCase() === 'YES' || household.nhts.toUpperCase() === 'Y');

  const RenderDetails = React.memo(() => (
    <View className="flex-1 bg-gray-50">
      {/* Profile Header Card */}
      <View className="mx-4 mt-4 mb-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <View className="flex-row items-center mb-3">
          <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
            <Home size={24} className="text-blue-600" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-900 font-bold text-2xl mb-1">
              {household.hh_id}
            </Text>
            <Text className="text-gray-600 text-sm">
              {household.total_families} {household.total_families === 1 ? "Family" : "Families"}
            </Text>
          </View>
        </View>
        <View className={`${isNHTS ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'} border rounded-full px-3 py-1.5 self-start`}>
          <Text className={`${isNHTS ? 'text-green-700' : 'text-gray-700'} text-xs font-semibold`}>
            {isNHTS ? 'NHTS Beneficiary' : 'NON-NHTS'}
          </Text>
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
        <InfoRow
          label="Household Head"
          value={household.head || "Not specified"}
        />
        <View className="h-px bg-gray-100 my-1" />
        <InfoRow label="Date Registered" value={registeredDate} />
        {registeredBy !== "N/A" && (
          <>
            <View className="h-px bg-gray-100 my-1" />
            <InfoRow label="Registered By" value={registeredBy} />
          </>
        )}
      </View>

      {/* Location Details Card */}
      <View className="mx-4 mb-3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <View className="flex-row items-center mb-4">
          <View className="w-1 h-6 bg-green-500 rounded-full mr-3" />
          <Text className="text-gray-900 font-bold text-base">
            Location Details
          </Text>
        </View>
        {fullAddress && fullAddress.trim() !== "" ? (
          <>
            <View className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4">
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                  <MapPin size={16} className="text-green-600" />
                </View>
                <Text className="text-gray-600 text-xs font-semibold uppercase tracking-wide">
                  Full Address
                </Text>
              </View>
              <Text className="text-gray-900 text-sm leading-6 font-medium">
                {fullAddress}
              </Text>
            </View>
            {(household.street || household.sitio || household.barangay || household.municipality || household.province) && (
              <View className="h-px bg-gray-100 my-3" />
            )}
          </>
        ) : null}
        {household.street && (
          <>
            <InfoRow label="Street" value={household.street} />
            <View className="h-px bg-gray-100 my-1" />
          </>
        )}
        {household.sitio && (
          <>
            <InfoRow label="Sitio" value={capitalize(household.sitio) || household.sitio} />
            <View className="h-px bg-gray-100 my-1" />
          </>
        )}
        {household.barangay && (
          <>
            <InfoRow label="Barangay" value={household.barangay} />
            <View className="h-px bg-gray-100 my-1" />
          </>
        )}
        {household.municipality && (
          <>
            <InfoRow label="Municipality" value={household.municipality} />
            {household.province && <View className="h-px bg-gray-100 my-1" />}
          </>
        )}
        {household.province && (
          <InfoRow label="Province" value={household.province} />
        )}
      </View>

      {/* NHTS Information Card */}
      {isNHTS && (
        <View className="mx-4 mb-3 bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-200 p-6 shadow-sm">
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
              <Text className="text-green-600 text-lg font-bold">✓</Text>
            </View>
            <Text className="text-green-700 font-bold text-base">
              NHTS Beneficiary
            </Text>
          </View>
          <Text className="text-gray-600 text-xs leading-5 mb-3">
            This household is registered as a beneficiary of the National Household Targeting System for Poverty Reduction (NHTS-PR).
          </Text>
          {household.nhts_date && (
            <>
              <View className="h-px bg-green-100 my-2" />
              <InfoRow
                label="NHTS Registration"
                value={formatDate(household.nhts_date)}
              />
            </>
          )}
        </View>
      )}

      {/* Families in Household Card */}
      {householdFamilies.length > 0 && (
        <View className="mx-4 mb-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <View className="w-1 h-6 bg-orange-500 rounded-full mr-3" />
              <Text className="text-gray-900 font-bold text-base">
                Families in Household
              </Text>
            </View>
            <View className="bg-orange-100 rounded-full px-3 py-1.5">
              <Text className="text-orange-700 text-xs font-bold">
                {householdFamilies.length}
              </Text>
            </View>
          </View>
          <View className="pt-2">
            {householdFamilies.map((family: any, index: number) => (
              <FamilyCard key={family.fam_id || index} family={family} />
            ))}
          </View>
        </View>
      )}

      <View className="h-6" />
    </View>
  ));

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
        overScrollMode="never"
        data={[{}]}
        renderItem={({ index }) => <RenderDetails />}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              // Add refetch logic here if needed
            }}
            colors={["#0084f0"]}
          />
        }
        windowSize={5}
        removeClippedSubviews={true}
      />
    </PageLayout>
  );
}

import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import PageLayout from "@/screens/_PageLayout";
import { router } from "expo-router";
import {
  TouchableOpacity,
  View,
  Text,
  FlatList,
  RefreshControl,
} from "react-native";
import { useGetOwnedHouses } from "./queries/accountGetQueries";
import { LoadingState } from "@/components/ui/loading-state";
import { Home } from "lucide-react-native";
import { formatDate } from "@/helpers/dateHelpers";


import React from "react";

export default () => {
  const { user } = useAuth();
  const {
    data: ownedHouses,
    isLoading,
    refetch: refetchHouses,
  } = useGetOwnedHouses(user?.rp as string);

  const houses = ownedHouses || [];

  const handleRefresh = () => {
    refetchHouses();
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

  const Details = React.memo(({ item }: { item: Record<string, any> }) => (
    <View className="px-6">
      {/* House Header */}
      <View className="pt-4 pb-6 border-b border-gray-100">
        <View className="flex-row items-center mb-3">
          <Home size={20} color="#3b82f6" />
          <Text className="text-gray-900 font-semibold text-lg ml-2">
            {item.hh_id}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="bg-primaryBlue px-3 py-1 rounded-full">
            <Text className="text-white text-xs">
              {item.total_families}{" "}
              {item.total_families === 1 ? "family" : "families"}
            </Text>
          </View>
          <View
            className={`${
              item.nhts === "YES" ? "bg-green-500" : "bg-gray-200"
            } px-3 py-1 rounded-full`}
          >
            <Text
              className={`${
                item.nhts === "YES" ? "text-white" : "text-gray-600"
              } text-xs`}
            >
              {item.nhts === "YES" ? "NHTS" : "Non-NHTS"}
            </Text>
          </View>
        </View>
      </View>

      {/* Basic Information */}
      <View className="py-4">
        <Text className="text-gray-900 font-medium text-sm mb-3">
          House Details
        </Text>
        <InfoRow label="House ID" value={item.hh_id} />
        <InfoRow
          label="Location"
          value={`SITIO ${item.sitio}${
            item.street !== "N/A" ? `, ${item.street}` : ""
          }`}
        />
        <InfoRow label="NHTS Status" value={item.nhts || "N/A"} />
        <InfoRow label="Total Families" value={item.total_families} />
        {item.date_registered && (
          <View className="py-3">
            <Text className="text-gray-500 text-xs mb-1">Date Registered</Text>
            <Text className="text-gray-900 text-sm">
              {formatDate(item.date_registered, "long")}
            </Text>
          </View>
        )}
      </View>
    </View>
  ));

  if (isLoading) {
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
        <Text className="text-gray-900 text-[13px]">Houses Owned</Text>
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
        data={houses}
        renderItem={({ item }) => <Details item={item} />}
        keyExtractor={(item, index) => `house-${item.hh_id || index}`}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            colors={["#0084f0"]}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500 text-sm">No houses owned yet</Text>
          </View>
        }
      />
    </PageLayout>
  );
};
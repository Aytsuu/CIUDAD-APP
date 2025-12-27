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
import { useGetOwnedHouses } from "../queries/accountGetQueries";
import { LoadingState } from "@/components/ui/loading-state";
import HouseIcon from "@/assets/icons/essentials/house-icon.svg";

import React from "react";
import { formatDate } from "@/helpers/dateHelpers";
import { ChevronRight } from "@/lib/icons/ChevronRight";

export default () => {
  const { user } = useAuth();
  const {
    data: ownedHouses,
    isLoading,
    refetch: refetchHouses,
  } = useGetOwnedHouses(user?.rp as string);

  const houses = ownedHouses || [];
  console.log(houses);

  const handleRefresh = () => {
    refetchHouses();
  };

  const CardDetails = React.memo(
    ({ item, index }: { item: Record<string, any>; index: number }) => (
      <View className="mb-6 mx-1">
        {/* Header Info */}
        <View className="flex-row justify-between items-end mb-2 px-1">
          <Text className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">
            House {String(index + 1).padStart(2, "0")}
          </Text>
          <Text className="text-gray-500 text-xs italic">
            {formatDate(item.date_registered, "short")}
          </Text>
        </View>

        {/* Main Card */}
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(account)/house/details",
              params: {
                household: JSON.stringify(item),
              },
            })
          }
          className="bg-white border border-gray-200 rounded-2xl p-4 flex-row items-center gap-4"
        >

            {/* Icon Container */}
            <View className="bg-primaryBlue p-3 rounded-xl">
              <HouseIcon />
            </View>

            {/* Content */}
            <View className="flex-1">
              <Text className="text-gray-400 text-[10px] uppercase font-primary-medium tracking-tight">
                Household ID
              </Text>
              <Text className="text-slate-800 text-base font-bold -mt-1">
                {item.hh_id}
              </Text>

              <View className="flex-row items-center mt-1">
                <Text
                  className="text-slate-600 text-xs font-primary-medium flex-1"
                  numberOfLines={1}
                >
                  {`SITIO ${item.sitio}${
                    item.street !== "N/A" ? `, ${item.street}` : ""
                  }`}
                </Text>
              </View>
            </View>

            <View>
              <ChevronRight size={20} className="text-primaryBlue" />
            </View>
        </TouchableOpacity>
      </View>
    )
  );

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
        <Text className="text-gray-900 text-[13px] font-primary-medium">
          Houses Owned
        </Text>
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
        renderItem={({ item, index }) => (
          <CardDetails item={item} index={index} />
        )}
        keyExtractor={(item, index) => `house-${item.hh_id || index}`}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            colors={["#0084f0"]}
          />
        }
        style={{
          paddingHorizontal: 24,
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500 text-sm">No houses owned yet</Text>
          </View>
        }
      />
    </PageLayout>
  );
};

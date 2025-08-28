"use client";
import { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Plus, ChevronLeft } from "lucide-react-native";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDonations} from "./queries";
import { Donation } from "../don-types";
import { useRouter } from "expo-router";
import { SearchInput } from "@/components/ui/search-input";
import PageLayout from "@/screens/_PageLayout";

const DonationTracker = () => {
  const router = useRouter();
  const { data: donations = [], isLoading, refetch } = useGetDonations();
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Use useMemo to prevent re-rendering issues with search
  const filteredData = useMemo(() => {
    return donations.filter((donation: Donation) => {
      const searchableText = [
        donation.don_num,
        donation.don_donor,
        donation.don_item_name,
        donation.don_category,
        donation.don_qty,
        donation.don_date,
      ]
        .join(" ")
        .toLowerCase();
      return searchableText.includes(searchTerm.toLowerCase());
    });
  }, [donations, searchTerm]);

  const handleAddDonation = () => {
    router.push("/donation/staffDonationAdd");
  };

  const handleViewDonation = (donationNum: string) => {
    router.push({
      pathname: "/donation/staffDonationView",
      params: { don_num: donationNum.toString() },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Loading donations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerTitle={<Text>Donation Records</Text>}
      rightAction={
        <TouchableOpacity>
          <ChevronLeft size={30} color="black" className="text-white" />
        </TouchableOpacity>
      }
    >
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="mb-4" onStartShouldSetResponder={() => true}>
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                onSubmit={() => {
                  // Optional: Add any submit logic if needed
                }}
              />
            </View>
            <TouchableOpacity
              className="bg-primaryBlue rounded-full p-3 flex mr-5"
              onPress={handleAddDonation}
            >
              <Plus size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {filteredData.map((donation: Donation, index: number) => (
          <TouchableOpacity
            key={donation.don_num}
            onPress={() => handleViewDonation(donation.don_num)}
            accessibilityLabel={`View details for ${donation.don_item_name}`}
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Card
              className={`bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100 ${
                index === filteredData.length - 1 ? "mb-0" : "mb-4"
              }`}
            >
              <CardHeader className="pb-3">
                <View className="flex-row items-start justify-between">
                  <CardTitle className="text-lg font-semibold text-black flex-1 pr-2">
                    {donation.don_item_name}
                  </CardTitle>
                  <TouchableOpacity
                    className="p-2 -m-2"
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => handleViewDonation(donation.don_num)}
                  ></TouchableOpacity>
                </View>
              </CardHeader>

              <CardContent className="pt-0">
                <Text className="text-sm text-black leading-5 mb-4">
                  Donor: {donation.don_donor}
                </Text>
                <View className="border-t border-gray-200 pt-3">
                  <Text className="text-sm font-medium text-black">
                    Category: {donation.don_category}
                  </Text>
                  <Text className="text-sm font-medium text-black">
                    Quantity: {donation.don_qty}
                  </Text>
                  <Text className="text-sm font-medium text-black">
                    Date: {donation.don_date}
                  </Text>
                  <Text className="text-sm font-medium text-blac">
                    Reference No: {donation.don_num}
                  </Text>
                </View>
              </CardContent>
            </Card>
          </TouchableOpacity>
        ))}

        {/* Empty state */}
        {filteredData.length === 0 && (
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-gray-500 text-center">
              No donation records found
            </Text>
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
};

export default DonationTracker;
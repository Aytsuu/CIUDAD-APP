"use client";
import { useState, useEffect } from "react";
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
import { useGetDonations } from "./donation-queries";
import { Donation } from "../donation-types";
import { useRouter } from "expo-router";
import { SearchInput } from "@/components/ui/search-input";
import PageLayout from "@/screens/_PageLayout";
import { useDebounce } from "@/hooks/use-debounce";
import { SelectLayout, DropdownOption } from "@/components/ui/select-layout";

const DonationTracker = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Use backend search and filtering
  const { 
    data: donationsData = { results: [], count: 0 }, 
    isLoading, 
    refetch 
  } = useGetDonations(
    currentPage,
    10, // pageSize
    debouncedSearchTerm,
    categoryFilter,
    statusFilter
  );

  // Extract the donations array from the data structure
  const donations = donationsData.results || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddDonation = () => {
    router.push("/(donation)/staffDonationAdd");
  };

  const handleViewDonation = (donationNum: string) => {
    router.push({
      pathname: "/(donation)/staffDonationView",
      params: { don_num: donationNum.toString() },
    });
  };

  // Category options matching web
  const categoryOptions: DropdownOption[] = [
    { label: "All Categories", value: "all" },
    { label: "Monetary Donations", value: "Monetary Donations" },
    { label: "Essential Goods", value: "Essential Goods" },
    { label: "Medical Supplies", value: "Medical Supplies" },
    { label: "Household Items", value: "Household Items" },
    { label: "Educational Supplies", value: "Educational Supplies" },
    { label: "Baby & Childcare Items", value: "Baby & Childcare Items" },
    { label: "Animal Welfare Items", value: "Animal Welfare Items" },
    { label: "Shelter & Homeless Aid", value: "Shelter & Homeless Aid" },
    { label: "Disaster Relief Supplies", value: "Disaster Relief Supplies" },
  ];

  const statusOptions: DropdownOption[] = [
    { label: "All Statuses", value: "all" },
    { label: "Stashed", value: "Stashed" },
    { label: "Allotted", value: "Allotted" },
  ];

  const handleCategorySelect = (option: DropdownOption) => {
    setCategoryFilter(option.value);
    setCurrentPage(1);
  };

  const handleStatusSelect = (option: DropdownOption) => {
    setStatusFilter(option.value);
    setCurrentPage(1);
  };

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
        <View onStartShouldSetResponder={() => true}>
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1">
              <SearchInput
                value={searchTerm}
                onChange={(text) => {
                  setSearchTerm(text);
                  setCurrentPage(1); // Reset to first page when searching
                }}
                onSubmit={() => {
                  // Optional
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

        {/* Filter dropdowns */}
        <View className="flex-row gap-3 mb-4 px-5">
          <View className="flex-1">
            <SelectLayout
              options={categoryOptions}
              selectedValue={categoryFilter}
              onSelect={handleCategorySelect}
              placeholder="Select category"
              maxHeight={300}
            />
          </View>
          <View className="flex-1">
            <SelectLayout
              options={statusOptions}
              selectedValue={statusFilter}
              onSelect={handleStatusSelect}
              placeholder="Select status"
              maxHeight={200}
            />
          </View>
        </View>

        {/* Loading state for content only */}
        {isLoading ? (
          <View className="h-64 justify-center items-center">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-sm text-gray-500 mt-2">
              Loading donations...
            </Text>
          </View>
        ) : (
          <>
            {donations.map((donation: Donation, index: number) => (
              <TouchableOpacity
                key={donation.don_num}
                onPress={() => handleViewDonation(donation.don_num)}
                accessibilityLabel={`View details for ${donation.don_item_name}`}
                accessibilityRole="button"
                activeOpacity={0.7}
              >
                <Card
                  className={`bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100 ${
                    index === donations.length - 1 ? "mb-0" : "mb-4"
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
                    <View className="flex-row justify-between mb-2">
                    <Text className="text-sm text-black leading-5">
                      Donor: {donation.don_donor}
                    </Text>
                    <Text
                      className={`px-2 w-20 text-center py-1 rounded-full text-xs font-medium  ${
                        donation.don_status === "Stashed"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {donation.don_status}
                    </Text>
                    </View>
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
            {donations.length === 0 && (
              <View className="flex-1 justify-center items-center py-12">
                <Text className="text-gray-500 text-center">
                  No donation records found
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </PageLayout>
  );
};

export default DonationTracker;
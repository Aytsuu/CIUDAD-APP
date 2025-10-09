"use client";
import { useState} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  TextInput,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGetDonations } from "./donation-queries";
import { Donation } from "../donation-types";
import { useRouter } from "expo-router";
import PageLayout from "@/screens/_PageLayout";
import { useDebounce } from "@/hooks/use-debounce";
import { SelectLayout, DropdownOption } from "@/components/ui/select-layout";
import EmptyState from "@/components/ui/emptyState";
import { Button } from "@/components/ui/button"; 
import { LoadingState } from "@/components/ui/loading-state";

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

  // Render Donation Card Component (styled like Budget Plan)
  const RenderDonationCard = ({ item }: { item: Donation }) => (
    <TouchableOpacity 
      onPress={() => handleViewDonation(item.don_num)}
      activeOpacity={0.8}
      className="mb-3"
    >
      <Card className="border-2 border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-semibold text-lg text-[#1a2332] mb-1">
                {item.don_item_name}
              </Text>
              <Text className="text-sm text-gray-500">
                Reference No: {item.don_num}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  item.don_status === "Stashed"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {item.don_status}
              </Text>
            </View>
          </View>
        </CardHeader>

        <CardContent className="pt-3 border-t border-gray-200">
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Donor:</Text>
              <Text className="text-sm font-medium text-black">
                {item.don_donor}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Category:</Text>
              <Text className="text-sm font-medium text-black">
                {item.don_category}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Quantity:</Text>
              <Text className="text-sm font-medium text-black">
                {item.don_qty}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Date:</Text>
              <Text className="text-sm font-medium text-black">
                {item.don_date}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  // Empty state component
  const renderEmptyState = () => {
    const emptyMessage = searchTerm || categoryFilter !== "all" || statusFilter !== "all"
      ? 'No donation records found. Try adjusting your search terms.'
      : 'No donation records available yet.';
    
    return (
      <View className="flex-1 justify-center items-center py-8">
        <EmptyState emptyMessage={emptyMessage} />
      </View>
    );
  };

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="font-semibold text-lg text-[#2a3a61]">Donation Records</Text>}
      rightAction={<View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>}
      wrapScroll={false}
    >
      <View className="flex-1 px-6">
        {/* Search and Filter Section - Styled like Resolution */}
        <View className="mb-4">
          <View className="flex-row items-center gap-2 pb-3">
            <View className="relative flex-1"> 
              <TextInput
                placeholder="Search donation records..."
                className="pl-2 w-full h-[45px] bg-white text-base rounded-xl p-2 border border-gray-300"
                value={searchTerm}
                onChangeText={(text) => {
                  setSearchTerm(text);
                  setCurrentPage(1);
                }}
              />
            </View>
          </View>

          {/* Filter Dropdowns - Styled like Resolution */}
          <View className="flex-row gap-3 pb-3">
            <View className="flex-1">
              <SelectLayout
                options={categoryOptions}
                selectedValue={categoryFilter}
                onSelect={handleCategorySelect}
                placeholder="Select category"
                maxHeight={300}
                isInModal={false}
              />
            </View>
            <View className="flex-1">
              <SelectLayout
                options={statusOptions}
                selectedValue={statusFilter}
                onSelect={handleStatusSelect}
                placeholder="Select status"
                maxHeight={200}
                isInModal={false}
              />
            </View>
          </View>

          {/* Add Button - Styled like Resolution's Create Button */}
          <Button 
            onPress={handleAddDonation} 
            className="bg-primaryBlue mt-3 rounded-xl"
          >
            <Text className="text-white text-[17px]">Add Donation</Text>
          </Button>
        </View>

        {/* Content Area */}
        <View className="flex-1">
          {isLoading ? (
            renderLoadingState()
          ) : (
            <View className="flex-1">
              {donations.length === 0 ? (
                renderEmptyState()
              ) : (
                <FlatList
                  data={donations}
                  renderItem={({ item }) => <RenderDonationCard item={item} />}
                  keyExtractor={(item) => item.don_num}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={['#00a8f0']}
                    />
                  }
                  contentContainerStyle={{ 
                    paddingBottom: 16,
                    paddingTop: 16
                  }}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </PageLayout>
  );
};

export default DonationTracker;
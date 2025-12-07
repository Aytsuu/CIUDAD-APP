"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  ActivityIndicator
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
import { Search } from "@/lib/icons/Search";
import { SearchInput } from "@/components/ui/search-input";
import { useAuth } from "@/contexts/AuthContext";

const INITIAL_PAGE_SIZE = 5;

const DonationTracker = () => {
  const { user } = useAuth(); 
  const isSecretary = ["admin", "secretary"].includes(user?.staff?.pos?.toLowerCase()); 
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showSearch, setShowSearch] = useState(false);
  
  // Pagination states
  const [pageSize, setPageSize] = useState<number>(INITIAL_PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const debouncedSearchTerm = useDebounce(searchQuery, 500);

  // Use backend search and filtering
  const { 
    data: donationsData = { results: [], count: 0, next: null, previous: null }, 
    isLoading, 
    refetch,
    error,
    isFetching
  } = useGetDonations(
    1, // Always page 1 since we load more by increasing pageSize
    pageSize, // This controls how many items to fetch
    debouncedSearchTerm,
    categoryFilter,
    statusFilter
  );

  // Extract the donations array from the data structure
  const donations = donationsData.results || [];
  const totalCount = donationsData.count || 0;
  
  // Reset pagination when search or filters change
  useEffect(() => {
    setPageSize(INITIAL_PAGE_SIZE);
  }, [debouncedSearchTerm, categoryFilter, statusFilter]);

  // Handle scrolling timeout
  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  // Handle load more - increment pageSize
  const handleLoadMore = () => {
    if (isScrolling && !isFetching && !isLoadMore && donations.length < totalCount) {
      setIsLoadMore(true);
      setPageSize((prev) => prev + 5); // Load 5 more items
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPageSize(INITIAL_PAGE_SIZE);
    await refetch();
    setIsRefreshing(false);
  };

  // Effects
  useEffect(() => {
    if (!isFetching && isRefreshing) setIsRefreshing(false);
  }, [isFetching, isRefreshing]);

  useEffect(() => {
    if (!isLoading && isInitialRender) setIsInitialRender(false);
  }, [isLoading, isInitialRender]);

  useEffect(() => {
    if (!isFetching && isLoadMore) setIsLoadMore(false);
  }, [isFetching, isLoadMore]);

  const handleAddDonation = () => {
    router.push("/(donation)/staffDonationAdd");
  };

  const handleViewDonation = (donationNum: string) => {
    router.push({
      pathname: "/(donation)/staffDonationView",
      params: { don_num: donationNum.toString() },
    });
  };

  const handleSearch = () => {
    setSearchQuery(searchInputVal);
    setPageSize(INITIAL_PAGE_SIZE);
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
    setPageSize(INITIAL_PAGE_SIZE);
  };

  const handleStatusSelect = (option: DropdownOption) => {
    setStatusFilter(option.value);
    setPageSize(INITIAL_PAGE_SIZE);
  };

  // Render Donation Card Component (styled like Budget Plan)
  const RenderDonationCard = useCallback(({ item }: { item: Donation }) => (
    <TouchableOpacity 
      onPress={() => handleViewDonation(item.don_num)}
      activeOpacity={0.8}
      className="mb-3"
    >
      <Card className="border-2 border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-semibold text-lg text-[#1a2332] mb-1 font-sans">
                {item.don_item_name}
              </Text>
              <View className="bg-blue-50 border border-blue-600 px-3 py-1 rounded-full self-start">
                <Text className="text-sm tracking-wide font-sans">
                  Reference No: {item.don_num}
                </Text>
              </View>    
            </View>
            <View className="flex-row items-center">
              <Text
                className={`px-2 py-1 rounded-md text-xs font-medium font-sans ${
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
              <Text className="text-sm text-gray-600 font-sans">Donor:</Text>
              <Text className="text-sm font-medium text-black font-sans">
                {item.don_donor}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 font-sans">Category:</Text>
              <Text className="text-sm font-medium text-black font-sans">
                {item.don_category}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 font-sans">Quantity:</Text>
              <Text className="text-sm font-medium text-black font-sans">
                {item.don_qty}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600 font-sans">Date:</Text>
              <Text className="text-sm font-medium text-black font-sans">
                {item.don_date}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  ), []);

  // Render function for FlatList
  const renderItem = useCallback(
    ({ item }: { item: Donation }) => <RenderDonationCard item={item} />,
    []
  );

  // Empty state component
  const renderEmptyState = () => {
    const emptyMessage = searchQuery || categoryFilter !== "all" || statusFilter !== "all"
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

  // Error state component
  if (error) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px] font-sans">Donation Records</Text>}
        rightAction={
          <TouchableOpacity 
            onPress={() => setShowSearch(!showSearch)} 
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Search size={22} className="text-gray-700" />
          </TouchableOpacity>
        }
        wrapScroll={false}
      >
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 text-lg font-medium mb-2 font-sans">
            Error loading donations
          </Text>
          <Text className="text-gray-600 text-center mb-4 font-sans">
            {error.message}
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-primaryBlue px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-medium font-sans">Retry</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px] font-sans">Donation Records</Text>}
      rightAction={
        <TouchableOpacity 
          onPress={() => setShowSearch(!showSearch)} 
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
      wrapScroll={false}
    >
      <View className="flex-1 bg-white">
        {/* Search Bar */}
        {showSearch && (
          <SearchInput 
            value={searchInputVal}
            onChange={setSearchInputVal}
            onSubmit={handleSearch} 
          />
        )}

        <View className="flex-1 px-6">
          {/* Filter Dropdowns */}
          <View className="py-3 space-y-2">
            <View className="flex">
              <SelectLayout
                options={categoryOptions}
                selectedValue={categoryFilter}
                onSelect={handleCategorySelect}
                placeholder="Select category"
                maxHeight={300}
                isInModal={false}
              />
            </View>
            <View className="flex mt-2">
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

          {/* Add Button - Only show if user is secretary */}
          {isSecretary && (
            <Button 
              onPress={handleAddDonation} 
              className="bg-primaryBlue rounded-xl mb-4"
            >
              <Text className="text-white text-[13px] font-bold font-sans">Add Donation</Text>
            </Button>
          )}

          {/* Result Count */}
          {!isRefreshing && donations.length > 0 && (
            <View className="mb-2">
              <Text className="text-xs text-gray-500 font-sans">
                Showing {donations.length} of {totalCount} donations
              </Text>
            </View>
          )}

          {/* Content Area */}
          <View className="flex-1">
            {isLoading && isInitialRender ? (
              renderLoadingState()
            ) : (
              <View className="flex-1">
                {donations.length === 0 ? (
                  renderEmptyState()
                ) : (
                  <FlatList
                    data={donations}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.don_num}
                    maxToRenderPerBatch={5}
                    overScrollMode="never"
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    initialNumToRender={5}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    onScroll={handleScroll}
                    windowSize={11}
                    removeClippedSubviews
                    refreshControl={
                      <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={['#00a8f0']}
                      />
                    }
                    contentContainerStyle={{ 
                      paddingBottom: 20,
                      paddingTop: 8,
                      flexGrow: 1,
                    }}
                    ListFooterComponent={() =>
                      isFetching && isLoadMore ? (
                        <View className="py-4 items-center">
                          <ActivityIndicator size="small" color="#3B82F6" />
                          <Text className="text-xs text-gray-500 mt-2 font-sans">
                            Loading more donations...
                          </Text>
                        </View>
                      ) : (
                        donations.length > 0 && donations.length >= totalCount && (
                          <View className="py-4 items-center">
                            <Text className="text-xs text-gray-400 font-sans">
                              No more donations
                            </Text>
                          </View>
                        )
                      )
                    }
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </PageLayout>
  );
};

export default DonationTracker;
import { 
  FlatList, 
  TouchableOpacity, 
  View, 
  Text, 
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter } from "expo-router";
import React from "react";
import { Search } from "@/lib/icons/Search";
import { useBusinessTable } from "./queries/profilingGetQueries";
import { Card } from "@/components/ui/card";
import { ChevronRight } from "@/lib/icons/ChevronRight";
import { SearchInput } from "@/components/ui/search-input";
import PageLayout from "../_PageLayout";
import { Calendar } from "@/lib/icons/Calendar";
import { Building } from "@/lib/icons/Building";

export default function BusinessRecords() {
  const router = useRouter();
  const [searchInputVal, setSearchInputVal] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [showSearch, setShowSearch] = React.useState<boolean>(false);

  const { data: businessesTableData, isLoading, refetch } = useBusinessTable(
    currentPage,
    pageSize,
    searchQuery
  );

  const families = businessesTableData?.results || [];
  const totalCount = businessesTableData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  }, [searchInputVal]);

  const handleBusinessPress = (business: any) => {
    // Navigate to business details
    // router.push(`/business/${business.bus_id}`);
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get business initial
  const getBusinessInitial = (businessName: string) => {
    return businessName ? businessName.charAt(0).toUpperCase() : 'B';
  };

  const RenderBusinessCard = React.memo(({ item, index }: { item: any; index: number }) => {
    const respondentName = `${item.bus_respondentFname || ''} ${item.bus_respondentMname ? item.bus_respondentMname + ' ' : ''}${item.bus_respondentLname || ''}`.trim();
    const businessAddress = `${item.bus_street || ''}, ${item.sitio || ''}`.replace(/^,\s*|,\s*$/g, '');
    const hasFiles = item.files && item.files.length > 0;
    
    return (
      <TouchableOpacity
        onPress={() => handleBusinessPress(item)}
        className="mb-3 mx-5"
        activeOpacity={0.7}
      >
        <Card className="p-4 bg-white shadow-sm border border-gray-100">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              {/* Business Header */}
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-blue-600 font-semibold text-lg">
                    {getBusinessInitial(item.bus_name)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-semibold text-base" numberOfLines={1}>
                    {item.bus_name || 'Unnamed Business'}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    ID: {item.bus_id}
                  </Text>
                </View>
              </View>

              {/* Business Details */}
              <View className="space-y-2">
                {/* Gross Sales */}
                {item.bus_gross_sales && (
                  <View className="flex-row items-center">
                    <Text>P</Text>
                    <Text className="text-gray-600 text-sm flex-1">
                      Gross Sales: <Text className="font-medium text-green-600">{formatCurrency(item.bus_gross_sales)}</Text>
                    </Text>
                  </View>
                )}

                {/* Location */}
                {businessAddress && (
                  <View className="flex-row items-center">
                    <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
                      {businessAddress}
                    </Text>
                  </View>
                )}

                {/* Respondent */}
                {respondentName && (
                  <View className="flex-row items-center">
                    <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
                      Contact: {respondentName}
                    </Text>
                  </View>
                )}

                {/* Contact Number */}
                {item.bus_respondentContact && (
                  <View className="flex-row items-center">
                    <Text className="text-gray-600 text-sm">
                      {item.bus_respondentContact}
                    </Text>
                  </View>
                )}

                {/* Registration Date */}
                {item.bus_date_registered && (
                  <View className="flex-row items-center">
                    <Calendar size={14} className="text-gray-400 mr-2" />
                    <Text className="text-gray-600 text-sm">
                      Registered: {formatDate(item.bus_date_registered)}
                    </Text>
                  </View>
                )}

                {/* Registered By */}
                {item.bus_registered_by && (
                  <View className="flex-row items-center">
                    <Building size={14} className="text-gray-400 mr-2" />
                    <Text className="text-gray-600 text-sm">
                      By: {item.bus_registered_by}
                    </Text>
                  </View>
                )}
              </View>

              {/* Files indicator */}
              {hasFiles && (
                <View className="mt-3 pt-3 border-t border-gray-100">
                  <Text className="text-xs text-blue-600 font-medium">
                    📎 {item.files.length} document{item.files.length > 1 ? 's' : ''} attached
                  </Text>
                </View>
              )}
            </View>
            
            <ChevronRight size={20} className="text-gray-400 ml-2" />
          </View>
        </Card>
      </TouchableOpacity>
    );
  });

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Building size={32} className="text-gray-400" />
      </View>
      <Text className="text-gray-500 text-lg font-medium mb-2">
        {searchQuery ? 'No businesses found' : 'No businesses yet'}
      </Text>
      <Text className="text-gray-400 text-center px-8">
        {searchQuery 
          ? 'Try adjusting your search terms' 
          : 'Business records will appear here once added'
        }
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="text-gray-500 mt-4">Loading businesses...</Text>
    </View>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50 rounded-lg mt-4">
        <TouchableOpacity
          onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1 ? 'bg-gray-200' : 'bg-blue-500'
          }`}
        >
          <Text className={`font-medium ${
            currentPage === 1 ? 'text-gray-400' : 'text-white'
          }`}>
            Previous
          </Text>
        </TouchableOpacity>
        
        <Text className="text-gray-600 font-medium">
          Page {currentPage} of {totalPages}
        </Text>
        
        <TouchableOpacity
          onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages ? 'bg-gray-200' : 'bg-blue-500'
          }`}
        >
          <Text className={`font-medium ${
            currentPage === totalPages ? 'text-gray-400' : 'text-white'
          }`}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
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
        <Text className="text-gray-900 text-[13px]">
          Business Records
        </Text>
      }
      rightAction={
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        {showSearch && (
          <SearchInput 
            value={searchInputVal}
            onChange={setSearchInputVal}
            onSubmit={handleSearch} 
          />
        )}

        <View className="flex-1 py-4">
          {/* Stats Card */}
          <Card className="flex-row items-center p-4 mb-4 bg-primaryBlue shadow-lg mx-5">
            <View className="p-3 bg-white/20 rounded-full mr-4">
              <Building size={24} className="text-white" />
            </View>
            <View className="flex-1">
              <Text className="text-white/80 text-sm font-medium">
                Total Businesses
              </Text>
              <Text className="text-white text-2xl font-bold">
                {totalCount}
              </Text>
              {searchQuery && (
                <Text className="text-white/80 text-xs">
                  Showing {totalCount} results
                </Text>
              )}
            </View>
          </Card>

          {/* Business List */}
          <View className="flex-1">
            {isLoading && !isRefreshing ? (
              renderLoadingState()
            ) : totalCount === 0 ? (
              renderEmptyState()
            ) : (
              <>
                <FlatList
                  data={families}
                  renderItem={({item, index}) => <RenderBusinessCard item={item} index={index} />}
                  keyExtractor={(item) => item.bus_id}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      colors={['#3B82F6']}
                    />
                  }
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
                {renderPagination()}
              </>
            )}
          </View>
        </View>
      </View>
    </PageLayout>
  );
}
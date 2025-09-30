import React from "react"
import { TouchableOpacity, View, Text, FlatList, RefreshControl } from "react-native"
import PageLayout from "../_PageLayout"
import { router } from "expo-router"
import { Building } from "@/lib/icons/Building"
import { Plus } from "@/lib/icons/Plus"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { Button } from "@/components/ui/button"
import { FileText } from "@/lib/icons/FileText"
import { useModificationRequests, useOwnedBusinesses } from "./queries/businessGetQueries"
import { useAuth } from "@/contexts/AuthContext"
import { Search } from "@/lib/icons/Search"
import { SearchInput } from "@/components/ui/search-input"
import { LoadingState } from "@/components/ui/loading-state"
import BusinessDetails from "./BusinessDetails"
import { useDebounce } from "@/hooks/use-debounce"

export default () => {
  // =================== STATE INITIALIZATION ===================
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [searchInputVal, setSearchInputVal] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const debouncedPageSize = useDebounce(pageSize, 100)
  const { data: modificationRequests, isLoading: isLoadingRequests } = useModificationRequests();
  const { data: ownedBusinesses, isLoading: isLoadingBusinesses, refetch } = useOwnedBusinesses({
    page: currentPage,
    page_size: debouncedPageSize,
    search: searchQuery,
    ...(user?.rp ? { rp: user?.rp } : { br: user?.br })
  })

  const businessList = ownedBusinesses?.results || []
  const hasBusinesses = (ownedBusinesses?.count || 0) > 0

  // =================== SIDE EFFECTS ===================  
  React.useEffect(() => {
    if(searchQuery != searchInputVal && searchInputVal == "") {
      setSearchQuery(searchInputVal)
    }
  }, [searchQuery, searchInputVal])

  // =================== HANDLERS ===================  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }

  const handleAddBusiness = () => {
    router.push('/(business)/add-business')
  }

  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  }, [searchInputVal]);


  // =================== RENDER HELPER ===================
  const EmptyState = () => (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() =>  router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">
        My Business
      </Text>}
    >
      <View className="flex-1 items-center justify-center px-6 py-12">
        <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-6">
          <Building size={32} className="text-primaryBlue" />
        </View>
        
        <Text className="text-gray-900 text-xl font-semibold mb-2 text-center">
          No businesses yet
        </Text>
        
        <Text className="text-gray-500 text-base text-center mb-8 leading-6">
          Start by adding your first business or request for a document if you don't have your business permit yet.
        </Text>
        
        <View className="flex gap-4">
          <TouchableOpacity
            onPress={() => router.push('/(business)/add-business')}
            className="bg-transparent border-2 border-primaryBlue px-8 py-4 rounded-full flex-row items-center justify-center"
          >
            <Plus size={20} className="text-primaryBlue mr-2" />
            <Text className="text-primaryBlue font-semibold text-sm">
              Add Your First Business
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageLayout>
  )

  const RenderDataCard = React.memo(({ business, index } : { business: Record<string, any>, index: number}) => (
    <View className="px-6">
      <BusinessDetails 
        business={business} 
        modReq={modificationRequests.filter(
          (req: any) => req.current_details.bus_id == business.bus_id
        )}
      />
    </View>
  ))

  const BusinessList = () => (
    <View className="flex-1 py-4">
        <FlatList
          maxToRenderPerBatch={1}
          overScrollMode="never"
          data={businessList}
          renderItem={({item, index}) => <RenderDataCard business={item} index={index} />}
          keyExtractor={(item) => item.bus_id}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#00a8f0']}
            />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          windowSize={5}
          removeClippedSubviews={true} 
        />
    </View>
  )

  const renderContent = () => {
    return <BusinessList />
  }

  // =================== MAIN RENDER ===================
  if ((isLoadingBusinesses || isLoadingRequests) && searchQuery == "") {
    return <LoadingState />
  }

  if (!hasBusinesses && !isLoadingBusinesses && searchQuery == "") {
    return <EmptyState />
  }

  return (
    <PageLayout
      wrapScroll={false}
      leftAction={
        <TouchableOpacity
          onPress={() =>  router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">
        My Business
      </Text>}
      rightAction={
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleAddBusiness}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Plus size={22} className="text-gray-700" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <Search size={22} className="text-gray-700" />
          </TouchableOpacity>
        </View>
      }
    >
      <View className="flex-1">
        {/* Search Bar */}
        {showSearch && (
          <SearchInput 
            value={searchInputVal}
            onChange={setSearchInputVal}
            onSubmit={handleSearch} 
          />
        )}
        {renderContent()}
      </View>
    </PageLayout>
  )
}
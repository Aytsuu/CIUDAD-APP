import React from "react"
import { TouchableOpacity, View, Text, ActivityIndicator, FlatList, RefreshControl } from "react-native"
import PageLayout from "../_PageLayout"
import { router } from "expo-router"
import { Building } from "@/lib/icons/Building"
import { Plus } from "@/lib/icons/Plus"
import { ChevronRight } from "@/lib/icons/ChevronRight"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { Button } from "@/components/ui/button"
import { FileText } from "@/lib/icons/FileText"
import { useModificationRequests, useOwnedBusinesses } from "./queries/businessGetQueries"
import { useAuth } from "@/contexts/AuthContext"
import { MapPin } from "@/lib/icons/MapPin"
import { FeedbackScreen } from "@/components/ui/feedback-screen"
import { Search } from "@/lib/icons/Search"
import { SearchInput } from "@/components/ui/search-input"
import { LoadingState } from "@/components/ui/loading-state"

export default () => {
  // =================== STATE INITIALIZATION ===================
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [searchInputVal, setSearchInputVal] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [selectedBusiness, setSelectedBusiness] = React.useState<Record<string, any> | null>(null);
  const [showFeedback, setShowFeedback] = React.useState<boolean>(false);
  const [status, setStatus] = React.useState<"success" | "failure" | "waiting" | "message">('success');
  const { data: modificationRequests, isLoading: isLoadingRequests } = useModificationRequests();
  const { data: ownedBusinesses, isLoading: isLoadingBusinesses, refetch } = useOwnedBusinesses({
    br: 5
  })


  const businessList = ownedBusinesses?.results || []
  const hasBusinesses = (ownedBusinesses?.count || 0) > 0

  // =================== SIDE EFFECTS ===================  

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

  const handleBusinessPress = (business: Record<string, any>) => {
    if(business.bus_status === 'Pending'){
      setStatus('waiting');
      setShowFeedback(true);
    }
    setSelectedBusiness(business);
  }

  // =================== RENDER HELPER ===================
  const feedbackContents: any = {
    waiting: {
      title: (
        <View className="flex">
          <Text className={`text-[18px] text-gray-800 font-PoppinsSemiBold text-center`}>
            Awaiting Verification
          </Text>
          <Text className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}>
            Your request is still under review
          </Text>
          <Text className={`text-[15px] text-gray-800 font-PoppinsRegular text-center`}>
            please wait patiently...
          </Text>
        </View>
      ),
      content: (
        <View className="flex-1 justify-end">
          <Text className={`text-sm text-gray-800 text-center`}>
            Processing period takes 2-3 business days.
          </Text>
        </View>
      )
    }
  }

  const EmptyState = () => (
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
        <Button
          onPress={() => router.push('/(business)/add-business')}
          className="bg-primaryBlue px-8 py-4 rounded-xl flex-row items-center"
        >
          <Plus size={20} className="text-white mr-2" />
          <Text className="text-white font-semibold text-sm">
            Add Your First Business
          </Text>
        </Button>
        <Button
          className="bg-primaryBlue px-8 py-4 rounded-xl flex-row items-center"
        >
          <FileText size={20} className="text-white mr-2" />
          <Text className="text-white font-semibold text-sm">
            Request for a Document
          </Text>
        </Button>
      </View>
    </View>
  )

  const RenderDataCard = React.memo(({ business, index } : { business: Record<string, any>, index: number}) => (
    <TouchableOpacity
      key={index}
      onPress={() => router.push({
        pathname: '/(business)/details',
        params: {
          business: JSON.stringify(business)
        }
      })}
      className="bg-white p-5 border-b border-gray-100"
    >
      <View className="flex-1 justify-between">
        <View className="flex-row items-center mb-2">
          <View className="flex-1">
            <Text className="text-gray-800 font-PoppinsMedium text-xs">
              # {business.bus_id}
            </Text>
            <Text className="text-gray-900 font-PoppinsMedium text-xl">
              {business.bus_name}
            </Text>
          </View>
          <View className="w-10 h-10 rounded-lg bg-blue-50 items-center justify-center mr-3">
            
          </View>
        </View>
        <View className="flex-row items-end justify-between">
          <View className="flex-1">
            <Text className="text-sm text-gray-600">Gross Sales: ₱ {business.bus_gross_sales?.toLocaleString() || '0'}</Text>
            <View className="flex-row items-center gap-1">
              <MapPin size={16} className="text-gray-500"/>
              <Text className="text-sm text-gray-600">{business.bus_street}, Sitio {business.sitio}</Text>
            </View>
          </View>
          <ChevronRight size={20} className="text-gray-500"/>
        </View>
      </View>
    </TouchableOpacity>
  ))

  const BusinessList = () => (
    <View className="flex-1">
      <View className="flex-1 border-t border-gray-100">
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
    </View>
  )

  const renderContent = () => {
    if(showFeedback){
      return (
        <FeedbackScreen 
          status={status}
          title={feedbackContents[status].title}
          content={feedbackContents[status].content}
          animationDuration={200}
        />
      )
    }
    
    return hasBusinesses ? <BusinessList /> : <EmptyState />
  }

  // =================== MAIN RENDER ===================
  if (isLoadingBusinesses || isLoadingRequests) {
    return <LoadingState />
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => {
            selectedBusiness ? setSelectedBusiness(null) : router.back()
            showFeedback && setShowFeedback(!showFeedback)
          }}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">{
        selectedBusiness ? selectedBusiness.bus_name : "My Business"}
      </Text>}
      rightAction={
        hasBusinesses && !isLoadingBusinesses && !selectedBusiness ? (
          <View>
            <TouchableOpacity
              onPress={handleAddBusiness}
              className="w-10 h-10 rounded-full bg-primaryBlue items-center justify-center"
            >
              <Plus size={24} className="text-white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowSearch(!showSearch)}
              className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
            >
              <Search size={22} className="text-gray-700" />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="w-10 h-10" />
        )
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
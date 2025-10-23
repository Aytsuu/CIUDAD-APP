import PageLayout from "@/screens/_PageLayout"
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from "react-native"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { Search } from "@/lib/icons/Search"
import { Calendar, Users, FileText, Archive, Plus } from "lucide-react-native"
import { useRouter } from "expo-router"
import React from "react"
import { SearchInput } from "@/components/ui/search-input"
import { useGetActiveMinutesOfMeetingRecords, useGetInactiveMinutesOfMeetingRecords, type MinutesOfMeetingRecords } from "./queries/MOMFetchQueries"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button"
import { formatAreaOfFocus } from "@/helpers/wordFormatter"
import { LoadingState } from "@/components/ui/loading-state"
import EmptyState from "@/components/ui/emptyState"

export default function MinutesOfMeetingMain() {
  const router = useRouter()
  
  // State management
  const [searchInputVal, setSearchInputVal] = React.useState<string>("")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [showSearch, setShowSearch] = React.useState<boolean>(false)
  const [activeTab, setActiveTab] = React.useState<'active' | 'archive'>('active')
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [pageSize, _setPageSize] = React.useState<number>(10)
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false)

  // Query hooks with pagination and search
  const { 
    data: activeMOMData, 
    isLoading: isActiveLoading, 
    refetch: refetchActive 
  } = useGetActiveMinutesOfMeetingRecords(currentPage, pageSize, searchQuery)
  
  const { 
    data: inactiveMOMData, 
    isLoading: isInactiveLoading, 
    refetch: refetchInactive 
  } = useGetInactiveMinutesOfMeetingRecords(currentPage, pageSize, searchQuery)

  // Data based on active tab
  const currentData = activeTab === 'active' ? activeMOMData : inactiveMOMData
  const momRecords = currentData?.results || []
  const totalCount = currentData?.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)
  const isLoading = activeTab === 'active' ? isActiveLoading : isInactiveLoading

  // Refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true)
    if (activeTab === 'active') {
      await refetchActive()
    } else {
      await refetchInactive()
    }
    setIsRefreshing(false)
  }

  const handleSearch = React.useCallback(() => {
    setSearchQuery(searchInputVal)
    setCurrentPage(1)
  }, [searchInputVal])

  const handleCardPress = (record: MinutesOfMeetingRecords) => {
    router.push({
      pathname: '/(council)/minutes-of-meeting/mom-view',
      params: {
        mom_id: record.mom_id
      }
    })
  }

  // MOM Card Component
  const RenderMOMCard = React.memo(({ item }: { item: MinutesOfMeetingRecords }) => (
    <TouchableOpacity
      onPress={() => handleCardPress(item)}
      className="bg-white rounded-xl border border-gray-100 p-4 mb-3 shadow-sm active:scale-[0.98]"
      activeOpacity={0.7} 
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-3">
          <Text className="text-gray-900 text-base font-semibold leading-5" numberOfLines={2}>
            {item.mom_title}
          </Text>
        </View>
        <View className="flex-row items-center bg-blue-50 px-2 py-1 rounded-md">
          <Calendar size={12} className="text-blue-600 mr-1" />
          <Text className="text-blue-600 text-xs font-medium">{formatDate(item.mom_date)}</Text>
        </View>
      </View>

      <View className="mb-3">
        <View className="flex-row items-center mb-1">
          <FileText size={14} className="text-gray-500 mr-1" />
          <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide">Agenda</Text>
        </View>
        <Text className="text-gray-700 text-sm leading-5" numberOfLines={3}>
          {item.mom_agenda}
        </Text>
      </View>

      {item.mom_area_of_focus?.length > 0 && (
        <View>
          <View className="flex-row items-center mb-2">
            <Users size={14} className="text-gray-500 mr-1" />
            <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide">Areas of Focus</Text>
          </View>
          <View className="flex-row flex-wrap">
            {item.mom_area_of_focus.slice(0, 3).map((area, index) => (
              <View key={index} className="bg-gray-100 px-2 py-1 rounded-md mr-2 mb-1">
                <Text className="text-gray-700 text-xs font-medium">{formatAreaOfFocus(area)}</Text>
              </View>
            ))}
            {item.mom_area_of_focus.length > 3 && (
              <View className="bg-gray-100 px-2 py-1 rounded-md mr-2 mb-1">
                <Text className="text-gray-500 text-xs font-medium">+{item.mom_area_of_focus.length - 3} more</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  ))

  // Helper function
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  // Empty state component
  const renderEmptyState = () => {
    const emptyMessage = searchQuery
    ? 'No records found. Try adjusting your search terms.'
    : 'No records available yet.';
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 py-10">
        <EmptyState emptyMessage={emptyMessage} />
      </View>
    );
  };

  // Loading state component
  const renderLoadingState = () => (
    <View className="flex-1 justify-center items-center">
      <LoadingState/>
    </View>
  )


  // Handle tab change
  const handleTabChange = (tab: 'active' | 'archive') => {
    setActiveTab(tab)
    setCurrentPage(1)
    setSearchQuery('')
    setSearchInputVal('')
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      wrapScroll={false}
      headerTitle={<Text className="text-gray-900 text-[13px]">Minutes Of Meeting Records</Text>}
      rightAction={
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
          <Search size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 bg-gray-50">
        {/* Search Bar */}
        {showSearch && (
          <View className="px-6 pb-3">
            <SearchInput 
              value={searchInputVal}
              onChange={setSearchInputVal}
              onSubmit={handleSearch} 
            />
          </View>
        )}

        {/* Tabs */}
        <View className="flex-1 px-6">
          <Tabs value={activeTab} onValueChange={val => handleTabChange(val as 'active' | 'archive')} className="flex-1">
            <TabsList className="bg-blue-50 flex-row justify-between">
              <TabsTrigger 
                value="active" 
                className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
              >
                <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                  Active
                </Text>
              </TabsTrigger>
              <TabsTrigger 
                value="archive" 
                className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
              >
                <View className="flex-row items-center justify-center">
                  <Archive size={16} className="mr-1" color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'}/>
                  <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
                    Archive
                  </Text>
                </View>
              </TabsTrigger>
            </TabsList>

            {/* Add Button */}
            <View className="pb-4 pt-4">
              <Button
                className="bg-primaryBlue px-4 py-3 rounded-xl flex-row items-center justify-center shadow-md"
                onPress={() => router.push('/(council)/minutes-of-meeting/mom-create')}
              >
                <Plus size={20} color="white" />
                <Text className="text-white ml-2 font-semibold">Add</Text>
              </Button>
            </View>

            {/* Active Tab Content */}
            <TabsContent value="active" className="flex-1">
              {isLoading && !isRefreshing ? (
                renderLoadingState()
              ) : totalCount === 0 ? (
                renderEmptyState()
              ) : (
                <View className="flex-1">
                  <FlatList
                    data={momRecords}
                    renderItem={({ item }) => <RenderMOMCard item={item} />}
                    keyExtractor={(item) => `mom-${item.mom_id}`}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={['#00a8f0']}
                      />
                    }
                    contentContainerStyle={{ 
                      paddingTop: 16,
                      paddingBottom: 20,
                      flexGrow: 1
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
              )}
            </TabsContent>

            {/* Archive Tab Content */}
            <TabsContent value="archive" className="flex-1">
              {isLoading && !isRefreshing ? (
                renderLoadingState()
              ) : totalCount === 0 ? (
                renderEmptyState()
              ) : (
                <View className="flex-1">
                  <FlatList
                    data={momRecords}
                    renderItem={({ item }) => <RenderMOMCard item={item} />}
                    keyExtractor={(item) => `mom-${item.mom_id}`}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                      <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        colors={['#00a8f0']}
                      />
                    }
                    contentContainerStyle={{ 
                      paddingTop: 16,
                      paddingBottom: 20,
                      flexGrow: 1
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
              )}
            </TabsContent>
          </Tabs>
        </View>
      </View>
    </PageLayout>
  )
}
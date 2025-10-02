// import PageLayout from "@/screens/_PageLayout"
// import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native"
// import { ChevronLeft } from "@/lib/icons/ChevronLeft"
// import { Search } from "@/lib/icons/Search"
// import { Calendar, Users, FileText, Archive, Plus } from "lucide-react-native"
// import { useRouter } from "expo-router"
// import React from "react"
// import { SearchInput } from "@/components/ui/search-input"
// import { useGetActiveMinutesOfMeetingRecords, useGetInactiveMinutesOfMeetingRecords, type MinutesOfMeetingRecords } from "./queries/MOMFetchQueries"
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button"
// import { formatAreaOfFocus } from "@/helpers/wordFormatter"

// export default function MinutesOfMeetingMain() {
//   const router = useRouter()
//   const [searchInputVal, setSearchInputVal] = React.useState<string>("")
//   const [searchQuery, setSearchQuery] = React.useState<string>("")
//   const [showSearch, setShowSearch] = React.useState<boolean>(false)
//   const [activeTab, setActiveTab] = React.useState<'active' | 'archive'>('active')

//   const { data: activeMOM = [], isLoading: isActiveLoading } = useGetActiveMinutesOfMeetingRecords()
//   const { data: inactiveMOM = [], isLoading: isInactiveLoading} = useGetInactiveMinutesOfMeetingRecords()

//   const handleSearch = React.useCallback(() => {
//     setSearchQuery(searchInputVal)
//   }, [searchInputVal])

//   const filteredRecords = React.useMemo(() => {
//     if (!searchQuery.trim()) return momRecords

//     return momRecords.filter(
//       (record: MinutesOfMeetingRecords) =>
//         record.mom_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         record.mom_agenda.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         record.mom_area_of_focus.some((area) => area.toLowerCase().includes(searchQuery.toLowerCase())),
//     )
//   }, [momRecords, searchQuery])

//   const formatDate = (dateString: string) => {
//     try {
//       const date = new Date(dateString)
//       return date.toLocaleDateString("en-US", {
//         year: "numeric",
//         month: "short",
//         day: "numeric",
//       })
//     } catch {
//       return dateString
//     }
//   }

//   const handleCardPress = (record: MinutesOfMeetingRecords) => {
//     router.push({
//       pathname: '/(council)/minutes-of-meeting/mom-view',
//       params: {
//         mom_id: record.mom_id
//       }
//     })
//   }

//   const renderMOMCard = ({ item }: { item: MinutesOfMeetingRecords }) => (
//     <TouchableOpacity
//       onPress={() => handleCardPress(item)}
//       className="bg-white rounded-xl border border-gray-100 p-4 mb-3 shadow-sm active:scale-[0.98]"
//       activeOpacity={0.7} 
//     >
//       <View className="flex-row justify-between items-start mb-3">
//         <View className="flex-1 mr-3">
//           <Text className="text-gray-900 text-base font-semibold leading-5" numberOfLines={2}>
//             {item.mom_title}
//           </Text>
//         </View>
//         <View className="flex-row items-center bg-blue-50 px-2 py-1 rounded-md">
//           <Calendar size={12} className="text-blue-600 mr-1" />
//           <Text className="text-blue-600 text-xs font-medium">{formatDate(item.mom_date)}</Text>
//         </View>
//       </View>

//       <View className="mb-3">
//         <View className="flex-row items-center mb-1">
//           <FileText size={14} className="text-gray-500 mr-1" />
//           <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide">Agenda</Text>
//         </View>
//         <Text className="text-gray-700 text-sm leading-5" numberOfLines={3}>
//           {item.mom_agenda}
//         </Text>
//       </View>

//       {item.mom_area_of_focus?.length > 0 && (
//         <View>
//           <View className="flex-row items-center mb-2">
//             <Users size={14} className="text-gray-500 mr-1" />
//             <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide">Areas of Focus</Text>
//           </View>
//           <View className="flex-row flex-wrap">
//             {item.mom_area_of_focus.slice(0, 3).map((area, index) => (
//               <View key={index} className="bg-gray-100 px-2 py-1 rounded-md mr-2 mb-1">
//                 <Text className="text-gray-700 text-xs font-medium">{formatAreaOfFocus(area)}</Text>
//               </View>
//             ))}
//             {item.mom_area_of_focus.length > 3 && (
//               <View className="bg-gray-100 px-2 py-1 rounded-md mr-2 mb-1">
//                 <Text className="text-gray-500 text-xs font-medium">+{item.mom_area_of_focus.length - 3} more</Text>
//               </View>
//             )}
//           </View>
//         </View>
//       )}
//     </TouchableOpacity>
//   )

//   const RenderEmptyState = ({ isArchive }: { isArchive?: boolean }) => (
//     <View className="flex-1 items-center justify-center py-12">
//       <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
//         {isArchive ? (
//           <Archive size={24} color="#9CA3AF" />
//         ) : (
//           <FileText size={24} color="#9CA3AF" />
//         )}
//       </View>
//       <Text className="text-gray-500 text-base font-medium mb-1">
//         {isArchive ? "No archived meetings" : "No active meetings"}
//       </Text>
//       <Text className="text-gray-400 text-sm">
//         {isArchive ? "Archived meetings will appear here" : "Create your first meeting to get started"}
//       </Text>
//     </View>
//   )

//   const renderHeader = () =>
//     showSearch ? (
//       <View className="px-4 pb-3">
//         <SearchInput value={searchInputVal} onChange={setSearchInputVal} onSubmit={handleSearch} />
//       </View>
//     ) : null

//   return (
//     <PageLayout
//       leftAction={
//         <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
//           <ChevronLeft size={24} className="text-gray-700" />
//         </TouchableOpacity>
//       }
//       headerTitle={<Text className="text-gray-900 text-[13px]">Minutes Of Meeting Records</Text>}
//       rightAction={
//         <TouchableOpacity onPress={() => setShowSearch(!showSearch)} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
//           <Search size={22} className="text-gray-700" />
//         </TouchableOpacity>
//       }
//     >
//       <View className="flex-1 bg-gray-50">
//         {isLoading ? (
//           <View className="flex-1 items-center justify-center">
//             <ActivityIndicator size="large" color="#3B82F6" />
//             <Text className="text-gray-500 text-sm mt-2">Loading meetings...</Text>
//           </View>
//         ) : (
//           <View className="flex-1 px-4">
//             <Tabs value={activeTab} onValueChange={val => setActiveTab(val as 'active' | 'archive')} className="flex-1">
//               <TabsList className="bg-blue-50 mb-5 mt-5 flex-row justify-between">
//                 <TabsTrigger value="active" className={`flex-1 mx-1 ${activeTab === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}>
//                   <Text className={`${activeTab === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
//                     Active
//                   </Text>
//                 </TabsTrigger>
//                 <TabsTrigger value="archive" className={`flex-1 mx-1 ${activeTab === 'archive' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}>
//                   <View className="flex-row items-center justify-center">
//                     <Archive size={16} className="mr-1" color={activeTab === 'archive' ? '#00A8F0' : '#6b7280'}/>
//                     <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'} pl-1`}>
//                       Archive
//                     </Text>
//                   </View>
//                 </TabsTrigger>
//               </TabsList>

//               <View className="pb-4">
//                 <Button
//                   className="bg-primaryBlue px-4 py-3 rounded-xl flex-row items-center justify-center shadow-md"
//                   onPress={() => router.push('/(council)/minutes-of-meeting/mom-create')}
//                 >
//                   <Plus size={20} color="white" />
//                   <Text className="text-white ml-2 font-semibold">Add</Text>
//                 </Button>
//               </View>

//               <TabsContent value="active" className="flex-1">
//                 <FlatList
//                   data={filteredRecords.filter(item => !item.mom_is_archive)}
//                   renderItem={renderMOMCard}
//                   keyExtractor={(item) => `mom-${item.mom_id}`}
//                   ListHeaderComponent={renderHeader}
//                   ListEmptyComponent={<RenderEmptyState />}
//                   contentContainerStyle={{
//                     flexGrow: 1,
//                     paddingBottom: 32,
//                   }}
//                   style={{ flex: 1 }}
//                   showsVerticalScrollIndicator={false}
//                 />
//               </TabsContent>

//               <TabsContent value="archive" className="flex-1">
//                 <FlatList
//                   data={filteredRecords.filter(item => item.mom_is_archive)}
//                   renderItem={renderMOMCard}
//                   keyExtractor={(item) => `mom-${item.mom_id}`}
//                   ListHeaderComponent={renderHeader}
//                   ListEmptyComponent={<RenderEmptyState isArchive />}
//                   contentContainerStyle={{
//                     flexGrow: 1,
//                     paddingBottom: 32,
//                   }}
//                   style={{ flex: 1 }}
//                   showsVerticalScrollIndicator={false}
//                 />
//               </TabsContent>
//             </Tabs>
//           </View>
//         )}
//       </View>
//     </PageLayout>
//   )
// }


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
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center py-20">
      <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
        <Archive size={32} className="text-gray-400" />
      </View>
      <Text className="text-gray-500 text-lg font-medium mb-2">
        {searchQuery ? 'No meetings found' : `No ${activeTab} meetings`}
      </Text>
      <Text className="text-gray-400 text-center px-8">
        {searchQuery 
          ? 'Try adjusting your search terms' 
          : `${activeTab === 'active' ? 'Active' : 'Archived'} meetings will appear here once added`
        }
      </Text>
    </View>
  )

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  )

  // Pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50 rounded-lg mt-4 mx-4">
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
    )
  }

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
        <View className="px-6">
          <Tabs value={activeTab} onValueChange={val => handleTabChange(val as 'active' | 'archive')}>
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
            <TabsContent value="active">
              {isLoading && !isRefreshing ? (
                renderLoadingState()
              ) : totalCount === 0 ? (
                renderEmptyState()
              ) : (
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
                    paddingBottom: 500,
                    paddingTop: 16
                  }}
                  ListEmptyComponent={
                    <Text className="text-center text-gray-500 py-4">
                      No active meetings found
                    </Text>
                  }
                />
              )}
              {!isLoading && totalCount > 0 && renderPagination()}
            </TabsContent>

            {/* Archive Tab Content */}
            <TabsContent value="archive">
              {isLoading && !isRefreshing ? (
                renderLoadingState()
              ) : totalCount === 0 ? (
                renderEmptyState()
              ) : (
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
                    paddingBottom: 500,
                    paddingTop: 16
                  }}
                  ListEmptyComponent={
                    <Text className="text-center text-gray-500 py-4">
                      No archived meetings found
                    </Text>
                  }
                />
              )}
              {!isLoading && totalCount > 0 && renderPagination()}
            </TabsContent>
          </Tabs>
        </View>
      </View>
    </PageLayout>
  )
}
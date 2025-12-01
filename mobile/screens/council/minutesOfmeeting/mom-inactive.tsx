// inactive-mom-screen.tsx
import { 
  View, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity, 
  Text,
  ActivityIndicator
} from "react-native"
import React from "react"
import { useRouter } from "expo-router"
import { Calendar, Users, FileText } from "lucide-react-native"
import { useGetInactiveMinutesOfMeetingRecords, type MinutesOfMeetingRecords } from "./queries/MOMFetchQueries"
import { formatAreaOfFocus } from "@/helpers/wordFormatter"
import { LoadingState } from "@/components/ui/loading-state"
import { formatDate } from "@/helpers/dateHelpers"

interface InactiveMOMScreenProps {
  searchQuery: string
}

const INITIAL_PAGE_SIZE = 10;

export default function InactiveMOMScreen({ searchQuery }: InactiveMOMScreenProps) {
  const router = useRouter()
  
  // ================= STATE INITIALIZATION =================
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [pageSize, setPageSize] = React.useState<number>(INITIAL_PAGE_SIZE)
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false)
  const [isScrolling, setIsScrolling] = React.useState<boolean>(false)
  const [isLoadMore, setIsLoadMore] = React.useState<boolean>(false)
  const [isInitialRender, setIsInitialRender] = React.useState<boolean>(true)
  const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null)

  // ================= QUERY HOOK =================
  const { 
    data: inactiveMOMData, 
    isLoading, 
    refetch,
    isFetching
  } = useGetInactiveMinutesOfMeetingRecords(currentPage, pageSize, searchQuery)

  const momRecords = inactiveMOMData?.results || []
  const totalCount = inactiveMOMData?.count || 0
  const hasNext = inactiveMOMData?.next

  // ================= SIDE EFFECTS =================
    React.useEffect(() => {
      if (!isFetching && isRefreshing) setIsRefreshing(false);
    }, [isFetching, isRefreshing]);
  
    React.useEffect(() => {
      if (!isLoading && isInitialRender) setIsInitialRender(false);
    }, [isLoading, isInitialRender]);
  
    React.useEffect(() => {
      if (!isFetching && isLoadMore) setIsLoadMore(false);
    }, [isFetching, isLoadMore]);

  // ================= HANDLERS =================
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }

  const handleLoadMore = () => {
    if (isScrolling) {
      setIsLoadMore(true);
    }

    if (hasNext && isScrolling) {
      setPageSize((prev) => prev + 5);
    }
  }

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
          <Text className="text-blue-600 text-xs font-medium">{formatDate(item.mom_date,"long")}</Text>
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

  const renderItem = React.useCallback(
    ({ item }: { item: MinutesOfMeetingRecords }) => <RenderMOMCard item={item} />,
    []
  )

  // Loading state for initial load
  if (isLoading) {
    return <LoadingState />
  }

  // ================= MAIN RENDER =================
  return (
    <View className="flex-1">
      {/* Result Count */}
      {!isRefreshing && (
        <Text className="text-xs text-gray-500 mt-2 mb-3 px-6">{`Showing ${momRecords.length} of ${totalCount} MOM records`}</Text>
      )}
      
      {/* Loading state during refresh */}
      {isFetching && isRefreshing && !isLoadMore && <LoadingState />}

      {/* Main Content - only render when not refreshing */}
      {!isRefreshing && (
        <FlatList
          maxToRenderPerBatch={10}
          overScrollMode="never"
          data={momRecords}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={10}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          onScroll={handleScroll}
          windowSize={21}
          renderItem={renderItem}
          keyExtractor={(item) => `mom-inactive-${item.mom_id}`}
          removeClippedSubviews
          contentContainerStyle={{
            paddingHorizontal: 0,
            paddingTop: 0,
            paddingBottom: 20,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#00a8f0"]}
            />
          }
          ListFooterComponent={() =>
            isFetching ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-xs text-gray-500 mt-2">
                  Loading more...
                </Text>
              </View>
            ) : (
              !hasNext &&
              momRecords.length > 0 && (
                <View className="py-4 items-center">
                  <Text className="text-xs text-gray-400">
                    No more records
                  </Text>
                </View>
              )
            )
          }
          ListEmptyComponent={<View></View>}
        />
      )}
    </View>
  )
}
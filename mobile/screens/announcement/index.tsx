import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useDeleteAnnouncement, useGetAnnouncementList } from "./queries";
import PageLayout from "@/screens/_PageLayout";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { FileText } from "@/lib/icons/FileText";
import { Calendar } from "@/lib/icons/Calendar";
import { formatTimeAgo, getDateTimeFormat } from "@/helpers/dateHelpers";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/loading-state";
import { Plus } from "@/lib/icons/Plus";
import { Search } from "@/lib/icons/Search";
import { SearchInput } from "@/components/ui/search-input";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@/components/ui/button";
import { SelectLayout } from "@/components/ui/select-layout";

const INITIAL_PAGE_SIZE = 10;

export default () => {
  const router = useRouter();
  const { user } = useAuth();

  const staff_id = user?.staff?.staff_id;

  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState<boolean>(false);
  const [searchInputVal, setSearchInputVal] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<number>(INITIAL_PAGE_SIZE);
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const [myAnnouncement, setMyAnnouncement] = React.useState<boolean>(false);

  const {
    data: announcements,
    isLoading,
    refetch,
    isFetching,
  } = useGetAnnouncementList(currentPage, pageSize, searchQuery);
  const { mutate: deleteAnnouncement } = useDeleteAnnouncement();

  const data = announcements?.results || [];
  const hasNext = announcements?.next;

  React.useEffect(() => {
    if (searchQuery != searchInputVal && searchInputVal == "") {
      setSearchQuery(searchInputVal);
    }
  }, [searchQuery, searchInputVal]);

  React.useEffect(() => {
    if (!isFetching && isSearching) setIsSearching(false);
  }, [isFetching]);

  const handleSearch = React.useCallback(() => {
    setIsSearching(true);
    setSearchQuery(searchInputVal);
    setPageSize(INITIAL_PAGE_SIZE);
  }, [searchInputVal]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPageSize(INITIAL_PAGE_SIZE);
    await refetch();
    setIsRefreshing(false);
  };

  // Load more items when user reaches end of list
  const handleLoadMore = () => {
    if (hasNext && hasScrolled && !isFetching && !isRefreshing && !isLoading) {
      setPageSize((prev) => prev + 5);
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength);
  };

  if (isLoading && currentPage === 1 && searchQuery == "")
    return <LoadingState />;

  return (
    <PageLayout
      wrapScroll={false}
      leftAction={
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.push("/");
          }}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-gray-900 text-[13px]">Announcements</Text>
      }
      rightAction={
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => router.push("/(announcement)/announcementcreate")}
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
      {showSearch && (
        <SearchInput
          value={searchInputVal}
          onChange={setSearchInputVal}
          onSubmit={handleSearch}
        />
      )}
      <View className="flex-1 px-6">
        <View className="flex-row">
          <Button
            variant={"outline"}
            className={`native:h-9 native:p-0 rounded-full ${
              myAnnouncement ? "border-primaryBlue" : "border-gray-400"
            } transition-colors duration-100`}
            onPress={() => setMyAnnouncement((prev) => !prev)}
          >
            <Text
              className={`text-xs ${
                myAnnouncement ? "text-primaryBlue font-medium" : "text-gray-700 font-normal"
              } transition-colors duration-100`}
            >
              My Announcement
            </Text>
          </Button>
        </View>
        {isFetching && searchQuery !== "" && <LoadingState />}

        {/* List */}
        {!isSearching && (
          <FlatList
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
            maxToRenderPerBatch={5}
            initialNumToRender={5}
            windowSize={5}
            data={data}
            onScroll={() => {
              if (!hasScrolled) setHasScrolled(true);
            }}
            renderItem={({ item }) => (
              <View className="py-3">
                {/* Header */}
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-2">
                    <Text
                      className="text-base font-semibold text-gray-900 truncate"
                      numberOfLines={2}
                    >
                      {item.ann_title}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5 truncate">
                      {item.staff.name} - {item.staff.position}
                    </Text>
                  </View>
                </View>

                {/* Description with gradient fade */}
                <View className="relative mb-2">
                  <Text className="text-sm text-gray-700 leading-5">
                    {truncateText(item.ann_details)}
                  </Text>
                  {item.ann_details.length > 100 && (
                    <LinearGradient
                      colors={["rgba(255,255,255,0)", "rgba(255,255,255,1)"]}
                      className="absolute bottom-0 left-0 right-0 h-8"
                      pointerEvents="none"
                    />
                  )}
                </View>

                {/* Footer Info */}
                <View className="flex-row items-center justify-between pt-2">
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/(announcement)/announcementview",
                        params: { ann_id: item.ann_id },
                      })
                    }
                  >
                    <Text className="text-sm font-semibold text-primaryBlue">
                      View more
                    </Text>
                  </TouchableOpacity>
                  <View className="flex-row items-center gap-1">
                    <Calendar size={12} className="text-gray-400" />
                    <Text className="text-xs text-gray-500">
                      {formatTimeAgo(item.ann_created_at)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.ann_id}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={() =>
              isFetching && pageSize > INITIAL_PAGE_SIZE ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text className="text-xs text-gray-500 mt-2">
                    Loading more...
                  </Text>
                </View>
              ) : !hasNext && data.length > 0 && pageSize >= data.length ? (
                <View className="py-4 items-center">
                  <Text className="text-xs text-gray-400">
                    No more announcements
                  </Text>
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={["#3B82F6"]}
              />
            }
            contentContainerStyle={{
              paddingTop: 12,
              paddingBottom: 20,
              gap: 8,
            }}
            ListEmptyComponent={
              <View className="items-center justify-center py-12">
                <FileText size={48} className="text-gray-300 mb-3" />
                <Text className="text-gray-500 text-sm">
                  No announcements yet
                </Text>
              </View>
            }
          />
        )}
      </View>
    </PageLayout>
  );
};

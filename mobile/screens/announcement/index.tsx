import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useDeleteAnnouncement, useGetAnnouncementList } from "./queries";
import PageLayout from "@/screens/_PageLayout";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { FileText } from "@/lib/icons/FileText";
import { formatDate, formatTimeAgo } from "@/helpers/dateHelpers";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/ui/loading-state";
import { Plus } from "@/lib/icons/Plus";
import { Search } from "@/lib/icons/Search";
import { SearchInput } from "@/components/ui/search-input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Ellipsis } from "@/lib/icons/Ellipsis";
import { capitalize } from "@/helpers/capitalize";
import ImageCarousel from "@/components/ui/imageCarousel";

const INITIAL_PAGE_SIZE = 15;

export default () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isInitialRender, setIsInitialRender] = React.useState<boolean>(true);
  const [isLoadMore, setIsLoadMore] = React.useState<boolean>(false);
  const [showSearch, setShowSearch] = React.useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchInputVal, setSearchInputVal] = React.useState<string>("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<number>(INITIAL_PAGE_SIZE);
  const [myAnnouncement, setMyAnnouncement] = React.useState<string | null>(
    null
  );
  const [sortBy, setSortBy] = React.useState<string>("Newest");
  const [filter, setFilter] = React.useState<string>("Type");
  const [recipient, setRecipient] = React.useState<string>("Recipient");
  const [viewMoreList, setViewMoreList] = React.useState<string[]>([]);
  const [isScrolling, setIsScrolling] = React.useState<boolean>(false);
  const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const {
    data: announcements,
    isLoading,
    refetch,
    isFetching,
  } = useGetAnnouncementList(
    currentPage,
    pageSize,
    searchQuery,
    myAnnouncement,
    sortBy,
    filter,
    recipient
  );

  const { mutate: deleteAnnouncement } = useDeleteAnnouncement();

  const data = announcements?.results || [];
  const totalCount = announcements?.count || 0;
  const hasNext = announcements?.next;

  React.useEffect(() => {
    if (searchQuery != searchInputVal && searchInputVal == "") {
      setSearchQuery(searchInputVal);
    }
  }, [searchQuery, searchInputVal]);

  React.useEffect(() => {
    if (!isFetching && isRefreshing) setIsRefreshing(false);
  }, [isFetching, isRefreshing]);

  React.useEffect(() => {
    if (!isLoading && isInitialRender) setIsInitialRender(false);
  }, [isLoading, isInitialRender]);

  React.useEffect(() => {
    if (!isFetching && isLoadMore) setIsLoadMore(false);
  }, [isFetching, isLoadMore]);

  const handleScroll = () => {
    setIsScrolling(true);
    if(scrollTimeout.current){
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false)
    }, 150)
  }

  const handleSearch = React.useCallback(() => {
    setIsRefreshing(true);
    setSearchQuery(searchInputVal);
    setPageSize(INITIAL_PAGE_SIZE);
  }, [searchInputVal]);

  const handleSortBy = (sort: string) => {
    setIsRefreshing(true);
    setSortBy(sort);
  };

  const handleFilter = (filter: string) => {
    setIsRefreshing(true);
    setFilter(filter);
  };

  const handleRecipient = (recip: string) => {
    setIsRefreshing(true);
    setRecipient(recip);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPageSize(INITIAL_PAGE_SIZE);
    await refetch();
    setIsRefreshing(false);
  };

  // Load more items when user reaches end of list
  const handleLoadMore = () => {
    if (isScrolling) {
      setIsLoadMore(true);
    }
    if (hasNext && isScrolling && !isFetching && !isRefreshing && !isLoading) {
      setPageSize((prev) => prev + 5);
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleFormatDate = (posted: string) => {
    const timeAgo = formatTimeAgo(posted)
    const raw = timeAgo?.split(" ")[0]
    const isPastWeek = parseInt(raw) > 7 && raw.split("")[raw.length - 1] == "d"

    return isPastWeek ? formatDate(posted, "short") : timeAgo
  }

  if (isLoading && isInitialRender) {
    return <LoadingState />;
  }

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
        <View>
          <View className="flex-row gap-2 pb-2 flex-wrap">
            {user?.staff && (
              <Button
                variant={"outline"}
                className={`native:h-9 native:p-0 rounded-full ${
                  myAnnouncement ? "border-primaryBlue" : "border-gray-400"
                }`}
                onPress={() => {
                  setIsRefreshing(true);
                  setMyAnnouncement(
                    myAnnouncement ? null : user?.staff?.staff_id
                  );
                }}
              >
                <Text
                  className={`text-xs ${
                    myAnnouncement
                      ? "text-primaryBlue font-medium"
                      : "text-gray-700 font-normal"
                  }`}
                >
                  Created
                </Text>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger>
                <View className="h-9 px-4 rounded-full border border-gray-400 flex-row items-center justify-center">
                  <Text className="text-xs text-gray-700">{sortBy}</Text>
                </View>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2">
                <DropdownMenuItem onPress={() => handleSortBy("Newest")}>
                  <Text className="text-xs">Newest</Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onPress={() => handleSortBy("Oldest")}>
                  <Text className="text-xs">Oldest</Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onPress={() => handleSortBy("A to Z")}>
                  <Text className="text-xs">A to Z</Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onPress={() => handleSortBy("Z to A")}>
                  <Text className="text-xs">Z to A</Text>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <View className="h-9 px-4 rounded-full border border-gray-400 flex-row items-center justify-center">
                  <Text className="text-xs text-gray-700">{filter}</Text>
                </View>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="mt-2">
                <DropdownMenuItem onPress={() => handleFilter("All")}>
                  <Text className="text-xs">All</Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onPress={() => handleFilter("Event")}>
                  <Text className="text-xs">Event</Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onPress={() => handleFilter("General")}>
                  <Text className="text-xs">General</Text>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user?.staff && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <View className="h-9 px-4 rounded-full border border-gray-400 flex-row items-center justify-center">
                    <Text className="text-xs text-gray-700">{recipient}</Text>
                  </View>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mt-2">
                  <DropdownMenuItem onPress={() => handleRecipient("All")}>
                    <Text className="text-xs">All</Text>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onPress={() => handleRecipient("Staff Only")}
                  >
                    <Text className="text-xs">Staff Only</Text>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onPress={() => handleRecipient("Resident Only")}
                  >
                    <Text className="text-xs">Resident Only</Text>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </View>
          {!isRefreshing && (
            <Text className="text-xs text-gray-500 mt-2 mb-3">{`Showing ${totalCount} announcements ${
              myAnnouncement ? "you created" : ""
            }`}</Text>
          )}
        </View>
        {isFetching && isRefreshing && !isLoadMore && <LoadingState />}

        {/* List */}
        {!isRefreshing && (
          <FlatList
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            maxToRenderPerBatch={5}
            initialNumToRender={5}
            windowSize={5}
            data={data}
            onScroll={handleScroll}
            renderItem={({ item }) => (
              <View className="">
                {/* Header */}
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1 mr-2">
                    <Text
                      className="text-base font-semibold text-gray-900 truncate"
                      numberOfLines={2}
                    >
                      {item.ann_title}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-0.5 truncate font-medium">
                      {item.staff.id == user?.staff?.staff_id
                        ? "POSTED BY YOU"
                        : `${capitalize(item.staff.name)} - ${capitalize(
                            item.staff.position
                          )}`}
                    </Text>
                  </View>
                  <View>
                    {item.staff.id == user?.staff?.staff_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Ellipsis size={20} className="text-gray-700" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onPress={() => router.push({
                            pathname: "/(announcement)/announcementcreate",
                            params: {
                              data: JSON.stringify(item)
                            }
                          })}>
                            <Text className="text-sm text-gray-700">Edit</Text>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Text className="text-sm text-gray-700">
                              Delete
                            </Text>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </View>
                </View>

                {/* Description with gradient fade */}
                <View className="relative mb-2">
                  {viewMoreList.includes(item.ann_id) ? (
                    <View>
                      <Text className="text-sm text-gray-700 leading-5">
                        {item.ann_details}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          setViewMoreList(
                            viewMoreList.filter((view) => view !== item.ann_id)
                          )
                        }
                        className="mt-1"
                      >
                        <Text className="text-sm font-semibold text-primaryBlue">
                          View less
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text className="text-sm text-gray-700 leading-5">
                      {truncateText(item.ann_details)}
                      {item.ann_details.length > 150 && (
                        <Text
                          onPress={() =>
                            setViewMoreList((prev) => [...prev, item.ann_id])
                          }
                          className="text-sm font-semibold text-primaryBlue"
                        >
                          {" "}
                          View more
                        </Text>
                      )}
                    </Text>
                  )}
                </View>
                {item.files?.length > 0 && (
                  <ImageCarousel 
                    images={item.files}
                  />
                )}

                {/* Footer Info */}
                <View className="flex-row items-center justify-between border-b border-gray-100 pb-5">
                  <View></View>
                  <Text className="text-xs text-gray-500">
                    {handleFormatDate(item.ann_start_at ? item.ann_start_at : item.ann_created_at)}
                  </Text>
                </View>
              </View>
            )}
            keyExtractor={(item) => item.ann_id}
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
              paddingTop: 0,
              paddingBottom: 20,
              gap: 20,
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

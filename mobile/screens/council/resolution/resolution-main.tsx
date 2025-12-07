import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
  Modal,
  ScrollView,
  Image,
  RefreshControl,
  Linking,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive, ArchiveRestore, Trash, CircleAlert, ChevronLeft, ChevronRight, Search, Files, X } from 'lucide-react-native';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SelectLayout } from '@/components/ui/select-layout';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { useResolution } from './queries/resolution-fetch-queries';
import { useDeleteResolution } from './queries/resolution-delete-queries';
import { useArchiveOrRestoreResolution } from './queries/resolution-delete-queries';
import PageLayout from '@/screens/_PageLayout';
import { useDebounce } from '@/hooks/use-debounce';
import { LoadingState } from "@/components/ui/loading-state";
import { formatDate } from "@/helpers/dateHelpers"


const INITIAL_PAGE_SIZE = 10;

function ResolutionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"active" | "archive">("active");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(INITIAL_PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const [viewImagesModalVisible, setViewImagesModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{rsd_url: string, rsd_name: string}[]>([]);
  const [currentZoomScale, setCurrentZoomScale] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use debounce for search to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Updated to use pagination
  const { 
    data: responseData = { results: [], count: 0, next: null, previous: null }, 
    isLoading, 
    isError, 
    refetch,
    isFetching 
  } = useResolution(
    currentPage,
    pageSize,
    debouncedSearchQuery, 
    filter, 
    yearFilter,
    activeTab === "archive"
  );

  // Extract the actual data array from paginated response
  const fetchedData = responseData?.results || [];
  const totalCount = responseData?.count || 0;
  const hasNext = responseData?.next;

  const { mutate: deleteRes, isPending: isDeletePending } = useDeleteResolution();
  const { mutate: archiveRestore, isPending: isArchivePending } = useArchiveOrRestoreResolution();

  // Reset pagination when filters or tab changes
  useEffect(() => {
    setCurrentPage(1);
    setPageSize(INITIAL_PAGE_SIZE);
  }, [debouncedSearchQuery, filter, yearFilter, activeTab]);

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

  // Handle load more
  const handleLoadMore = () => {
    if (isScrolling) {
      setIsLoadMore(true);
    }

    if (hasNext && isScrolling) {
      setPageSize((prev) => prev + 5);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
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

  // Filter options
  const filterOptions = [
    { label: "All", value: "all" },
    { label: "Council", value: "council" },
    { label: "Waste Committee", value: "waste" },
    { label: "GAD", value: "gad" },
    { label: "Finance", value: "finance" }
  ];

  // Extract unique years from fetched data for the dropdown
  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    
    fetchedData.forEach((record: any) => {
      if (record.res_date_approved) {
        try {
          const date = new Date(record.res_date_approved);
          if (!isNaN(date.getTime())) {
            years.add(date.getFullYear());
          }
        } catch (error) {
          console.error('Error parsing date:', record.res_date_approved, error);
        }
      }
    });

    const sortedYears = Array.from(years).sort((a, b) => b - a);
    
    const options = [{ label: "All Years", value: "all" }];
    
    sortedYears.forEach(year => {
      options.push({ label: year.toString(), value: year.toString() });
    });

    return options;
  }, [fetchedData]);

  const handleDelete = (res_num: number) => deleteRes(String(res_num));
  const handleArchive = (res_num: number) => archiveRestore({ res_num: String(res_num), res_is_archive: true });
  const handleRestore = (res_num: number) => archiveRestore({ res_num: String(res_num), res_is_archive: false });

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
  };

  const handleYearFilterChange = (value: string) => {
    setYearFilter(value);
  };

  const handleViewPdf = (pdfUrl: string) => {
    if (!pdfUrl) {
      Alert.alert("Error", "No PDF file available");
      return;
    }
    Linking.openURL(pdfUrl).catch(() =>
      Alert.alert('Cannot Open PDF', 'Please make sure you have a PDF reader app installed.')
    );
  };

  const handleViewImages = (images: {rsd_url: string, rsd_name: string}[]) => {
    if (!images?.length) {
      Alert.alert("Info", "No supporting images available");
      return;
    }
    setSelectedImages(images);
    setCurrentIndex(0);
    setViewImagesModalVisible(true);
  };

  const handleEdit = (item: any) => {
    router.push({
      pathname: '/(council)/resolution/res-edit',
      params: {
        res_num: item.res_num,
        res_title: item.res_title,
        res_date_approved: item.res_date_approved,
        res_area_of_focus: item.res_area_of_focus,
        resolution_files: JSON.stringify(item.resolution_files || []),
        resolution_supp: JSON.stringify(item.resolution_supp || []),
        gpr_id: item.gpr_id
      }
    });    
  }

  // Loading state component
  const renderLoadingState = () => (
    <View className="h-64 justify-center items-center">
      <LoadingState/>
    </View>
  );

  // Resolution Card Component - Memoized for better performance
  const ResolutionCard = React.memo(({ item, activeTab, onViewPdf, onViewImages, onEdit }: { 
    item: any; 
    activeTab: string;
    onViewPdf: (url: string) => void;
    onViewImages: (images: {rsd_url: string, rsd_name: string}[]) => void;
    onEdit: (item: any) => void;
  }) => (
    <Pressable onPress={() => onEdit(item)} className="mb-4">
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="flex-row justify-between items-center">
          <CardTitle className="text-lg text-[#2a3a61]">Resolution No. {item.res_num}</CardTitle>
          {activeTab === 'active' ? (
            <View className="flex-row gap-1">
              <TouchableOpacity 
                onPress={() => item.resolution_files?.[0]?.rf_url && onViewPdf(item.resolution_files[0].rf_url)} 
                className="bg-blue-50 rounded py-1 px-1.5"
              >
                <Files size={16} color="#00A8F0"/>
              </TouchableOpacity>

              <ConfirmationModal
                trigger={<TouchableOpacity className="bg-red-50 rounded py-1 px-1.5"><Archive size={16} color="#dc2626"/></TouchableOpacity>}
                title="Archive Resolution"
                description="This resolution will be archived. Proceed?"
                actionLabel="Confirm"
                onPress={() => handleArchive(item.res_num)}
              />
            </View>
          ) : (
            <View className="flex-row gap-1">
              <TouchableOpacity 
                onPress={() => item.resolution_files?.[0]?.rf_url && onViewPdf(item.resolution_files[0].rf_url)} 
                className="bg-blue-50 rounded py-1 px-1.5"
              >
                <Files size={16} color="#00A8F0"/>
              </TouchableOpacity>

              <ConfirmationModal
                trigger={<TouchableOpacity className="bg-green-50 rounded py-1 px-1.5"><ArchiveRestore size={16} color="#15803d"/></TouchableOpacity>}
                title="Restore Resolution"
                description="Restore this resolution from the archive?"
                actionLabel="Confirm"
                onPress={() => handleRestore(item.res_num)}
              />
              <ConfirmationModal
                trigger={<TouchableOpacity className="bg-red-50 rounded py-1 px-1.5"><Trash size={16} color="#dc2626"/></TouchableOpacity>}
                title="Delete Resolution"
                description="This action is irreversible. Proceed?"
                actionLabel="Confirm"
                onPress={() => handleDelete(item.res_num)}
              />
            </View>
          )}
        </CardHeader>

        <CardContent className="space-y-2">
          <View className="pb-3">
            <Text className="text-gray-600">Title:</Text>
            <Text className="text-base text-black mt-1" numberOfLines={3} ellipsizeMode="tail">
              {item.res_title}
            </Text>
          </View>

          <View className="flex-row justify-between pb-1">
            <Text className="text-gray-600">Date Approved:</Text>
            <Text>{formatDate(item.res_date_approved,"long")}</Text>
          </View>

          <View className="flex-row justify-between pb-1">
            <Text className="text-gray-600">Area of Focus:</Text>
            <Text>{item.res_area_of_focus?.join(', ') || ''}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-gray-600">Supporting Documents:</Text>
            {item.resolution_supp?.length > 0 ? (
              <TouchableOpacity onPress={() => onViewImages(item.resolution_supp)}>
                <Text className="text-blue-600 underline">{item.resolution_supp.length} attachment(s)</Text>
              </TouchableOpacity>
            ) : (
              <View className="flex-row items-center">
                <CircleAlert size={16} color="#ff2c2c" />
                <Text className="text-red-500 ml-1">No documents</Text>
              </View>
            )}
          </View>
        </CardContent>
      </Card>
    </Pressable>
  ));

  const renderItem = React.useCallback(
    ({ item }: { item: any }) => (
      <ResolutionCard 
        item={item} 
        activeTab={activeTab}
        onViewPdf={handleViewPdf}
        onViewImages={handleViewImages}
        onEdit={handleEdit}
      />
    ),
    [activeTab]
  );

  // Simple empty state component
  const renderEmptyState = () => {
    const message = searchQuery || filter !== 'all' || yearFilter !== 'all'
      ? "No matching resolutions found."
      : activeTab === 'active' 
        ? "No active resolutions found." 
        : "No archived resolutions found.";
    
    return (
      <View className="flex-1 justify-center items-center py-8">
        <Text className="text-gray-500 text-center">{message}</Text>
      </View>
    );
  };

  if (isError) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Resolution Record</Text>}
        rightAction={
          <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
        }
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-red-500 text-center mb-4">
            Failed to load resolutions.
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-[#2a3a61] px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Try Again</Text>
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
      headerTitle={
          <Text className="text-gray-900 text-[13px]">Resolution Record</Text>
      }
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
        {showSearch && (
          <SearchInput 
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={() => {}} 
          />
        )}      

        {/*Filters */}
        <View className="px-6 pt-4 pb-4">
          <View className="flex-row justify-between items-center gap-2">
            <View className="flex-1 pb-4">
              <SelectLayout
                options={yearOptions}
                className="h-8"
                selectedValue={yearFilter}
                onSelect={(option) => handleYearFilterChange(option.value)}
                placeholder="Year Filter"
                isInModal={false}
              />
            </View>

            <View className="flex-1 pb-4">
              <SelectLayout
                options={filterOptions}
                className="h-8"
                selectedValue={filter}
                onSelect={(option) => handleFilterChange(option.value)}
                placeholder="Area Filter"
                isInModal={false}
              />
            </View>
          </View>

          <Button 
            onPress={() => router.push('/(council)/resolution/res-create')} 
            className="bg-primaryBlue mt-4 rounded-xl"
          >
            <Text className="text-white text-[17px]">Create</Text>
          </Button>
        </View>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "active" | "archive")} className="flex-1">
          <TabsList className="bg-blue-50 mx-6 mb-5 mt-2 flex-row justify-between">
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
              <Text className={`${activeTab === 'archive' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                Archive
              </Text>
            </TabsTrigger>
          </TabsList>

          {/* Loading state during refresh */}
          {isFetching && isRefreshing && !isLoadMore && <LoadingState />}

          {/* Main Content - only render when not refreshing */}
          {!isRefreshing && (
            <>
              <TabsContent value="active" className="flex-1 p-2">
                {/* Result Count - Only show when there are items */}
                {!isRefreshing && fetchedData.length > 0 && (
                  <View className="px-6 mb-2">
                    <Text className="text-xs text-gray-500">
                      Showing {fetchedData.length} of {totalCount} resolutions
                    </Text>
                  </View>
                )}

                <FlatList
                  maxToRenderPerBatch={5}
                  overScrollMode="never"
                  data={fetchedData}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  initialNumToRender={5}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  onScroll={handleScroll}
                  windowSize={11}
                  renderItem={renderItem}
                  keyExtractor={item => `resolution-active-${item.res_num}`}
                  removeClippedSubviews
                  contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    paddingBottom: 20,
                    flexGrow: 1,
                  }}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      colors={["#00a8f0"]}
                    />
                  }
                  ListFooterComponent={() =>
                    isFetching && isLoadMore ? (
                      <View className="py-4 items-center">
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text className="text-xs text-gray-500 mt-2">
                          Loading more resolutions...
                        </Text>
                      </View>
                    ) : (
                      !hasNext &&
                      fetchedData.length > 0 && (
                        <View className="py-4 items-center">
                          <Text className="text-xs text-gray-400">
                            No more resolutions
                          </Text>
                        </View>
                      )
                    )
                  }
                  ListEmptyComponent={renderEmptyState()}
                />
              </TabsContent>

              <TabsContent value="archive" className="flex-1 p-2">
                {/* Result Count - Only show when there are items */}
                {!isRefreshing && fetchedData.length > 0 && (
                  <View className="px-6 mb-2">
                    <Text className="text-xs text-gray-500">
                      Showing {fetchedData.length} of {totalCount} resolutions
                    </Text>
                  </View>
                )}

                <FlatList
                  maxToRenderPerBatch={5}
                  overScrollMode="never"
                  data={fetchedData}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  initialNumToRender={5}
                  onEndReached={handleLoadMore}
                  onEndReachedThreshold={0.5}
                  onScroll={handleScroll}
                  windowSize={11}
                  renderItem={renderItem}
                  keyExtractor={item => `resolution-archive-${item.res_num}`}
                  removeClippedSubviews
                  contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    paddingBottom: 20,
                    flexGrow: 1,
                  }}
                  refreshControl={
                    <RefreshControl
                      refreshing={isRefreshing}
                      onRefresh={handleRefresh}
                      colors={["#00a8f0"]}
                    />
                  }
                  ListFooterComponent={() =>
                    isFetching && isLoadMore ? (
                      <View className="py-4 items-center">
                        <ActivityIndicator size="small" color="#3B82F6" />
                        <Text className="text-xs text-gray-500 mt-2">
                          Loading more resolutions...
                        </Text>
                      </View>
                    ) : (
                      !hasNext &&
                      fetchedData.length > 0 && (
                        <View className="py-4 items-center">
                          <Text className="text-xs text-gray-400">
                            No more resolutions
                          </Text>
                        </View>
                      )
                    )
                  }
                  ListEmptyComponent={renderEmptyState()}
                />
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* View Images Modal - keep this part the same */}
        <Modal
          visible={viewImagesModalVisible}
          transparent={true}
          onRequestClose={() => {
            setViewImagesModalVisible(false);
            setCurrentZoomScale(1);
          }}
        >
          <View className="flex-1 bg-black/90">
            {/* Header with close button and file name */}
            <View className="absolute top-0 left-0 right-0 z-10 bg-black/50 p-4 flex-row justify-between items-center">
              <Text className="text-white text-lg font-medium w-[90%]">
                {selectedImages[currentIndex]?.rsd_name || 'Document'}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setViewImagesModalVisible(false);
                  setCurrentZoomScale(1);
                }}
              >
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Image with zoom capability */}
            <ScrollView
              className="flex-1"
              maximumZoomScale={3}
              minimumZoomScale={1}
              zoomScale={currentZoomScale}
              onScrollEndDrag={(e) => setCurrentZoomScale(e.nativeEvent.zoomScale)}
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            >
              <Image
                source={{ uri: selectedImages[currentIndex]?.rsd_url }}
                style={{ width: '100%', height: 400 }}
                resizeMode="contain"
              />
            </ScrollView>

            {/* Pagination indicators at the bottom */}
            {selectedImages.length > 1 && (
              <View className="absolute bottom-4 left-0 right-0 items-center">
                <View className="flex-row bg-black/50 rounded-full px-3 py-1">
                  {selectedImages.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setCurrentIndex(index);
                        setCurrentZoomScale(1);
                      }}
                      className="p-1"
                    >
                      <View 
                        className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Navigation arrows for multiple files */}
            {selectedImages.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <TouchableOpacity
                    className="absolute left-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
                    onPress={() => {
                      setCurrentIndex(prev => prev - 1);
                      setCurrentZoomScale(1);
                    }}
                  >
                    <ChevronLeft size={24} color="white" />
                  </TouchableOpacity>
                )}
                {currentIndex < selectedImages.length - 1 && (
                  <TouchableOpacity
                    className="absolute right-4 top-1/2 -mt-6 bg-black/50 rounded-full p-3"
                    onPress={() => {
                      setCurrentIndex(prev => prev + 1);
                      setCurrentZoomScale(1);
                    }}
                  >
                    <ChevronRight size={24} color="white" />
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </Modal>
      </View>
    </PageLayout>
  );
}

export default ResolutionPage;
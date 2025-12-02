import React from "react";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  ActivityIndicator
} from "react-native";
import {
  Archive,
  ArchiveRestore,
  Trash,
  ChevronLeft,
} from "lucide-react-native";
import {
  useGetProjectProposals,
  useGetProjectProposalYears,
  useGetProjectProposalGrandTotal
} from "./queries/projprop-fetchqueries";
import {
  usePermanentDeleteProjectProposal,
  useArchiveProjectProposal,
  useRestoreProjectProposal,
} from "./queries/projprop-delqueries";
import { ProjectProposalView } from "./projprop-view";
import { useRouter } from "expo-router";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { ProjectProposal } from "./projprop-types";
import { SelectLayout } from "@/components/ui/select-layout";
import { useDebounce } from "@/hooks/use-debounce";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search } from "@/lib/icons/Search";
import { SearchInput } from "@/components/ui/search-input";

const INITIAL_PAGE_SIZE = 10;

const ProjectProposalList: React.FC = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [_showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectProposal | null>(null);
  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const [selectedYear, setSelectedYear] = useState("All");
  const [showSearch, setShowSearch] = useState(false);
  
  // Pagination states like receipt page
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(INITIAL_PAGE_SIZE);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isLoadMore, setIsLoadMore] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const { data: grandTotalData } = useGetProjectProposalGrandTotal();
  const grandTotal = grandTotalData?.grand_total || 0;
  const { data: availableYears = [] } = useGetProjectProposalYears();
  const {
    data: projectsData,
    isLoading,
    refetch,
    error,
    isFetching,
  } = useGetProjectProposals(
    currentPage,
    pageSize,
    debouncedSearchTerm,
    viewMode === "archived",
    selectedYear !== "All" ? selectedYear : undefined
  );

  const { mutate: deleteProject, isPending: isDeleting } = usePermanentDeleteProjectProposal();
  const { mutate: archiveProject, isPending: isArchiving } = useArchiveProjectProposal();
  const { mutate: restoreProject, isPending: isRestoring } = useRestoreProjectProposal();

  // Extract data from paginated response
  const projects = projectsData?.results || [];
  const totalCount = projectsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasMore = currentPage < totalPages;

  // Reset pagination when search, filter, year or view mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, selectedYear, viewMode]);

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

  // Handle load more - increment page number
  const handleLoadMore = () => {
    if (isScrolling && hasMore && !isFetching && !isLoadMore) {
      setIsLoadMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
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

  // Create year filter options
  const yearFilterOptions = [
    { label: "All Years", value: "All" },
    ...availableYears.map((year) => ({
      label: year.toString(),
      value: year.toString(),
    })),
  ];

  const handleSearch = () => {
    setSearchQuery(searchInputVal);
    setCurrentPage(1);
  };

  const handleArchivePress = (project: ProjectProposal, event?: any) => {
    event?.stopPropagation?.();
    archiveProject(project.gprId, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleRestorePress = (project: ProjectProposal, event?: any) => {
    event?.stopPropagation?.();
    restoreProject(project.gprId, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleDeletePress = (project: ProjectProposal, event?: any) => {
    event?.stopPropagation?.();
    deleteProject(project.gprId, {
      onSuccess: () => {
        refetch();
        setShowDeleteSuccess(true);
      },
    });
  };

  const handleProjectPress = (project: ProjectProposal) => {
    setSelectedProject(project);
  };

  const handleViewModeChange = (mode: "active" | "archived") => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const handleYearChange = (option: { label: string; value: string }) => {
    setSelectedYear(option.value);
    setCurrentPage(1);
  };

  // Memoized Render Project Card
  const RenderProjectCard = React.memo(({ project }: { project: ProjectProposal }) => (
    <TouchableOpacity
      onPress={() => handleProjectPress(project)}
      activeOpacity={0.8}
      className="mb-3"
    >
      <Card className="border-2 border-gray-200 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="font-semibold text-lg text-[#1a2332] mb-1">
                {project.projectTitle || "Untitled"}
              </Text>
              <Text className="text-sm text-gray-500">
                Date: {project.date || "No date provided"}
              </Text>
            </View>
            <View className="flex-row">
              {viewMode === "active" ? (
                <ConfirmationModal
                  trigger={
                    <TouchableOpacity className="bg-red-50 p-2 rounded-lg ml-2">
                      <Archive size={16} color="#ef4444" />
                    </TouchableOpacity>
                  }
                  title={`Archive "${project.projectTitle}"`}
                  description="Are you sure you want to archive this project proposal?"
                  actionLabel="Archive"
                  onPress={() => handleArchivePress(project)}
                />
              ) : (
                <>
                  <ConfirmationModal
                    trigger={
                      <TouchableOpacity className="bg-green-50 p-2 rounded-lg ml-2">
                        <ArchiveRestore size={16} color="#10b981" />
                      </TouchableOpacity>
                    }
                    title={`Restore "${project.projectTitle}"`}
                    description="Are you sure you want to restore this project proposal?"
                    actionLabel="Restore"
                    onPress={() => handleRestorePress(project)}
                  />
                  <ConfirmationModal
                    trigger={
                      <TouchableOpacity className="bg-red-50 p-2 rounded-lg ml-2">
                        <Trash size={16} color="#ef4444" />
                      </TouchableOpacity>
                    }
                    title={`Delete "${project.projectTitle}"`}
                    description="Please confirm if you would like to proceed with deleting the proposal. This action cannot be undone."
                    actionLabel="Delete"
                    variant="destructive"
                    onPress={() => handleDeletePress(project)}
                  />
                </>
              )}
            </View>
          </View>
        </CardHeader>

        <CardContent className="pt-3 border-t border-gray-200">
          <View className="space-y-3">
            <View className="pb-2">
              <Text className="text-sm text-gray-600 mb-1">Description:</Text>
              <Text className="text-base text-black" numberOfLines={2} ellipsizeMode="tail">
                {project.background || "No description available"}
              </Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-600">Total Budget:</Text>
              <Text className="text-lg font-bold text-[#2a3a61]">
                ₱
                {project.budgetItems && project.budgetItems.length > 0
                  ? new Intl.NumberFormat("en-US", {
                      style: "decimal",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(
                      project.budgetItems.reduce((grandTotal, item) => {
                        const amount = item.amount || 0;
                        const paxCount =
                          typeof item.pax === "string"
                            ? parseInt(item.pax) ||
                              (item.pax.includes("pax")
                                ? parseInt(item.pax) || 1
                                : 1)
                            : 1;
                        return grandTotal + paxCount * amount;
                      }, 0)
                    )
                  : "N/A"}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  ));

  // Render function for FlatList
  const renderItem = React.useCallback(
    ({ item }: { item: ProjectProposal }) => <RenderProjectCard project={item} />,
    []
  );

  // Empty state component
  const renderEmptyState = () => {
    const emptyMessage = searchQuery || selectedYear !== "All"
      ? "No project proposals found"
      : `No ${viewMode === "active" ? "active" : "archived"} project proposals found.`;
    
    return (
      <View className="flex-1 justify-center items-center py-12">
        <Text className="text-gray-500 text-center">
          {emptyMessage}
        </Text>
      </View>
    );
  };

  if (selectedProject) {
    return (
      <ProjectProposalView
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  if (error) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Project Proposal</Text>}
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
          <Text className="text-red-500 text-lg font-medium mb-2">
            Error loading proposals
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            {error.message}
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="bg-primaryBlue px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-gray-900 text-[13px]">Project Proposal</Text>}
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
            {/* Year Filter */}
            <View className="py-3">
              <SelectLayout
                options={yearFilterOptions}
                selectedValue={selectedYear}
                onSelect={handleYearChange}
                placeholder="Filter by year"
                isInModal={false}
              />
            </View>

            {/* Total Budget Display */}
            <View className="pb-3">
              <View className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
                <Text className="font-medium text-sm text-center">
                  Grand Total:{" "}
                  <Text className="font-bold text-green-700">
                    ₱
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(grandTotal)}
                  </Text>
                </Text>
              </View>
            </View>

            {/* Result Count */}
            {!isRefreshing && projects.length > 0 && (
              <View className="mb-2">
                <Text className="text-xs text-gray-500">
                  Showing {projects.length} of {totalCount} proposals
                  {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                </Text>
              </View>
            )}

            {/* Tabs - Styled like Budget Plan */}
            <Tabs value={viewMode} onValueChange={val => handleViewModeChange(val as "active" | "archived")} className="flex-1">
              <TabsList className="bg-blue-50 flex-row justify-between">
                <TabsTrigger 
                  value="active" 
                  className={`flex-1 mx-1 ${viewMode === 'active' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
                >
                  <Text className={`${viewMode === 'active' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                    Active
                  </Text>
                </TabsTrigger>
                <TabsTrigger 
                  value="archived" 
                  className={`flex-1 mx-1 ${viewMode === 'archived' ? 'bg-white border-b-2 border-primaryBlue' : ''}`}
                >
                  <Text className={`${viewMode === 'archived' ? 'text-primaryBlue font-medium' : 'text-gray-500'}`}>
                    Archived
                  </Text>
                </TabsTrigger>
              </TabsList>

              {/* Active Tab Content */}
              <TabsContent value="active" className="flex-1 mt-4">
                {isLoading && isInitialRender ? (
                  <View className="flex-1 justify-center items-center">
                    <LoadingState/>
                  </View>
                ) : (
                  <View className="flex-1">
                    {projects.length === 0 ? (
                      renderEmptyState()
                    ) : (
                      <FlatList
                        data={projects}
                        maxToRenderPerBatch={5}
                        overScrollMode="never"
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        initialNumToRender={5}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        onScroll={handleScroll}
                        windowSize={11}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => `project-${item.gprId}-${index}`}
                        removeClippedSubviews
                        contentContainerStyle={{
                          paddingBottom: 20,
                          paddingTop: 8,
                          flexGrow: 1,
                        }}
                        refreshControl={
                          <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={['#00a8f0']}
                          />
                        }
                        ListFooterComponent={() =>
                          isFetching && isLoadMore ? (
                            <View className="py-4 items-center">
                              <ActivityIndicator size="small" color="#3B82F6" />
                              <Text className="text-xs text-gray-500 mt-2">
                                Loading more proposals...
                              </Text>
                            </View>
                          ) : (
                            !hasMore &&
                            projects.length > 0 && (
                              <View className="py-4 items-center">
                                <Text className="text-xs text-gray-400">
                                  No more proposals
                                </Text>
                              </View>
                            )
                          )
                        }
                      />
                    )}
                  </View>
                )}
              </TabsContent>

              {/* Archived Tab Content */}
              <TabsContent value="archived" className="flex-1 mt-4">
                {isLoading && isInitialRender ? (
                  <View className="flex-1 justify-center items-center">
                    <LoadingState/>
                  </View>
                ) : (
                  <View className="flex-1">
                    {projects.length === 0 ? (
                      renderEmptyState()
                    ) : (
                      <FlatList
                        data={projects}
                        maxToRenderPerBatch={5}
                        overScrollMode="never"
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        initialNumToRender={5}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        onScroll={handleScroll}
                        windowSize={11}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => `project-${item.gprId}-${index}`}
                        removeClippedSubviews
                        contentContainerStyle={{
                          paddingBottom: 20,
                          paddingTop: 8,
                          flexGrow: 1,
                        }}
                        refreshControl={
                          <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={handleRefresh}
                            colors={['#00a8f0']}
                          />
                        }
                        ListFooterComponent={() =>
                          isFetching && isLoadMore ? (
                            <View className="py-4 items-center">
                              <ActivityIndicator size="small" color="#3B82F6" />
                              <Text className="text-xs text-gray-500 mt-2">
                                Loading more proposals...
                              </Text>
                            </View>
                          ) : (
                            !hasMore &&
                            projects.length > 0 && (
                              <View className="py-4 items-center">
                                <Text className="text-xs text-gray-400">
                                  No more proposals
                                </Text>
                              </View>
                            )
                          )
                        }
                      />
                    )}
                  </View>
                )}
              </TabsContent>
            </Tabs>
          </View>
        </View>
      </PageLayout>

      {/* Loading Modal for mutations */}
      <LoadingModal 
        visible={isArchiving || isRestoring || isDeleting} 
      />
    </>
  );
};

export default ProjectProposalList;
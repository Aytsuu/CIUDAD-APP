import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  FlatList,
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

const ProjectProposalList: React.FC = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [_showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectProposal | null>(null);
  const [searchInputVal, setSearchInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchTerm = useDebounce(searchQuery, 500);
  const [selectedYear, setSelectedYear] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  
  const pageSize = 10;
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

  // Calculate total budget of all displayed projects
  const totalBudget = projects.reduce((sum, project) => {
    if (!project.budgetItems || project.budgetItems.length === 0) return sum;

    const projectTotal = project.budgetItems.reduce((projectSum, item) => {
      const amount =
        typeof item.amount === "string"
          ? parseFloat(item.amount) || 0
          : item.amount || 0;
      const paxCount =
        typeof item.pax === "string"
          ? parseInt(item.pax.replace(/\D/g, "")) || 1
          : 1;
      return projectSum + paxCount * amount;
    }, 0);

    return sum + projectTotal;
  }, 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
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

  // Render Project Card (styled like Budget Plan)
  const RenderProjectCard = ({ project }: { project: ProjectProposal }) => (
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
            onPress={() => refetch()}
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
                    }).format(totalBudget)}
                  </Text>
                </Text>
              </View>
            </View>

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
                {isLoading ? (
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
                        renderItem={({ item }) => <RenderProjectCard project={item} />}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                          <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#00a8f0']}
                          />
                        }
                        contentContainerStyle={{ 
                          paddingBottom: 16,
                          paddingTop: 16
                        }}
                        ListFooterComponent={
                          totalPages > 1 ? (
                            <View className="flex-row justify-between items-center mt-4 px-4">
                              <TouchableOpacity
                                onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`p-2 ${currentPage === 1 ? "opacity-50" : ""}`}
                              >
                                <Text className="text-primaryBlue font-bold">← Previous</Text>
                              </TouchableOpacity>

                              <View className="flex-row items-center">
                                {isFetching && (
                                  <LoadingState />
                                )}
                                <Text className="text-gray-500">
                                  Page {currentPage} of {totalPages}
                                </Text>
                              </View>

                              <TouchableOpacity
                                onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`p-2 ${currentPage === totalPages ? "opacity-50" : ""}`}
                              >
                                <Text className="text-primaryBlue font-bold">Next →</Text>
                              </TouchableOpacity>
                            </View>
                          ) : null
                        }
                      />
                    )}
                  </View>
                )}
              </TabsContent>

              {/* Archived Tab Content */}
              <TabsContent value="archived" className="flex-1 mt-4">
                {isLoading ? (
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
                        renderItem={({ item }) => <RenderProjectCard project={item} />}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                          <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#00a8f0']}
                          />
                        }
                        contentContainerStyle={{ 
                          paddingBottom: 16,
                          paddingTop: 16
                        }}
                        ListFooterComponent={
                          totalPages > 1 ? (
                            <View className="flex-row justify-between items-center mt-4 px-4">
                              <TouchableOpacity
                                onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`p-2 ${currentPage === 1 ? "opacity-50" : ""}`}
                              >
                                <Text className="text-primaryBlue font-bold">← Previous</Text>
                              </TouchableOpacity>

                              <View className="flex-row items-center">
                                {isFetching && (
                                  <LoadingState />
                                )}
                                <Text className="text-gray-500">
                                  Page {currentPage} of {totalPages}
                                </Text>
                              </View>

                              <TouchableOpacity
                                onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`p-2 ${currentPage === totalPages ? "opacity-50" : ""}`}
                              >
                                <Text className="text-primaryBlue font-bold">Next →</Text>
                              </TouchableOpacity>
                            </View>
                          ) : null
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
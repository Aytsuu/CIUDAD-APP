import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView
} from "react-native";
import {
  Archive,
  ArchiveRestore,
  Trash,
  ChevronLeft,
  ClipboardCheck
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
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select-layout";
import { useDebounce } from "@/hooks/use-debounce";
import PageLayout from "@/screens/_PageLayout";

const ProjectProposalList: React.FC = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [_showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectProposal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [selectedYear, setSelectedYear] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
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

  const { mutate: deleteProject } = usePermanentDeleteProjectProposal();
  const { mutate: archiveProject } = useArchiveProjectProposal();
  const { mutate: restoreProject } = useRestoreProjectProposal();

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

  // Calculate total budget of all displayed projects
  const totalBudget = projects.reduce((sum, project) => {
    if (!project.budgetItems || project.budgetItems.length === 0) return sum;

    const projectTotal = project.budgetItems.reduce((projectSum, item) => {
      const amount = typeof item.amount === 'string' ? parseFloat(item.amount) || 0 : item.amount || 0;
      const paxCount = typeof item.pax === 'string' 
        ? parseInt(item.pax.replace(/\D/g, '')) || 1 
        : 1;
      return projectSum + (paxCount * amount);
    }, 0);

    return sum + projectTotal;
  }, 0);

  const handleViewLogs = () => {
    router.push({
      pathname: "/gad/project-proposal/projprop-logs",
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    setCurrentPage(1);
  };

  const handleArchivePress = (project: ProjectProposal, event?: any) => {
    event?.stopPropagation?.();
    return new Promise<void>((resolve) => {
      setIsProcessing(true);
      archiveProject(project.gprId, {
        onSuccess: () => {
          refetch();
          setIsProcessing(false);
          resolve();
        },
        onError: () => {
          setIsProcessing(false);
          resolve();
        },
      });
    });
  };

  const handleRestorePress = (project: ProjectProposal, event?: any) => {
    event?.stopPropagation?.();
    return new Promise<void>((resolve) => {
      setIsProcessing(true);
      restoreProject(project.gprId, {
        onSuccess: () => {
          refetch();
          setIsProcessing(false);
          resolve();
        },
        onError: () => {
          setIsProcessing(false);
          resolve();
        },
      });
    });
  };

  const handleDeletePress = (project: ProjectProposal, event?: any) => {
    event?.stopPropagation?.();
    return new Promise<void>((resolve) => {
      setIsProcessing(true);
      deleteProject(project.gprId, {
        onSuccess: () => {
          refetch();
          setIsProcessing(false);
          setShowDeleteSuccess(true);
          resolve();
        },
        onError: () => {
          setIsProcessing(false);
          resolve();
        },
      });
    });
  };

  const handleProjectPress = (project: ProjectProposal) => {
    setSelectedProject(project);
  };

  const handleViewModeChange = (mode: "active" | "archived") => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);
    setCurrentPage(1);
  };

  const handleYearChange = (option: { label: string; value: string }) => {
    setSelectedYear(option.value);
    setCurrentPage(1);
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
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="black" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-[16px] font-medium">GAD Project Proposal</Text>}
        backgroundColor="bg-white"
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
            className="bg-blue-500 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerTitle={<Text>GAD Project Proposal</Text>}
      wrapScroll={false}
      showScrollIndicator={false}
    >
      <ScrollView
      showsVerticalScrollIndicator={true}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Search and Filter Section */}
      <View className="p-4">
        <View className="mb-2">
          <Input
            placeholder="Search by project title..."
            className="rounded-xl flex-row items-center justify-between px-4 py-3 min-h-[44px] border border-gray-300"
            value={searchTerm}
            onChangeText={handleSearchChange}
          />
        </View>
        
        <SelectLayout
          options={yearFilterOptions}
          selectedValue={selectedYear}
          onSelect={handleYearChange}
          placeholder="Year"
          className="bg-white mb-2"
        />

        {/* View Mode Toggle and Total Budget */}
        <View className="flex-row justify-between items-center mb-4">
          {/* Total Budget Display */}
          <View className="px-3 py-2 rounded-lg bg-gray-50">
            <Text className="font-medium text-sm">
              Total:{" "}
              <Text className="font-bold text-green-700">
                ₱
                {new Intl.NumberFormat("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(totalBudget)}
              </Text>
            </Text>
          </View>
          
          {/* View Mode Toggle */}
          <View className="flex-row border border-gray-300 rounded-full bg-gray-100 overflow-hidden">
            <TouchableOpacity
              className={`px-4 py-2 ${viewMode === "active" ? "bg-white" : ""}`}
              onPress={() => handleViewModeChange("active")}
            >
              <Text className="text-sm font-medium">Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 ${
                viewMode === "archived" ? "bg-white" : ""
              }`}
              onPress={() => handleViewModeChange("archived")}
            >
              <Text className="text-sm font-medium">Archived</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

        {/* Initial Loading State */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center py-16">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="mt-4 text-gray-600">Loading proposals...</Text>
          </View>
        ) : projects.length === 0 ? (
          <View className="flex-1 justify-center items-center py-12 px-4">
            <Text className="text-gray-500 text-center">
              {searchTerm || selectedYear !== "All"
                ? "No project proposals found"
                : `No ${
                    viewMode === "active" ? "active" : "archived"
                  } project proposals found.`}
            </Text>
          </View>
        ) : (
          <View className="px-4 pb-4">
            {/* Project List */}
            {projects.map((project) => (
              <TouchableOpacity
                key={project.gprId}
                onPress={() => handleProjectPress(project)}
                className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-200"
              >
                <View className="flex-row justify-between items-start mb-3">
                  <Text className="text-lg font-semibold text-gray-900 flex-1 mr-3">
                    {project.projectTitle || "Untitled"}
                  </Text>
                  <View className="flex-row">
                    {viewMode === "active" ? (
                      <ConfirmationModal
                        trigger={
                          <TouchableOpacity className="p-1">
                            <Archive color="#ef4444" size={20} />
                          </TouchableOpacity>
                        }
                        title={`Archive "${project.projectTitle}"`}
                        description="Are you sure you want to archive this project proposal?"
                        actionLabel="Archive"
                        onPress={() => handleArchivePress(project)}
                        loading={isProcessing}
                      />
                    ) : (
                      <>
                        <ConfirmationModal
                          trigger={
                            <TouchableOpacity className="p-1 mr-2">
                              <ArchiveRestore color="#10b981" size={20} />
                            </TouchableOpacity>
                          }
                          title={`Restore "${project.projectTitle}"`}
                          description="Are you sure you want to restore this project proposal?"
                          actionLabel="Restore"
                          onPress={() => handleRestorePress(project)}
                          loading={isProcessing}
                        />
                        <ConfirmationModal
                          trigger={
                            <TouchableOpacity className="p-1">
                              <Trash color="#ef4444" size={20} />
                            </TouchableOpacity>
                          }
                          title={`Delete "${project.projectTitle}"`}
                          description="Please confirm if you would like to proceed with deleting the proposal. This action cannot be undone."
                          actionLabel="Delete"
                          variant="destructive"
                          onPress={() => handleDeletePress(project)}
                          loading={isProcessing}
                        />
                      </>
                    )}
                  </View>
                </View>

                <Text className="text-sm text-gray-600 mb-3" numberOfLines={2}>
                  {project.background || "No description available"}
                </Text>

                <View className="mb-2">
                  <Text className="text-sm text-gray-600">
                    Date: {project.date || "No date provided"}
                  </Text>
                </View>

                <View className="mb-2">
                  <Text className="text-sm text-gray-600 underline">
                    Total Budget: ₱
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
              </TouchableOpacity>
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <View className="flex-row justify-between items-center mt-4">
                <TouchableOpacity
                  onPress={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`p-2 ${currentPage === 1 ? "opacity-50" : ""}`}
                >
                  <Text className="text-primaryBlue font-bold">← Previous</Text>
                </TouchableOpacity>

                <View className="flex-row items-center">
                  {isFetching && (
                    <ActivityIndicator size="small" color="#3b82f6" className="mr-2" />
                  )}
                  <Text className="text-gray-500">
                    Page {currentPage} of {totalPages}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`p-2 ${
                    currentPage === totalPages ? "opacity-50" : ""
                  }`}
                >
                  <Text className="text-primaryBlue font-bold">Next →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
};

export default ProjectProposalList;
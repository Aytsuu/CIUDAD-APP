import type React from "react";
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native";
import {
  Archive,
  ArchiveRestore,
  Trash,
  ChevronLeft,
} from "lucide-react-native";
import { useGetProjectProposals } from "./queries/projprop-fetchqueries";
import {
  usePermanentDeleteProjectProposal,
  useArchiveProjectProposal,
  useRestoreProjectProposal,
} from "./queries/projprop-delqueries";
import { ProjectProposalView } from "./projprop-view";
import { useRouter } from "expo-router";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import ScreenLayout from "@/screens/_ScreenLayout";
import { ProjectProposal } from "./projprop-types";

const ProjectProposalList: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"active" | "archived">("active");
  const [_showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<ProjectProposal | null>(null);
  const [pageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: projects = [],
    isLoading,
    refetch,
    error,
  } = useGetProjectProposals();
  const { mutate: deleteProject } = usePermanentDeleteProjectProposal();
  const { mutate: archiveProject } = useArchiveProjectProposal();
  const { mutate: restoreProject } = useRestoreProjectProposal();

  const filteredProjects = projects.filter((project: ProjectProposal) => {
    return viewMode === "active" ? !project.gprIsArchive : project.gprIsArchive;
  });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredProjects.length / pageSize);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Calculate total budget of all displayed projects
  const totalBudget = filteredProjects.reduce((sum, project) => {
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
    setCurrentPage(1); // Reset to first page on refresh
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

  const handleDeleteSuccessComplete = () => {
    setShowDeleteSuccess(false);
  };

  const router = useRouter();

  const handleBackPress = () => {
    setSelectedProject(null);
  };

  const handleProjectPress = (project: ProjectProposal) => {
    setSelectedProject(project);
  };

  const handleViewModeChange = (mode: "active" | "archived") => {
    setViewMode(mode);
    setCurrentPage(1); // Reset to first page when changing view mode
  };

  if (selectedProject) {
    return (
      <ProjectProposalView
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-4 text-gray-600">Loading proposals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
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
      </SafeAreaView>
    );
  }

  return (
    <ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={
        <Text className="text-[13px]">GAD Project Proposal</Text>
      }
      showExitButton={false}
      headerAlign="left"
      scrollable={true}
      keyboardAvoiding={true}
      contentPadding="medium"
      loadingMessage="Loading..."
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className="mt-5 pt-4 pb-2 p-3">
        <View className="flex-row justify-center mb-3">
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

        <View className="flex-row justify-between mb-2">
          <View className="px-2 py-2 rounded-lg">
            <Text className="font-medium ">
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
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {paginatedProjects.length === 0 ? (
          <View className="flex-1 justify-center items-center py-12">
            <Text className="text-gray-500 text-center">
              No {viewMode === "active" ? "active" : "archived"} project
              proposals found.
            </Text>
            <Text className="text-gray-400 text-sm mt-2">
              Total projects: {projects.length} | Active:{" "}
              {projects.filter((p) => !p.gprIsArchive).length} | Archived:{" "}
              {projects.filter((p) => p.gprIsArchive).length}
            </Text>
          </View>
        ) : (
          paginatedProjects.map((project) => (
            <TouchableOpacity
              key={project.gprId}
              onPress={() => handleProjectPress(project)}
              className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
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
          ))
        )}

        {/* Pagination Controls */}
        {filteredProjects.length > pageSize && (
          <View className="flex-row justify-between items-center mt-4 px-4 pb-4">
            <TouchableOpacity
              onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 ${currentPage === 1 ? "opacity-50" : ""}`}
            >
              <Text className="text-primaryBlue font-bold">← Previous</Text>
            </TouchableOpacity>

            <Text className="text-gray-500">
              Page {currentPage} of {totalPages}
            </Text>

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
      </ScrollView>
    </ScreenLayout>
  );
};

export default ProjectProposalList;

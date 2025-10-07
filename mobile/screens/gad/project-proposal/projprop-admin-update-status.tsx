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
import { ChevronLeft, ClipboardCheck } from "lucide-react-native";
import {
  useGetProjectProposals,
  useGetProjectProposal,
} from "./queries/projprop-fetchqueries";
import { useUpdateProjectProposalStatus } from "./queries/projprop-updatequeries";
import { ProjectProposalView } from "./projprop-view";
import ScreenLayout from "@/screens/_ScreenLayout";
import { useRouter } from "expo-router";
import { SelectLayout } from "@/components/ui/select-layout";
import { ProjectProposal, ProposalStatus } from "./projprop-types";
import { ProjPropStatusUpdateModal } from "./projprop-admin-modal-status";

const ProjPropAdminUpdateStatus: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedProject, setSelectedProject] =
    useState<ProjectProposal | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: projects = [],
    isLoading,
    refetch,
    error,
  } = useGetProjectProposals();
  const { data: detailedProject } = useGetProjectProposal(
    selectedProject?.gprId || 0,
    {
      enabled: !!selectedProject?.gprId,
    }
  );
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateProjectProposalStatus();

  const statusColors = {
    pending: "text-blue-800",
    amend: "text-yellow-500",
    approved: "text-green-500",
    rejected: "text-red-500",
    viewed: "text-darkGray",
    resubmitted: "text-indigo-600",
  };

  const filteredProjects = projects
    .filter((project: ProjectProposal) => {
      return !project.gprIsArchive;
    })
    .filter((project: ProjectProposal) => {
      if (selectedFilter === "All") return true;
      return project.status === selectedFilter;
    })
    .filter((project: ProjectProposal) => {
      const title = project.projectTitle?.toLowerCase() || "";
      const background = project.background?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();
      return title.includes(search) || background.includes(search);
    });

  // Calculate pagination values
  const totalPages = Math.ceil(filteredProjects.length / pageSize);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleViewLogs = () => {
    router.push({
      pathname: "/gad/project-proposal/projprop-logs",
    });
  };

  const handleProjectPress = (project: ProjectProposal) => {
    if (project.status === "Pending") {
      updateStatus(
        {
          gprId: project.gprId,
          status: "Viewed",
          reason: "Project viewed by admin",
        },
        {
          onSuccess: () => {
            const updatedProject: ProjectProposal = {
              ...project,
              status: "Viewed",
              statusReason: "Project viewed by admin",
            };
            setSelectedProject(updatedProject);
          },
        }
      );
    } else {
      setSelectedProject(project);
    }
  };

  const handleBackPress = () => {
    setSelectedProject(null);
  };

  const handleUpdateStatusPress = () => {
    setShowStatusModal(true);
  };

  const handleStatusUpdate = (
    status: ProposalStatus,
    reason: string | null
  ) => {
    if (!selectedProject) return;

    updateStatus(
      { gprId: selectedProject.gprId, status, reason },
      {
        onSuccess: () => {
          setShowStatusModal(false);
          setSelectedProject((prev) => (prev ? { ...prev, status } : null));
          refetch();
        },
      }
    );
  };

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

  const router = useRouter();

  // if (selectedProject) {
  //   return (
  //     <>
  //       <ProjectProposalView
  //         project={detailedProject || selectedProject}
  //         onBack={handleBackPress}
  //         customHeaderActions={
  //           <TouchableOpacity
  //             className="ml-2 bg-primaryBlue px-4 py-2 rounded-lg"
  //             onPress={handleUpdateStatusPress}
  //           >
  //             <Text className="text-white font-medium text-sm">
  //               Update Status
  //             </Text>
  //           </TouchableOpacity>
  //         }
  //         disableDocumentManagement
  //       />
  //       <ProjPropStatusUpdateModal
  //         visible={showStatusModal}
  //         project={selectedProject}
  //         onClose={() => setShowStatusModal(false)}
  //         onUpdate={handleStatusUpdate}
  //         isLoading={isUpdatingStatus}
  //       />
  //     </>
  //   );
  // }

  if (selectedProject) {
    const disabledStatuses = ["Approved", "Rejected", "Amend"];
    const isStatusDisabled = disabledStatuses.includes(selectedProject.status);

    return (
      <>
        <ProjectProposalView
          project={detailedProject || selectedProject}
          onBack={handleBackPress}
          customHeaderActions={
            <TouchableOpacity
              className={`ml-2 px-4 py-2 rounded-lg ${
                isStatusDisabled ? "bg-gray-400" : "bg-primaryBlue"
              }`}
              onPress={isStatusDisabled ? undefined : handleUpdateStatusPress}
              disabled={isStatusDisabled}
            >
              <Text className="text-white font-medium text-sm">
                Update Status
              </Text>
            </TouchableOpacity>
          }
          disableDocumentManagement
        />
        <ProjPropStatusUpdateModal
          visible={showStatusModal}
          project={selectedProject}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleStatusUpdate}
          isLoading={isUpdatingStatus}
        />
      </>
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
        <View className="flex-1 justify-center items-center p-2">
          <Text className="text-red-500 text-lg font-medium mb-2">
            Error loading proposals
          </Text>
          <Text className="text-gray-600 text-center mb-4">
            {error.message}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-primaryBlue px-6 py-3 rounded-lg"
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
        <Text className="text-[13px]">Review Project Proposal</Text>
      }
      showExitButton={false}
      headerAlign="left"
      scrollable={true}
      keyboardAvoiding={true}
      contentPadding="medium"
      loadingMessage="Loading..."
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className="mt-2 pt-4 pb-2 p-3">
        <View className="mb-4">
          <SelectLayout
            options={[
              { label: "All", value: "All" },
              { label: "Pending", value: "Pending" },
              { label: "Viewed", value: "Viewed" },
              { label: "Amend", value: "Amend" },
              { label: "Resubmitted", value: "Resubmitted" },
              { label: "Approved", value: "Approved" },
              { label: "Rejected", value: "Rejected" },
            ]}
            selectedValue={selectedFilter}
            onSelect={(option) => setSelectedFilter(option.value)}
            placeholder="Select Status"
            isInModal={true}
          />
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
          <View className="flex-row justify-end p-2">
            <TouchableOpacity
              onPress={handleViewLogs}
              className="bg-primaryBlue px-3 py-2 rounded-md"
            >
              <Text className="text-white text-[17px]">
                <ClipboardCheck size={14} color="white" /> Logs
              </Text>
            </TouchableOpacity>
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
              No project proposals found.
            </Text>
          </View>
        ) : (
          paginatedProjects.map((project) => (
            <TouchableOpacity
              key={project.gprId}
              onPress={() => handleProjectPress(project)}
              className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100"
            >
              <View className="mb-3">
                <Text className="text-lg font-semibold text-gray-900">
                  {project.projectTitle || "Untitled"}
                </Text>
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
                          const amount =
                            typeof item.amount === "string"
                              ? parseFloat(item.amount) || 0
                              : item.amount || 0;
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

              <View className="mb-3">
                <Text
                  className={`text-sm font-medium ${
                    statusColors[
                      project.status.toLowerCase() as keyof typeof statusColors
                    ] || "text-gray-500"
                  }`}
                >
                  {project.status || "Pending"}
                </Text>
                {project.statusReason && (
                  <Text className="text-sm text-gray-600 mt-1">
                    Remark(s): {project.statusReason}
                  </Text>
                )}
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

export default ProjPropAdminUpdateStatus;

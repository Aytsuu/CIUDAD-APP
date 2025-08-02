"use client";

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
  Modal,
  TextInput,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import {
  useGetProjectProposals,
  useGetProjectProposal,
} from "./queries/fetchqueries";
import { useUpdateProjectProposalStatus } from "./queries/updatequeries";
import { ProjectProposalView } from "./view-projprop";
import ScreenLayout from "@/screens/_ScreenLayout";
import { useRouter } from "expo-router";
import { SelectLayout } from "@/components/ui/select-layout";
import { ProjectProposal, ProposalStatus } from "./projprop-types";

const StatusUpdateModal: React.FC<{
  visible: boolean;
  project: ProjectProposal | null;
  onClose: () => void;
  onUpdate: (status: ProposalStatus, reason: string | null) => void;
  isLoading: boolean;
}> = ({ visible, project, onClose, onUpdate, isLoading }) => {
  const [selectedStatus, setSelectedStatus] = useState<ProposalStatus | null>(
    null
  );
  const [reason, setReason] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const statusOptions: ProposalStatus[] = [
    "Pending",
    "Amend",
    "Approved",
    "Rejected",
  ];

  const isReasonRequired =
    selectedStatus === "Approved" ||
    selectedStatus === "Rejected" ||
    selectedStatus === "Amend";

  const isUpdateDisabled =
    !selectedStatus ||
    selectedStatus === project?.status ||
    (isReasonRequired && !reason.trim());

  const handleUpdate = () => {
    if (selectedStatus && !isUpdateDisabled) {
      onUpdate(selectedStatus, isReasonRequired ? reason : null);
    }
  };

  const handleClose = () => {
    setSelectedStatus(null);
    setReason("");
    setShowStatusDropdown(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View className="absolute inset-0 bg-black/50 justify-center items-center">
        <View className="bg-white rounded-lg p-6 w-[90%] max-w-md">
          <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Update Proposal Status
          </Text>

          <View className="mb-4 relative z-10">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Select Status
            </Text>
            <TouchableOpacity
              className="bg-white border border-gray-300 rounded px-3 py-2 flex-row justify-between items-center"
              onPress={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              <Text className="text-gray-700">
                {selectedStatus || "Select Status"}
              </Text>
              <Text className="text-gray-400">▼</Text>
            </TouchableOpacity>

            {showStatusDropdown && (
              <View className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-20">
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status}
                    className={`px-4 py-3 ${
                      status === selectedStatus ? "bg-blue-50" : ""
                    }`}
                    onPress={() => {
                      setSelectedStatus(status);
                      setShowStatusDropdown(false);
                      if (status !== "Approved" && status !== "Rejected") {
                        setReason("");
                      }
                    }}
                  >
                    <Text
                      className={`text-center ${
                        status === selectedStatus
                          ? "text-primaryBlue font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {isReasonRequired && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Reason for {selectedStatus}{" "}
                <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                className="bg-white border border-gray-300 rounded px-3 py-2 h-20 text-sm"
                placeholder={`Enter reason for ${selectedStatus?.toLowerCase()}...`}
                value={reason}
                onChangeText={setReason}
                multiline
                textAlignVertical="top"
              />
              {isReasonRequired && !reason.trim() && (
                <Text className="text-red-500 text-xs mt-1">
                  Remark(s) is required for {selectedStatus} status.
                </Text>
              )}
            </View>
          )}

          <View className="flex-row justify-between mt-4">
            <TouchableOpacity
              onPress={handleClose}
              className="py-2 px-4 rounded bg-gray-200"
              disabled={isLoading}
            >
              <Text className="text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleUpdate}
              className={`py-2 px-4 rounded ${
                isUpdateDisabled || isLoading ? "bg-gray-300" : "bg-primaryBlue"
              }`}
              disabled={isUpdateDisabled || isLoading}
            >
              <Text
                className={`font-medium ${
                  isUpdateDisabled || isLoading ? "text-gray-500" : "text-white"
                }`}
              >
                {isLoading ? "Updating..." : "Update"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AdminUpdateStatus: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedProject, setSelectedProject] =
    useState<ProjectProposal | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(3);
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
    pending: "text-blue",
    amend: "text-yellow-500",
    approved: "text-green-500",
    rejected: "text-red-500",
    viewed: "text-darkGray",
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
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleProjectPress = (project: ProjectProposal) => {
    // Automatically set to "Viewed" if current status is "Pending"
    if (project.status === "Pending") {
      updateStatus(
        {
          gprId: project.gprId,
          status: "Viewed", // This is now type-safe
          reason: "Project viewed by admin",
        },
        {
          onSuccess: () => {
            // Create a new object with the correct type
            const updatedProject: ProjectProposal = {
              ...project,
              status: "Viewed", // Explicitly typed
              statusReason: "Project viewed by admin",
            };
            setSelectedProject(updatedProject);
          },
        }
      );
    } else {
      setSelectedProject(project); // Original project has correct types
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
      const amount = Number.parseFloat(item.amount?.toString()) || 0;
      const paxCount = item.pax?.includes("pax")
        ? Number.parseInt(item.pax) || 1
        : 1;
      return projectSum + paxCount * amount;
    }, 0);

    return sum + projectTotal;
  }, 0);

  const router = useRouter();

  if (selectedProject) {
    return (
      <>
        <ProjectProposalView
          project={detailedProject || selectedProject}
          onBack={handleBackPress}
          customHeaderActions={
            <TouchableOpacity
              className="ml-2 bg-primaryBlue px-4 py-2 rounded-lg"
              onPress={handleUpdateStatusPress}
            >
              <Text className="text-white font-medium text-sm">
                Update Status
              </Text>
            </TouchableOpacity>
          }
          disableDocumentManagement // Disable document management features
        />
        <StatusUpdateModal
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
        <View className="flex-1 justify-center items-center p-4">
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

      <View className="mt-2 px-4 pt-4 pb-2">
        <View className="mb-4">
          <SelectLayout
            options={[
              { label: "All", value: "All" },
              { label: "Pending", value: "Pending" },
              { label: "Viewed", value: "Viewed" },
              { label: "Amend", value: "Amend" },
              { label: "Approved", value: "Approved" },
              { label: "Rejected", value: "Rejected" },
            ]}
            selectedValue={selectedFilter}
            onSelect={(option) => setSelectedFilter(option.value)}
            placeholder="Select Status"
            isInModal={true}
          />
        </View>

        {/* Dynamic Total Budget Display */}
        <View className="flex-row justify-end mb-2">
          <View className=" px-4 py-2 rounded-lg">
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
        className="flex-1 px-4"
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
                          const amount = item.amount || 0;
                          const paxCount = item.pax?.includes("pax")
                            ? parseInt(item.pax) || 1
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
      </ScrollView>
    </ScreenLayout>
  );
};

export default AdminUpdateStatus;
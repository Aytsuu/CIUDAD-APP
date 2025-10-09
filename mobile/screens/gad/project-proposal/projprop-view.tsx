import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Linking,
  FlatList,
} from "react-native";
import {
  ChevronLeft,
  Archive,
  ArchiveRestore,
  Trash,
  X,
  Download,
  FileText,
  Image as ImageIcon,
  User,
  Calendar,
  Target,
  Users,
  DollarSign,
  PieChart,
} from "lucide-react-native";
import { useGetSupportDocs } from "./queries/projprop-fetchqueries";
import { useAddSupportDocument } from "./queries/projprop-addqueries";
import {
  useArchiveSupportDocument,
  useRestoreSupportDocument,
  useDeleteSupportDocument,
} from "./queries/projprop-delqueries";
import MediaPicker from "@/components/ui/media-picker";
import { SupportDoc, ProjectProposalViewProps } from "./projprop-types";
import { useRouter } from "expo-router";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";

export const ProjectProposalView: React.FC<ProjectProposalViewProps> = ({
  project,
  onBack,
  customHeaderActions,
  disableDocumentManagement = false,
}) => {
  // Add early return for undefined projects
  if (!project) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={
          <Text className="font-semibold text-lg text-[#2a3a61]">
            Project Proposal
          </Text>
        }
        rightAction={
          <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
        }
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500">No project data available</Text>
        </View>
      </PageLayout>
    );
  }

  const [activeTab, setActiveTab] = useState<"details" | "documents">(
    "details"
  );
  const [supportDocsViewMode, setSupportDocsViewMode] = useState<
    "active" | "archived"
  >("active");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [viewImageModalVisible, setViewImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const router = useRouter();

  const {
    data: supportDocs = [],
    isLoading: isLoadingSupportDocs,
    refetch: refetchSupportDocs,
  } = useGetSupportDocs(project.gprId || 0, {
    enabled: !!project.gprId,
  });

  const addSupportDocMutation = useAddSupportDocument();
  const archiveSupportDocMutation = useArchiveSupportDocument();
  const restoreSupportDocMutation = useRestoreSupportDocument();
  const deleteSupportDocMutation = useDeleteSupportDocument();

  const activeSupportDocs = supportDocs.filter((doc) => !doc.psd_is_archive);
  const archivedSupportDocs = supportDocs.filter((doc) => doc.psd_is_archive);

  const handleUploadFiles = async () => {
    try {
      await addSupportDocMutation.mutateAsync({
        gprId: project.gprId!,
        files: selectedImages,
      });
      setShowUploadModal(false);
      setSelectedImages([]);
      refetchSupportDocs();
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleArchiveSupportDoc = (psdId: number) => {
    archiveSupportDocMutation.mutate(
      { gprId: project.gprId || 0, psdId },
      {
        onSuccess: () => {
          refetchSupportDocs();
        },
      }
    );
  };

  const handleRestoreSupportDoc = (psdId: number) => {
    restoreSupportDocMutation.mutate(
      { gprId: project.gprId || 0, psdId },
      {
        onSuccess: () => {
          refetchSupportDocs();
        },
      }
    );
  };

  const handleDeleteSupportDoc = (psdId: number) => {
    deleteSupportDocMutation.mutate(
      { gprId: project.gprId || 0, psdId },
      {
        onSuccess: () => {
          refetchSupportDocs();
        },
      }
    );
  };

  const handleViewImage = (doc: SupportDoc, index: number) => {
    setSelectedImageUrl(doc.psd_url);
    setCurrentImageIndex(index);
    setViewImageModalVisible(true);
  };

  const handleDownloadFile = async (doc: SupportDoc) => {
    try {
      await Linking.openURL(doc.psd_url);
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  // Calculate total budget
  const totalBudget =
    project.budgetItems?.reduce((sum, item) => {
      const amount = Number.parseFloat(item.amount?.toString()) || 0;
      const paxCount =
        typeof item.pax === "string"
          ? parseInt(item.pax) ||
            (item.pax.includes("pax") ? parseInt(item.pax) || 1 : 1)
          : 1;
      return sum + paxCount * amount;
    }, 0) || 0;

  const formatNumber = (num: number) => {
    return `₱${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Budget Plan Style Components
  const ProjectInfoCard = ({
    title,
    value,
    icon: Icon,
    color = "#1D4ED8",
  }: {
    title: string;
    value: string;
    icon: any;
    color?: string;
  }) => (
    <Card className="bg-white border-2 border-gray-200 rounded-lg shadow-sm mb-2">
      <CardContent className="p-4">
        <View className="flex-row items-center gap-2 mb-3">
          <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
            <Icon size={20} color={color} />
          </View>
          <Text className="text-sm font-medium text-gray-600 font-sans">
            {title}
          </Text>
        </View>
        <Text className="text-lg font-semibold text-gray-900 font-sans">
          {value}
        </Text>
      </CardContent>
    </Card>
  );

  const BudgetCard = () => (
    <Card className="bg-white border-2 border-gray-200 rounded-lg shadow-sm mb-2">
      <CardHeader className="pb-3">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
            <DollarSign size={20} color="#15803D" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-[#1a2332] font-sans">
              Budget Allocation
            </Text>
            <Text className="text-xs text-gray-500 mt-1 font-sans">
              Detailed breakdown of budget items
            </Text>
          </View>
        </View>
      </CardHeader>
      <CardContent className="pt-3 border-t border-gray-200">
        <View className="space-y-4">
          {project.budgetItems
            ?.filter((item) => item.name && item.name.trim())
            .map((item, index) => {
              const amount = Number.parseFloat(item.amount?.toString()) || 0;
              const paxCount =
                typeof item.pax === "string"
                  ? parseInt(item.pax) ||
                    (item.pax.includes("pax") ? parseInt(item.pax) || 1 : 1)
                  : 1;
              const total = paxCount * amount;

              return (
                <View
                  key={index}
                  className="flex-row justify-between items-start py-2 border-b border-gray-100 last:border-b-0"
                >
                  <View className="flex-1 pr-4">
                    <Text
                      className="text-sm font-medium text-gray-900 font-sans mb-1"
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    <View className="w-6 h-1 bg-gray-200 rounded-full">
                      <View className="w-4 h-1 bg-blue-500 rounded-full" />
                    </View>
                  </View>
                  <View className="min-w-[120px] items-end">
                    <Text
                      className="text-base font-semibold text-[#2a3a61] font-sans"
                      numberOfLines={1}
                    >
                      {formatNumber(total)}
                    </Text>
                  </View>
                </View>
              );
            })}

          {/* Total Row */}
          <View className="flex-row justify-between items-center pt-3 border-t border-gray-200">
            <Text className="text-sm font-semibold text-gray-700 font-sans">
              TOTAL
            </Text>
            <Text className="text-lg font-bold text-green-700 font-sans">
              {formatNumber(totalBudget)}
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );

  const ParticipantsCard = () => (
    <Card className="bg-white border-2 border-gray-200 rounded-lg shadow-sm mb-2">
      <CardContent className="p-4">
        <View className="flex-row items-center gap-2 mb-3">
          <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
            <Users size={20} color="#7C3AED" />
          </View>
          <Text className="text-sm font-medium text-gray-600 font-sans">
            Participants
          </Text>
        </View>
        <View className="space-y-2">
          {project.participants
            ?.filter((p) => p.category && p.category.trim())
            .map((participant, index) => (
              <Text key={index} className="text-sm text-gray-800 font-sans">
                {participant.count || "0"} {participant.category}
              </Text>
            ))}
        </View>
      </CardContent>
    </Card>
  );

  const renderProjectDetails = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-6 py-4 space-y-4">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-gray-900 font-sans mb-1">
            Project Overview
          </Text>
          <Text className="text-sm text-gray-600 font-sans">
            GAD Project Proposal Details
          </Text>
        </View>

        {/* Project Info Cards */}
        <ProjectInfoCard
          title="Project Title"
          value={project.projectTitle || "Untitled"}
          icon={FileText}
          color="#1D4ED8"
        />

        {project.date && (
          <ProjectInfoCard
            title="Project Date"
            value={project.date}
            icon={Calendar}
            color="#0D9488"
          />
        )}

        {/* Background */}
        <Card className="bg-white border-2 border-gray-200 rounded-lg shadow-sm mb-2">
          <CardContent className="p-4">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
                <FileText size={20} color="#7C3AED" />
              </View>
              <Text className="text-sm font-medium text-gray-600 font-sans">
                Background
              </Text>
            </View>
            <Text className="text-sm text-gray-800 leading-5 font-sans">
              {project.background || "No background provided"}
            </Text>
          </CardContent>
        </Card>

        {/* Objectives */}
        {project.objectives?.filter((obj) => obj && obj.trim()).length > 0 && (
          <Card className="bg-white border-2 border-gray-200 rounded-lg shadow-sm mb-2">
            <CardContent className="p-4">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
                  <Target size={20} color="#DC2626" />
                </View>
                <Text className="text-sm font-medium text-gray-600 font-sans">
                  Objectives
                </Text>
              </View>
              <View className="space-y-2">
                {project.objectives
                  .filter((obj) => obj && obj.trim())
                  .map((obj, index) => (
                    <View key={index} className="flex-row">
                      <Text className="text-sm text-gray-800 mr-2">•</Text>
                      <Text className="text-sm text-gray-800 flex-1 font-sans">
                        {obj}
                      </Text>
                    </View>
                  ))}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Participants */}
        {project.participants?.filter((p) => p.category && p.category.trim())
          .length > 0 && <ParticipantsCard />}

        {/* Budget */}
        {project.budgetItems?.filter((item) => item.name && item.name.trim())
          .length > 0 && <BudgetCard />}

        {/* Monitoring & Evaluation */}
        {project.monitoringEvaluation && (
          <Card className="bg-white border-2 border-gray-200 rounded-lg shadow-sm mb-2">
            <CardContent className="p-4">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
                  <PieChart size={20} color="#0D9488" />
                </View>
                <Text className="text-sm font-medium text-gray-600 font-sans">
                  Monitoring & Evaluation
                </Text>
              </View>
              <Text className="text-sm text-gray-800 leading-5 font-sans">
                {project.monitoringEvaluation}
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Signatories */}
        {project.signatories && project.signatories.length > 0 && (
          <Card className="bg-white border-2 border-gray-200 rounded-lg shadow-sm mb-2">
            <CardHeader className="pb-3">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
                  <User size={20} color="#1D4ED8" />
                </View>
                <Text className="text-lg font-semibold text-[#1a2332] font-sans">
                  Signatories
                </Text>
              </View>
            </CardHeader>
            <CardContent className="pt-3 border-t border-gray-200">
              <View className="flex-row justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2 font-sans">
                    Prepared by:
                  </Text>
                  {project.signatories
                    .filter((s) => s.type === "prepared")
                    .map((sig, index) => (
                      <View key={index} className="mb-3 items-center">
                        <Text className="text-sm text-gray-800 text-center mb-1 font-sans">
                          {sig.name}
                        </Text>
                        <Text className="text-xs font-semibold text-gray-700 text-center font-sans">
                          {sig.position || "N/A"}
                        </Text>
                      </View>
                    ))}
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2 font-sans">
                    Approved by:
                  </Text>
                  {project.signatories
                    .filter((s) => s.type === "approved")
                    .map((sig, index) => (
                      <View key={index} className="mb-3 items-center">
                        <Text className="text-sm text-gray-800 text-center mb-1 font-sans">
                          {sig.name}
                        </Text>
                        <Text className="text-xs font-semibold text-gray-700 text-center font-sans">
                          {sig.position || "N/A"}
                        </Text>
                      </View>
                    ))}
                </View>
              </View>
            </CardContent>
          </Card>
        )}
      </View>
    </ScrollView>
  );

  const renderSupportingDocuments = () => (
    <View className="flex-1">
      <View className="px-6 py-4">
        {!disableDocumentManagement && (
          <View className="relative mb-4 flex-col items-center">
            <TouchableOpacity
              className={`rounded-xl w-full h-10 px-4 py-2 native:h-12 native:px-5 native:py-3 ${
                project.gprIsArchive ? "bg-gray-300" : "bg-primaryBlue"
              }`}
              onPress={() => !project.gprIsArchive && setShowUploadModal(true)}
              disabled={project.gprIsArchive}
            >
              <Text
                className={`font-medium font-sans text-center ${
                  project.gprIsArchive ? "text-gray-500" : "text-white"
                }`}
              >
                Add Documents
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {project.gprIsArchive && (
          <View className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <Text className="text-yellow-800 text-sm text-center font-sans">
              This project is archived. Document modifications are disabled.
            </Text>
          </View>
        )}

        {/* Active/Archive Tabs for Documents - Using Budget Plan style */}
        <Tabs
          value={supportDocsViewMode}
          onValueChange={(val) =>
            setSupportDocsViewMode(val as "active" | "archived")
          }
        >
          <TabsList className="bg-blue-50 flex-row justify-between">
            <TabsTrigger
              value="active"
              className={`flex-1 mx-1 ${
                supportDocsViewMode === "active"
                  ? "bg-white border-b-2 border-primaryBlue"
                  : ""
              }`}
            >
              <Text
                className={`${
                  supportDocsViewMode === "active"
                    ? "text-primaryBlue font-medium"
                    : "text-gray-500"
                }`}
              >
                Active
              </Text>
            </TabsTrigger>
            <TabsTrigger
              value="archived"
              className={`flex-1 mx-1 ${
                supportDocsViewMode === "archived"
                  ? "bg-white border-b-2 border-primaryBlue"
                  : ""
              }`}
            >
              <Text
                className={`${
                  supportDocsViewMode === "archived"
                    ? "text-primaryBlue font-medium"
                    : "text-gray-500"
                }`}
              >
                Archived
              </Text>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </View>

      {(supportDocsViewMode === "active"
        ? activeSupportDocs
        : archivedSupportDocs
      ).length === 0 && !isLoadingSupportDocs ? (
        <View className="flex-1 justify-center items-center py-12">
          <Text className="text-gray-500 text-center font-sans">
            No {supportDocsViewMode === "active" ? "active" : "archived"}{" "}
            supporting documents found.
          </Text>
        </View>
      ) : isLoadingSupportDocs ? (
        <View className="flex-1 justify-center items-center py-12">
          <LoadingState />
        </View>
      ) : (
        <FlatList
          data={
            supportDocsViewMode === "active"
              ? activeSupportDocs
              : archivedSupportDocs
          }
          keyExtractor={(doc) => doc.psd_id.toString()}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
          renderItem={({ item: doc, index }) => (
            <Card className="bg-white border-2 border-gray-200 shadow-sm mb-2">
              <CardHeader className="pb-3">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-semibold text-lg text-[#1a2332] mb-1 font-sans">
                      {doc.psd_name || "Document"}
                    </Text>
                    <Text className="text-sm text-gray-500 font-sans">
                      {doc.psd_type || "Unknown type"}
                    </Text>
                  </View>
                </View>
              </CardHeader>

              <CardContent className="pt-3 border-t border-gray-200">
                {doc.psd_type?.startsWith("image/") && doc.psd_url ? (
                  <TouchableOpacity onPress={() => handleViewImage(doc, index)}>
                    <Image
                      source={{ uri: doc.psd_url }}
                      className="w-full h-48 rounded-lg"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ) : (
                  <View className="bg-gray-100 p-6 items-center justify-center rounded-lg">
                    <FileText size={48} color="#6B7280" />
                    <Text className="text-gray-600 text-center mt-2 font-sans">
                      Document preview not available
                    </Text>
                    {doc.psd_url && (
                      <TouchableOpacity
                        onPress={() => handleDownloadFile(doc)}
                        className="flex-row items-center bg-blue-100 px-4 py-2 rounded-lg mt-3"
                      >
                        <Download size={16} color="#3b82f6" />
                        <Text className="text-blue-600 text-sm ml-2 font-sans">
                          Open Document
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {!disableDocumentManagement && (
                  <View className="flex-row justify-end space-x-2 mt-3">
                    {supportDocsViewMode === "active"
                      ? !project.gprIsArchive && (
                          <ConfirmationModal
                            trigger={
                              <TouchableOpacity className="bg-red-50 p-2 rounded-lg">
                                <Archive size={16} color="#ef4444" />
                              </TouchableOpacity>
                            }
                            title="Archive Document"
                            description="Are you sure you want to archive this document?"
                            actionLabel="Archive"
                            onPress={() => handleArchiveSupportDoc(doc.psd_id)}
                          />
                        )
                      : !project.gprIsArchive && (
                          <>
                            <ConfirmationModal
                              trigger={
                                <TouchableOpacity className="bg-green-50 p-2 rounded-lg">
                                  <ArchiveRestore size={16} color="#10b981" />
                                </TouchableOpacity>
                              }
                              title="Restore Document"
                              description="Are you sure you want to restore this document?"
                              actionLabel="Restore"
                              onPress={() =>
                                handleRestoreSupportDoc(doc.psd_id)
                              }
                            />
                            <ConfirmationModal
                              trigger={
                                <TouchableOpacity className="bg-red-50 p-2 rounded-lg">
                                  <Trash size={16} color="#ef4444" />
                                </TouchableOpacity>
                              }
                              title="Delete Document"
                              description="Are you sure you want to permanently delete this document?"
                              actionLabel="Delete"
                              variant="destructive"
                              onPress={() => handleDeleteSupportDoc(doc.psd_id)}
                            />
                          </>
                        )}
                  </View>
                )}
              </CardContent>
            </Card>
          )}
        />
      )}
    </View>
  );

  if (isLoadingSupportDocs) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={
          <Text className="font-semibold text-lg text-[#2a3a61]">
            Project Proposal
          </Text>
        }
        rightAction={
          <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
        }
      >
        <LoadingState />
      </PageLayout>
    );
  }

  return (
    <>
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={onBack || (() => router.back())}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={
          <Text className="font-semibold text-lg text-[#2a3a61]">
            {project.projectTitle}
          </Text>
        }
        rightAction={<View />}
        wrapScroll={false}
      >
        <View className="flex-1">
          <View className="pt-4">
            <Tabs
              value={activeTab}
              onValueChange={(val) =>
                setActiveTab(val as "details" | "documents")
              }
            >
              <TabsList className="bg-white flex-row justify-between">
                <TabsTrigger
                  value="details"
                  className={`flex-1 mx-1 ${
                    activeTab === "details"
                      ? " border-b-2 border-primaryBlue"
                      : ""
                  }`}
                >
                  <Text
                    className={`${
                      activeTab === "details" ? " font-medium" : "text-gray-500"
                    }`}
                  >
                    Project Details
                  </Text>
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className={`flex-1 mx-1 ${
                    activeTab === "documents"
                      ? " border-b-2 border-primaryBlue"
                      : ""
                  }`}
                >
                  <Text
                    className={`${
                      activeTab === "documents"
                        ? "font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    Documents
                  </Text>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </View>

          {/* Content Area */}
          <View className="flex-1">
            {activeTab === "details"
              ? renderProjectDetails()
              : renderSupportingDocuments()}
          </View>
        </View>
      </PageLayout>

      {/* Upload Modal */}
      {!disableDocumentManagement && (
        <Modal
          visible={showUploadModal && !project.gprIsArchive}
          animationType="slide"
          onRequestClose={() => setShowUploadModal(false)}
        >
          <View className="flex-1 bg-white">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <Text className="text-blue-500 font-sans">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold font-sans">
                Add Supporting Documents
              </Text>
              <TouchableOpacity
                onPress={handleUploadFiles}
                disabled={selectedImages.length === 0}
              >
                <Text
                  className={`font-sans ${
                    selectedImages.length === 0
                      ? "text-gray-400"
                      : "text-blue-500"
                  }`}
                >
                  Upload
                </Text>
              </TouchableOpacity>
            </View>

            <MediaPicker
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              maxImages={10}
              multiple={true}
              editable={true}
            />
          </View>
        </Modal>
      )}

      {/* Image View Modal */}
      <Modal
        visible={viewImageModalVisible}
        transparent={true}
        onRequestClose={() => setViewImageModalVisible(false)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center">
          <TouchableOpacity
            className="absolute top-4 right-4 z-10"
            onPress={() => setViewImageModalVisible(false)}
          >
            <X size={24} color="white" />
          </TouchableOpacity>

          {selectedImageUrl && (
            <>
              <Image
                source={{ uri: selectedImageUrl }}
                className="w-full h-4/5"
                resizeMode="contain"
              />
              <Text className="text-white mt-2 font-sans">
                {(supportDocsViewMode === "active"
                  ? activeSupportDocs
                  : archivedSupportDocs)[currentImageIndex]?.psd_name ||
                  "Document"}
              </Text>
            </>
          )}
        </View>
      </Modal>

      {/* Loading Modal for mutations */}
      <LoadingModal
        visible={
          addSupportDocMutation.isPending ||
          archiveSupportDocMutation.isPending ||
          restoreSupportDocMutation.isPending ||
          deleteSupportDocMutation.isPending
        }
      />
    </>
  );
};

export default ProjectProposalView;

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
} from "react-native";
import {
  ChevronLeft,
  Archive,
  ArchiveRestore,
  Trash,
  X,
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

export const ProjectProposalView: React.FC<ProjectProposalViewProps> = ({
  project,
  onBack,
  customHeaderActions,
  disableDocumentManagement = false,
}) => {

  //add early return for undefined projects
  if (!project) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">No project data available</Text>
        <TouchableOpacity onPress={onBack || (() => router.back())} className="mt-4">
          <Text className="text-blue-500">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  const [activeTab, setActiveTab] = useState<"soft" | "supporting">("soft");
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
  const imageDocs = (
    supportDocsViewMode === "active" ? activeSupportDocs : archivedSupportDocs
  ).filter((doc) => doc.psd_type?.startsWith("image/"));

  const handleUploadFiles = async () => {
    console.log('Selected images:', selectedImages.map(file => ({
      uri: file.uri,
      id: file.id,
      name: file.name,
      type: file.type,
      hasFile: !!file.file,
      filePrefix: file.file ? file.file.substring(0, 20) : 'undefined'
    })));
    

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

  const renderSupportingDocument = () => (
    <ScrollView className="flex-1 bg-white p-4">
      {!disableDocumentManagement && (
        <View className="flex-row justify-between items-center mb-4">
          {(project.status === "Pending" ||
            project.status === "Amend" ||
            project.status === "Rejected") && (
            <TouchableOpacity
              className={`px-4 py-2 rounded-lg ${
                project.gprIsArchive ? "bg-gray-300" : "bg-blue-500"
              }`}
              onPress={() => !project.gprIsArchive && setShowUploadModal(true)}
              disabled={project.gprIsArchive}
            >
              <Text
                className={`font-medium ${
                  project.gprIsArchive ? "text-gray-500" : "text-white"
                }`}
              >
                Add Documents
              </Text>
            </TouchableOpacity>
          )}

          <View className="flex-row border border-gray-300 rounded-full bg-gray-100 overflow-hidden">
            <TouchableOpacity
              className={`px-4 py-2 ${
                supportDocsViewMode === "active" ? "bg-white" : ""
              }`}
              onPress={() => setSupportDocsViewMode("active")}
            >
              <Text className="text-sm">Active</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-4 py-2 ${
                supportDocsViewMode === "archived" ? "bg-white" : ""
              }`}
              onPress={() => setSupportDocsViewMode("archived")}
            >
              <Text className="text-sm">Archived</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {project.gprIsArchive && (
        <View className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <Text className="text-yellow-800 text-sm text-center">
            This project is archived. Document modifications are disabled.
          </Text>
        </View>
      )}

      {(supportDocsViewMode === "active"
        ? activeSupportDocs
        : archivedSupportDocs
      ).length === 0 ? (
        <View className="flex-1 justify-center items-center py-12">
          <Text className="text-gray-500 text-center">
            No {supportDocsViewMode === "active" ? "active" : "archived"}{" "}
            supporting documents found.
          </Text>
        </View>
      ) : (
        (supportDocsViewMode === "active"
          ? activeSupportDocs
          : archivedSupportDocs
        ).map((doc, index) => (
          <View
            key={doc.psd_id}
            className="mb-6 border border-gray-200 rounded-lg overflow-hidden"
          >
            {doc.psd_type?.startsWith("image/") && doc.psd_url ? (
              <TouchableOpacity onPress={() => handleViewImage(doc, index)}>
                <Image
                  source={{ uri: doc.psd_url }}
                  className="w-full h-96"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : (
              <View className="bg-gray-100 p-8 items-center justify-center h-96">
                <Text className="text-gray-600 text-center mb-2">
                  {doc.psd_url || "Document"}
                </Text>
                <Text className="text-gray-500 text-sm">
                  Document preview not available
                </Text>
              </View>
            )}

            {!disableDocumentManagement && (
              <View className="p-4 bg-white border-t gap-2 border-gray-200 flex-row justify-end space-x-2">
                {supportDocsViewMode === "active"
                  ? !project.gprIsArchive &&
                    (project.status === "Pending" ||
                      project.status === "Amend" ||
                      project.status === "Rejected") && (
                      <ConfirmationModal
                        trigger={
                          <TouchableOpacity className="p-2 rounded-lg">
                            <Archive size={20} color="#ef4444" />
                          </TouchableOpacity>
                        }
                        title="Archive Document"
                        description="Are you sure you want to archive this document?"
                        actionLabel="Archive"
                        onPress={() => handleArchiveSupportDoc(doc.psd_id)}
                      />
                    )
                  : !project.gprIsArchive &&
                    (project.status === "Pending" ||
                      project.status === "Amend" ||
                      project.status === "Rejected") && (
                      <>
                        <ConfirmationModal
                          trigger={
                            <TouchableOpacity className="p-2 bg-green-100 rounded-lg">
                              <ArchiveRestore size={20} color="#10b981" />
                            </TouchableOpacity>
                          }
                          title="Restore Document"
                          description="Are you sure you want to restore this document?"
                          actionLabel="Restore"
                          onPress={() => handleRestoreSupportDoc(doc.psd_id)}
                        />
                        <ConfirmationModal
                          trigger={
                            <TouchableOpacity className="p-2 bg-red-100 rounded-lg">
                              <Trash size={20} color="#ef4444" />
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
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderSoftCopy = () => (
    <ScrollView className="flex-1 bg-white">
      <View className="bg-gray-100 p-4 items-center border-b border-gray-300">
        {project.headerImage ? (
          <Image
            source={{ uri: project.headerImage }}
            className="w-full h-16 mb-2"
            resizeMode="contain"
          />
        ) : (
          <View className="w-full h-12 bg-gray-200 rounded mb-2 justify-center items-center">
            <Text className="text-gray-500 text-xs">📄</Text>
          </View>
        )}
        <Text className="text-lg font-bold text-center text-gray-900">
          PROJECT PROPOSAL
        </Text>
      </View>

      <View className="p-4">
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Project Title:
          </Text>
          <Text className="text-base text-gray-900">
            {project.projectTitle}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Background:
          </Text>
          <Text className="text-sm text-gray-800 leading-5">
            {project.background || "No background provided"}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Objectives:
          </Text>
          {!project.objectives ||
          project.objectives.length === 0 ||
          project.objectives.every((obj) => !obj || !obj.trim()) ? (
            <Text className="text-sm text-gray-600 italic">
              No objectives provided
            </Text>
          ) : (
            <View>
              {project.objectives
                .filter((obj) => obj && obj.trim())
                .map((obj, index) => (
                  <View key={index} className="flex-row mb-1">
                    <Text className="text-sm text-gray-800 mr-2">•</Text>
                    <Text className="text-sm text-gray-800 flex-1">{obj}</Text>
                  </View>
                ))}
            </View>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Participants:
          </Text>
          {!project.participants ||
          project.participants.length === 0 ||
          project.participants.every(
            (p) => !p.category || !p.category.trim()
          ) ? (
            <Text className="text-sm text-gray-600 italic">
              No participants provided
            </Text>
          ) : (
            <View>
              {project.participants
                .filter((p) => p.category && p.category.trim())
                .map((participant, index) => (
                  <Text key={index} className="text-sm text-gray-800 mb-1">
                    {participant.count || "0"} {participant.category}
                  </Text>
                ))}
            </View>
          )}
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Budgetary Requirements:
          </Text>
          <View className="flex-row bg-gray-100 border border-gray-300">
            <View className="flex-1 p-2 border-r border-gray-300">
              <Text className="text-xs font-semibold text-gray-700">Item</Text>
            </View>
            <View className="w-16 p-2 border-r border-gray-300">
              <Text className="text-xs font-semibold text-gray-700">Pax</Text>
            </View>
            <View className="w-20 p-2 border-r border-gray-300">
              <Text className="text-xs font-semibold text-gray-700">
                Amount
              </Text>
            </View>
            <View className="w-20 p-2">
              <Text className="text-xs font-semibold text-gray-700">Total</Text>
            </View>
          </View>

          {!project.budgetItems ||
          project.budgetItems.length === 0 ||
          project.budgetItems.every(
            (item) => !item.name || !item.name.trim()
          ) ? (
            <View className="flex-row border-l border-r border-b border-gray-300">
              <View className="flex-1 p-2">
                <Text className="text-xs text-gray-600 italic">
                  No budget items provided
                </Text>
              </View>
            </View>
          ) : (
            project.budgetItems
              .filter((item) => item.name && item.name.trim())
              .map((item, index) => {
                const amount = Number.parseFloat(item.amount?.toString()) || 0;
                const paxCount = typeof item.pax === 'string' 
                                    ? parseInt(item.pax) || (item.pax.includes("pax") ? parseInt(item.pax) || 1 : 1)
                                    : 1;
                const total = paxCount * amount;

                return (
                  <View
                    key={index}
                    className="flex-row border-l border-r border-b border-gray-300"
                  >
                    <View className="flex-1 p-2 border-r border-gray-300">
                      <Text className="text-xs text-gray-800">{item.name}</Text>
                    </View>
                    <View className="w-16 p-2 border-r border-gray-300">
                      <Text className="text-xs text-gray-800">{paxCount}</Text>
                    </View>
                    <View className="w-20 p-2 border-r border-gray-300">
                      <Text className="text-xs text-gray-800">
                        {amount.toFixed(2)}
                      </Text>
                    </View>
                    <View className="w-20 p-2">
                      <Text className="text-xs text-gray-800">
                        {total.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              })
          )}

          <View className="flex-row border-l border-r border-b border-gray-300 bg-gray-50">
            <View className="flex-1 p-2 border-r border-gray-300">
              <Text className="text-xs text-gray-800"></Text>
            </View>
            <View className="w-16 p-2 border-r border-gray-300">
              <Text className="text-xs text-gray-800"></Text>
            </View>
            <View className="w-20 p-2 border-r border-gray-300">
              <Text className="text-xs font-semibold text-gray-800">TOTAL</Text>
            </View>
            <View className="w-20 p-2">
              <Text className="text-xs font-semibold text-gray-800">
                {project.budgetItems
                  ?.reduce((sum, item) => {
                    const amount =
                      Number.parseFloat(item.amount?.toString()) || 0;
                    const paxCount = typeof item.pax === 'string' 
                                    ? parseInt(item.pax) || (item.pax.includes("pax") ? parseInt(item.pax) || 1 : 1)
                                    : 1;
                    return sum + paxCount * amount;
                  }, 0)
                  .toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-5 mt-2">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Monitoring Evaluation:
          </Text>
          <Text className="text-sm text-gray-800 leading-5">
            {project.monitoringEvaluation || "No monitoring evaluation provided"}
          </Text>
        </View>

        <View className="mb-4 mt-8">
          <View className="flex-row justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Prepared by:
              </Text>
              {project.signatories?.filter((s) => s.type === "prepared")
                .length === 0 ? (
                <Text className="text-xs text-gray-600 italic">
                  No preparers assigned
                </Text>
              ) : (
                project.signatories
                  ?.filter((s) => s.type === "prepared")
                  .map((sig, index) => (
                    <View key={index} className="mb-3 items-center">
                      <Text className="text-sm text-gray-800 text-center mb-1">
                        {sig.name}
                      </Text>
                      <Text className="text-xs font-semibold text-gray-700 text-center">
                        {sig.position || "N/A"}
                      </Text>
                    </View>
                  ))
              )}
            </View>

            <View className="flex-1 ml-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">
                Approved by:
              </Text>
              {project.signatories?.filter((s) => s.type === "approved")
                .length === 0 ? (
                <Text className="text-xs text-gray-600 italic">
                  No approvers assigned
                </Text>
              ) : (
                project.signatories
                  ?.filter((s) => s.type === "approved")
                  .map((sig, index) => (
                    <View key={index} className="mb-3 items-center">
                      <Text className="text-sm text-gray-800 text-center mb-1">
                        {sig.name}
                      </Text>
                      <Text className="text-xs font-semibold text-gray-700 text-center">
                        {sig.position || "N/A"}
                      </Text>
                    </View>
                  ))
              )}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View className="mt-16 flex-row justify-between items-center p-4 border-b border-gray-200">
        <TouchableOpacity
          onPress={onBack || (() => router.back())}
          className="flex-row items-center flex-1"
        >
          <ChevronLeft color="#374151" size={20} />
          <Text
            className="ml-2 text-blue-500 font-medium flex-1"
            numberOfLines={1}
          >
            {project.projectTitle}
          </Text>
        </TouchableOpacity>
        {customHeaderActions}
      </View>

      <View className="flex-row p-4">
        <TouchableOpacity
          onPress={() => setActiveTab("soft")}
          className={`flex-1 py-2 px-4 rounded-l-lg border ${
            activeTab === "soft"
              ? "bg-gray-800 border-gray-800"
              : "bg-white border-gray-300"
          }`}
        >
          <Text
            className={`text-center text-sm font-medium ${
              activeTab === "soft" ? "text-white" : "text-gray-700"
            }`}
          >
            Soft Copy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("supporting")}
          className={`flex-1 py-2 px-4 rounded-r-lg border-t border-r border-b ${
            activeTab === "supporting"
              ? "bg-gray-800 border-gray-800"
              : "bg-white border-gray-300"
          }`}
        >
          <Text
            className={`text-center text-sm font-medium ${
              activeTab === "supporting" ? "text-white" : "text-gray-700"
            }`}
          >
            Supporting Document
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "soft" ? renderSoftCopy() : renderSupportingDocument()}

      {!disableDocumentManagement && (
        <Modal
          visible={showUploadModal && !project.gprIsArchive}
          animationType="slide"
          onRequestClose={() => setShowUploadModal(false)}
        >
          <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <Text className="text-blue-500">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold">
                Add Supporting Documents
              </Text>
              <TouchableOpacity
                onPress={handleUploadFiles}
                disabled={selectedImages.length === 0}
              >
                <Text
                  className={`${
                    selectedImages.length === 0 ? "text-gray-400" : "text-blue-500"
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
          </SafeAreaView>
        </Modal>
      )}

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
              <Text className="text-white mt-2">
                {(supportDocsViewMode === "active"
                  ? activeSupportDocs
                  : archivedSupportDocs)[currentImageIndex]?.psd_name ||
                  "Document"}
              </Text>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProjectProposalView;

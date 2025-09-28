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
  Linking,
} from "react-native";
import {
  ChevronLeft,
  Archive,
  ArchiveRestore,
  Trash,
  X,
  FileText,
  Download,
  Calendar,
  User,
  CreditCard,
  Building,
  Receipt,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import {
  useGetDisbursementVoucher,
  useGetDisbursementFiles,
  useAddDisbursementFiles,
  useArchiveDisbursementFile,
  useRestoreDisbursementFile,
  useDeleteDisbursementFile,
} from "./disbursement-queries";
import MediaPicker from "@/components/ui/media-picker";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import {
  DisbursementFile,
  DisbursementVoucher,
  Signatory,
} from "./disbursement-types";

interface DisbursementViewProps {
  disNum: string;
  disbursement?: DisbursementVoucher;
  onBack?: () => void;
  customHeaderActions?: React.ReactNode;
  disableDocumentManagement?: boolean;
}

export const DisbursementView: React.FC<DisbursementViewProps> = ({
  disNum,
  disbursement: propDisbursement,
  onBack,
  customHeaderActions,
  disableDocumentManagement = false,
}) => {
  const [activeTab, setActiveTab] = useState<"details" | "supporting">(
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
    data: disbursement,
    isLoading: isLoadingDisbursement,
    refetch: refetchDisbursement,
  } = useGetDisbursementVoucher(disNum, {
    enabled: !!disNum,
  });

  const {
    data: supportDocs = [],
    isLoading: isLoadingSupportDocs,
    refetch: refetchSupportDocs,
  } = useGetDisbursementFiles(disNum, {
    enabled: !!disNum,
  });

  const addSupportDocMutation = useAddDisbursementFiles();
  const archiveSupportDocMutation = useArchiveDisbursementFile();
  const restoreSupportDocMutation = useRestoreDisbursementFile();
  const deleteSupportDocMutation = useDeleteDisbursementFile();

  const activeSupportDocs = supportDocs.filter((doc) => !doc.disf_is_archive);
  const archivedSupportDocs = supportDocs.filter((doc) => doc.disf_is_archive);
  const imageDocs = (
    supportDocsViewMode === "active" ? activeSupportDocs : archivedSupportDocs
  ).filter((doc) => doc.disf_type?.startsWith("image/"));

  const handleUploadFiles = async () => {
    try {
      console.log("Selected images before processing:", selectedImages);

      const filesForUpload = selectedImages.map((image) => {
        const dataUrl = `data:${image.type};base64,${image.file}`;

        return {
          file: dataUrl,
          name: image.name || `image_${Date.now()}.jpg`,
          type: image.type || "image/jpeg",
        };
      });

      console.log("Files for upload:", filesForUpload);

      const uploadData = {
        dis_num: disNum,
        files: filesForUpload,
      };

      console.log("Final upload data:", uploadData);

      await addSupportDocMutation.mutateAsync(uploadData, {
        onSuccess: (data) => {
          console.log("Upload successful response:", data);
          setShowUploadModal(false);
          setSelectedImages([]);
          refetchSupportDocs();
        },
        onError: (error) => {
          console.error("Upload error:", error);
        },
      });
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleArchiveSupportDoc = (disfNum: string) => {
    archiveSupportDocMutation.mutate(
      { disNum, disfNum },
      {
        onSuccess: () => {
          refetchSupportDocs();
        },
      }
    );
  };

  const handleRestoreSupportDoc = (disfNum: string) => {
    restoreSupportDocMutation.mutate(
      { disNum, disfNum },
      {
        onSuccess: () => {
          refetchSupportDocs();
        },
      }
    );
  };

  const handleDeleteSupportDoc = (disfNum: string) => {
    deleteSupportDocMutation.mutate(
      { disNum, disfNum },
      {
        onSuccess: () => {
          refetchSupportDocs();
        },
      }
    );
  };

  // Updated to match project proposal pattern
  const handleViewImage = (doc: DisbursementFile, index: number) => {
    setSelectedImageUrl(doc.disf_url);
    setCurrentImageIndex(index);
    setViewImageModalVisible(true);
  };

  const handleDownloadFile = async (doc: DisbursementFile) => {
    try {
      await Linking.openURL(doc.disf_url);
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num || 0);
  };

  const getSignatoryLabel = (type: Signatory["type"]) => {
    switch (type) {
      case "certified_appropriation":
        return "Certified: Appropriation/Allotment";
      case "certified_availability":
        return "Certified: Availability of Funds";
      case "certified_validity":
        return "Certified: Validity/Propriety";
      default:
        return type;
    }
  };

  if (!disbursement && !isLoadingDisbursement) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">No disbursement data available</Text>
        <TouchableOpacity
          onPress={onBack || (() => router.back())}
          className="mt-4"
        >
          <Text className="text-blue-500">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isLoadingDisbursement) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-gray-500">Loading disbursement...</Text>
      </SafeAreaView>
    );
  }

  const renderDetails = () => (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="px-4 space-y-4">
        {/* Payee Information Card */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <View className="flex-row items-center mb-3 pb-2 border-b border-gray-100">
            <View className="bg-blue-100 p-2 rounded-full mr-3">
              <User size={20} color="#2563eb" />
            </View>
            <Text className="text-lg font-semibold text-gray-800">Payee Information</Text>
          </View>
          
          <Text className="text-base text-gray-900 font-medium mb-2">
            {disbursement?.dis_payee}
          </Text>
          {disbursement?.dis_tin && (
            <View className="bg-gray-50 px-3 py-2 rounded-lg">
              <Text className="text-sm text-gray-600">
                <Text className="font-medium">TIN:</Text> {disbursement.dis_tin}
              </Text>
            </View>
          )}
        </View>

        {/* Date Information Card */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <View className="flex-row items-center mb-4 pb-2 border-b border-gray-100">
            <View className="bg-green-100 p-2 rounded-full mr-3">
              <Calendar size={20} color="#059669" />
            </View>
            <Text className="text-lg font-semibold text-gray-800">Date Information</Text>
          </View>
          
          <View className="space-y-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-medium text-gray-600">DV Date:</Text>
              <Text className="text-sm text-gray-900 font-medium">
                {disbursement?.dis_date
                  ? new Date(disbursement.dis_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : "Not specified"}
              </Text>
            </View>
            
            <View className="h-px bg-gray-100" />
            
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-medium text-gray-600">Payment Date:</Text>
              <Text className="text-sm text-gray-900 font-medium">
                {disbursement?.dis_paydate
                  ? new Date(disbursement.dis_paydate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : "Not specified"}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Details Card */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <View className="flex-row items-center mb-4 pb-2 border-b border-gray-100">
            <View className="bg-purple-100 p-2 rounded-full mr-3">
              <CreditCard size={20} color="#7c3aed" />
            </View>
            <Text className="text-lg font-semibold text-gray-800">Payment Details</Text>
          </View>

          <View className="space-y-3">
            {disbursement?.dis_checknum && (
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-600">Check Number:</Text>
                <Text className="text-sm text-gray-900 font-medium">
                  {disbursement.dis_checknum}
                </Text>
              </View>
            )}

            {disbursement?.dis_bank && (
              <>
                {disbursement?.dis_checknum && <View className="h-px bg-gray-100" />}
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-medium text-gray-600">Bank:</Text>
                  <Text className="text-sm text-gray-900 font-medium">
                    {disbursement.dis_bank}
                  </Text>
                </View>
              </>
            )}

            {disbursement?.dis_or_num && (
              <>
                {(disbursement?.dis_checknum || disbursement?.dis_bank) && 
                  <View className="h-px bg-gray-100" />
                }
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-medium text-gray-600">OR Number:</Text>
                  <Text className="text-sm text-gray-900 font-medium">
                    {disbursement.dis_or_num}
                  </Text>
                </View>
              </>
            )}
            
            {!disbursement?.dis_checknum && !disbursement?.dis_bank && !disbursement?.dis_or_num && (
              <Text className="text-sm text-gray-500 italic text-center py-2">
                No payment details provided
              </Text>
            )}
          </View>
        </View>

        {/* Particulars Card */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <View className="flex-row items-center mb-4 pb-2 border-b border-gray-100">
            <View className="bg-orange-100 p-2 rounded-full mr-3">
              <Receipt size={20} color="#ea580c" />
            </View>
            <Text className="text-lg font-semibold text-gray-800">Particulars</Text>
          </View>

          {!disbursement?.dis_particulars || disbursement.dis_particulars.length === 0 ? (
            <Text className="text-sm text-gray-500 italic text-center py-4">
              No particulars provided
            </Text>
          ) : (
            <View className="space-y-4">
              {disbursement.dis_particulars.map((item: any, index: number) => {
                const amount =
                  typeof item.amount === "string"
                    ? parseFloat(item.amount) || 0
                    : item.amount || 0;

                const taxRate =
                  typeof item.tax === "string"
                    ? parseFloat(item.tax) || 0
                    : item.tax || 0;

                const taxAmount = amount * (taxRate / 100);
                const netAmount = amount - taxAmount;

                return (
                  <View
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    <Text className="text-base font-semibold text-gray-800 mb-3">
                      {item.forPayment || `Payment Item ${index + 1}`}
                    </Text>

                    <View className="space-y-2">
                      {/* Gross Amount */}
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-gray-600">Gross Amount:</Text>
                        <Text className="text-sm font-semibold text-gray-800">
                          {formatCurrency(amount)}
                        </Text>
                      </View>

                      {/* Tax Calculation */}
                      {taxRate > 0 && (
                        <>
                          <View className="flex-row justify-between items-center">
                            <Text className="text-sm text-gray-600">
                              Withholding Tax ({taxRate}%):
                            </Text>
                            <Text className="text-sm text-red-600 font-semibold">
                              - {formatCurrency(taxAmount)}
                            </Text>
                          </View>
                        </>
                      )}

                      {/* Divider */}
                      <View className="h-px bg-gray-200 my-2" />

                      {/* Net Amount */}
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm font-bold text-gray-700">
                          Net Amount:
                        </Text>
                        <Text className="text-sm font-bold text-green-600">
                          {formatCurrency(taxRate > 0 ? netAmount : amount)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Signatories Card */}
        <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <View className="flex-row items-center mb-4 pb-2 border-b border-gray-100">
            <View className="bg-indigo-100 p-2 rounded-full mr-3">
              <Building size={20} color="#4f46e5" />
            </View>
            <Text className="text-lg font-semibold text-gray-800">Signatories</Text>
          </View>

          {!disbursement?.dis_signatories || disbursement.dis_signatories.length === 0 ? (
            <Text className="text-sm text-gray-500 italic text-center py-4">
              No signatories provided
            </Text>
          ) : (
            <View className="space-y-4">
              {disbursement.dis_signatories.map((sig: Signatory, index: number) => (
                <View
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <Text className="text-xs font-bold text-indigo-600 uppercase tracking-wide mb-2">
                    {getSignatoryLabel(sig.type)}
                  </Text>
                  <Text className="text-base font-semibold text-gray-800 mb-1">
                    {sig.name}
                  </Text>
                  <Text className="text-sm text-gray-600">{sig.position}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );

  const renderSupportingDocument = () => (
    <ScrollView className="flex-1 bg-white p-4">
      {!disableDocumentManagement && (
        <View className="flex-row justify-between items-center mb-4">
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${
              disbursement?.dis_is_archive ? "bg-gray-300" : "bg-blue-500"
            }`}
            onPress={() =>
              !disbursement?.dis_is_archive && setShowUploadModal(true)
            }
            disabled={disbursement?.dis_is_archive}
          >
            <Text
              className={`font-medium ${
                disbursement?.dis_is_archive ? "text-gray-500" : "text-white"
              }`}
            >
              Add Documents
            </Text>
          </TouchableOpacity>

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

      {disbursement?.dis_is_archive && (
        <View className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <Text className="text-yellow-800 text-sm text-center">
            This disbursement is archived. Document modifications are disabled.
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
            key={doc.disf_num}
            className="mb-6 border border-gray-200 rounded-lg overflow-hidden"
          >
            {doc.disf_type?.startsWith("image/") && doc.disf_url ? (
              <TouchableOpacity onPress={() => handleViewImage(doc, index)}>
                <Image
                  source={{ uri: doc.disf_url }}
                  className="w-full h-96"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : (
              <View className="bg-gray-100 p-8 items-center justify-center h-96">
                <FileText size={48} color="#6b7280" />
                <Text className="text-gray-600 text-center mb-2 mt-2">
                  {doc.disf_name || "Document"}
                </Text>
                <Text className="text-gray-500 text-sm">
                  Document preview not available
                </Text>
                {doc.disf_url && (
                  <TouchableOpacity
                    onPress={() => handleDownloadFile(doc)}
                    className="flex-row items-center bg-blue-100 px-3 py-2 rounded-lg mt-3"
                  >
                    <Download size={16} color="#3b82f6" />
                    <Text className="text-blue-600 text-sm ml-2">
                      Open Document
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {!disableDocumentManagement && (
              <View className="p-4 bg-white border-t gap-2 border-gray-200 flex-row justify-end space-x-2">
                {supportDocsViewMode === "active"
                  ? !disbursement?.dis_is_archive && (
                      <ConfirmationModal
                        trigger={
                          <TouchableOpacity className="p-2 rounded-lg">
                            <Archive size={20} color="#ef4444" />
                          </TouchableOpacity>
                        }
                        title="Archive Document"
                        description="Are you sure you want to archive this document?"
                        actionLabel="Archive"
                        onPress={() => handleArchiveSupportDoc(doc.disf_num)}
                      />
                    )
                  : !disbursement?.dis_is_archive && (
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
                          onPress={() => handleRestoreSupportDoc(doc.disf_num)}
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
                          onPress={() => handleDeleteSupportDoc(doc.disf_num)}
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
            className="ml-2 font-medium flex-1"
            numberOfLines={1}
          >
            DV {disbursement?.dis_num} - {disbursement?.dis_payee}
          </Text>
        </TouchableOpacity>
        {customHeaderActions}
      </View>

      <View className="flex-row p-4">
        <TouchableOpacity
          onPress={() => setActiveTab("details")}
          className={`flex-1 py-2 px-4 rounded-l-lg border ${
            activeTab === "details"
              ? "bg-gray-800 border-gray-800"
              : "bg-white border-gray-300"
          }`}
        >
          <Text
            className={`text-center text-sm font-medium ${
              activeTab === "details" ? "text-white" : "text-gray-700"
            }`}
          >
            Details
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
            Supporting Docs
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "details" ? renderDetails() : renderSupportingDocument()}

      {!disableDocumentManagement && (
        <Modal
          visible={showUploadModal && !disbursement?.dis_is_archive}
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
          </SafeAreaView>
        </Modal>
      )}

      {/* Image View Modal - Following Project Proposal Pattern */}
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
                  : archivedSupportDocs)[currentImageIndex]?.disf_name ||
                  "Document"}
              </Text>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DisbursementView;
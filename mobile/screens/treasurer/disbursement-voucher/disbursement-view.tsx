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
import { LoadingModal } from "@/components/ui/loading-modal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/screens/_PageLayout";
import { LoadingState } from "@/components/ui/loading-state";

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
  if (!disNum && !propDisbursement) {
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
          <Text className="text-gray-900 text-[13px]">
            Disbursement Voucher
          </Text>
        }
        rightAction={
          <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"></View>
        }
      >
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 font-sans">
            No disbursement data available
          </Text>
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

  const handleUploadFiles = async () => {
    try {
      const filesForUpload = selectedImages.map((image) => {
        const dataUrl = `data:${image.type};base64,${image.file}`;
        return {
          file: dataUrl,
          name: image.name || `image_${Date.now()}.jpg`,
          type: image.type || "image/jpeg",
        };
      });

      const uploadData = {
        dis_num: disNum,
        files: filesForUpload,
      };

      await addSupportDocMutation.mutateAsync(uploadData, {
        onSuccess: () => {
          setShowUploadModal(false);
          setSelectedImages([]);
          refetchSupportDocs();
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
    return `₱${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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

  const InfoCard = ({
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
        <Text className="text-[13px] font-semibold text-gray-900 font-sans">
          {value}
        </Text>
      </CardContent>
    </Card>
  );

  const renderDetails = () => (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <View className="px-6 py-4 space-y-4">
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-900 font-sans mb-1">
            Disbursement Overview
          </Text>
          <Text className="text-sm text-gray-600 font-sans">
            Voucher Details
          </Text>
        </View>

        <InfoCard
          title="Payee"
          value={disbursement?.dis_payee || "Unknown Payee"}
          icon={User}
          color="#1D4ED8"
        />

        {disbursement?.dis_tin && (
          <Card className="bg-white border-2 border-gray-200 rounded-lg shadow-sm mb-2">
            <CardContent className="p-4">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
                  <CreditCard size={20} color="#7C3AED" />
                </View>
                <Text className="text-sm text-gray-600 font-sans">
                  TIN
                </Text>
              </View>
              <Text className="text-[13px] font-semibold text-gray-900 font-sans">
                {disbursement.dis_tin}
              </Text>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white border-2 border-gray-200 rounded-lg shadow-sm mb-2">
          <CardContent className="p-4">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
                <Calendar size={20} color="#059669" />
              </View>
              <Text className="text-sm text-gray-600 font-sans">
                Date Information
              </Text>
            </View>

            <View className="space-y-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-600 font-sans">
                  DV Date:
                </Text>
                <Text className="text-sm text-gray-900 font-sans">
                  {disbursement?.dis_date
                    ? new Date(disbursement.dis_date).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )
                    : "Not specified"}
                </Text>
              </View>

              <View className="h-px bg-gray-100" />

              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-medium text-gray-600 font-sans">
                  Payment Date:
                </Text>
                <Text className="text-sm text-gray-900 font-medium font-sans">
                  {disbursement?.dis_paydate
                    ? new Date(disbursement.dis_paydate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )
                    : "Not specified"}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-gray-200 rounded-lg shadow-sm mb-2">
          <CardContent className="p-4">
            <View className="flex-row items-center gap-2 mb-4">
              <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
                <CreditCard size={20} color="#7c3aed" />
              </View>
              <Text className="text-sm font-medium text-gray-600 font-sans">
                Payment Details
              </Text>
            </View>

            <View className="space-y-3">
              {disbursement?.dis_checknum && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-medium text-gray-600 font-sans">
                    Check Number:
                  </Text>
                  <Text className="text-sm text-gray-900 font-medium font-sans">
                    {disbursement.dis_checknum}
                  </Text>
                </View>
              )}

              {disbursement?.dis_bank && (
                <>
                  {disbursement?.dis_checknum && (
                    <View className="h-px bg-gray-100" />
                  )}
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-medium text-gray-600 font-sans">
                      Bank:
                    </Text>
                    <Text className="text-sm text-gray-900 font-medium font-sans">
                      {disbursement.dis_bank}
                    </Text>
                  </View>
                </>
              )}

              {disbursement?.dis_or_num && (
                <>
                  {(disbursement?.dis_checknum || disbursement?.dis_bank) && (
                    <View className="h-px bg-gray-100" />
                  )}
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-medium text-gray-600 font-sans">
                      OR Number:
                    </Text>
                    <Text className="text-sm text-gray-900 font-medium font-sans">
                      {disbursement.dis_or_num}
                    </Text>
                  </View>
                </>
              )}

              {!disbursement?.dis_checknum &&
                !disbursement?.dis_bank &&
                !disbursement?.dis_or_num && (
                  <Text className="text-sm text-gray-500 italic text-center py-2 font-sans">
                    No payment details provided
                  </Text>
                )}
            </View>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-gray-200 rounded-lg shadow-sm mb-2">
          <CardHeader className="pb-3">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
                <Receipt size={20} color="#ea580c" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-[#1a2332] font-sans">
                  Particulars
                </Text>
                <Text className="text-xs text-gray-500 mt-1 font-sans">
                  Payment breakdown details
                </Text>
              </View>
            </View>
          </CardHeader>
          <CardContent className="pt-3 border-t border-gray-200">
            {!disbursement?.dis_particulars ||
            disbursement.dis_particulars.length === 0 ? (
              <Text className="text-sm text-gray-500 italic text-center py-4 font-sans">
                No particulars provided
              </Text>
            ) : (
              <View className="space-y-4">
                {disbursement.dis_particulars.map(
                  (item: any, index: number) => {
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
                        className="flex-row justify-between items-start py-2 border-b border-gray-100 last:border-b-0"
                      >
                        <View className="flex-1 pr-4">
                          <Text
                            className="text-sm font-medium text-gray-900 font-sans mb-1"
                            numberOfLines={2}
                          >
                            {item.forPayment || `Payment Item ${index + 1}`}
                          </Text>
                          <View className="flex-col gap-1 mt-2">
                            <Text className="text-xs text-gray-600 font-sans">
                              Gross: {formatCurrency(amount)}
                            </Text>
                            {taxRate > 0 && (
                              <Text className="text-xs text-red-600 font-sans">
                                Tax ({taxRate}%): - {formatCurrency(taxAmount)}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View className="min-w-[120px] items-end">
                          <Text
                            className="text-[13px] font-semibold text-[#2a3a61] font-sans"
                            numberOfLines={1}
                          >
                            {formatCurrency(taxRate > 0 ? netAmount : amount)}
                          </Text>
                        </View>
                      </View>
                    );
                  }
                )}
              </View>
            )}
          </CardContent>
        </Card>

        {disbursement?.dis_signatories &&
          disbursement.dis_signatories.length > 0 && (
            <Card className="bg-white border-2 border-gray-200 rounded-lg shadow-sm mb-2">
              <CardHeader className="pb-3">
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center">
                    <Building size={20} color="#4f46e5" />
                  </View>
                  <Text className="text-[13px] font-semibold text-[#1a2332] font-sans">
                    Signatories
                  </Text>
                </View>
              </CardHeader>
              <CardContent className="pt-3 border-t border-gray-200">
                <View className="space-y-4">
                  {disbursement.dis_signatories.map(
                    (sig: Signatory, index: number) => (
                      <View
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <Text className="text-[13px] text-indigo-600 uppercase tracking-wide mb-2">
                          {getSignatoryLabel(sig.type)}
                        </Text>
                        <Text className="text-[13px] font-semibold text-gray-800 mb-1">
                          {sig.name}
                        </Text>
                        <Text className="text-gray-600 text-xs">
                          {sig.position}
                        </Text>
                      </View>
                    )
                  )}
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
                disbursement?.dis_is_archive ? "bg-gray-300" : "bg-primaryBlue"
              }`}
              onPress={() =>
                !disbursement?.dis_is_archive && setShowUploadModal(true)
              }
              disabled={disbursement?.dis_is_archive}
            >
              <Text
                className={`font-bold text-[13px] text-center ${
                  disbursement?.dis_is_archive ? "text-gray-500" : "text-white"
                }`}
              >
                Add Documents
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {disbursement?.dis_is_archive && (
          <View className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <Text className="text-yellow-800 text-sm text-center text-[13px]">
              This disbursement is archived. Document modifications are
              disabled.
            </Text>
          </View>
        )}

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
                className={`font-sans ${
                  supportDocsViewMode === "active"
                    ? "text-primaryBlue text-[13px]"
                    : "text-gray-500 text-[13px]"
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
                className={`font-sans ${
                  supportDocsViewMode === "archived"
                    ? "text-primaryBlue text-[13px]"
                    : "text-gray-500 text-[13px]"
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
          <Text className="text-gray-500 text-center text-[13px]">
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
          keyExtractor={(doc) => doc.disf_num.toString()}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 16 }}
          renderItem={({ item: doc, index }) => (
            <Card className="bg-white border-2 border-gray-200 shadow-sm mb-2">
              <CardHeader className="pb-3">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-semibold text-lg text-[#1a2332] mb-1 font-sans">
                      {doc.disf_name || "Document"}
                    </Text>
                    <Text className="text-sm text-gray-500 font-sans">
                      {doc.disf_type || "Unknown type"}
                    </Text>
                  </View>
                </View>
              </CardHeader>

              <CardContent className="pt-3 border-t border-gray-200">
                {doc.disf_type?.startsWith("image/") && doc.disf_url ? (
                  <TouchableOpacity onPress={() => handleViewImage(doc, index)}>
                    <Image
                      source={{ uri: doc.disf_url }}
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
                    {doc.disf_url && (
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
                      ? !disbursement?.dis_is_archive && (
                          <ConfirmationModal
                            trigger={
                              <TouchableOpacity className="bg-red-50 p-2 rounded-lg">
                                <Archive size={16} color="#ef4444" />
                              </TouchableOpacity>
                            }
                            title="Archive Document"
                            description="Are you sure you want to archive this document?"
                            actionLabel="Archive"
                            onPress={() =>
                              handleArchiveSupportDoc(doc.disf_num)
                            }
                          />
                        )
                      : !disbursement?.dis_is_archive && (
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
                                handleRestoreSupportDoc(doc.disf_num)
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
                              onPress={() =>
                                handleDeleteSupportDoc(doc.disf_num)
                              }
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

  if (isLoadingDisbursement || isLoadingSupportDocs) {
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
          <Text className="text-gray-900 text-[13px]">
            Disbursement Voucher
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
          <Text className="text-gray-900 text-[13px]">
            DV #{disbursement?.dis_num}
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
                      ? "border-b-2 border-primaryBlue"
                      : ""
                  }`}
                >
                  <Text
                    className={`font-sans ${
                      activeTab === "details" ? "text-[13px]" : "text-gray-500 text-[13px]"
                    }`}
                  >
                    Voucher Details
                  </Text>
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className={`flex-1 mx-1 ${
                    activeTab === "documents"
                      ? "border-b-2 border-primaryBlue text-[13px]"
                      : ""
                  }`}
                >
                  <Text
                    className={`font-sans ${
                      activeTab === "documents"
                        ? "text-[13px]"
                        : "text-gray-500 text-[13px]"
                    }`}
                  >
                    Documents
                  </Text>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </View>

          <View className="flex-1">
            {activeTab === "details"
              ? renderDetails()
              : renderSupportingDocuments()}
          </View>
        </View>
      </PageLayout>

      {!disableDocumentManagement && (
        <Modal
          visible={showUploadModal && !disbursement?.dis_is_archive}
          animationType="slide"
          onRequestClose={() => setShowUploadModal(false)}
        >
          <View className="flex-1 bg-white">
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <Text className="text-blue-500 font-sans">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold font-sans text-[13px]">
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
                  : archivedSupportDocs)[currentImageIndex]?.disf_name ||
                  "Document"}
              </Text>
            </>
          )}
        </View>
      </Modal>

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

export default DisbursementView;

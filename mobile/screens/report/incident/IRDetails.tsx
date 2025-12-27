import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Image,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { useRouter, useLocalSearchParams } from "expo-router";
import React from "react";
import PageLayout from "@/screens/_PageLayout";
import { getDateTimeFormat } from "@/helpers/dateHelpers";
import { LoadingState } from "@/components/ui/loading-state";
import ImageCarousel from "@/components/ui/imageCarousel";
import {
  useConvertCoordinatesToAddress,
  useGetIRInfo,
} from "../queries/reportFetch";
import { useUpdateIR } from "../queries/reportUpdate";
import { StatusStepper } from "./StatusStepper";
import { AlertTriangle } from "@/lib/icons/AlertTriangle";
import { MapPin } from "@/lib/icons/MapPin";
import { UserRound } from "@/lib/icons/UserRound";
import { Calendar } from "@/lib/icons/Calendar";
import { Clock } from "@/lib/icons/Clock";
import { PenLine } from "@/lib/icons/PenLine";
import { capitalize } from "@/helpers/capitalize";
import { Phone } from "@/lib/icons/Phone";
import MapView, { Region, PROVIDER_GOOGLE } from "react-native-maps";
import { DEFAULT_REGION } from "../securado/configs";
import { CustomMarker } from "../securado/marker";
import { useToastContext } from "@/components/ui/toast";
import { ArchiveRestore } from "@/lib/icons/ArchiveRestore";
import { Archive } from "@/lib/icons/Archive";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { Plus } from "@/lib/icons/Plus";
import { X } from "@/lib/icons/X";

export default function IRDetails() {
  // ============ STATE INITIALIZATION ============
  const router = useRouter();
  const { toast } = useToastContext();
  const params = useLocalSearchParams();
  const mapRef = React.useRef<MapView>(null);
  const [region, setRegion] = React.useState<Region | null>(DEFAULT_REGION);
  const [isRefreshing, setIsRefreshing] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const report = React.useMemo(() => {
    try {
      return JSON.parse(params.report as string);
    } catch (error) {
      return null;
    }
  }, [params.report]);

  // State for Remarks
  const [isRemarkModalOpen, setIsRemarkModalOpen] = React.useState<boolean>(false);
  const [remarkToAdd, setRemarkToAdd] = React.useState<string>("");

  const { data: IRInfo, isLoading, refetch } = useGetIRInfo(report?.ir_id);
  const isTracker = IRInfo?.ir_is_tracker;
  const images = IRInfo?.files || [];

  console.log(IRInfo);

  // Queries
  const { mutateAsync: updateIR } = useUpdateIR();

  const { data: userLocation, isLoading: isLoadingUserLoc } =
    useConvertCoordinatesToAddress(
      IRInfo?.ir_track_user_lat,
      IRInfo?.ir_track_user_lng
    );

  const { data: deviceLocation, isLoading: isLoadingDeviceLoc } =
    useConvertCoordinatesToAddress(IRInfo?.ir_track_lat, IRInfo?.ir_track_lng);

  const isResolved = IRInfo?.ir_status === "RESOLVED";
  const isInProgress = IRInfo?.ir_status === "IN PROGRESS";
  const hasRemark = !!IRInfo?.ir_remark && IRInfo?.ir_remark.trim() !== "";
  const isArchive = IRInfo?.ir_is_archive;

  // ============ HANDLERS ============
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleOpenRemarkModal = () => {
    if (hasRemark) {
      setRemarkToAdd(IRInfo?.ir_remark || "");
    }
    setIsRemarkModalOpen(true);
  };

  const handleCloseRemarkModal = () => {
    setIsRemarkModalOpen(false);
    setRemarkToAdd("");
  };

  const handleSaveRemark = async () => {
    if (!remarkToAdd.trim()) {
      toast.error("Remark cannot be empty");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateIR({
        data: {
          ir_remark: remarkToAdd,
        },
        ir_id: IRInfo?.ir_id,
      });
      toast.success("Remark saved");
      handleCloseRemarkModal();
      await refetch();
    } catch (err) {
      toast.error("Failed to save remark. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    try {
      await updateIR({
        data: {
          ir_is_archive: true,
        },
        ir_id: IRInfo?.ir_id,
      });
      toast.success("Report has been moved to archive");
    } catch (err) {
      toast.success("Failed to archive report. Please try again.");
    }
  };

  const handleArchiveRestore = async () => {
    try {
      await updateIR({
        data: {
          ir_is_archive: false,
        },
        ir_id: IRInfo?.ir_id,
      });
      toast.success("Report restored");
    } catch (err) {
      toast.error("Failed to restore report. Please try again.");
    }
  };

  // ============ RENDER HELPERS ============
  const InfoRow = ({
    label,
    value,
    valueColor = "text-gray-900",
    Icon,
  }: {
    label: string;
    value: string | number;
    valueColor?: string;
    Icon?: any;
  }) => (
    <View className="py-4 border-b flex-row items-center gap-4 border-gray-100">
      <View className="bg-primaryBlue p-3 rounded-lg">
        <Icon size={20} className="text-white" />
      </View>
      <View>
        <Text className="text-gray-500 text-xs mb-1 font-primary-medium">
          {label}
        </Text>
        <Text className={`text-sm font-primary-medium ${valueColor}`}>
          {value}
        </Text>
      </View>
    </View>
  );

  const severity_color_bg: Record<string, any> = {
    LOW: "bg-green-600",
    MEDIUM: "bg-orange-600",
    HIGH: "bg-red-600",
  };

  const severity_color_stroke: Record<string, any> = {
    LOW: "#16a34a",
    MEDIUM: "#ea580c",
    HIGH: "#dc2626",
  };

  // ============ MAIN RENDER ============
  const modalContent = isArchive
    ? {
        title: "Restore Incident",
        description: "Bring this report back to the active list?",
        icon: <ArchiveRestore size={22} className="text-gray-700" />,
        action: handleArchiveRestore,
        variant: "default",
      }
    : {
        title: "Archive Incident",
        description: "Move this report to the archives?",
        icon: <Archive size={22} className="text-gray-700" />,
        action: handleArchive,
        variant: "destructive",
      };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <>
      <PageLayout
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </TouchableOpacity>
        }
        headerTitle={
          <Text className="text-gray-900 text-[13px] font-primary-medium">
            Incident Report
          </Text>
        }
        rightAction={
          <View className="flex-row items-center gap-5">
            <ConfirmationModal
              trigger={<TouchableOpacity>{modalContent.icon}</TouchableOpacity>}
              title={modalContent.title}
              description={modalContent.description}
              variant={modalContent.variant as any}
              onPress={modalContent.action}
            />

            <View
              className={`${
                severity_color_bg[IRInfo?.ir_severity as string]
              } w-8 h-8 flex-row items-center justify-center rounded-lg`}
            >
              <AlertTriangle
                size={18}
                fill={"white"}
                stroke={`${severity_color_stroke[IRInfo?.ir_severity as string]}`}
              />
            </View>
          </View>
        }
        footer={
          <TouchableOpacity 
              className="flex-1 flex-row justify-center items-center"
              onPress={handleOpenRemarkModal}
            >
              <View className="flex-row items-center gap-4">
                <PenLine size={18} className="text-gray-700" />
                <Text className="text-base font-primary-medium text-gray-700">
                  Open Remark
                </Text>
              </View>
            </TouchableOpacity>
        }
        showFooter={!isResolved}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={["#0084f0"]}
          />
        }
      >
        <StatusStepper isVerified={isInProgress} isResolved={isResolved} />
        <View className="mb-4">
          {isTracker ? (
            <MapView
              ref={mapRef}
              initialRegion={DEFAULT_REGION}
              region={region ?? undefined}
              style={{ height: 350 }}
              provider={PROVIDER_GOOGLE}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              <CustomMarker
                lat={IRInfo?.ir_track_lat as number}
                lng={IRInfo?.ir_track_lng as number}
                iconUri={require("@/assets/images/report/tracker_icon.png")}
                circleColor="255, 100, 100"
              />

              <CustomMarker
                lat={IRInfo?.ir_track_user_lat as number}
                lng={IRInfo?.ir_track_user_lng as number}
                iconUri={require("@/assets/images/report/user_icon.png")}
                circleColor="59, 130, 246"
              />
            </MapView>
          ) : (
            <View className="px-6">
              <ImageCarousel images={images} />
            </View>
          )}
        </View>

        <View className="px-6">
          <View
            className={`${
              severity_color_bg[IRInfo?.ir_severity as string]
            } h-8 flex-row gap-4 items-center justify-center rounded-lg mb-4`}
          >
            <AlertTriangle
              size={18}
              fill={"white"}
              stroke={`${severity_color_stroke[IRInfo?.ir_severity as string]}`}
            />
            <Text className="text-xs font-primary-medium text-white">
              {capitalize(IRInfo?.ir_severity)} severity report
            </Text>
          </View>

          <View className="border-t border-gray-100 pt-4">
            <Text className="text-sm font-primary-medium mb-3">Description</Text>
            <View className="min-h-[120px] border border-gray-300 bg-gray-200 rounded-lg shadow-sm p-4 mb-6">
              <Text className="font-primary-medium text-xs text-gray-500 mb-3 italic">
                Review the provided information of the incident
              </Text>
              <Text className="font-primary-medium text-sm">
                {IRInfo.ir_add_details}
              </Text>
            </View>

            {isTracker && (
              <View className="gap-2 mb-4">
                <View className="flex-row gap-3 p-4 rounded-lg bg-blue-50 mb-2">
                  <Image
                    source={require("@/assets/images/report/tracker_icon.png")}
                    style={{
                      width: 26,
                      height: 32,
                    }}
                  />

                  <View className="flex-1 gap-1 flex-shrink">
                    <Text className="text-primaryBlue font-primary-medium text-sm">
                      Device Location
                    </Text>
                    <Text className="text-xs font-primary text-gray-800 flex-wrap">
                      {deviceLocation?.display_name || "Loading..."}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3 p-4 rounded-lg bg-blue-50">
                  <Image
                    source={require("@/assets/images/report/user_icon.png")}
                    style={{
                      width: 26,
                      height: 32,
                    }}
                  />

                  <View className="flex-1 gap-1 flex-shrink">
                    <Text className="text-primaryBlue font-primary-medium text-sm">
                      User Location
                    </Text>
                    <Text className="text-xs font-primary text-gray-800 flex-wrap">
                      {userLocation?.display_name || "Loading..."}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View className="border-t border-gray-100 pt-2">
              {isTracker ? (
                <>
                  <InfoRow
                    label="Reported By"
                    value={IRInfo?.ir_track_user_name}
                    Icon={UserRound}
                  />
                  <InfoRow
                    label="Contact"
                    value={IRInfo?.ir_track_user_contact}
                    Icon={Phone}
                  />
                  <InfoRow
                    label="Reported At"
                    value={getDateTimeFormat(IRInfo?.ir_created_at)}
                    Icon={Clock}
                  />
                </>
              ) : (
                <>
                  <InfoRow
                    label="Location"
                    value={IRInfo?.ir_area}
                    Icon={MapPin}
                  />
                  <InfoRow
                    label="Reported By"
                    value={IRInfo?.ir_reported_by}
                    Icon={UserRound}
                  />
                  <InfoRow label="Date" value={IRInfo?.ir_date} Icon={Calendar} />
                  <InfoRow label="Time" value={IRInfo?.ir_time} Icon={Clock} />
                </>
              )}
            </View>
          </View>
        </View>
      </PageLayout>

      {/* Remark Modal */}
      <Modal
        visible={isRemarkModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseRemarkModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className="bg-white rounded-2xl w-full max-w-[500px] max-h-[85%]">
              {/* Header */}
              <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="bg-primaryBlue p-2 rounded-lg">
                    <PenLine size={18} className="text-white" />
                  </View>
                  <Text className="text-base font-primary-semibold text-gray-900">
                    Remark
                  </Text>
                </View>
                <TouchableOpacity onPress={handleCloseRemarkModal} className="p-1">
                  <X size={22} className="text-gray-500" />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false}>
                <Text className="text-sm font-primary-medium text-gray-700 mb-2">
                  Details
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 min-h-[140px] text-sm font-primary text-gray-900"
                  placeholder="Enter your remark here..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                  value={remarkToAdd}
                  onChangeText={setRemarkToAdd}
                  editable={!isArchive}
                />
                {isArchive && (
                  <Text className="text-xs text-amber-600 font-primary-medium mt-2">
                    Cannot edit remark for archived reports
                  </Text>
                )}
              </ScrollView>

              {/* Footer */}
              <View className="px-5 py-4 border-t border-gray-200">  
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleSaveRemark}
                    disabled={isSubmitting || !remarkToAdd.trim()}
                    className={`flex-1 rounded-lg py-3 px-4 ${
                      isSubmitting || !remarkToAdd.trim()
                        ? "bg-gray-300"
                        : "bg-primaryBlue"
                    }`}
                  >
                    <Text className="text-white font-primary-semibold text-center text-sm">
                      {isSubmitting ? "Saving..." : "Save Remark"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  Clock4,
  CalendarDays,
  ImageOff,
  User,
  FileText,
  Activity,
  CheckCircle2,
  Map,
  UserRound,
  Phone,
  Clock,
  CircleAlert,
  Eye,
  RotateCcw,
  Archive,
  Lock,
} from "lucide-react";
import React from "react";
import { useLocation, useNavigate } from "react-router";
import { useLoading } from "@/context/LoadingContext";
import { MediaGallery } from "@/components/ui/media-gallery";
import { getDateTimeFormat } from "@/helpers/dateHelper";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  useConvertCoordinatesToAddress,
  useGetIRInfo,
} from "../queries/reportFetch";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useUpdateIR } from "../queries/reportUpdate";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { LoadButton } from "@/components/ui/button/load-button";
import ReportMapLocation from "../securado/ReportMapLocation";
import { Separator } from "@/components/ui/separator";
import TrackerIcon from "@/assets/images/tracker_icon.svg";
import UserIcon from "@/assets/images/user_icon.svg";

// Styling constants
const SEVERITY_LEVELS: Record<string, string> = {
  LOW: "bg-green-100 border-green-200 text-green-700",
  MEDIUM: "bg-amber-100 border-amber-200 text-amber-700",
  HIGH: "bg-red-100 border-red-200 text-red-700",
};

// Reusable component for Sidebar Info rows
const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mt-0.5">
      <Icon className="w-4 h-4 text-blue-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-gray-900 break-words leading-snug">
        {value || "N/A"}
      </p>
    </div>
  </div>
);

// Loading state component
const LoadingState = () => (
  <LayoutWithBack
    title="Incident Report Details"
    description="Loading report information..."
  >
    <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
      <Spinner size="lg" />
      <p className="text-base text-gray-500">
        Retrieving incident report details...
      </p>
    </div>
  </LayoutWithBack>
);

export default function IRViewDetails() {
  // ================ STATE INITIALIZATION ================
  const navigate = useNavigate();
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state]);
  const isVerified = params?.isVerified;
  const { showLoading, hideLoading } = useLoading();
  const [mediaFiles, setMediaFiles] = React.useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isClosing, setIsClosing] = React.useState<boolean>(false);
  const [isReopening, setIsReopening] = React.useState<boolean>(false);
  const { data: IRInfo, isLoading } = useGetIRInfo(params?.ir_id);
  const isTracker = IRInfo?.ir_is_tracker;
  const images = IRInfo?.files || [];

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
  const isClosed = IRInfo?.ir_status === "CLOSED";
  const isPending = IRInfo?.ir_status === "PENDING"
  const isInProgress = IRInfo?.ir_status === "IN-PROGRESS"

  // ================ SIDE EFFECTS ================
  React.useEffect(() => {
    if (isLoading || isLoadingUserLoc || isLoadingDeviceLoc) showLoading();
    else hideLoading();
  }, [isLoading]);

  React.useEffect(() => {
    if (IRInfo) {
      setMediaFiles(IRInfo?.files);
    }
  }, [IRInfo]);

  // ================ HANDLERS ================
  const handleCreateIR = async () => {
    try {
      setIsSubmitting(true);
      await updateIR({
        data: {
          ir_is_verified: true,
        },
        ir_id: params?.ir_id,
      });
      showSuccessToast("Incident Report Created");
      navigate(-1);
    } catch (err) {
      showErrorToast("Failed to create incident report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkInProgress = async () => {
    try {
      setIsSubmitting(true);
      await updateIR({
        data: {
          ir_status: "IN-PROGRESS",
        },
        ir_id: params?.ir_id,
      });
      showSuccessToast("Incident Report has been marked as In-Progress");
      navigate(-1);
    } catch (err) {
      showErrorToast("Failed to change status. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseIR = async () => {
    try {
      setIsClosing(true);
      await updateIR({
        data: {
          ir_status: "CLOSED",
        },
        ir_id: params?.ir_id,
      });
      showSuccessToast("Incident Report has been closed");
      navigate(-1);
    } catch (err) {
      showErrorToast("Failed to close incident report. Please try again.");
    } finally {
      setIsClosing(false);
    }
  };

  const handleReopenIR = async () => {
    try {
      setIsReopening(true);
      // Reopening usually sets it back to IN-PROGRESS or PENDING. 
      // IN-PROGRESS implies active work is resuming.
      await updateIR({
        data: { ir_status: "IN-PROGRESS" },
        ir_id: params?.ir_id,
      });
      showSuccessToast("Incident Report reopened successfully");
      navigate(-1);
    } catch (err) {
      showErrorToast("Failed to reopen report.");
    } finally {
      setIsReopening(false);
    }
  };

  // ================ RENDER ================
  // Helper to determine Card Styling based on status
  const getActionCardStyles = () => {
    if (isResolved) return "border-green-200 bg-green-50";
    if (isClosed) return "border-slate-200 bg-slate-50"; // Gray theme for closed
    return "border-blue-100 bg-white";
  };

  const getActionHeaderStyles = () => {
    if (isResolved) return "text-green-800";
    if (isClosed) return "text-slate-700";
    return "text-gray-900";
  };

  if (isLoading || isLoadingDeviceLoc || isLoadingUserLoc)
    return <LoadingState />;

  return (
    <LayoutWithBack
      title="Incident Report Details"
      description="Detailed breakdown of the incident report including location data, reporter information, and supporting media."
    >
      <div className="mx-auto max-w-7xl">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Main Content (Description + Evidence) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3 border-b border-gray-100">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  Incident Description
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea
                  className="w-full min-h-[200px] resize-none bg-gray-50 border-gray-200 text-gray-800 text-sm leading-relaxed p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={IRInfo?.ir_add_details}
                  readOnly
                  placeholder="No additional details provided."
                />
              </CardContent>
            </Card>

            {/* Evidence Card */}
            {!isTracker && (
              <Card className="shadow-sm w-full border-gray-200 h-full">
                <CardHeader className="pb-3 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <ImageOff className="w-5 h-5 text-gray-500" />
                      Evidence Gallery
                    </CardTitle>
                    <Badge variant="outline" className="text-gray-500">
                      {images.length} File{images.length !== 1 && "s"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {images.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                      <ImageOff className="w-10 h-10 text-gray-300 mb-2" />
                      <p className="text-sm text-gray-400 font-medium">
                        No evidence uploaded
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-lg overflow-hidden">
                      <MediaGallery mediaFiles={mediaFiles} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {isTracker && (
              <div className="shadow-sm w-full bg-white rounded-lg border h-full p-5 space-y-5">
                <div className="pb-3 border-b border-gray-200 text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Map className="w-5 h-5 text-gray-500" />
                  Location Evidence
                </div>
                <div className="h-[90%]">
                  <ReportMapLocation
                    IRInfo={IRInfo}
                    selectedReport={IRInfo?.ir_id}
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar (Actions + Metadata) */}
          <div className="lg:col-span-1 space-y-6">
            {/* Action Panel */}
            <Card className={`shadow-md transition-all duration-300 ${getActionCardStyles()}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-base font-semibold flex items-center gap-2 ${getActionHeaderStyles()}`}>
                  {isResolved ? (
                    <><CheckCircle2 className="w-5 h-5 text-green-600" /> Resolution Status</>
                  ) : isClosed ? (
                    <><Archive className="w-5 h-5 text-slate-500" /> Report Closed</>
                  ) : (
                    <>Actions</>
                  )}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="grid gap-3">
                {/* 1. NOT VERIFIED: Create Report */}
                {!isVerified && (
                  isSubmitting ? (
                    <LoadButton className="w-full">Creating Report...</LoadButton>
                  ) : (
                    <ConfirmationModal
                      title="Generate Official Incident Report"
                      description="This will formally document the incident..."
                      trigger={
                        <Button className="w-full">
                          <FileText className="w-4 h-4 mr-2" /> Create Incident Report
                        </Button>
                      }
                      onClick={handleCreateIR}
                    />
                  )
                )}

                {isVerified && (
                  <>
                    {/* 2. PENDING: Mark In Progress */}
                    {isPending && (
                       isSubmitting ? (
                        <LoadButton className="w-full">Changing Status...</LoadButton>
                      ) : (
                        <ConfirmationModal
                          title="Begin Resolution Process"
                          description="This will update status to 'In Progress'..."
                          trigger={
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                              <Activity className="w-4 h-4 mr-2" /> Mark In Progress
                            </Button>
                          }
                          onClick={handleMarkInProgress}
                        />
                      )
                    )}

                    {/* 3. IN PROGRESS: Resolve or Close */}
                    {isInProgress && (
                      <>
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => navigate("/report/action/form", {
                             state: { params: { ir_id: IRInfo?.ir_id, area: IRInfo?.ir_area } } 
                          })}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Resolve Incident
                        </Button>

                        {isClosing ? (
                          <LoadButton className="w-full">Closing Report...</LoadButton>
                        ) : (
                          <ConfirmationModal
                            title="Close Incident Report"
                            description="This will close the report without resolution. It can be reopened later."
                            trigger={
                              <Button variant="secondary" className="w-full bg-white border border-gray-200 hover:bg-gray-100 text-gray-700">
                                <Lock className="w-4 h-4 mr-2" /> Close Report
                              </Button>
                            }
                            onClick={handleCloseIR}
                          />
                        )}
                      </>
                    )}

                    {/* 4. CLOSED: Show Info & Reopen Button */}
                    {isClosed && (
                      <div className="space-y-4">
                        <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                          <p className="text-xs text-slate-600 font-medium text-center mb-1">
                            Archived
                          </p>
                          <p className="text-xs text-center text-slate-500">
                            Closed: {getDateTimeFormat(IRInfo?.ir_updated_at)}
                          </p>
                        </div>
                        
                        {isReopening ? (
                           <LoadButton className="w-full bg-slate-800 text-white">Reopening...</LoadButton>
                        ) : (
                          <ConfirmationModal
                            title="Reopen Incident Report"
                            description="This will move the report back to 'In Progress' for further action. Are you sure?"
                            trigger={
                              <Button variant="outline" className="w-full border-slate-300 hover:bg-white hover:text-slate-800 text-slate-600">
                                <RotateCcw className="w-4 h-4 mr-2" /> Reopen Incident Report
                              </Button>
                            }
                            onClick={handleReopenIR}
                          />
                        )}
                      </div>
                    )}

                    {/* 5. RESOLVED: View Action Report */}
                    {isResolved && (
                      <div className="space-y-3">
                        <div className="bg-white/60 p-3 rounded-lg border border-green-100">
                          <p className="text-xs text-green-700 font-medium text-center mb-1">Report Resolved</p>
                          <p className="text-xs text-center text-green-600">
                            Resolved: {getDateTimeFormat(IRInfo?.ir_updated_at)}
                          </p>
                        </div>
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => navigate("/report/action/document", { state: { params: { type: "AR", data: { id: IRInfo?.ar } } } })}
                        >
                          <Eye className="w-4 h-4 mr-2" /> View Action Report
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {/* Received Date Footer (Common for non-resolved) */}
                {!isResolved && !isClosed && (
                  <p className="text-xs text-center text-gray-400 mt-2">
                    Received: {getDateTimeFormat(IRInfo?.ir_created_at)}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Metadata Sidebar */}
            {!isTracker && (
              <Card className="shadow-sm border-gray-200">
                <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Additional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Severity Badge Block */}
                  <div className="mb-6 flex flex-col gap-2">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Severity Level
                    </Label>
                    <Badge
                      className={`w-fit px-3 py-1 text-xs font-semibold rounded-md border ${
                        SEVERITY_LEVELS[IRInfo?.ir_severity] ||
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {IRInfo?.ir_severity || "UNKNOWN"}
                    </Badge>
                  </div>

                  {/* Info Rows */}
                  <InfoItem
                    icon={MapPin}
                    label="Location"
                    value={IRInfo?.ir_area.toUpperCase()}
                  />
                  <InfoItem
                    icon={User}
                    label="Reported By"
                    value={IRInfo?.ir_reported_by}
                  />
                  <InfoItem
                    icon={CalendarDays}
                    label="Date"
                    value={IRInfo?.ir_date}
                  />
                  <InfoItem
                    icon={Clock4}
                    label="Time"
                    value={IRInfo?.ir_time}
                  />
                </CardContent>
              </Card>
            )}

            {isTracker && (
              <div className="">
                <Card className="shadow-sm border-gray-200">
                  <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
                    <CardTitle className="text-base font-semibold text-gray-900">
                      Additional Details
                    </CardTitle>
                  </CardHeader>
                  <div className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <UserRound
                        className="text-red-600 mt-1 flex-shrink-0"
                        size={18}
                      />
                      <div>
                        <p className="text-xs text-gray-500 tracking-wide font-medium mb-1">
                          REPORTED BY
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {IRInfo?.ir_track_user_name}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <Phone
                        className="text-red-600 mt-1 flex-shrink-0"
                        size={18}
                      />
                      <div>
                        <p className="text-xs text-gray-500 tracking-wide font-medium mb-1">
                          CONTACT
                        </p>
                        <p className="text-sm text-gray-900 font-medium leading-relaxed">
                          {IRInfo?.ir_track_user_contact ||
                            "No contact provided"}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <Clock
                        className="text-red-600 mt-1 flex-shrink-0"
                        size={18}
                      />
                      <div>
                        <p className="text-xs text-gray-500 tracking-wide font-medium mb-1">
                          REPORTED AT
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {getDateTimeFormat(
                            IRInfo?.ir_created_at
                          ).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="flex gap-4 bg-blue-50 border shadow-sm overflow-hidden p-5 mt-4">
                  <img src={UserIcon} className="w-[40px] h-[35px]" />
                  <div className="flex flex-col gap-2 text-white">
                    <h4 className="font-semibold text-md text-primary">
                      User Location
                    </h4>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {userLocation?.display_name || "Location unavailable"}
                    </p>
                  </div>
                </Card>

                <Card className="flex gap-4 bg-blue-50 border shadow-sm overflow-hidden p-5 mt-4">
                  <img src={TrackerIcon} className="w-[40px] h-[35px]" />
                  <div className="flex flex-col gap-2 text-white">
                    <h4 className="font-semibold text-md text-primary">
                      Device Location
                    </h4>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {deviceLocation?.display_name || "Location unavailable"}
                    </p>
                  </div>
                </Card>

                <div className="flex items-start gap-3  text-gray-600 mt-4">
                  <CircleAlert className="w-8 h-8" />
                  <p className="text-sm">
                    Locations shown are historical snapshots from the time of
                    the report. They are not live real-time updates.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}

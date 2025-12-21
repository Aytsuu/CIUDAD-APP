import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button/button";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import {
  MdCheckCircle,
  MdCancel,
  MdTrendingUp,
  MdAccessTimeFilled,
  MdAccountCircle,
  MdInsertDriveFile,
  MdError,
  MdBlock,
  MdAssignment,
  MdHistory,
  MdInfo,
  MdRefresh,
} from "react-icons/md";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import Loading from "@/components/ui/loading";
import { Complainant, Accused, ComplaintFile, ComplaintHistory } from "./complaint-type";
import { useGetComplaintById } from "./api-operations/queries/complaintGetQueries";
import { useUpdateComplaint } from "./api-operations/queries/complaintUpdateQueries";
import { usePostRaiseIssue } from "./api-operations/queries/complaintPostQueries";
import { ComplaintActionModal } from "./ComplaintActionModal";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type ActionType = "accept" | "reject" | "raise";

interface StatusConfig {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconColor: string;
  bgColor: string;
  title: string;
  description: string;
  showActions: boolean;
}

interface TimelineAction {
  action: string;
  description: string;
  timestamp: string;
  status: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
}

export function ComplaintViewRecord() {
  // =================================================
  //          Hooks & State
  // =================================================
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const compIdFromParams = searchParams.get("comp_id");
  const stateComplaint = location.state?.complaint;
  const compIdFromState = stateComplaint?.comp_id;
  
  const compId = compIdFromParams || compIdFromState;
  
  const {
    data: fetchedData,
    isLoading,
    isError,
    refetch,
  } = useGetComplaintById(compId || "");
  
  // Always prioritize fetchedData over stateComplaint
  const complaintData = fetchedData || stateComplaint;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);

  // Mutations
  const updateComplaintMutation = useUpdateComplaint();
  const raiseIssueMutation = usePostRaiseIssue();

  const isProcessing = updateComplaintMutation.isPending || raiseIssueMutation.isPending;

  // =================================================
  //          Handlers
  // =================================================
  const handleActionClick = (action: ActionType) => {
    setCurrentAction(action);
    setIsModalOpen(true);
  };

  const handleConfirmAction = async (reason?: string) => {
    if (!complaintData?.comp_id) {
      toast.error("Invalid complaint ID");
      return;
    }

    try {
      const compId = Number(complaintData.comp_id);

      switch (currentAction) {
        case "accept":
          await updateComplaintMutation.mutateAsync({
            compId,
            payload: { comp_status: "Accepted" },
          });
          toast.success("Complaint accepted successfully");
          break;

        case "reject":
          if (!reason) {
            toast.error("Rejection reason is required");
            return;
          }
          await updateComplaintMutation.mutateAsync({
            compId,
            payload: { comp_status: "Rejected", comp_rejection_reason: reason },
          });
          toast.success("Complaint rejected successfully");
          break;

        case "raise":
          await raiseIssueMutation.mutateAsync(compId);
          toast.success("Complaint raised successfully");
          break;
      }

      // Invalidate and refetch with proper timing
      await queryClient.invalidateQueries({ 
        queryKey: ['complaint', compId.toString()],
        exact: true 
      });
      
      // Small delay to ensure backend processing is complete
      setTimeout(async () => {
        await refetch();
      }, 300);

      setIsModalOpen(false);
    } catch (error) {
      console.error("Action error:", error);
      toast.error(`Failed to ${currentAction} complaint. Please try again.`);
    }
  };

  const handleRefresh = async () => {
    if (compId) {
      // Remove cached query data
      queryClient.removeQueries({ 
        queryKey: ['complaint', compId],
        exact: true 
      });
      
      // Force fresh fetch
      await refetch();
      toast.success("Data refreshed");
    }
  };

  // =================================================
  //          Status Configuration
  // =================================================
  const statusConfig = useMemo((): StatusConfig => {
    const c = complaintData;
    if (!c) {
      return {
        icon: MdError,
        iconColor: "text-gray-500",
        bgColor: "bg-gray-100",
        title: "No Data",
        description: "No complaint data available",
        showActions: false,
      };
    }

    switch (c.comp_status) {
      case "Pending":
        return {
          icon: MdAccessTimeFilled,
          iconColor: "text-orange-500",
          bgColor: "bg-orange-100",
          title: "Pending Request",
          description: "Blotter request awaiting review",
          showActions: true,
        };
      case "Raised":
        return {
          icon: MdTrendingUp,
          iconColor: "text-blue-500",
          bgColor: "bg-blue-100",
          title: "Raised Request",
          description: "Complaint undergoing process",
          showActions: false,
        };
      case "Accepted":
        return {
          icon: MdCheckCircle,
          iconColor: "text-green-500",
          bgColor: "bg-green-100",
          title: "Accepted Request",
          description: "Blotter has been accepted",
          showActions: true,
        };
      case "Rejected":
        return {
          icon: MdCancel,
          iconColor: "text-red-500",
          bgColor: "bg-red-100",
          title: "Rejected Request",
          description: "This complaint has been rejected",
          showActions: false,
        };
      case "Cancelled":
        return {
          icon: MdBlock,
          iconColor: "text-gray-500",
          bgColor: "bg-gray-100",
          title: "Cancelled Request",
          description: "This complaint has been cancelled",
          showActions: false,
        };
      default:
        return {
          icon: MdError,
          iconColor: "text-gray-500",
          bgColor: "bg-gray-100",
          title: `${c.comp_status} Request`,
          description: "Complaint status information",
          showActions: false,
        };
    }
  }, [complaintData]);

  // =================================================
  //          Helper Functions
  // =================================================
  const formatDate = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "Invalid time";
    }
  };

  const formatDateTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return "Invalid date/time";
    }
  };

  const extractStatusFromAction = (action: string, details?: any): string => {
    // Check details.new_status first (most reliable)
    if (details?.new_status) {
      return details.new_status;
    }
    
    const toStatusMatch = action.match(/to\s+(Pending|Accepted|Rejected|Raised|Cancelled)/i);
    if (toStatusMatch) {
      return toStatusMatch[1];
    }
    
    const actionLower = action.toLowerCase();
    if (actionLower.includes("raised") || actionLower.includes("raise")) return "Raised";
    if (actionLower.includes("accepted") || actionLower.includes("accept")) return "Accepted";
    if (actionLower.includes("rejected") || actionLower.includes("reject")) return "Rejected";
    if (actionLower.includes("cancelled") || actionLower.includes("cancel")) return "Cancelled";
    if (actionLower.includes("pending")) return "Pending";
    
    return "Updated";
  };

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case "Pending": return "bg-orange-100 text-orange-800";
      case "Accepted": return "bg-green-100 text-green-800";
      case "Rejected": return "bg-red-100 text-red-800";
      case "Raised": return "bg-blue-100 text-blue-800";
      case "Cancelled": return "bg-gray-100 text-gray-800";
      default: return "bg-purple-100 text-purple-800";
    }
  };

  // =================================================
  //          Component Rendering Functions
  // =================================================
  const renderStatusHeader = () => {
    if (!complaintData) return null;
    
    const StatusIcon = statusConfig.icon;

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`${statusConfig.bgColor} p-3 rounded-lg`}>
              <StatusIcon size={24} className={statusConfig.iconColor} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">
                {statusConfig.title}
              </h1>
              <p className="text-sm text-gray-500">{statusConfig.description}</p>
            </div>
          </div>
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
            disabled={isProcessing}
          >
            <MdRefresh /> Refresh
          </Button>
        </div>

        {statusConfig.showActions && (
          <div className={`grid ${complaintData.comp_status === "Accepted" ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
            {complaintData.comp_status === "Pending" && (
              <>
                <Button
                  onClick={() => handleActionClick("accept")}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 py-3 rounded-lg transition-colors"
                >
                  <MdCheckCircle className="text-lg" /> Accept
                </Button>
                <Button
                  onClick={() => handleActionClick("reject")}
                  disabled={isProcessing}
                  className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 py-3 rounded-lg transition-colors"
                >
                  <MdCancel className="text-lg" /> Reject
                </Button>
              </>
            )}

            {complaintData.comp_status === "Accepted" && (
              <Button
                onClick={() => handleActionClick("raise")}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 disabled:opacity-50 py-3 rounded-lg transition-colors"
              >
                <MdTrendingUp className="text-lg" /> Raise Complaint
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderActionsTaken = () => {
    if (!complaintData) {
      return null;
    }

    const initialAction: TimelineAction = {
      action: "Complaint Filed",
      description: `Filed by ${complaintData.complainant?.[0]?.cpnt_name || "Complainant"}`,
      timestamp: complaintData.comp_created_at,
      status: "Pending",
      icon: MdAssignment,
      iconColor: "text-orange-500",
      bgColor: "bg-orange-100",
    };

    // Safe array handling with explicit checks
    const historyEntries = Array.isArray(complaintData.comp_history) 
      ? complaintData.comp_history 
      : [];
    
    const allActions: TimelineAction[] = [initialAction];

    // Process history entries
    historyEntries.forEach((entry: ComplaintHistory) => {
      const actionText = entry.comp_hist_action || "Complaint updated";
      const newStatus = extractStatusFromAction(actionText, entry.comp_hist_details);
      
      let icon = MdHistory;
      let iconColor = "text-gray-500";
      let bgColor = "bg-gray-100";

      switch (newStatus) {
        case "Accepted":
          icon = MdCheckCircle;
          iconColor = "text-green-500";
          bgColor = "bg-green-100";
          break;
        case "Rejected":
          icon = MdCancel;
          iconColor = "text-red-500";
          bgColor = "bg-red-100";
          break;
        case "Raised":
          icon = MdTrendingUp;
          iconColor = "text-blue-500";
          bgColor = "bg-blue-100";
          break;
        case "Pending":
          icon = MdAccessTimeFilled;
          iconColor = "text-orange-500";
          bgColor = "bg-orange-100";
          break;
        case "Cancelled":
          icon = MdBlock;
          iconColor = "text-gray-500";
          bgColor = "bg-gray-100";
          break;
      }

      const updatedBy = entry.staff?.staff_name || "System";
      const position = entry.staff?.staff_position;
      
      allActions.push({
        action: actionText,
        description: `Updated by ${updatedBy}${position ? ` (${position})` : ''}`,
        timestamp: entry.comp_hist_timestamp,
        status: newStatus,
        icon,
        iconColor,
        bgColor,
      });
    });

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MdHistory className="text-blue-500 text-xl" />
            <h2 className="text-lg font-semibold text-gray-800">Actions Taken</h2>
          </div>
          <span className="text-xs text-gray-500">
            {allActions.length} {allActions.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <div className="space-y-4">
          {allActions.length === 0 ? (
            <div className="text-center py-6">
              <MdHistory className="text-gray-400 text-3xl mx-auto mb-2" />
              <p className="text-sm text-gray-600">No actions recorded yet</p>
            </div>
          ) : (
            allActions.map((action, index) => {
              const ActionIcon = action.icon;
              const isLast = index === allActions.length - 1;
              
              return (
                <div key={`${action.timestamp}-${index}`} className="relative">
                  {!isLast && (
                    <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  
                  <div className="flex gap-3">
                    <div className="relative z-10">
                      <div className={`${action.bgColor} p-2 rounded-full`}>
                        <ActionIcon className={`${action.iconColor} text-base`} />
                      </div>
                    </div>
                    
                    <div className="flex-1 pb-3">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800">
                            {action.action}
                          </h3>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {action.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-gray-800">
                            {formatDate(action.timestamp)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(action.timestamp)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-gray-500">Status:</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(action.status)}`}>
                          {action.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderAssignedSection = () => {
    if (!complaintData) return null;

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        {complaintData.staff ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Reviewed & Accepted by:
              </h3>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MdAccountCircle className="text-blue-500 text-2xl" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-darkBlue1">
                    {complaintData.staff.staff_name}
                  </h4>
                  {complaintData.staff.staff_position && (
                    <span className="text-xs text-white px-2 bg-green-500 rounded-full">
                      {complaintData.staff.staff_position}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Staff ID: {complaintData.staff.staff_id}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <MdAssignment className="text-gray-400 text-3xl mx-auto mb-2" />
            <p className="text-sm text-gray-600">No staff assigned yet</p>
          </div>
        )}
      </div>
    );
  };

  const renderComplaintDetails = () => {
    if (!complaintData) return null;

    return (
      <>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blotter ID
                </span>
              </div>
              <p className="text-lg font-bold text-gray-800 pl-3">
                {complaintData.comp_id}
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-gray-400 rounded-full" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Filed
                </span>
              </div>
              <div className="pl-3">
                <p className="text-sm font-semibold text-gray-800">
                  {formatDate(complaintData.comp_created_at)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(complaintData.comp_created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-gray-800">Allegation</h1>
            <p className="text-sm text-gray-500">
              Details about the incident or wrongdoing being reported.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-500 text-white rounded-lg p-4">
              <h2 className="text-sm font-semibold">Type of Incident</h2>
              <p className="text-xs text-blue-100 mb-2">
                Details about the incident or wrongdoing being reported.
              </p>
              <h2 className="text-lg text-center font-semibold">
                {complaintData.comp_incident_type}
              </h2>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <h2 className="text-sm font-semibold">Time of Incident</h2>
              <p className="text-xs text-gray-500 mb-2">
                When the incident occurred
              </p>
              <h2 className="text-lg text-center text-gray-600 font-semibold">
                {formatDateTime(complaintData.comp_datetime)}
              </h2>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <h2 className="text-sm font-semibold">Location</h2>
              <p className="text-xs text-gray-500 mb-2">
                Where the event took place
              </p>
              <h2 className="text-lg text-center text-gray-600 font-semibold">
                {complaintData.comp_location}
              </h2>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-4">
            <h2 className="text-sm font-semibold mb-2">Incident Details</h2>
            <p className="text-xs text-gray-500 mb-3">
              A clear description of what happened
            </p>
            <p className="text-gray-600 break-words whitespace-pre-wrap">
              {complaintData.comp_allegation}
            </p>
          </div>
        </div>
      </>
    );
  };

  const renderPartiesInvolved = () => {
    if (!complaintData) return null;

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <section className="mb-6">
          <div className="mb-4">
            <h1 className="text-lg font-semibold text-gray-800">Complainant</h1>
            <p className="text-sm text-gray-500">
              Person who lodged or initiated the complaint
            </p>
          </div>
          <div className="space-y-4">
            {complaintData.complainant?.map((person: Complainant, index: number) => (
              <div key={index} className="bg-blue-500 text-white rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <MdAccountCircle className="text-white text-4xl" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h2 className="text-md font-semibold">
                          {person.cpnt_name.toUpperCase()}
                        </h2>
                        <span className={`text-white rounded-full px-3 py-1 text-xs ${
                          person.rp_id ? "bg-green-500" : "bg-purple-700"
                        }`}>
                          {person.rp_id ? "Resident" : "Non-resident"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Age: {person.cpnt_age} yrs. old</div>
                      <div>Gender: {person.cpnt_gender}</div>
                      <div className="col-span-2">Contact: {person.cpnt_number}</div>
                      <div className="col-span-2">Address: {person.cpnt_address}</div>
                      <div className="col-span-2">
                        Relation to Respondent: {person.cpnt_relation_to_respondent}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {complaintData.accused?.length > 0 && (
          <section>
            <div className="mb-4">
              <h1 className="text-lg font-semibold text-gray-800">Respondent</h1>
              <p className="text-sm text-gray-500">
                The person being reported or accused in the incident
              </p>
            </div>
            <div className="space-y-4">
              {complaintData.accused.map((person: Accused, index: number) => (
                <div key={index} className="bg-blue-500 text-white rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <MdAccountCircle className="text-white text-4xl" />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h2 className="text-md font-semibold">
                            {person.acsd_name.toUpperCase()}
                          </h2>
                          <span className="bg-green-500 text-white rounded-full px-3 py-1 text-xs">
                            Resident
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Age: {person.acsd_age} yrs. old</div>
                        <div>Gender: {person.acsd_gender}</div>
                        <div className="col-span-2">Address: {person.acsd_address}</div>
                        <div className="col-span-2">Description: {person.acsd_description}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderSupportingDocuments = () => {
    if (!complaintData) return null;

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        {complaintData.complaint_files?.length > 0 ? (
          <MediaUpload
            title="Attached Files"
            description="Uploaded photos, files, or proof related to the incident."
            mediaFiles={
              complaintData.complaint_files.map((doc: ComplaintFile) => ({
                id: doc.comp_file_id?.toString() || crypto.randomUUID(),
                name: doc.comp_file_name,
                type: doc.comp_file_type || "application/pdf",
                url: doc.comp_file_url,
              })) as MediaUploadType
            }
            setMediaFiles={() => {}}
            readOnly={true}
            hideRemoveButton={true}
            viewMode="list"
            acceptableFiles="document"
          />
        ) : (
          <div className="text-center py-6">
            <MdInsertDriveFile className="text-4xl text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No supporting documents attached</p>
            <p className="text-sm text-gray-500 mt-1">
              Uploaded photos, files, or proof related to the incident.
            </p>
          </div>
        )}
      </div>
    );
  };

  // =================================================
  //          Loading & Error States
  // =================================================
  if (isLoading && !stateComplaint) {
    return (
      <LayoutWithBack
        title="Blotter Details"
        description="Review and manage complaint record information"
      >
        <div className="flex items-center justify-center h-64 space-x-4">
          <Loading /> <span>Loading Data...</span>
        </div>
      </LayoutWithBack>
    );
  }

  if ((isError || !complaintData) && !stateComplaint) {
    return (
      <LayoutWithBack
        title="Complaint Details"
        description="Review and manage complaint record information"
      >
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <MdError className="text-4xl text-red-500" />
          <p className="text-gray-600">Failed to load complaint data</p>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <MdRefresh /> Try Again
          </Button>
        </div>
      </LayoutWithBack>
    );
  }

  if (!complaintData) {
    return (
      <LayoutWithBack
        title="Complaint Details"
        description="Review and manage complaint record information"
      >
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <MdInfo className="text-4xl text-gray-400" />
          <p className="text-gray-600">No complaint data found</p>
          <Button
            onClick={() => navigate("/complaint")}
            variant="outline"
          >
            Back to Complaints
          </Button>
        </div>
      </LayoutWithBack>
    );
  }

  // =================================================
  //          Main Render
  // =================================================
  return (
    <LayoutWithBack
      title="Blotter Details"
      description="Review and manage complaint record information"
    >
      <div className="overflow-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="lg:w-8/12 space-y-6">
            {renderComplaintDetails()}
            {renderPartiesInvolved()}
            {renderSupportingDocuments()}
          </div>

          {/* Sidebar */}
          <div className="lg:w-4/12 space-y-6">
            {renderStatusHeader()}
            {renderActionsTaken()}
            {renderAssignedSection()}
          </div>
        </div>
      </div>

      <ComplaintActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actionType={currentAction}
        complaintId={complaintData.comp_id}
        onConfirm={handleConfirmAction}
        isLoading={isProcessing}
      />
    </LayoutWithBack>
  );
}
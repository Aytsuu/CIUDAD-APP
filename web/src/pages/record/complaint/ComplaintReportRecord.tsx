import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
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
  MdLightbulb,
} from "react-icons/md";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import Loading from "@/components/ui/loading";
import { Complainant, Accused, ComplaintFile } from "./complaint-type";
import { useGetComplaintById } from "./api-operations/queries/complaintGetQueries";
import { useUpdateComplaint } from "./api-operations/queries/complaintUpdateQueries";
import { usePostRaiseIssue } from "./api-operations/queries/complaintPostQueries";
import { ComplaintActionModal } from "./ComplaintActionModal";
import { toast } from "sonner";
import { StarOff } from "lucide-react";

type ActionType = "accept" | "reject" | "raise";

export function ComplaintViewRecord() {
  // =================================================
  //          State initialization
  // =================================================
  const [searchParams] = useSearchParams();
  const compIdFromNotification = searchParams.get("comp_id");
  const {
    data: fetchedData,
    isLoading,
    isError,
    refetch,
  } = useGetComplaintById(compIdFromNotification ?? "");
  const location = useLocation();
  const navigate = useNavigate();
  const stateData = location.state?.complaint;

  const complaintData = stateData || fetchedData;

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);

  // Mutations
  const updateComplaintMutation = useUpdateComplaint();
  const raiseIssueMutation = usePostRaiseIssue();

  const isProcessing =
    updateComplaintMutation.isPending || raiseIssueMutation.isPending;

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
          navigate("/complaint");
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
          navigate("/complaint");
          break;

        case "raise":
          await raiseIssueMutation.mutateAsync(compId);
          toast.success("Complaint raised successfully");
          navigate("/complaint");
          break;

        default:
          toast.error("Invalid action");
          return;
      }

      setIsModalOpen(false);
      await refetch();
    } catch (error) {
      toast.error(`Failed to ${currentAction} complaint. Please try again.`);
    }
  };

  // Loading state
  if (isLoading && !stateData) {
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

  // Error or no data
  if (!complaintData || (isError && !stateData)) {
    return (
      <LayoutWithBack
        title="Complaint Details"
        description="Review and manage complaint record information"
      >
        <div className="flex items-center justify-center h-64">
          No data available
        </div>
      </LayoutWithBack>
    );
  }

  // --- Status Configuration ---
  const getStatusConfig = () => {
    const c = complaintData;

    switch (c.comp_status) {
      case "Pending":
        return {
          icon: MdAccessTimeFilled,
          iconColor: "text-red-500",
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
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  // --- Render Status Header for Right Side ---
  const renderStatusHeader = () => {
    const c = complaintData;

    return (
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div
            className={`${statusConfig.bgColor} p-3 rounded-lg flex-shrink-0`}
          >
            <StatusIcon size={24} className={statusConfig.iconColor} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">
              {statusConfig.title}
            </h1>
            <p className="text-sm text-gray-500">{statusConfig.description}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {statusConfig.showActions && (
          <div className="space-y-2">
            {c.comp_status === "Pending" && (
              <>
                <Button
                  onClick={() => handleActionClick("accept")}
                  disabled={isProcessing}
                  className="w-full bg-green-500 text-white hover:bg-green-400 flex items-center justify-center gap-2 disabled:opacity-50 py-3"
                >
                  <MdCheckCircle /> Accept Complaint
                </Button>
                <Button
                  onClick={() => handleActionClick("reject")}
                  disabled={isProcessing}
                  className="w-full bg-red-500 text-white hover:bg-red-400 flex items-center justify-center gap-2 disabled:opacity-50 py-3"
                >
                  <MdCancel /> Reject Complaint
                </Button>
              </>
            )}

            {c.comp_status === "Accepted" && (
              <Button
                onClick={() => handleActionClick("raise")}
                disabled={isProcessing}
                className="w-full bg-blue-500 text-white hover:bg-blue-400 flex items-center justify-center gap-2 disabled:opacity-50 py-3"
              >
                <MdTrendingUp /> Raise to Next Level
              </Button>
            )}
          </div>
        )}

        {/* Reason Display for Rejected/Cancelled Complaints */}
        {(c.comp_status === "Rejected" || c.comp_status === "Cancelled") && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              c.comp_status === "Rejected"
                ? "bg-red-50 border border-red-200"
                : "bg-gray-50 border border-gray-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-full ${
                  c.comp_status === "Rejected" ? "bg-red-100" : "bg-gray-100"
                }`}
              >
                <MdCancel
                  size={20}
                  className={
                    c.comp_status === "Rejected"
                      ? "text-red-500"
                      : "text-gray-500"
                  }
                />
              </div>
              <div className="flex-1">
                <h3
                  className={`text-sm font-semibold ${
                    c.comp_status === "Rejected"
                      ? "text-red-800"
                      : "text-gray-800"
                  }`}
                >
                  {c.comp_status === "Rejected"
                    ? "Rejection Reason"
                    : "Cancellation Reason"}
                </h3>
                <p
                  className={`text-sm mt-1 ${
                    c.comp_status === "Rejected"
                      ? "text-red-700"
                      : "text-gray-700"
                  }`}
                >
                  {c.comp_status === "Rejected"
                    ? c.comp_rejection_reason
                    : c.comp_cancel_reason}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- Render Actions Taken Section ---
  const renderActionsTaken = () => (
    <div className="bg-white rounded-lg p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <MdHistory className="text-blue-500 text-xl" />
        <h2 className="text-lg font-semibold text-gray-800">Actions Taken</h2>
      </div>
      <div className="space-y-3">
        {/* Created Action */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
          <div className="bg-blue-100 p-2 rounded-full">
            <MdInsertDriveFile className="text-blue-500 text-sm" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-800">
              Complaint Created
            </h3>
            <p className="text-xs text-gray-600">
              Complaint was filed by the complainant
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(complaintData.comp_datetime).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Status Updates */}
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <div className={`${statusConfig.bgColor} p-2 rounded-full`}>
            <StatusIcon className={`${statusConfig.iconColor} text-sm`} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-800">
              Status Updated
            </h3>
            <p className="text-xs text-gray-600">
              Current status:{" "}
              <span className="font-semibold">{complaintData.comp_status}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">Last updated</p>
          </div>
        </div>
      </div>
    </div>
  );

  // --- Render Assigned Section ---
  const renderAssignedSection = () => (
    <div className="rounded-lg p-4">
      {complaintData.staff ? (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">
            Reviewed & Accepted by:
          </h3>
          <div className="flex items-start gap-3 p-3 rounded-lg">
            <div className="flex flex-col">
              <div className="flex flex-row gap-x-6 items-center">
                <h4 className="font-semibold text-darkBlue1">
                  {complaintData.staff.staff_name}
                </h4>
                <p className="text-xs text-white px-2 bg-green-500 rounded-full">
                  {complaintData.staff.staff_position}
                </p>
              </div>
              <span className="text-sm py-1 text-darkBlue1">
                ID: {complaintData.staff.staff_id}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <MdAssignment className="text-gray-400 text-3xl mx-auto mb-2" />
          <p className="text-sm text-gray-600">No staff assigned yet</p>
          <button className="mt-2 text-sm text-blue-500 hover:text-blue-600 font-medium">
            Assign Staff
          </button>
        </div>
      )}
    </div>
  );

  // --- Main UI Rendering ---
  const renderContent = () => {
    const c = complaintData;
    return (
      <div className="flex gap-6">
        {/* Left Column - Main Content (70%) */}
        <div className="w-8/12 space-y-6">
          <div className="bg-white rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-800">
              Blotter ID: {c.comp_id}
            </h3>
            <h3 className="text-sm font-medium text-gray-800">
              Date Filed: {new Date(c.comp_created_at).toLocaleString()}
            </h3>
          </div>

          {/* Allegation Section */}
          <div className="bg-white rounded-lg p-4">
            <div className="mb-4">
              <h1 className="text-lg font-semibold text-gray-800">
                Allegation
              </h1>
              <p className="text-sm text-gray-500">
                Details about the incident or wrongdoing being reported.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Incident Type */}
              <div className="bg-blue-500 text-white rounded-lg p-4">
                <h2 className="text-sm font-semibold">Type of Incident</h2>
                <p className="text-xs text-blue-100 mb-2">
                  Details about the incident or wrongdoing being reported.
                </p>
                <h2 className="text-lg text-center font-semibold">
                  {c.comp_incident_type}
                </h2>
              </div>

              {/* Time of Incident */}
              <div className="bg-gray-100 rounded-lg p-4">
                <h2 className="text-sm font-semibold">Time of Incident</h2>
                <p className="text-xs text-gray-500 mb-2">
                  When the incident occurred
                </p>
                <h2 className="text-lg text-center text-gray-600 font-semibold">
                  {new Date(c.comp_datetime).toLocaleString()}
                </h2>
              </div>

              {/* Location */}
              <div className="bg-gray-100 rounded-lg p-4">
                <h2 className="text-sm font-semibold">Location</h2>
                <p className="text-xs text-gray-500 mb-2">
                  Where the event took place
                </p>
                <h2 className="text-lg text-center text-gray-600 font-semibold">
                  {c.comp_location}
                </h2>
              </div>
            </div>

            {/* Incident Details */}
            <div className="bg-gray-100 rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-2">Incident Details</h2>
              <p className="text-xs text-gray-500 mb-3">
                A clear description of what happened
              </p>
              <p className="text-gray-600 break-words whitespace-pre-wrap">
                {c.comp_allegation}
              </p>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="bg-white rounded-lg p-4">
            {/* Complainant */}
            <section className="mb-6">
              <div className="mb-4">
                <h1 className="text-lg font-semibold text-gray-800">
                  Complainant
                </h1>
                <p className="text-sm text-gray-500">
                  Person who lodged or initiated the complaint
                </p>
              </div>
              <div className="space-y-4">
                {c.complainant?.map((person: Complainant, index: number) => (
                  <div
                    key={index}
                    className="bg-blue-500 text-white rounded-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <MdAccountCircle className="text-white text-4xl" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h2 className="text-md font-semibold">
                              {person.cpnt_name.toUpperCase()}
                            </h2>
                            {person.rp_id ? (
                              <span className="bg-green-500 text-white rounded-full px-3 py-1 text-xs">
                                Resident
                              </span>
                            ) : (
                              <span className="bg-purple-700 text-white rounded-full px-3 py-1 text-xs">
                                Non-resident
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="opacity-90">Age:</span>{" "}
                            {person.cpnt_age} yrs. old
                          </div>
                          <div>
                            <span className="opacity-90">Gender:</span>{" "}
                            {person.cpnt_gender}
                          </div>
                          <div className="col-span-2">
                            <span className="opacity-90">Contact:</span>{" "}
                            {person.cpnt_number}
                          </div>
                          <div className="col-span-2">
                            <span className="opacity-90">Address:</span>{" "}
                            {person.cpnt_address}
                          </div>
                          <div className="col-span-2">
                            <span className="opacity-90">
                              Relation to Respondent:
                            </span>{" "}
                            {person.cpnt_relation_to_respondent}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Accused */}
            {c.accused?.length > 0 && (
              <section>
                <div className="mb-4">
                  <h1 className="text-lg font-semibold text-gray-800">
                    Respondent
                  </h1>
                  <p className="text-sm text-gray-500">
                    The person being reported or accused in the incident
                  </p>
                </div>
                <div className="space-y-4">
                  {c.accused.map((person: Accused, index: number) => (
                    <div
                      key={index}
                      className="bg-blue-500 text-white rounded-lg p-4"
                    >
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
                            <div>
                              <span className="opacity-90">Age:</span>{" "}
                              {person.acsd_age} yrs. old
                            </div>
                            <div>
                              <span className="opacity-90">Gender:</span>{" "}
                              {person.acsd_gender}
                            </div>
                            <div className="col-span-2">
                              <span className="opacity-90">Address:</span>{" "}
                              {person.acsd_address}
                            </div>
                            <div className="col-span-2">
                              <span className="opacity-90">Description:</span>{" "}
                              {person.acsd_description}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Supporting Documents */}
          <div className="bg-white rounded-lg p-4">
            {c.complaint_files?.length > 0 ? (
              <MediaUpload
                title="Attached Files"
                description="Uploaded photos, files, or proof related to the incident."
                mediaFiles={
                  c.complaint_files.map((doc: ComplaintFile) => ({
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
                <p className="text-gray-600">
                  No supporting documents attached
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Uploaded photos, files, or proof related to the incident.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Actions Sidebar (30%) */}
        <div className="w-5/12 space-y-6">
          {/* Status Header Moved to Right */}
          {renderStatusHeader()}
          {renderActionsTaken()}
          {renderAssignedSection()}
        </div>
      </div>
    );
  };

  return (
    <LayoutWithBack
      title="Blotter Details"
      description="Review and manage complaint record information"
    >
      <div className="overflow-auto">{renderContent()}</div>

      <ComplaintActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        actionType={currentAction}
        complaintId={complaintData?.comp_id || ""}
        onConfirm={handleConfirmAction}
        isLoading={isProcessing}
      />
    </LayoutWithBack>
  );
}

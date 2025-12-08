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

  // --- Main UI Rendering ---
  const renderContent = () => {
    const c = complaintData;
    return (
      <div>
        {/* Header */}
        <div className="flex mb-4 bg-white w-full h-24 rounded-lg">
          <div className="flex justify-between items-center w-full p-4">
            <div className="flex items-center gap-4">
              <div className={`flex ${statusConfig.bgColor} rounded-lg w-9 h-9 justify-center items-center`}>
                <StatusIcon size={24} className={statusConfig.iconColor} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  {statusConfig.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {statusConfig.description}
                  {c.comp_status === "Accepted" && c.staff && (
                    <span className="block text-xs text-green-600 font-medium">
                      Confirmed by:{" "}
                      {c.staff.rp_id
                        ? `${c.staff.rp.first_name} ${c.staff.rp.last_name}`.toUpperCase()
                        : "Staff"}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {statusConfig.showActions && (
              <div className="flex gap-2">
                {c.comp_status === "Pending" && (
                  <>
                    <Button
                      onClick={() => handleActionClick("accept")}
                      disabled={isProcessing}
                      className="bg-green-500 text-white w-32 hover:bg-green-400 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <MdCheckCircle /> Accept
                    </Button>
                    <Button
                      onClick={() => handleActionClick("reject")}
                      disabled={isProcessing}
                      className="bg-red-500 text-white w-32 hover:bg-red-400 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <MdCancel /> Reject
                    </Button>
                  </>
                )}

                {c.comp_status === "Accepted" && (
                  <Button
                    onClick={() => handleActionClick("raise")}
                    disabled={isProcessing}
                    className="bg-blue-500 text-white w-32 hover:bg-blue-400 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <MdTrendingUp /> Raise
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reason Display for Rejected/Cancelled Complaints */}
        {(c.comp_status === "Rejected" || c.comp_status === "Cancelled") && (
          <div className={`mb-4 p-4 rounded-lg ${
            c.comp_status === "Rejected" ? "bg-red-50 border border-red-200" : "bg-gray-50 border border-gray-200"
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${
                c.comp_status === "Rejected" ? "bg-red-100" : "bg-gray-100"
              }`}>
                <MdCancel 
                  size={20} 
                  className={c.comp_status === "Rejected" ? "text-red-500" : "text-gray-500"} 
                />
              </div>
              <div className="flex-1">
                <h3 className={`text-sm font-semibold ${
                  c.comp_status === "Rejected" ? "text-red-800" : "text-gray-800"
                }`}>
                  {c.comp_status === "Rejected" ? "Rejection Reason" : "Cancellation Reason"}
                </h3>
                <p className={`text-sm mt-1 ${
                  c.comp_status === "Rejected" ? "text-red-700" : "text-gray-700"
                }`}>
                  {c.comp_status === "Rejected" 
                    ? c.comp_rejection_reason 
                    : c.comp_cancel_reason
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sub Header */}
        <div className="w-full h-full bg-white rounded-lg mb-4 p-2">
          <div className="pl-5">
            <h1 className="text-lg font-semibold text-gray-800">Allegation</h1>
            <p className="text-sm text-gray-500 ">
              Details about the incident or wrongdoing being reported.
            </p>
          </div>

          <div className="grid grid-cols-3 grid-rows-2 p-4 gap-x-10 gap-y-4">
            {/* box 1 */}
            <div className="bg-blue-500 text-white rounded-lg w-full h-full px-4 py-2">
              <h2 className="text-md font-semibold">Type of Incident</h2>
              <p className="text-xs text-white mb-2">
                Details about the incident or wrongdoing being reported.
              </p>
              <h2 className="text-lg w-full text-center font-semibold">
                {c.comp_incident_type}
              </h2>
            </div>
            {/* box 2 */}
            <div className="bg-gray-100 rounded-lg w-full h-full px-4 py-2">
              <h2 className="text-md font-semibold">Time of incident</h2>
              <p className="text-xs text-gray-500 mb-2">
                The time when the incident occured.
              </p>
              <h2 className="text-lg w-full text-center text-gray-600 font-semibold">
                {new Date(c.comp_datetime).toLocaleString()}
              </h2>
            </div>
            {/* box 3 */}
            <div className="bg-gray-100 rounded-lg w-full h-full px-4 py-2">
              <h2 className="text-md font-semibold">Location of incident</h2>
              <p className="text-xs text-gray-500 mb-2">
                The area or address where the reported event took place.
              </p>
              <h2 className="text-lg w-full text-center text-gray-600 font-semibold">
                {c.comp_location}
              </h2>
            </div>
            {/* row 2 */}
            <div className="bg-gray-100 rounded-lg w-full h-full px-4 py-2 col-span-3">
              <h2 className="text-md font-semibold">Incident Details</h2>
              <p className="text-xs text-gray-500 mb-2">
                A clear description of what happened.
              </p>
              <p className="text-start text-md w-full text-gray-600 font-semibold break-words whitespace-pre-wrap">
                {c.comp_allegation}
              </p>
            </div>
          </div>
        </div>

        {/* Complaint Details */}
        <div className="rounded-lg p-4 bg-white">
          {/* Complainant */}
          <section className="p-4 rounded-lg bg-white">
            <div className="mb-2">
              <h1 className="text-lg font-semibold text-gray-800">
                Complainant
              </h1>
              <p className="text-sm text-gray-500 ">
                Person who lodged or initiated the complaint
              </p>
            </div>
            <div className="space-y-4">
              {c.complainant?.map((person: Complainant, index: number) => (
                <div key={index} className="flex">
                  <div className="bg-blue-500 text-white rounded-lg w-full h-full px-4 py-2 col-span-3">
                    <div className="flex items-start gap-4">
                      <MdAccountCircle className="text-white text-5xl" />
                      <div className="flex flex-col w-full space-y-2">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <h2 className="text-md font-semibold">
                              {person.cpnt_name.toUpperCase()}
                            </h2>
                            {person.rp_id ? (
                              <span className="bg-green-500 text-white rounded-full px-4 py-1 text-xs text-center">
                                Resident
                              </span>
                            ) : (
                              <span className="bg-purple-700 text-white rounded-full px-4 py-1 text-xs text-center">
                                Non-resident
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="text-sm text-white">
                          Age: {person.cpnt_age} yrs. old, Gender:{" "}
                          {person.cpnt_gender}
                        </h3>
                        <h3 className="text-sm text-white">
                          Contact #: {person.cpnt_number}
                        </h3>
                        <h3 className="text-sm text-white">
                          Address: {person.cpnt_address}
                        </h3>
                        <h3 className="text-sm text-white">
                          Relation to Respondent:{" "}
                          {person.cpnt_relation_to_respondent}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Accused */}
          {c.accused?.length > 0 && (
            <section className="p-4">
              <div className="mb-2">
                <h1 className="text-lg font-semibold text-gray-800">
                  Respondent
                </h1>
                <p className="text-sm text-gray-500 ">
                  The person being reported or accused in the incident
                </p>
              </div>
              <div className="space-y-4">
                {c.accused.map((person: Accused, index: number) => (
                  <div key={index} className="flex">
                    <div className="bg-blue-500 text-white rounded-lg w-full h-full px-4 py-2 col-span-3">
                      <div className="flex items-start gap-4">
                        <MdAccountCircle className="text-white text-5xl" />
                        <div className="flex flex-col w-full space-y-2">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <h2 className="text-md font-semibold">
                                {person.acsd_name.toUpperCase()}
                              </h2>
                              <span className="bg-green-500 text-white rounded-full px-4 py-1 text-xs text-center">
                                Resident
                              </span>
                            </div>
                          </div>
                          <h3 className="text-sm text-white">
                            Age: {person.acsd_age} yrs. old, Gender:{" "}
                            {person.acsd_gender}
                          </h3>
                          <h3 className="text-sm text-white">
                            Address: {person.acsd_address}
                          </h3>
                          <h3 className="text-sm text-white">
                            Description: {person.acsd_description}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Supporting Documents */}
          <section className="p-4">
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
              <div className="mb-2">
                <h1 className="text-lg font-semibold text-gray-800">
                  Attached Files
                </h1>
                <p className="text-sm text-gray-500 ">
                  Uploaded photos, files, or proof related to the incident.
                </p>
                <div className="flex flex-col items-center justify-center text-gray-600 italic py-6">
                  <MdInsertDriveFile className="text-4xl mb-2 text-gray-400" />
                  <p>No supporting documents attached</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  };

  return (
    <LayoutWithBack
      title="Blotter Details"
      description="Review and manage complaint record information"
    >
      <div className="flex">
        <div className="flex-1 overflow-auto px-10">{renderContent()}</div>
      </div>

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
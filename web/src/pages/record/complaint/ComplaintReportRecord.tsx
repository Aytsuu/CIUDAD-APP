import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  MapPin,
  Clock,
  Phone,
  FileText,
  Download,
} from "lucide-react";
import {
  MdCheckCircle,
  MdCancel,
  MdTrendingUp,
  MdAccessTimeFilled,
} from "react-icons/md";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/ui/loading";
import { Complainant, Accused, ComplaintFile } from "./complaint-type";
import { useGetComplaintById } from "./api-operations/queries/complaintGetQueries";
import { useUpdateComplaint } from "./api-operations/queries/complaintUpdateQueries";
import { usePostRaiseIssue } from "./api-operations/queries/complaintPostQueries";
import { ComplaintActionModal } from "./ComplaintActionModal";
import { toast } from "sonner"; 

type ActionType = "accept" | "reject" | "raise";

export function ComplaintViewRecord() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);

  // Get data from location state (from table link with state)
  const stateData = location.state?.complaint;

  // Get data from URL params (from notification)
  const urlDataParam = searchParams.get("data");
  const urlData = urlDataParam ? JSON.parse(urlDataParam) : null;

  // Method 3: Fallback - Get ID for API fetch if no data provided
  const complaintId = searchParams.get("id");

  // Determine which data source to use
  const hasDirectData = stateData || urlData;
  const complaintDataDirect = stateData || urlData;

  // Only fetch from API if no direct data is available
  const {
    data: fetchedData,
    isLoading,
    isError,
    refetch,
  } = useGetComplaintById(complaintId ?? "");

  // Use direct data if available, otherwise use fetched data
  const complaintData = complaintDataDirect || fetchedData;

  // Mutation hooks
  const updateComplaintMutation = useUpdateComplaint();
  const raiseIssueMutation = usePostRaiseIssue();

  // Handle action button clicks
  const handleActionClick = (action: ActionType) => {
    setCurrentAction(action);
    setIsModalOpen(true);
  };

  // Handle modal confirmation
  const handleConfirmAction = async (reason?: string) => {
    if (!complaintData?.comp_id) {
      toast.error("Invalid complaint ID");
      return;
    }

    try {
      const compId = Number(complaintData.comp_id);

      // Handle different actions with appropriate API calls
      switch (currentAction) {
        case "accept":
          await updateComplaintMutation.mutateAsync({
            compId: compId,
            payload: {
              comp_status: "Accepted",
            },
          });
          toast.success("Complaint accepted successfully");
          navigate("/complaint")
          break;

        case "reject":
          if (!reason) {
            toast.error("Rejection reason is required");
            return;
          }
          await updateComplaintMutation.mutateAsync({
            compId: compId,
            payload: {
              comp_status: "Rejected",
              rejection_reason: reason,
            },
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
      console.error("Error processing action:", error);
      toast.error(
        `Failed to ${currentAction} complaint. Please try again.`
      );
    }
  };

  // Determine if any mutation is pending
  const isProcessing = 
    updateComplaintMutation.isPending || raiseIssueMutation.isPending;

  // Loading state - this only shows if actually fetching
  if (isLoading && !hasDirectData) {
    return (
      <LayoutWithBack
        title="Complaint Details"
        description="Review and manage complaint record information"
      >
        <div className="flex items-center justify-center h-64 space-x-4">
          <Loading /> <span>Loading Data...</span>
        </div>
      </LayoutWithBack>
    );
  }

  // Error or no data
  if (!complaintData || (isError && !hasDirectData)) {
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

  const renderContent = () => {
    return (
      <div className="">
        {/* Header */}
        <div className="flex mb-4 bg-white w-full h-24 rounded-lg">
          <div className="flex justify-between items-center w-full p-4">
            {/* Left section */}
            <div className="flex items-center gap-4">
              {complaintData.comp_status === "Pending" && (
                <div className="flex bg-orange-100 rounded-lg w-9 h-9 justify-center items-center">
                  <MdAccessTimeFilled size={24} className="text-red-500" />
                </div>
              )}

              {complaintData.comp_status === "Raised" && (
                <div className="flex bg-blue-100 rounded-lg w-9 h-9 justify-center items-center">
                  <MdTrendingUp size={24} className="text-blue-500" />
                </div>
              )}

              {complaintData.comp_status === "Accepted" && (
                <div className="flex bg-green-100 rounded-lg w-9 h-9 justify-center items-center animate-bump">
                  <MdCheckCircle size={24} className="text-green-500" />
                </div>
              )}

              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  {complaintData.comp_status} Request
                </h1>
                <p className="text-sm text-gray-500">
                  {complaintData.comp_status === "Pending" &&
                    "Blotter request awaiting review"}
                  {complaintData.comp_status === "Raised" &&
                    "Complaint undergoing process"}
                  {complaintData.comp_status === "Accepted" && (
                    <div>
                      <p>Blotter has been accepted</p>
                      <p>Confirmed by: {complaintData.staff} </p>
                    </div>
                  )}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {complaintData.comp_status === "Pending" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleActionClick("accept")}
                  disabled={isProcessing}
                  className="bg-green-500 text-white px-4 py-1 rounded-md w-32 hover:bg-green-400 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MdCheckCircle /> Accept
                </Button>
                <Button
                  onClick={() => handleActionClick("reject")}
                  disabled={isProcessing}
                  className="bg-red-500 text-white px-4 py-1 rounded-md w-32 hover:bg-red-400 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MdCancel /> Reject
                </Button>
              </div>
            )}
            {complaintData.comp_status === "Accepted" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleActionClick("raise")}
                  disabled={isProcessing}
                  className="bg-blue-500 text-white px-4 py-1 rounded-md w-32 hover:bg-blue-400 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MdTrendingUp /> Raise
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Complaint Details */}
        <div className="rounded-lg p-4 bg-white">
          {/* Allegation */}
          <section className="p-4">
            <h2 className="font-semibold text-[20px] text-gray-500">
              Allegation
            </h2>
            <p className="text-gray-600 text-sm mb-4">Case details</p>
            <Card>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Incident Type
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {complaintData.comp_incident_type}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Date & Time
                    </p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(complaintData.comp_datetime).toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">
                      Filed On
                    </p>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {new Date(
                        complaintData.comp_created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-gray-900 flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    {complaintData.comp_location}
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-500">
                    Allegation Details
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-gray-800 leading-relaxed">
                      {complaintData.comp_allegation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Complainant Section */}
          <section className="p-4 rounded-lg bg-white">
            <h2 className="font-semibold text-[20px] text-gray-500 mb-4">
              Complainant
            </h2>
            <Card>
              <CardContent className="space-y-6">
                {complaintData.complainant.map(
                  (person: Complainant, index: number) => (
                    <div key={person.cpnt_id || index}>
                      {index > 0 && <Separator />}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">
                              Name
                            </p>
                            <p className="text-gray-900 flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              {person.cpnt_name.toUpperCase()}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">
                              Age
                            </p>
                            <p className="text-gray-900 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {person.cpnt_age}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">
                              Gender
                            </p>
                            <p className="text-gray-900 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {person.cpnt_gender.toUpperCase()}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">
                              Contact Number
                            </p>
                            <p className="text-gray-900 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              {person.cpnt_number}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-500">
                            Address
                          </p>
                          <p className="text-gray-900 flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                            {/* {person.cpnt_address || "N/A"} */}
                          </p>
                        </div>

                        {person.cpnt_relation_to_respondent && (
                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">
                              Relationship to Respondent
                            </p>
                            <p className="text-gray-600 font-medium">
                              {person.cpnt_relation_to_respondent.toUpperCase()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </section>

          {/* Accused Section */}
          {complaintData.accused?.length > 0 && (
            <section className="p-4">
              <h2 className="font-semibold text-[20px] text-gray-500 mb-4">
                Accused
              </h2>
              <Card>
                <CardContent className="space-y-6">
                  {complaintData.accused.map(
                    (person: Accused, index: number) => (
                      <div key={person.acsd_id || index}>
                        {index > 0 && <Separator />}
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {person.acsd_name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {person.acsd_age} years old, {person.acsd_gender}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-500">
                              Address
                            </p>
                            <p className="text-gray-900 flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                              {/* {person.acsd_address || "N/A"} */}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">
                              Description
                            </p>
                            <p className="text-gray-800 leading-relaxed">
                              {person.acsd_description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          {/* Supporting Documents */}
          {complaintData.complaint_files?.length > 0 && (
            <section className="p-4">
              <h2 className="font-semibold text-[20px] text-gray-500">
                Supporting Documents
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Attached files and evidence
              </p>
              <Card>
                <CardContent className="space-y-4">
                  {complaintData.complaint_files.map(
                    (doc: ComplaintFile, index: number) => (
                      <div key={doc.comp_file_id || index}>
                        {index > 0 && <Separator />}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div className="space-y-1">
                              <h3 className="text-base font-semibold text-gray-900">
                                {doc.comp_file_name}
                              </h3>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span>{doc.comp_file_type}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() =>
                              window.open(doc.comp_file_url, "_blank")
                            }
                          >
                            <Download className="w-4 h-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </div>
    );
  };

  return (
    <LayoutWithBack
      title="Complaint Details"
      description="Review and manage complaint record information"
    >
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 overflow-auto px-10">{renderContent()}</div>
      </div>

      {/* Action Modal */}
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
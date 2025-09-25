import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { useLocation } from "react-router-dom";
import { Complaint } from "./complaint-type";
import {
  AlertTriangle,
  FileText,
  Download,
  Eye,
  Shield,
  FileWarning,
  User,
  Calendar,
  FileX,
  Hash,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import {
  archiveComplaint,
  raiseIssue,
} from "./api-operations/restful-api/complaint-api";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { Badge } from "@/components/ui/badge";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export function ComplaintViewRecord() {
  const { state } = useLocation();
  const { user } = useAuth();
  const complaintData = state?.complaint as Complaint;
  const [isRaiseIssueDialogOpen, setIsRaiseIssueDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    complainants: true,
    accused: true,
    documents: true,
  });
  const { send } = useNotifications();
  const [complaintStatus, setComplaintStatus] = useState({
    isArchived: complaintData?.comp_is_archive || false,
    isRaised: complaintData?.comp_status === "Raised",
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRaiseIssue = async () => {
    setIsSubmitting(true);
    try {
      const response = await raiseIssue(complaintData.comp_id);
      if (response) {
        await handleSendAlert(response.data.sr_id);
        await archiveComplaint(complaintData.comp_id.toString());
        setComplaintStatus((prev) => ({
          ...prev,
          isRaised: true,
          isArchived: true,
        }));
        toast.success("Issue raised successfully", {
          description: `Service Request ${response.data.sr_id} created for Complaint ID: ${complaintData.comp_id}`,
        });
      }
    } catch (error: any) {
      toast.error("Failed to raise issue", {
        description: error.response?.data?.error || "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
      setIsRaiseIssueDialogOpen(false);
    }
  };

  const handleSendAlert = async (sr_id: string) => {
    try {
      await send({
        title: "Service Request Created",
        message: `Service Request ${sr_id} has been created for Complaint ${complaintData.comp_id}`,
        recipient_ids: [user?.acc_id || ""],
        metadata: {
          action_url: "/service-requests",
          sender_name: "Complaint System",
          sender_avatar: user?.profile_image || "",
        },
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const getStatusDisplay = () => {
    if (complaintStatus.isRaised) {
      return {
        text: "Raised",
        variant: "destructive" as const,
        icon: <AlertTriangle className="w-3 h-3" />,
      };
    } else if (complaintStatus.isArchived) {
      return {
        text: "Archived",
        variant: "secondary" as const,
        icon: <FileWarning className="w-3 h-3" />,
      };
    } else {
      return {
        text: complaintData?.comp_status || "Active",
        variant: "default" as const,
        icon: <Shield className="w-3 h-3" />,
      };
    }
  };

  if (!complaintData) {
    return (
      <LayoutWithBack
        title="Complaint Not Found"
        description="The requested complaint record could not be located"
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Complaint Data Available
            </h3>
            <p className="text-gray-600 mb-6">
              The complaint record you're looking for could not be found or may have been removed.
            </p>
            <Button variant="outline">Return to Complaints List</Button>
          </div>
        </div>
      </LayoutWithBack>
    );
  }

  const statusDisplay = getStatusDisplay();
  const formattedDate = complaintData.comp_datetime
    ? new Date(complaintData.comp_datetime).toLocaleString()
    : "Not specified";
  const formattedCreatedAt = complaintData.comp_created_at
    ? new Date(complaintData.comp_created_at).toLocaleDateString()
    : "Not available";

  return (
    <LayoutWithBack
      title={`Complaint Details`}
      description={`Review and manage complaint record information`}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* General Information Section */}
        <div className="bg-white rounded-lg border">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <button
                onClick={() => toggleSection('general')}
                className="flex items-center gap-2 text-left"
              >
                <h2 className="text-xl font-semibold text-gray-900 underline">
                  General Information
                </h2>
                {expandedSections.general ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <p className="text-sm text-gray-600 mt-1">
                Basic complaint details and status information
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={statusDisplay.variant} className="text-sm flex items-center gap-1.5">
                {statusDisplay.icon}
                {statusDisplay.text}
              </Badge>
              {!complaintStatus.isRaised && (
                <DialogLayout
                  isOpen={isRaiseIssueDialogOpen}
                  onOpenChange={setIsRaiseIssueDialogOpen}
                  trigger={
                    <Button variant="destructive" size="sm" disabled={isSubmitting}>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Raise Issue
                    </Button>
                  }
                  title="Create Service Request"
                  description="This will create a service request and archive the complaint."
                  mainContent={
                    <>
                      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-amber-800">Complaint Summary</p>
                            <div className="text-sm text-amber-700 space-y-1">
                              <p><span className="font-medium">ID:</span> {complaintData.comp_id}</p>
                              <p><span className="font-medium">Type:</span> {complaintData.comp_incident_type}</p>
                              <p><span className="font-medium">Location:</span> {complaintData.comp_location || "Not specified"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={() => setIsRaiseIssueDialogOpen(false)} disabled={isSubmitting}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleRaiseIssue} disabled={isSubmitting}>
                          {isSubmitting ? "Creating..." : "Create Service Request"}
                        </Button>
                      </div>
                    </>
                  }
                />
              )}
            </div>
          </div>

          {expandedSections.general && (
            <div className="p-6">
              {/* Three-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Identification */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Hash className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base font-semibold text-gray-900">Identification</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">COMPLAINT ID</p>
                      <p className="text-lg font-semibold text-gray-900">#{complaintData.comp_id}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">INCIDENT TYPE</p>
                      <p className="text-gray-900 font-medium">{complaintData.comp_incident_type || "Not specified"}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">LOCATION</p>
                      <p className="text-gray-900">{complaintData.comp_location || "Not specified"}</p>
                    </div>
                  </div>
                </div>

                {/* Classification */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base font-semibold text-gray-900">Classification</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">STATUS</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusDisplay.variant} className="text-sm flex items-center gap-1.5">
                          {statusDisplay.icon}
                          {statusDisplay.text}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">COMPLAINANTS</p>
                      <p className="text-2xl font-bold text-blue-600">{complaintData.complainant?.length || 0}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">ACCUSED PERSONS</p>
                      <p className="text-2xl font-bold text-red-600">{complaintData.accused?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Registration */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h3 className="text-base font-semibold text-gray-900">Registration</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">DATE FILED</p>
                      <p className="text-gray-900 font-medium">{formattedCreatedAt}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-gray-500 mb-1">INCIDENT DATE</p>
                      <p className="text-gray-900">{formattedDate}</p>
                    </div>
                    {complaintData.staff && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-500 mb-1">ASSIGNED STAFF</p>
                        <p className="text-gray-900 font-medium">{complaintData.staff.staff_name}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {complaintData.staff.staff_position}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Allegation Details - Full Width */}
              <div className="mt-8">
                <h3 className="text-base font-semibold text-gray-900 mb-4">Allegation Details</h3>
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {complaintData.comp_allegation || "No detailed description provided for this complaint."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Complainants Section */}
        {complaintData.complainant && complaintData.complainant.length > 0 && (
          <div className="bg-white rounded-lg border">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <button
                  onClick={() => toggleSection('complainants')}
                  className="flex items-center gap-2 text-left"
                >
                  <h2 className="text-xl font-semibold text-gray-900 underline">
                    Complainants
                  </h2>
                  {expandedSections.complainants ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                <p className="text-sm text-gray-600 mt-1">
                  A comprehensive list of all complainants in this case, including their details.
                </p>
              </div>
            </div>

            {expandedSections.complainants && (
              <div className="p-6">
                <div className="space-y-4">
                  {complaintData.complainant.map((person, index) => (
                    <div key={person.cpnt_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-blue-100 w-10 h-10 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {person.cpnt_name || "Unknown"}
                            </h4>
                            <p className="text-sm text-gray-600">Complainant {index + 1}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-3 rounded">
                          <p className="text-sm font-medium text-gray-500 mb-1">AGE</p>
                          <p className="text-gray-900 font-medium">{person.cpnt_age || "N/A"}</p>
                        </div>
                        <div className="bg-white p-3 rounded">
                          <p className="text-sm font-medium text-gray-500 mb-1">GENDER</p>
                          <p className="text-gray-900 font-medium">{person.cpnt_gender || "N/A"}</p>
                        </div>
                        {person.cpnt_number && (
                          <div className="bg-white p-3 rounded">
                            <p className="text-sm font-medium text-gray-500 mb-1">CONTACT</p>
                            <p className="text-gray-900 font-medium">{person.cpnt_number}</p>
                          </div>
                        )}
                        {person.cpnt_relation_to_respondent && (
                          <div className="bg-white p-3 rounded">
                            <p className="text-sm font-medium text-gray-500 mb-1">RELATION</p>
                            <p className="text-gray-900 font-medium">{person.cpnt_relation_to_respondent}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <div className="bg-white p-3 rounded">
                          <p className="text-sm font-medium text-gray-500 mb-1">ADDRESS</p>
                          {/* <p className="text-gray-900">{ || "Not provided"}</p> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Accused Persons Section */}
        {complaintData.accused && complaintData.accused.length > 0 && (
          <div className="bg-white rounded-lg border">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <button
                  onClick={() => toggleSection('accused')}
                  className="flex items-center gap-2 text-left"
                >
                  <h2 className="text-xl font-semibold text-gray-900 underline">
                    Accused Persons
                  </h2>
                  {expandedSections.accused ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                <p className="text-sm text-gray-600 mt-1">
                  A comprehensive list of all accused persons in this case, including their details.
                </p>
              </div>
            </div>

            {expandedSections.accused && (
              <div className="p-6">
                <div className="space-y-4">
                  {complaintData.accused.map((person, index) => (
                    <div key={person.acsd_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-red-100 w-10 h-10 flex items-center justify-center">
                            <User className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {person.acsd_name || "Unknown"}
                            </h4>
                            <p className="text-sm text-gray-600">Accused Person {index + 1}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-white p-3 rounded">
                          <p className="text-sm font-medium text-gray-500 mb-1">AGE</p>
                          <p className="text-gray-900 font-medium">{person.acsd_age || "N/A"}</p>
                        </div>
                        <div className="bg-white p-3 rounded">
                          <p className="text-sm font-medium text-gray-500 mb-1">GENDER</p>
                          <p className="text-gray-900 font-medium">{person.acsd_gender || "N/A"}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-white p-3 rounded">
                          <p className="text-sm font-medium text-gray-500 mb-1">ADDRESS</p>
                          {/* <p className="text-gray-900">{person?.address?.add_barangay || "Not provided"}</p> */}
                        </div>
                        {person.acsd_description && (
                          <div className="bg-white p-3 rounded">
                            <p className="text-sm font-medium text-gray-500 mb-1">DESCRIPTION</p>
                            <p className="text-gray-900 leading-relaxed">{person.acsd_description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Section */}
        <div className="bg-white rounded-lg border">
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <button
                onClick={() => toggleSection('documents')}
                className="flex items-center gap-2 text-left"
              >
                <h2 className="text-xl font-semibold text-gray-900 underline">
                  Supporting Documents
                </h2>
                {expandedSections.documents ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <p className="text-sm text-gray-600 mt-1">
                All documents and evidence submitted with this complaint.
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {complaintData?.comp_file?.length || 0} files
            </Badge>
          </div>

          {expandedSections.documents && (
            <div className="p-6">
              {!complaintData?.comp_file || complaintData.comp_file.length === 0 ? (
                <div className="text-center py-12">
                  <div className="rounded-full bg-gray-100 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FileX className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">No Documents</h3>
                  <p className="text-sm text-gray-500">No supporting documents were uploaded with this complaint</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {complaintData.comp_file.map((file: any, index: number) => (
                    <div
                      key={file.comp_file_id || index}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="rounded-lg p-3">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate text-lg">
                          {file.comp_file_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {file.comp_file_type} • {new Date(file.created_at || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confidentiality Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-2">
                Confidential Information
              </p>
              <p className="text-sm text-amber-700">
                All information contained in this complaint record is confidential and protected. 
                Access is restricted to authorized personnel only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}
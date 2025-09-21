import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { useLocation } from "react-router-dom";
import { Complaint } from "./complaint-type";
import {
  AlertTriangle,
  FolderOpen,
  FileText,
  Download,
  Eye,
  Shield,
  FileWarning,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

export function ComplaintViewRecord() {
  const { state } = useLocation();
  const { user } = useAuth();
  const complaintData = state?.complaint as Complaint;
  const [isRaiseIssueDialogOpen, setIsRaiseIssueDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { send } = useNotifications();
  const [complaintStatus, setComplaintStatus] = useState({
    isArchived: complaintData?.comp_is_archive || false,
    isRaised: complaintData?.comp_status === "Raised",
  });

  const handleRaiseIssue = async () => {
    setIsSubmitting(true);
    try {
      console.log("Raising issue for comp_id:", complaintData.comp_id);

      const response = await raiseIssue(complaintData.comp_id);

      if (response) {
        await handleSendAlert(response.sr_id);
        await archiveComplaint(complaintData.comp_id.toString());

        setComplaintStatus((prev) => ({
          ...prev,
          isRaised: true,
          isArchived: true,
        }));

        toast.success("Issue raised successfully", {
          description: `Service Request ${response.sr_id} created for Complaint ID: ${complaintData.comp_id}`,
          action: {
            label: "View SR",
            onClick: () => console.log("View SR action clicked"),
          },
        });
      }
    } catch (error: any) {
      console.error("Error raising issue:", error);
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

  const formatAddress = (address: any) => {
    if (!address) return "Not provided";
    const parts = [
      address.add_street,
      address.add_barangay,
      address.add_city,
      address.add_province,
    ].filter(Boolean);
    return parts.join(", ") || "Address not specified";
  };

  const formatPersonAddress = (person: any) => {
    if (person.cpnt_address) return person.cpnt_address;
    if (person.acsd_address) return person.acsd_address;
    if (person.add) return formatAddress(person.add);
    return "Not provided";
  };

  const renderDocumentsSection = () => {
    const files = complaintData?.comp_file || [];

    if (files.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">
              Supporting Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No documents uploaded</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-900">
            Supporting Documents ({files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {files.map((file: any, index: number) => (
              <div
                key={file.comp_file_id || index}
                className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50"
              >
                <FileText className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {file.comp_file_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {file.comp_file_type} •{" "}
                    {new Date(
                      file.created_at || Date.now()
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!complaintData) {
    return (
      <LayoutWithBack
        title="Complaint Not Found"
        description="The requested complaint record could not be located"
      >
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md">
            <div className="p-4 rounded-full bg-red-50 w-fit mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Complaint Data Available
            </h3>
            <p className="text-gray-600 mb-6">
              The complaint record you're looking for could not be found or may
              have been removed.
            </p>
            <Button variant="outline" size="sm">
              Return to Complaints List
            </Button>
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
    ? new Date(complaintData.comp_created_at).toLocaleString()
    : "Not available";

  const headerActions = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <Badge
        variant={statusDisplay.variant}
        className="text-sm flex items-center gap-1.5"
      >
        {statusDisplay.icon}
        {statusDisplay.text}
      </Badge>

      {!complaintStatus.isRaised && (
        <DialogLayout
          isOpen={isRaiseIssueDialogOpen}
          onOpenChange={setIsRaiseIssueDialogOpen}
          trigger={
            <Button
              variant="destructive"
              size="sm"
              disabled={complaintStatus.isRaised || isSubmitting}
              className="w-full sm:w-auto"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {complaintStatus.isRaised ? "Issue Raised" : "Raise Issue"}
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
                    <p className="text-sm font-medium text-amber-800">
                      Complaint Summary
                    </p>
                    <div className="text-sm text-amber-700 space-y-1">
                      <p>
                        <span className="font-medium">ID:</span>{" "}
                        {complaintData.comp_id}
                      </p>
                      <p>
                        <span className="font-medium">Type:</span>{" "}
                        {complaintData.comp_incident_type}
                      </p>
                      <p>
                        <span className="font-medium">Location:</span>{" "}
                        {complaintData.comp_location || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsRaiseIssueDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRaiseIssue}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Service Request"}
                </Button>
              </div>
            </>
          }
        />
      )}
    </div>
  );

  return (
    <LayoutWithBack
      title={"Complaint Details"}
      description={`Review and manage complaint record #${complaintData.comp_id}`}
    >
      <div className="space-y-6">
        {/* Main Content - Single Column */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Case Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Case Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {complaintData.complainant?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Complainants</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {complaintData.accused?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Accused</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {complaintData.comp_file?.length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Incident Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">
                Incident Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Incident Type
                  </p>
                  <p className="text-gray-900">
                    {complaintData.comp_incident_type || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    Date & Time
                  </p>
                  <p className="text-gray-900">{formattedDate}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Location
                </p>
                <p className="text-gray-900">
                  {complaintData.comp_location || "Location not specified"}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">
                  Allegation Details
                </p>
                <div className="p-3 bg-gray-50 rounded border">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                    {complaintData.comp_allegation ||
                      "No detailed description provided for this complaint."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Complainants Section */}
          {complaintData.complainant &&
            complaintData.complainant.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    Complainants ({complaintData.complainant.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {complaintData.complainant.map((person) => (
                    <div key={person.cpnt_id} className="p-4 border rounded">
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">
                          {person.cpnt_name || "Unknown"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Age & Gender</p>
                            <p className="text-gray-900">
                              {person.cpnt_age || "N/A"} years,{" "}
                              {person.cpnt_gender || "N/A"}
                            </p>
                          </div>
                          {person.cpnt_number && (
                            <div>
                              <p className="text-gray-500">Contact</p>
                              <p className="text-gray-900">
                                {person.cpnt_number}
                              </p>
                            </div>
                          )}
                        </div>
                        {person.cpnt_relation_to_respondent && (
                          <div className="text-sm">
                            <p className="text-gray-500">
                              Relation to Respondent
                            </p>
                            <p className="text-gray-900">
                              {person.cpnt_relation_to_respondent}
                            </p>
                          </div>
                        )}
                        <div className="text-sm">
                          <p className="text-gray-500">Address</p>
                          <p className="text-gray-900">
                            {formatPersonAddress(person)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          {/* Accused Persons Section */}
          {complaintData.accused &&
            complaintData.accused.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    Accused Persons ({complaintData.accused.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {complaintData.accused.map((person) => (
                    <div key={person.acsd_id} className="p-4 border rounded">
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">
                          {person.acsd_name || "Unknown"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Age & Gender</p>
                            <p className="text-gray-900">
                              {person.acsd_age || "N/A"} years,{" "}
                              {person.acsd_gender || "N/A"}
                            </p>
                          </div>
                        </div>
                        {person.acsd_description && (
                          <div className="text-sm">
                            <p className="text-gray-500">Description</p>
                            <p className="text-gray-900">
                              {person.acsd_description}
                            </p>
                          </div>
                        )}
                        <div className="text-sm">
                          <p className="text-gray-500">Address</p>
                          <p className="text-gray-900">
                            {formatPersonAddress(person)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          {/* Documents Section */}
          {renderDocumentsSection()}

          {/* Staff Information */}
          {complaintData.staff && (
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900">Assigned Staff</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {complaintData.staff.staff_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {complaintData.staff.staff_position}
                  </p>
                  <p className="text-sm text-gray-600">
                    {complaintData.staff.staff_department}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confidentiality Notice */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              All information contained in this complaint record is confidential
              and protected. Access is restricted to authorized personnel only.
            </p>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}

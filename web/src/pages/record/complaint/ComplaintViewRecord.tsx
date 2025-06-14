import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { BsChevronLeft } from "react-icons/bs";
import { Link, useLocation } from "react-router-dom";
import { ComplaintRecord } from "./complaint-type";
import { 
  FileText, 
  User, 
  Users, 
  AlertTriangle, 
  FolderOpen,
  Calendar,
  MapPin,
  Hash,
  Clock,
  Archive
} from "lucide-react";
import { toast } from "sonner";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { archiveComplaint } from "./restful-api/complaint-api";

export function ComplaintViewRecord() {
  const { state } = useLocation();
  const complaintData = state?.complaint as ComplaintRecord;
  const [isRaiseIssueDialogOpen, setIsRaiseIssueDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [complaintStatus, setComplaintStatus] = useState({
    isArchived: complaintData?.comp_is_archive || false,
    isRaised: false // Track if issue has been raised
  });

  const handleRaiseIssue = async () => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the status to show that issue has been raised
      setComplaintStatus(prev => ({ ...prev, isRaised: true }));

      toast.success("Issue raised successfully", {
        description: `Complaint ID: ${complaintData.comp_id}`,
        action: {
          label: "View",
          onClick: () => console.log("View action clicked"),
        },
      });
    } catch (error) {
      toast.error("Failed to raise issue", {
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
      setIsRaiseIssueDialogOpen(false);
    }
  };

  // Update the handleMoveToArchive function in ComplaintViewRecord
const handleMoveToArchive = async () => {
  setIsArchiving(true);
  try {
    // Call the API to archive the complaint
    await archiveComplaint(complaintData.comp_id.toString());
    
    // Update the status to show that complaint has been archived
    setComplaintStatus(prev => ({ ...prev, isArchived: true }));

    toast.success("Complaint moved to archive successfully", {
      description: `Complaint ID: ${complaintData.comp_id}`,
      action: {
        label: "View Archives",
        onClick: () => console.log("View archives clicked"),
      },
    });
  } catch (error: any) {
    console.error('Archive error:', error);
    toast.error("Failed to move to archive", {
      description: error.response?.data?.message || "Please try again later",
    });
  } finally {
    setIsArchiving(false);
    setIsArchiveDialogOpen(false);
  }
};

  // Function to get the current status display
  const getStatusDisplay = () => {
    if (complaintStatus.isArchived) {
      return { text: 'Archived', class: 'bg-gray-100 text-gray-700' };
    } else if (complaintStatus.isRaised) {
      return { text: 'Raised', class: 'bg-orange-100 text-orange-700' };
    } else {
      return { text: 'Active', class: 'bg-green-100 text-green-700' };
    }
  };

  if (!complaintData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-gray-500">No complaint data available</p>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay();

  return (
    <div className="w-full h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="flex flex-row mb-4 sm:mb-0">
          <div className="flex items-center mr-4">
            <Button className="text-black p-2 self-start" variant="outline">
              <Link to="/blotter-record">
                <BsChevronLeft />
              </Link>
            </Button>
          </div>
          <div>
           <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-darkBlue2" />
            <h1 className="font-semibold text-l sm:text-2xl text-darkBlue2">
              Complaint Record Details
            </h1>
            <span
              className={`px-2 py-1 rounded text-xs ${statusDisplay.class}`}
            >
              {statusDisplay.text}
            </span>
          </div>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3 text-darkGray" />
              <p className="text-xs sm:text-sm text-darkGray">
                Date & Time Filed:{" "}
                  {complaintData.comp_created_at
                  ? new Date(complaintData.comp_created_at).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Hash className="w-3 h-3 text-darkGray" />
              <p className="text-xs sm:text-sm text-darkGray">
                Case No: {complaintData.comp_id || "N/A"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          {/* Move to Archive Button */}
          {!complaintStatus.isArchived && (
            <DialogLayout
              isOpen={isArchiveDialogOpen}
              onOpenChange={(open) => setIsArchiveDialogOpen(open)}
              trigger={
                <Button 
                  className=""
                  disabled={isArchiving}
                >
                  <Archive className="w-4 h-4" />
                  {isArchiving ? "Archiving..." : "Archive"}
                </Button>
              }
              title="Confirm Archive Action"
              description="Are you sure you want to move this complaint to the archive?"
              mainContent={
                <>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Complaint ID:{" "}
                      <span className="font-medium">{complaintData.comp_id}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      This action will move the complaint to the archive section.
                      Archived complaints can still be viewed but are no longer active.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setIsArchiveDialogOpen(false)}
                      disabled={isArchiving}
                    >
                      Cancel
                    </Button>
                    <Button
                      // className="bg-gray-600 hover:bg-gray-700"
                      onClick={handleMoveToArchive}
                      disabled={isArchiving}
                    >
                      {isArchiving ? "Processing..." : "Move to Archive"}
                    </Button>
                  </div>
                </>
              }
            />
          )}

          {/* Raise Issue Button */}
          <DialogLayout
            isOpen={isRaiseIssueDialogOpen}
            onOpenChange={(open) => setIsRaiseIssueDialogOpen(open)}
            trigger={
              <Button 
                className={`${
                  complaintStatus.isRaised 
                    ? "bg-orange-600 hover:bg-orange-700 cursor-not-allowed" 
                    : "bg-red-600 hover:bg-red-700"
                }`}
                disabled={complaintStatus.isRaised || isSubmitting}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {complaintStatus.isRaised ? "Raised" : "Raise Issue"}
              </Button>
            }
            title="Confirm Issue Raising"
            description="Are you sure you want to raise an issue for this complaint report?"
            mainContent={
              <>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Complaint ID:{" "}
                    <span className="font-medium">{complaintData.comp_id}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    This action will notify the concerned authorities about
                    unresolved issues.
                  </p>
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
                    className="bg-red-600 hover:bg-red-700"
                    onClick={handleRaiseIssue}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Confirm"}
                  </Button>
                </div>
              </>
            }
          />
        </div>
      </div>

      <hr className="border-gray mb-6 sm:mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Complainant Card */}
        <div className="border rounded-md p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-darkBlue2" />
            <h3 className="font-medium text-lg text-darkBlue2">
              Complainant
            </h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-darkGray">Full Name</p>
              <p className="text-base">{complaintData.cpnt?.cpnt_name || "N/A"}</p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-darkGray" />
                <p className="text-sm text-darkGray">Address</p>
              </div>
              <p className="text-base">
                {complaintData.cpnt?.add ? 
                  `${complaintData.cpnt.add.add_street || ''} ${complaintData.cpnt.add.add_barangay}, ${complaintData.cpnt.add.add_city}, ${complaintData.cpnt.add.add_province}`.trim()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Accused Card(s) */}
        <div className="border rounded-md p-4 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-darkBlue2" />
            <h3 className="font-medium text-lg text-darkBlue2">
              Accused Person{complaintData.accused_persons?.length > 1 ? 's' : ''}
            </h3>
          </div>
          
          {/* Scrollable container for accused persons */}
          <div className={`space-y-4 ${
            complaintData.accused_persons && complaintData.accused_persons.length > 2 
              ? 'max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100' 
              : ''
          }`}>
            {complaintData.accused_persons && complaintData.accused_persons.length > 0 ? (
              complaintData.accused_persons.map((accused, index) => (
                <div key={accused.acsd_id} className="space-y-3 pb-4">
                  {index > 0 && <hr className="border-gray-200 mb-4" />}
                  <div>
                    <p className="text-sm text-darkGray">
                      Full Name {complaintData.accused_persons.length > 1 ? `(${index + 1})` : ''}
                    </p>
                    <p className="text-base font-medium">{accused.acsd_name || "N/A"}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-darkGray" />
                      <p className="text-sm text-darkGray">Address</p>
                    </div>
                    <p className="text-base">
                      {accused.add ? 
                        `${accused.add.add_street || ''} ${accused.add.add_barangay}, ${accused.add.add_city}, ${accused.add.add_province}`.trim()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No accused persons listed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Incident Details */}
      <div className="border rounded-md p-4 bg-white mb-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-darkBlue2" />
          <h2 className="font-medium text-lg text-darkBlue2">
            Incident Details
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-darkGray">Category</p>
            <p className="text-base font-medium">{complaintData.comp_incident_type || "N/A"}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-darkGray" />
              <p className="text-sm text-darkGray">Date of Incident</p>
            </div>
            <p className="text-base">
              {complaintData.comp_datetime
                ? new Date(complaintData.comp_datetime).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-darkGray mb-2">Incident Description</p>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-base whitespace-pre-line leading-relaxed">
              {complaintData.comp_allegation || "No description provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Supporting Documents Section */}
      <div className="border rounded-md p-4 bg-white mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="w-5 h-5 text-darkBlue2" />
          <h2 className="font-medium text-lg text-darkBlue2">
            Supporting Documents
          </h2>
        </div>
        
        {complaintData.complaint_files && complaintData.complaint_files.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {complaintData.complaint_files.map((file, index) => {
              const fileUrl = file.file.url || file.file.file_path || "#";
              const fileName = file.file.file_name || `Document ${index + 1}`;
              const fileType = file.file.file_type || "application/octet-stream";

              return (
                <div
                  key={file.cf_id}
                  className="border rounded-md p-2 flex flex-col hover:shadow-md transition-shadow"
                >
                  {fileType.startsWith("images/") ? (
                    <img
                      src={fileUrl}
                      alt={fileName}
                      className="w-full h-40 object-cover mb-2 rounded-md"
                      onError={(e) => {
                        console.error("Failed to load image:", fileUrl);
                        e.currentTarget.src = "/fallback-image.jpg";
                      }}
                    />
                  ) : fileType.startsWith("video/") ? (
                    <div className="relative w-full h-40 mb-2">
                      <video
                        controls
                        className="w-full h-full object-cover rounded-md"
                        poster="/video-thumbnail.jpg"
                      >
                        <source src={fileUrl} type={fileType} />
                        Your browser does not support videos
                      </video>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-40 bg-gray-100 mb-2 rounded-md hover:bg-gray-200 transition-colors">
                      <FileText className="w-12 h-12 text-gray-400" />
                      <span className="mt-2 text-xs text-gray-500">
                        Document
                      </span>
                    </div>
                  )}
                  <p className="text-xs truncate px-2 text-center font-medium">
                    {fileName}
                  </p>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-700 hover:underline mt-1 text-center transition-colors"
                  >
                    Open Fullscreen
                  </a>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No supporting documents attached</p>
            <p className="text-gray-400 text-sm mt-1">Documents will appear here when available</p>
          </div>
        )}
      </div>
    </div>
  );
}
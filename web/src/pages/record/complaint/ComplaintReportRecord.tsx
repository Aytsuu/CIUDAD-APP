import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { BsChevronLeft } from "react-icons/bs";
import { Link, useLocation } from "react-router-dom";
import { Complaint } from "./complaint-type";
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
  Play,
} from "lucide-react";
import { toast } from "sonner";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { archiveComplaint } from "./restful-api/complaint-api";
import { useAuth } from "@/context/AuthContext";
import { raiseIssue } from "./restful-api/complaint-api";
import { useNotifications } from "@/context/NotificationContext";

export function ComplaintViewRecord() {
  const { state } = useLocation();
  const { user } = useAuth();
  const complaintData = state?.complaint as Complaint;
  const [isRaiseIssueDialogOpen, setIsRaiseIssueDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { send } = useNotifications();
  const [complaintStatus, setComplaintStatus] = useState({
    isArchived: complaintData?.comp_is_archive || false,
    isRaised: false,
  });

  const handleRaiseIssue = async () => {
    setIsSubmitting(true);
    try {
      await raiseIssue(complaintData.comp_id);
      await handleSendAlert();
      
      // Archive the complaint after raising the issue
      await archiveComplaint(complaintData.comp_id.toString());
      
      setComplaintStatus((prev) => ({ ...prev, isRaised: true, isArchived: true }));
      toast.success("Issue raised successfully", {
        description: `Service Request created for Complaint ID: ${complaintData.comp_id}`,
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

  const handleSendAlert = async () => {
    await send({
      title: "Complaint Report Filed",
      message: "Your request has been processed",
      recipient_ids: [user?.acc_id || '', '13'], // pass here the id of the clerk's account
      metadata:{
        action_url: '/home',
        sender_name: 'System',
        sender_avatar: `${user?.profile_image}` || '',
      }
    })
  }

  const getStatusDisplay = () => {
    if (complaintStatus.isRaised) {
      return { text: "Raised", class: "bg-orange-100 text-orange-700" };
    } else if (complaintStatus.isArchived) {
      return {
        text: "Archived",
        class: "bg-yellow-100 text-yellow-700",
      };
    } else {
      return { text: "Active", class: "bg-green-100 text-green-700" };
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
              <Link to="/complaint">
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
                    unresolved issues and automatically archive the complaint.
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
            <h3 className="font-medium text-lg text-darkBlue2">Complainant</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-darkGray">Full Name</p>
              <p className="text-base">
                {complaintData.cpnt?.cpnt_name || "N/A"}
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3 text-darkGray" />
                <p className="text-sm text-darkGray">Address</p>
              </div>
              <p className="text-base">
                {complaintData.cpnt?.add
                  ? `${complaintData.cpnt.add.add_street || ""} ${
                      complaintData.cpnt.add.add_barangay
                    }, ${complaintData.cpnt.add.add_city}, ${
                      complaintData.cpnt.add.add_province
                    }`.trim()
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
              Accused Person
              {complaintData.accused_persons?.length > 1 ? "s" : ""}
            </h3>
          </div>

          <div
            className={`space-y-4 ${
              complaintData.accused_persons &&
              complaintData.accused_persons.length > 2
                ? "max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                : ""
            }`}
          >
            {complaintData.accused_persons &&
            complaintData.accused_persons.length > 0 ? (
              complaintData.accused_persons.map((accused, index) => (
                <div key={accused.acsd_id} className="space-y-3 pb-4">
                  {index > 0 && <hr className="border-gray-200 mb-4" />}
                  <div>
                    <p className="text-sm text-darkGray">
                      Full Name{" "}
                      {complaintData.accused_persons.length > 1
                        ? `(${index + 1})`
                        : ""}
                    </p>
                    <p className="text-base font-medium">
                      {accused.acsd_name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-darkGray" />
                      <p className="text-sm text-darkGray">Address</p>
                    </div>
                    <p className="text-base">
                      {accused.add
                        ? `${accused.add.add_street || ""} ${
                            accused.add.add_barangay
                          }, ${accused.add.add_city}, ${
                            accused.add.add_province
                          }`.trim()
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
            <p className="text-base font-medium">
              {complaintData.comp_incident_type || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-darkGray">Priority level</p>
            <p className="text-base font-medium">
              {complaintData.comp_category || "N/A"}
            </p>
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
      </div>
    </div>
  );
}
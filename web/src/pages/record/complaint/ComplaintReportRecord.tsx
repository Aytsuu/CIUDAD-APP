import { SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { BsChevronLeft } from "react-icons/bs";
import { Link, useLocation } from "react-router-dom";
import { Complaint } from "./complaint-type";
import {
  FileText,
  User,
  AlertTriangle,
  FolderOpen,
  Calendar,
  MapPin,
  Hash,
  Clock,
  UserCheck,
  UserX,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { archiveComplaint, raiseIssue } from "./api-operations/restful-api/complaint-api";
import { useAuth } from "@/context/AuthContext";
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

  // Tab states
  const [activeComplainantTab, setActiveComplainantTab] = useState(0);
  const [activeAccusedTab, setActiveAccusedTab] = useState(0);

  const handleRaiseIssue = async () => {
    setIsSubmitting(true);
    try {
      console.log("Raising issue for comp_id:", complaintData.comp_id);

      await raiseIssue(complaintData.comp_id);
      // await handleSendAlert();
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
      recipient_ids: [user?.acc_id || "", "13"],
      metadata: {
        action_url: "/home",
        sender_name: "System",
        sender_avatar: user?.profile_image || "",
      },
    });
  };

  const getStatusDisplay = () => {
    if (complaintStatus.isRaised) {
      return { text: "Raised", class: "bg-orange-100 text-orange-700 border-orange-200" };
    } else if (complaintStatus.isArchived) {
      return { text: "Archived", class: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    } else {
      return { text: "Active", class: "bg-green-100 text-green-700 border-green-200" };
    }
  };

  const renderPersonTabs = (persons: any[], activeTab: number, setActiveTab: { (value: SetStateAction<number>): void; (value: SetStateAction<number>): void; (arg0: any): void; }, type: string) => {
    const Icon = type === 'complainant' ? UserCheck : UserX;
    const title = type === 'complainant' ? 'Complainant' : 'Accused Person';
    const emptyMessage = type === 'complainant' ? 'No complainant listed' : 'No accused persons listed';
    
    if (!persons || persons.length === 0) {
      return (
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Icon className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-lg text-slate-800">{title}</h3>
          </div>
          <div className="text-center py-8">
            <Icon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">{emptyMessage}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b bg-slate-50">
          <Icon className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-lg text-slate-800">{title}</h3>
          <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded-full text-xs font-medium">
            {persons.length} {persons.length === 1 ? 'person' : 'people'}
          </span>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b bg-slate-50">
          <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
            {persons.map((person, index) => (
              <button
                key={person.cpnt_id || person.acsd_id || index}
                onClick={() => setActiveTab(index)}
                className={`
                  flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200
                  ${activeTab === index 
                    ? 'border-blue-500 text-blue-600 bg-white' 
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${activeTab === index ? 'bg-blue-500' : 'bg-slate-400'}`} />
                  {person.cpnt_name || person.acsd_name || `Person ${index + 1}`}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {persons[activeTab] && (
            <div className="space-y-6">
              {/* Name Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <p className="text-base text-slate-900 font-medium bg-slate-50 p-3 rounded-md">
                    {persons[activeTab].cpnt_name || persons[activeTab].acsd_name || "N/A"}
                  </p>
                </div>
                
                {/* Contact Info if available */}
                {(persons[activeTab].cpnt_phone || persons[activeTab].acsd_phone) && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Contact Number
                    </label>
                    <p className="text-base text-slate-900 bg-slate-50 p-3 rounded-md">
                      {persons[activeTab].cpnt_phone || persons[activeTab].acsd_phone || "N/A"}
                    </p>
                  </div>
                )}
              </div>

              {/* Address Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <div className="bg-slate-50 p-4 rounded-md">
                  <p className="text-base text-slate-900 leading-relaxed">
                    {persons[activeTab].add
                      ? `${persons[activeTab].add.add_street || ""} ${persons[activeTab].add.add_barangay}, ${persons[activeTab].add.add_city}, ${persons[activeTab].add.add_province}`.trim()
                      : "No address provided"}
                  </p>
                </div>
              </div>

              {/* Additional Info if available */}
              {(persons[activeTab].cpnt_email || persons[activeTab].acsd_email) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <p className="text-base text-slate-900 bg-slate-50 p-3 rounded-md">
                    {persons[activeTab].cpnt_email || persons[activeTab].acsd_email || "N/A"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!complaintData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-slate-500">No complaint data available</p>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay();

  return (
     <div className="w-full min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex flex-row mb-4 sm:mb-0">
            <div className="flex items-center mr-4">
              <Button className="text-slate-700 p-2 self-start hover:bg-slate-100" variant="outline">
                <Link to="/complaint">
                  <BsChevronLeft />
                </Link>
              </Button>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="flex flex-row font-semibold text-xl sm:text-2xl text-darkBlue2 items-center">
                  Complaint Record Details
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusDisplay.class}`}>
                  {statusDisplay.text}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    Filed: {complaintData.comp_created_at
                      ? new Date(complaintData.comp_created_at).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="w-4 h-4" />
                  <span>Case No: {complaintData.comp_id || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Raise Issue Button */}
          <div className="flex justify-end gap-4">
            <DialogLayout
              isOpen={isRaiseIssueDialogOpen}
              onOpenChange={setIsRaiseIssueDialogOpen}
              trigger={
                <Button
                  className={`${
                    complaintStatus.isRaised
                      ? "bg-orange-600 hover:bg-orange-700 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  } shadow-sm`}
                  disabled={complaintStatus.isRaised || isSubmitting}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {complaintStatus.isRaised ? "Issue Raised" : "Raise Issue"}
                </Button>
              }
              title="Confirm Issue Raising"
              description="Are you sure you want to raise an issue for this complaint report?"
              mainContent={
                <>
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-2">
                      Complaint ID: <span className="font-medium text-slate-800">{complaintData.comp_id}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      This action will notify the concerned authorities and automatically archive the complaint.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setIsRaiseIssueDialogOpen(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={handleRaiseIssue} disabled={isSubmitting}>
                      {isSubmitting ? "Processing..." : "Confirm"}
                    </Button>
                  </div>
                </>
              }
            />
          </div>
        </div>

        {/* Person Details with Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Complainant Tabs */}
          {renderPersonTabs(
            complaintData.complainant, 
            activeComplainantTab, 
            setActiveComplainantTab, 
            'complainant'
          )}

          {/* Accused Tabs */}
          {renderPersonTabs(
            complaintData.accused_persons, 
            activeAccusedTab, 
            setActiveAccusedTab, 
            'accused'
          )}
        </div>

        {/* Incident Details */}
        <div className="border rounded-lg p-6 bg-white shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="font-semibold text-lg text-slate-800">Incident Details</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Category</label>
              <p className="text-base text-slate-900 font-medium bg-slate-50 p-3 rounded-md">
                {complaintData.comp_incident_type || "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600">Priority Level</label>
              <p className="text-base text-slate-900 font-medium bg-slate-50 p-3 rounded-md">
                {complaintData.comp_category || "N/A"}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date of Incident
              </label>
              <p className="text-base text-slate-900 bg-slate-50 p-3 rounded-md">
                {complaintData.comp_datetime
                  ? new Date(complaintData.comp_datetime).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">Incident Description</label>
            <div className="bg-slate-50 p-4 rounded-md border">
              <p className="text-base text-slate-900 whitespace-pre-line leading-relaxed">
                {complaintData.comp_allegation || "No description provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Supporting Documents */}
        <div className="border rounded-lg p-6 bg-white shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-semibold text-lg text-slate-800">Supporting Documents</h2>
          </div>
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No documents uploaded</p>
          </div>
        </div>
      </div>
    </div>
  );
}
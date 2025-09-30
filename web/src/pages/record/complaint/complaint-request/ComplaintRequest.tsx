import { useState, useEffect, useMemo } from "react";
import ComplaintTable from "../ComplaintTable";
import ComplaintPagination from "../complaint-record/ComplaintPagination";
import { requestComplaintColumns } from "./ComplaintRequestColumn";
import { useGetComplaint } from "../api-operations/queries/complaintGetQueries";
import { filterComplaints } from "../complaint-record/FilterComplaint";
import { Complaint } from "../complaint-type";
import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import { BsChevronLeft } from "react-icons/bs";
import ComplaintFilterBar from "../complaint-record/ComplaintFilterBar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, X, Archive } from "lucide-react";
import { usePostArchiveComplaint } from "../api-operations/queries/complaintPostQueries";
import { useUpdateComplaint } from "../api-operations/queries/complaintUpdateQueries";

export default function ComplaintRequest() {
  const DEFAULT_PAGE_SIZE = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<string | null>(null);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = useState(1);
  const { data: complaints = [], isLoading, error } = useGetComplaint();

  // Dialog states
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Uncomment these when you create the mutation hooks
  const updateStatusMutation = useUpdateComplaint();
  const archiveComplaintMutation = usePostArchiveComplaint();

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

  // Filter for pending complaints that are not archived
  const pendingComplaints = useMemo(() => {
    return complaints.filter((c: Complaint) => 
      c.comp_status === 'Pending' && !c.comp_is_archive
    );
  }, [complaints]);

  const filteredData = useMemo(() => {
    return filterComplaints(pendingComplaints, searchQuery);
  }, [pendingComplaints, searchQuery, timeFilter]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const rejectedCount = useMemo(() => {
    return complaints.filter((c: Complaint) => c.comp_status === 'Rejected').length;
  }, [complaints]);

  // Get selected complaint details
  const selectedComplaint = complaints.find((c: Complaint) => String(c.comp_id) === selectedComplaintId);
  const selectedComplainantName = selectedComplaint?.complainant?.[0]?.cpnt_name || "Anonymous";

  // Action handlers
  const handleAcceptComplaint = (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    setShowAcceptDialog(true);
  };

  const handleRejectComplaint = (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    setShowRejectDialog(true);
  };

  const handleArchiveComplaint = (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    setShowArchiveDialog(true);
  };

  // Confirmation handlers
  const confirmAccept = async () => {
    setIsUpdating(true);
    try {
      await updateStatusMutation.mutateAsync({ 
        compId: Number(selectedComplaintId), 
        payload: { comp_status: 'Filed'},
      });
      console.log("Accepting complaint:", selectedComplaintId, "-> Status: Filed");
      
      setShowAcceptDialog(false);
      setSelectedComplaintId("");
    } catch (error) {
      console.error("Failed to accept complaint:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmReject = async () => {
    setIsUpdating(true);
    try {

      await updateStatusMutation.mutateAsync({ 
        compId: Number(selectedComplaintId), 
        payload: { comp_status: 'Rejected' },
      });
      console.log("Rejecting complaint:", selectedComplaintId, "-> Status: Rejected");
      
      setShowRejectDialog(false);
      setSelectedComplaintId("");
    } catch (error) {
      console.error("Failed to reject complaint:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmArchive = async () => {
    setIsUpdating(true);
    try {
      await archiveComplaintMutation.mutateAsync(selectedComplaintId);
      console.log("Archiving complaint:", selectedComplaintId, "-> comp_is_archive: true");
      setShowArchiveDialog(false);
      setSelectedComplaintId("");
    } catch (error) {
      console.error("Failed to archive complaint:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (error) return <div>Error: {error.message}</div>;

  const columns = useMemo(
    () => requestComplaintColumns({
      data: complaints,
      onAcceptComplaint: handleAcceptComplaint,
      onRejectComplaint: handleRejectComplaint,
      onArchiveComplaint: handleArchiveComplaint,
    }),
    [complaints]
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex gap-3 mb-2">
        <div className="flex items-center">
          <Link to="/complaint">
            <Button className="text-black p-2" variant="outline">
              <BsChevronLeft />
            </Button>
          </Link>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-darkBlue2">
              Request
            </h1>
          </div>
          <p className="text-darkGray text-sm">
            Manage and view pending blotter requests
          </p>
        </div>
      </div>
      <hr className="pb-4" />
      
      <ComplaintFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        buttons={{
          filter: true,
          request: false, 
          archived: false,
          newReport: false,
          rejected: true,
          rejectedCount: rejectedCount,
        }}
      />

      <ComplaintTable
        data={paginatedData}
        columns={columns}
        isLoading={isLoading}
      />

      <ComplaintPagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalData={filteredData.length}
        pageSize={pageSize}
      />

      {/* Accept Confirmation Dialog */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Accept Complaint?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to accept complaint <strong>{selectedComplaintId}</strong> from <strong>{selectedComplainantName}</strong>?
              <br /><br />
              This will change the status from <span className="text-red-600 font-medium">Pending</span> to <span className="text-blue-600 font-medium">Filed</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAccept}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdating ? "Accepting..." : "Accept"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              Reject Complaint?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject complaint <strong>{selectedComplaintId}</strong> from <strong>{selectedComplainantName}</strong>?
              <br /><br />
              This will change the status from <span className="text-red-600 font-medium">Pending</span> to <span className="text-red-600 font-medium">Rejected</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmReject}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUpdating ? "Rejecting..." : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-orange-600" />
              Archive Complaint?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive complaint <strong>{selectedComplaintId}</strong> from <strong>{selectedComplainantName}</strong>?
              <br /><br />
              This will move the complaint to the archive section and it won't appear in the main complaint list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchive}
              disabled={isUpdating}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isUpdating ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
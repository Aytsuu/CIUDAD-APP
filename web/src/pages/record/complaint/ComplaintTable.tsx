import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { ChevronDown, FileInput, Archive } from "lucide-react";
import { Link } from "react-router";
import { DataTable } from "@/components/ui/table/data-table";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
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

interface ComplaintTableProps {
  data: any[];
  columns: any[];
  isLoading: boolean;
  onArchiveComplaints?: (complaintIds: string[]) => Promise<void>;
}

export default function ComplaintTable({ 
  data, 
  columns, 
  isLoading, 
  onArchiveComplaints 
}: ComplaintTableProps) {
  const [pageSizeInput, setPageSizeInput] = useState("10");
  const [pageSize, setPageSize] = useState(10);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const showEntriesOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ];

  useEffect(() => {
    setPageSizeInput(pageSize.toString());
  }, [pageSize]);

  const paginatedData = data?.slice(0, pageSize) || [];
  const selectedCount = Object.keys(rowSelection).length;

  // Get selected complaint IDs and details
  const getSelectedComplaints = () => {
    const selectedIndices = Object.keys(rowSelection).filter(key => rowSelection[key]);
    return selectedIndices.map(index => {
      const complaint = paginatedData[parseInt(index)];
      return {
        id: complaint.comp_id,
        complainant: complaint.complainant?.[0]?.cpnt_name || 'Anonymous'
      };
    });
  };

  const handleArchiveClick = () => {
    if (selectedCount > 0) {
      setShowArchiveDialog(true);
    }
  };

  const handleConfirmArchive = async () => {
    setIsArchiving(true);
    try {
      const selectedComplaints = getSelectedComplaints();
      const complaintIds = selectedComplaints.map(c => c.id);
      
      if (onArchiveComplaints) {
        await onArchiveComplaints(complaintIds);
        // Reset selection after successful archive
        setRowSelection({});
      } else {
        console.log("Archive these complaint IDs:", complaintIds);
        // Example: await archiveComplaintsMutation.mutateAsync(complaintIds);
      }
      
      setShowArchiveDialog(false);
    } catch (error) {
      console.error("Failed to archive complaints:", error);
    } finally {
      setIsArchiving(false);
    }
  };

  const selectedComplaints = getSelectedComplaints();

  return (
    <div className="w-full flex flex-col">
      <div className="w-full h-auto bg-white flex flex-wrap gap-4 items-center p-3">
        {/* Show Entries Input */}
        <div className="flex gap-x-2 items-center border-r-2 border-gray pr-4 min-w-[200px]">
          <p className="text-xs sm:text-sm">Show</p>
          <DropdownLayout
            className="text-darkGray"
            trigger={
              <Button variant="outline" className="h-8 w-20 justify-between">
                {pageSizeInput}
                <ChevronDown size={16} />
              </Button>
            }
            options={showEntriesOptions.map((option) => ({
              id: option.value,
              name: option.label,
            }))}
            onSelect={(value) => {
              setPageSizeInput(value);
              const newSize = parseInt(value, 10);
              if (!isNaN(newSize) && newSize > 0) {
                setPageSize(Math.min(newSize, 100));
              }
            }}
          />
          <p className="text-xs sm:text-sm">Entries</p>
        </div>
                 
        <div className={`flex gap-2 transition-opacity duration-200 ${selectedCount > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Button
            variant="outline"
            className="border-2 border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 hover:text-orange-800"
            onClick={handleArchiveClick}
            disabled={isArchiving}
          >
            <Archive size={16} />
            {isArchiving 
              ? "Archiving..." 
              : selectedCount === 1
              ? `Archive ${selectedCount} complaint`
              : `Archive ${selectedCount} complaints`
            }
          </Button>
           
          <Link to="/complaint/archive">
            <Button variant="outline" className="gap-2 text-darkGray">
              <FileInput size={16} className="text-gray-400" />
              <span>Export</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white">
        <DataTable
          columns={columns}
          data={paginatedData}
          isLoading={isLoading}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </div>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-orange-600" />
              Archive Complaints?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to archive {selectedCount === 1 ? 'this complaint' : `these ${selectedCount} complaints`}?
              </p>
              {selectedComplaints.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="font-medium text-sm text-gray-700 mb-2">
                    {selectedCount === 1 ? 'Complaint to be archived:' : 'Complaints to be archived:'}
                  </p>
                  <ul className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedComplaints.slice(0, 5).map((complaint) => (
                      <li key={complaint.id} className="text-sm text-gray-600">
                        • ID: {complaint.id} - {complaint.complainant}
                      </li>
                    ))}
                    {selectedComplaints.length > 5 && (
                      <li className="text-sm text-gray-500 italic">
                        ... and {selectedComplaints.length - 5} more
                      </li>
                    )}
                  </ul>
                </div>
              )}
              <p className="text-sm text-gray-600">
                Archived complaints will be moved to the archive section and won't appear in the main complaint list.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmArchive}
              disabled={isArchiving}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isArchiving ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
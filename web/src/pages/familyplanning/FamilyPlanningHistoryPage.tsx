import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft, History, Eye } from "lucide-react"; // Import necessary icons
import { ColumnDef } from "@tanstack/react-table"; // Assuming you have DataTable
import { DataTable } from "@/components/ui/table/data-table"; // Adjust path as needed
import { getFPRecordsForPatient, getFPCompleteRecord } from "./request-db/GetRequest"; // Adjust path and import as needed
import { FamilyPlanningRecordDetail } from "./types/familyplanningtypes";
import ComparisonViewer from "./ComparisonPage";


// Extend or re-use types from PatientHistoryPage for display in table
type FPRecordDisplay = {
  fprecord_id: number;
  patient_name: string;
  date_of_visit: string;
  method_used?: string;
  // Add other relevant fields for display in the table
};

const FamilyPlanningHistoryPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>(); // Assuming you navigate with a patientId
  const [selectedRecords, setSelectedRecords] = useState<FamilyPlanningRecordDetail[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  // Fetch all family planning records for the patient
  // Adjust this query to use your actual API endpoint for fetching FP records
  const {
    data: fpRecords = [],
    isLoading,
    isError,
    error,
    // refetch: fetchCompleteRecord,
  } = useQuery<FPRecordDisplay[]>({
    queryKey: ["fpRecordsByPatient", patientId],
    queryFn: async () => {
      const records = await getFPRecordsForPatient(patientId!);
      return records.map((rec: any) => ({
        fprecord_id: rec.fprecord_id,
        patient_name: rec.patient_name,
        date_of_visit: rec.date_of_visit,
        method_used: rec.method_used,
        // Add other relevant fields if needed
      }));
    },
    enabled: !!patientId,
  });

  // Function to fetch complete record details for comparison
  const fetchCompleteRecord = async (fprecordId: number): Promise<FamilyPlanningRecordDetail> => {
    // This function should call the backend to get the full details for a single FP record
    // Use the get_complete_fp_record endpoint
    const record = await getFPCompleteRecord(fprecordId); // Adjust path as needed
    return record;
  };

  const handleCheckboxChange = async (record: FPRecordDisplay, isChecked: boolean) => {
    if (isChecked) {
      if (selectedRecords.length < 2) {
        try {
          const fullRecord = await fetchCompleteRecord(record.fprecord_id);
          setSelectedRecords((prev) => [...prev, fullRecord]);
        } catch (err) {
          toast.error("Failed to load full record for comparison.");
          console.error("Error fetching full record:", err);
        }
      } else {
        toast.info("You can select up to 2 records for comparison.");
      }
    } else {
      setSelectedRecords((prev) =>
        prev.filter((rec) => rec.fprecord_id !== record.fprecord_id)
      );
    }
  };

  const handleCompareClick = () => {
    if (selectedRecords.length === 2) {
      setComparisonModalOpen(true);
    } else {
      toast.info("Please select exactly two records to compare.");
    }
  };

  const handleCloseComparisonModal = () => {
    setComparisonModalOpen(false);
    setSelectedRecords([]); // Clear selection after comparison
  };

  const columns: ColumnDef<FPRecordDisplay>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
              handleCheckboxChange(row.original, !!value);
            }}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: "fprecord_id",
        header: "Record ID",
      },
      {
        accessorKey: "patient_name",
        header: "Patient Name",
      },
      {
        accessorKey: "date_of_visit",
        header: "Date of Visit",
        cell: ({ row }) => new Date(row.original.date_of_visit).toLocaleDateString(),
      },
      {
        accessorKey: "method_used",
        header: "Method Used",
      },
      // Add more columns for relevant FP record fields
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Link to={`/familyplanning/view/${row.original.fprecord_id}`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" /> View
              </Button>
            </Link>
            
          </div>
        ),
      },
    ],
    [handleCheckboxChange]
  );

  if (isLoading) {
    return <div className="p-4 text-center">Loading family planning records...</div>;
  }

  if (isError) {
    return <div className="p-4 text-center text-red-600">Error loading records: {error?.message}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Family Planning History for Patient: {patientId}</h1>
        <div className="flex items-center gap-4">
          <Link to="/familyplanning">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to All Patients
            </Button>
          </Link>
          <Button
            onClick={handleCompareClick}
            disabled={selectedRecords.length !== 2}
          >
            <History className="h-4 w-4 mr-2" /> Compare Selected Records
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        {fpRecords && fpRecords.length > 0 ? (
          <DataTable columns={columns} data={fpRecords} />
        ) : (
          <p className="text-center py-8 text-gray-500">No family planning records found for this patient.</p>
        )}
      </div>

      {/* Comparison Modal */}
      {comparisonModalOpen && selectedRecords.length === 2 && (
        <DialogLayout
          isOpen={comparisonModalOpen}
          onOpenChange={(open: boolean) => {
            if (!open) handleCloseComparisonModal();
          }}
          title="Record Comparison"
          description="Compare key details between two selected records."
          className="max-w-6xl max-h-[95vh] overflow-hidden" // Adjust max-w and max-h for better comparison view
          mainContent={
            <ComparisonViewer record1={selectedRecords[0]} record2={selectedRecords[1]} onClose={handleCloseComparisonModal} />
          }
        />
      )}

      
    </div>
  );
};

export default FamilyPlanningHistoryPage;
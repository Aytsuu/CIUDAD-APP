import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAnimalBitePatientDetails } from "./api/get-api.tsx"; 
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, Printer, History, XCircle, CalendarDays, FlaskConical, MapPin, PawPrint, FileText, UserSquare, Mail, Phone, Home } from "lucide-react";
import { Button } from "@/components/ui/button/button"; 
import { DataTable } from "@/components/ui/table/data-table.tsx";
import DialogLayout from "@/components/ui/dialog/dialog-layout"; 
import { Checkbox } from "@/components/ui/checkbox"; 
import { toast } from "sonner"; 

// Type definition for a single patient record detail, matching backend serializer output
type PatientRecordDetail = {
  bite_id: number;
  exposure_type: string;
  actions_taken: string;
  referredby: string;
  biting_animal: string;
  exposure_site: string;
  patient_fname: string;
  patient_lname: string;
  patient_mname?: string; // Optional middle name
  patient_sex: string;
  patient_dob: string;
  patient_address: string;
  patient_id: string; // This is the pat_id from the Patient model (varchar)
  patient_type: string; // New: 'Resident' or 'Transient'
  patient_age: string; // New: Age as calculated by backend serializer
  referral_id: number;
  referral_date: string;
  referral_transient: boolean;
  referral_receiver: string;
  referral_sender: string;
  record_created_at: string; // Creation date of the patient record
  patrec_id: number;
};

// --- Printable Referral Form Component ---
interface PrintableReferralFormProps {
  record: PatientRecordDetail;
  onClose: () => void;
}

const PrintableReferralForm: React.FC<PrintableReferralFormProps> = ({ record, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; 

    const printContent = printRef.current;
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <link href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css" rel="stylesheet">
          <style>
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; background-color: #f8f8f8; }
            .print-container { max-width: 800px; margin: 20px auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fff; box-shadow: 0 0 15px rgba(0,0,0,0.05); }
            .print-header { text-align: center; margin-bottom: 25px; border-bottom: 2px solid #3b82f6; padding-bottom: 15px; }
            .print-header h2 { font-size: 2.25rem; font-weight: 700; color: #1f2937; margin-bottom: 5px; }
            .print-header p { font-size: 0.9rem; color: #6b7280; }
            .print-section { margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
            .print-section-title { background-color: #eff6ff; color: #1e40af; font-weight: 600; padding: 12px 15px; border-bottom: 1px solid #dbeafe; display: flex; align-items: center; gap: 8px; }
            .print-section-content { padding: 15px; display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px 20px; }
            .print-item { display: flex; flex-direction: column; }
            .print-label { font-weight: 500; color: #4b5563; font-size: 0.875rem; margin-bottom: 2px; }
            .print-value { color: #1f2937; font-size: 0.95rem; word-break: break-word; }
            .print-button { display: none; }
            @media print {
              body { margin: 0; padding: 0; background-color: #fff !important; }
              .print-container { box-shadow: none; border: none; margin: 0; padding: 15px; }
              .no-print { display: none !important; }
            }
          </style>
        `);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
    document.body.style.overflow = originalBodyOverflow; 
    onClose(); 
  };

  useEffect(() => {
    handlePrint();
  }, []); 

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg relative print:shadow-none print:p-0">
      <Button onClick={onClose} className="absolute top-2 right-2 print:hidden z-10" variant="ghost">
        <XCircle size={20} />
      </Button>
      <div ref={printRef} className="print-container">
        <div className="print-header">
          <h3>Animal Bite Referral Form</h3>
          {/* <p>Generated on: {new Date().toLocaleDateString()}</p> */}
        </div>

        <div className="print-section">
          <div className="print-section-title">
            <Mail size={18} /> Referral Information
          </div>
          <div className="print-section-content">
            {/* <div className="print-item"><span className="print-label">Referral ID:</span> <span className="print-value">{record.referral_id}</span></div> */}
            <div className="print-item"><span className="print-label">Receiver:</span> <span className="print-value">{record.referral_receiver}</span></div>
            <div className="print-item"><span className="print-label">Sender:</span> <span className="print-value">{record.referral_sender}</span></div>
            <div className="print-item"><span className="print-label">Referral Date:</span> <span className="print-value">{new Date(record.referral_date).toLocaleDateString()}</span></div>
            {/* <div className="print-item"><span className="print-label">Transient:</span> <span className="print-value">{record.referral_transient ? "Yes" : "No"}</span></div> */}
          </div>
        </div>

        <div className="print-section">
          <div className="print-section-title">
            <UserSquare size={18} /> Patient Information
          </div>
          <div className="print-section-content">
            {/* Display patient type here */}
            <div className="print-item"><span className="print-label">Patient Type:</span> <span className="print-value">{record.patient_type}</span></div>
            {/* <div className="print-item"><span className="print-label">Patient ID:</span> <span className="print-value">{record.patient_id}</span></div> */}
            <div className="print-item"><span className="print-label">Name:</span> <span className="print-value">{record.patient_fname} {record.patient_mname ? record.patient_mname + " " : ""}{record.patient_lname}</span></div>
            <div className="print-item"><span className="print-label">Sex:</span> <span className="print-value">{record.patient_sex}</span></div>
            <div className="print-item"><span className="print-label">Date of Birth:</span> <span className="print-value">{new Date(record.patient_dob).toLocaleDateString()}</span></div>
            <div className="print-item"><span className="print-label">Age:</span> <span className="print-value">{record.patient_age}</span></div> {/* Display age from backend */}
            <div className="print-item"><span className="print-label">Address:</span> <span className="print-value">{record.patient_address}</span></div>
          </div>
        </div>

        <div className="print-section">
          <div className="print-section-title">
            <PawPrint size={18} /> Animal Bite Details
          </div>
          <div className="print-section-content">
            <div className="print-item"><span className="print-label">Exposure Type:</span> <span className="print-value">{record.exposure_type}</span></div>
            <div className="print-item"><span className="print-label">Site of Exposure:</span> <span className="print-value">{record.exposure_site}</span></div>
            <div className="print-item"><span className="print-label">Biting Animal:</span> <span className="print-value">{record.biting_animal}</span></div>
            <div className="print-item"><span className="print-label">Actions Taken:</span> <span className="print-value">{record.actions_taken}</span></div>
            <div className="print-item"><span className="print-label">Referred By:</span> <span className="print-value">{record.referredby}</span></div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6 no-print">--- End of Referral Form ---</p>
      </div>
    </div>
  );
};


// --- Comparison Viewer Component ---
interface ComparisonViewerProps {
  record1: PatientRecordDetail;
  record2: PatientRecordDetail;
  onClose: () => void;
}

const ComparisonViewer: React.FC<ComparisonViewerProps> = ({ record1, record2, onClose }) => {
  const fieldsToCompare = [
    { label: "Exposure Type", key: "exposure_type" },
    { label: "Site of Exposure", key: "exposure_site" },
    { label: "Biting Animal", key: "biting_animal" },
    { label: "Actions Taken", key: "actions_taken" },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg relative">
      <Button onClick={onClose} className="absolute top-2 right-2" variant="ghost">
        <XCircle size={20} />
      </Button>
      {/* <h2 className="text-xl font-bold mb-4 text-center">Record Comparison</h2> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Record 1 Column */}
        <div className="border p-4 rounded-lg bg-gray-50">
          <h3 className="font-semibold text-lg mb-2">Record from {new Date(record1.referral_date).toLocaleDateString()}</h3>
          {fieldsToCompare.map((field) => (
            <div key={field.key} className="mb-2">
              <span className="font-medium">{field.label}: </span>
              <span>{record1[field.key as keyof PatientRecordDetail] || "N/A"}</span>
            </div>
          ))}
        </div>
        
        {/* Record 2 Column */}
        <div className="border p-4 rounded-lg bg-gray-50">
          <h3 className="font-semibold text-lg mb-2">Record from {new Date(record2.referral_date).toLocaleDateString()}</h3>
          {fieldsToCompare.map((field) => (
            <div key={field.key} className="mb-2">
              <span className="font-medium">{field.label}: </span>
              <span>{record2[field.key as keyof PatientRecordDetail] || "N/A"}</span>
              {/* Optional: Highlight differences */}
              {record1[field.key as keyof PatientRecordDetail] !== record2[field.key as keyof PatientRecordDetail] && (
                <span className="ml-2 text-red-500 text-sm">(Changed)</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-sm text-gray-600 mt-4">Differences are highlighted in red.</p>
    </div>
  );
};


// --- Main Individual Patient History Component ---
const IndividualPatientHistory: React.FC = () => {
  // Destructure 'id' from useParams as per your router configuration
  const { id } = useParams<{ id: string }>(); 

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedRecordToPrint, setSelectedRecordToPrint] = useState<PatientRecordDetail | null>(null);

  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<number[]>([]); // Stores bite_id's for comparison

  useEffect(() => {
    // Log the id received from the URL
    console.log("IndividualPatientHistory mounted. Patient ID from URL (as 'id'):", id);
  }, [id]); // Depend on 'id' here

  const {
    data: patientRecords,
    isLoading,
    isError,
    error,
  } = useQuery<PatientRecordDetail[], Error>({
    queryKey: ["animalbitePatientHistory", id], // Use 'id' in the query key
    queryFn: () => {
      console.log("Fetching patient history for:", id);
      if (!id) { // Check if 'id' is available
        console.error("Query function called with no patientId (id).");
        return Promise.reject(new Error("No patient ID provided for fetching."));
      }
      return getAnimalBitePatientDetails(id); // Pass 'id' to the fetch function
    },
    enabled: !!id, // Only run the query if 'id' is available
  });

  useEffect(() => {
    if (patientRecords) {
      console.log("Patient records fetched successfully:", patientRecords.length, "records");
      if (patientRecords.length > 0) {
        console.log("First record details:", patientRecords[0]);
      }
    }
    if (isError) {
      console.error("Error fetching patient records:", error);
    }
  }, [patientRecords, isError, error]);

  const handlePrintClick = (record: PatientRecordDetail) => {
    setSelectedRecordToPrint(record);
    setPrintModalOpen(true);
  };

  const handlePrintModalClose = () => {
    setPrintModalOpen(false);
    setSelectedRecordToPrint(null);
  };

  const handleCompareCheckboxChange = (biteId: number, isChecked: boolean) => {
    setSelectedForComparison((prev) => {
      if (isChecked) {
        if (prev.length < 2) {
          return [...prev, biteId];
        } else {
          toast.info("You can select up to 2 records for comparison.");
          return prev; // Do not add more than 2
        }
      } else {
        return prev.filter((id) => id !== biteId);
      }
    });
  };

  const handleOpenComparisonModal = () => {
    if (selectedForComparison.length === 2) {
      setComparisonModalOpen(true);
    } else {
      toast.error("Please select exactly two records to compare.");
    }
  };

  const handleCloseComparisonModal = () => {
    setComparisonModalOpen(false);
  };

  const recordsToCompare = useMemo(() => {
    if (patientRecords && selectedForComparison.length === 2) {
      const record1 = patientRecords.find(rec => rec.bite_id === selectedForComparison[0]);
      const record2 = patientRecords.find(rec => rec.bite_id === selectedForComparison[1]);
      return record1 && record2 ? { record1, record2 } : null;
    }
    return null;
  }, [selectedForComparison, patientRecords]);


  const columns: ColumnDef<PatientRecordDetail>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center space-x-2">
          {/* We don't need a select all checkbox here as comparison is individual */}
          <span className="sr-only">Select for comparison</span>
        </div>
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedForComparison.includes(row.original.bite_id)}
          onCheckedChange={(checked) => handleCompareCheckboxChange(row.original.bite_id, !!checked)}
          aria-label="Select row for comparison"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "patient_type", // New column for patient type
      header: "Patient Type",
      cell: ({ row }) => row.original.patient_type,
    },
    {
      accessorKey: "exposure_type",
      header: "Exposure Type",
    },
    {
      accessorKey: "exposure_site",
      header: "Site of Exposure",
    },
    {
      accessorKey: "biting_animal",
      header: "Biting Animal",
    },
    {
      accessorKey: "actions_taken",
      header: "Actions Taken",
    },
    {
      accessorKey: "referredby",
      header: "Referred By",
    },
    {
      accessorKey: "referral_receiver",
      header: "Receiver",
    },
    {
      accessorKey: "referral_sender",
      header: "Sender",
    },
    {
      accessorKey: "record_created_at",
      header: "Record Created At",
      cell: ({ row }) => new Date(row.original.record_created_at).toLocaleString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handlePrintClick(row.original)}
          className="flex items-center gap-1"
        >
          <Printer size={16} /> Print
        </Button>
      ),
    },
  ], [selectedForComparison]); 

  if (!id) {
    return <div className="p-4 text-center">No patient ID provided in the URL.</div>;
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        Loading patient history...
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-center text-red-600">Error: {error?.message || "Failed to load patient history."}</div>;
  }

  // Use the new patient_fname and patient_lname from the first record for the header
  const patientName = patientRecords && patientRecords.length > 0
    ? `${patientRecords[0].patient_fname} ${patientRecords[0].patient_lname}`
    : "Unknown Patient";

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/Animalbite_viewing">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Animal Bite History for {patientName}</h1>
        {selectedForComparison.length === 2 && (
          <Button 
            variant="default" 
            className="ml-auto flex items-center gap-2" 
            onClick={handleOpenComparisonModal}
          >
            <History size={16} /> Compare Selected Records
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        {patientRecords && patientRecords.length > 0 ? (
          <DataTable columns={columns} data={patientRecords} />
        ) : (
          <p className="text-center py-8 text-gray-500">No animal bite records found for this patient.</p>
        )}
      </div>
      
      {/* Print Modal */}
      {printModalOpen && selectedRecordToPrint && (
        <DialogLayout
          isOpen={printModalOpen}
          onClose={handlePrintModalClose}
          title="Print Referral Form"
          description="A printable version of the referral form."
          className="max-w-4xl" 
          mainContent={
            <PrintableReferralForm record={selectedRecordToPrint} onClose={handlePrintModalClose} />
          }
        />
      )}

      {/* Comparison Modal */}
      {comparisonModalOpen && recordsToCompare && (
        <DialogLayout
          isOpen={comparisonModalOpen}
          // onClose={handleCloseComparisonModal}
          title="Record Comparison"
          description="Compare key details between two selected records."
          className="max-w-5xl" 
          mainContent={
            <ComparisonViewer record1={recordsToCompare.record1} record2={recordsToCompare.record2} onClose={handleCloseComparisonModal} />
          }
        />
      )}
    </div>
  );
};

export default IndividualPatientHistory;

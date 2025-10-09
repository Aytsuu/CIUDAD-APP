import React, { useState, useMemo, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAnimalBitePatientDetails } from "./api/get-api";
import { ColumnDef } from "@tanstack/react-table";
import { Printer, PawPrint, Calendar, MapPin, Stethoscope, ShieldCheck, User, Building, FileText } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

// --- Type Definition ---
type PatientRecordDetail = {
  bite_id: number;
  exposure_type: string;
  actions_taken: string;
  referredby: string;
  biting_animal: string;
  exposure_site: string;
  patient_fname: string;
  patient_lname: string;
  patient_mname?: string;
  patient_dob?: string;
  patient_sex: string;
  patient_age: string;
  patient_address: string;
  patient_id: string;
  referral_id: number;
  referral_date: string;
  referral_receiver: string;
  referral_sender: string;
  record_created_at: string;
};

// --- New Printable Referral Slip Component (Redesigned) ---
const ReferralSlip: React.FC<{ record: PatientRecordDetail }> = ({ record }) => {
  const slipRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    const content = slipRef.current;
    if (!content) return;

    const margin = 10; // 10mm margin on both sides
    const pdf = new jsPDF("p", "mm", "letter"); // bondpaper size

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const contentWidth = pdfWidth - margin * 2;

    const canvas = await html2canvas(content, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const imgRatio = imgHeight / imgWidth;
    const finalImgWidth = contentWidth;
    const finalImgHeight = finalImgWidth * imgRatio;
    const topMargin = margin;
    pdf.addImage(imgData, "PNG", margin, topMargin, finalImgWidth, finalImgHeight);
    pdf.save(`${record.patient_fname} ${record.patient_lname} ${record.referral_date} Referral Slip.pdf`);
  };

  const UnderlinedText: React.FC<{ value?: string | number; className?: string }> = ({ value, className = "" }) => (
    <span className={`underline decoration-black decoration-1 underline-offset-2 px-2 ${className}`}>{value || "________________"}</span>
  );

  return (
    <div className="bg-white rounded-lg">
      <div ref={slipRef} className="p-6 bg-white font-arial text-gray-800 text-sm">
        <div className="text-center font-bold mb-6 text-base tracking-wider">NATIONAL RABIES PREVENTION and CONTROL PROGRAM</div>

        <div className="flex justify-end mb-4">
          <span>
            Date: <UnderlinedText value={new Date(record.referral_date).toLocaleDateString()} />
          </span>
        </div>

        <div className="flex justify-between mb-4">
          <span>
            TO: <UnderlinedText value={record.referral_receiver} className="w-48 inline-block" />
          </span>
          <span>
            FROM: <UnderlinedText value={record.referral_sender} className="w-48 inline-block" />
          </span>
        </div>

        <div className="space-y-4 text-left leading-relaxed mt-6">
          <p>
            Respectfully referring, <UnderlinedText value={`${record.patient_lname}, ${record.patient_fname}`} /> (<span className="italic text-xs">Name Of Patients</span>)
          </p>
          <p>
            <UnderlinedText value={record.patient_age} /> years old, resident of <UnderlinedText value={record.patient_address} className="w-full inline-block" />
          </p>
          <p>
            Exposure: (Bite or Non Bite) <UnderlinedText value={record.exposure_type} />
          </p>
          <p>
            Date of Exposure: <UnderlinedText value={new Date(record.referral_date).toLocaleDateString()} />
          </p>
          <p>
            Site of Exposure: <UnderlinedText value={record.exposure_site} />
          </p>
          <p>
            Biting Animal: <UnderlinedText value={record.biting_animal} />
          </p>
          <p>
            Laboratory Exam. (if any): <UnderlinedText value="N/A" />
          </p>
          <p>
            ACTION DESIRED: <UnderlinedText value={record.actions_taken} />
          </p>
          <p className="pt-8">
            Referred By: <UnderlinedText value={record.referredby} />
          </p>
        </div>
      </div>
      <div className="flex justify-end p-4 bg-gray-100 border-t rounded-b-lg">
        <Button onClick={handlePrint} className="text-white">
          <Printer size={16} className="mr-2" />
          Print
        </Button>
      </div>
    </div>
  );
};

// --- Main Individual Patient History Component ---
const IndividualPatientHistory: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId, patientData } = location.state || {};

  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PatientRecordDetail | null>(null);

  // Redirect to Overall page if no patientId is provided
  useEffect(() => {
    if (!patientId) {
      navigate("/Animalbite_viewing");
    }
  }, [patientId, navigate]);

  const {
    data: patientRecords = [],
    isLoading,
    isError,
    error,
  } = useQuery<PatientRecordDetail[], Error>({
    queryKey: ["animalBiteHistory", patientId],
    queryFn: () => getAnimalBitePatientDetails(patientId),
    enabled: !!patientId,
    refetchOnWindowFocus: true,
  });

  const patientInfo = useMemo(() => {
    if (!patientData) return null;
    return {
      pat_id: patientData.pat_id,
      pat_type: patientData.pat_type,
      personal_info: {
        per_fname: patientData.personal_info.per_fname,
        per_lname: patientData.personal_info.per_lname,
        per_mname: patientData.personal_info.per_mname || "",
        per_sex: patientData.personal_info.per_sex,
        per_dob: patientData.personal_info.per_dob,
      },
      address: {
        add_street: patientData.address?.add_street || "",
      },
    };
  }, [patientData]);

  const handlePrintClick = (record: PatientRecordDetail) => {
    setSelectedRecord(record);
    setPrintModalOpen(true);
  };

  const tableColumns = useMemo<ColumnDef<PatientRecordDetail>[]>(
    () => [
      { accessorKey: "referral_date", header: "Date", cell: ({ row }) => new Date(row.original.referral_date).toLocaleDateString() },
      { accessorKey: "exposure_type", header: "Exposure Type" },
      { accessorKey: "biting_animal", header: "Biting Animal" },
      { accessorKey: "exposure_site", header: "Site of Exposure" },
      { accessorKey: "actions_taken", header: "Actions Taken" },
      { accessorKey: "referredby", header: "Referred By" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-4 justify-center">
            <Button size="sm" onClick={() => handlePrintClick(row.original)}>
              <Printer size={16} className="mr-2" /> Print
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const historyFields = [
    { label: "Exposure Type", key: "exposure_type", icon: <ShieldCheck className="w-4 h-4 text-gray-500" /> },
    { label: "Site of Exposure", key: "exposure_site", icon: <MapPin className="w-4 h-4 text-gray-500" /> },
    { label: "Biting Animal", key: "biting_animal", icon: <PawPrint className="w-4 h-4 text-gray-500" /> },
    { label: "Actions Taken", key: "actions_taken", icon: <Stethoscope className="w-4 h-4 text-gray-500" /> },
    { label: "Referred By", key: "referredby", icon: <User className="w-4 h-4 text-gray-500" /> },
    { label: "Referred To", key: "referral_receiver", icon: <Building className="w-4 h-4 text-gray-500" /> },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !patientId) {
    return (
      <div className="p-4 text-center text-red-600">
        Error: {error?.message || "Patient ID not provided or could not load patient history."}
      </div>
    );
  }

  const patientName = patientData
    ? `${patientData.personal_info.per_fname} ${patientData.personal_info.per_lname}`
    : "Patient";

  return (
    <LayoutWithBack title="Animal Bite Patient History" description="Detailed history of animal bite incidents for the selected patient.">
      <div className="container mx-auto py-8 space-y-8">
        <PatientInfoCard patient={patientInfo} />

        {/* Records Summary Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <FileText size={20} />
            Records Summary
          </h2>
          <DataTable columns={tableColumns} data={patientRecords} />
        </div>

        {/* Vertical History Comparison */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center gap-2">
            <Calendar size={20} />
            Referral History
          </h2>
          {patientRecords.length > 0 ? (
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-4 min-w-max">
                <div className="flex-shrink-0 w-48 space-y-4 pt-16">
                  {historyFields.map((field) => (
                    <div key={field.key} className="h-20 flex items-center">
                      <div className="flex items-center gap-2">
                        {field.icon}
                        <span className="font-semibold text-gray-700">{field.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {patientRecords.map((record) => (
                  <div key={record.bite_id} className="flex-shrink-0 w-64 bg-slate-50 rounded-lg p-4 border">
                    <div className="border-b pb-2 mb-4 text-center">
                      <div className="font-bold text-lg text-blue-600 flex items-center justify-center gap-2">
                        <Calendar size={20} />
                        {new Date(record.referral_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {historyFields.map((field) => (
                        <div key={`${record.bite_id}-${field.key}`} className="h-20 flex items-center text-gray-800 text-sm break-words">
                          <p>{record[field.key as keyof PatientRecordDetail] || "N/A"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">No records found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Print Modal */}
      {selectedRecord && (
        <DialogLayout
          isOpen={printModalOpen}
          onOpenChange={setPrintModalOpen}
          title="Print Referral Slip"
          description={`Referral for ${patientName} on ${new Date(selectedRecord.referral_date).toLocaleDateString()}`}
          className="max-w-xl max-h-[90vh] overflow-y-auto"
          mainContent={<ReferralSlip record={selectedRecord} />}
        />
      )}
    </LayoutWithBack>
  );
};

export default IndividualPatientHistory;
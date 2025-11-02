import React, { useState, useMemo, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAnimalBitePatientDetails } from "./api/get-api";
import { ColumnDef } from "@tanstack/react-table";
import { Printer, PawPrint, Calendar, MapPin, Stethoscope, ShieldCheck, User, Building, FileText, TrendingUp, AlertCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

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

// --- Statistics Card Component ---
const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; bgColor: string; iconColor: string }> = ({ icon, title, value, bgColor, iconColor }) => (
  <div className={`${bgColor} rounded-xl p-6 shadow-lg transform transition-all  hover:shadow-xl`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`${iconColor} p-4 rounded-full bg-white bg-opacity-50`}>
        {icon}
      </div>
    </div>
  </div>
);

// --- New Printable Referral Slip Component (Redesigned) ---
const ReferralSlip: React.FC<{ record: PatientRecordDetail }> = ({ record }) => {
  const slipRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    const content = slipRef.current;
    if (!content) return;

    const margin = 10;
    const pdf = new jsPDF("p", "mm", "letter");
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

  useEffect(() => {
    if (!patientId) {
      navigate("/services/animalbites/records");
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

  // Calculate statistics
  const stats = useMemo(() => {
    const exposureTypes = patientRecords.reduce((acc, record) => {
      acc[record.exposure_type] = (acc[record.exposure_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const animalTypes = patientRecords.reduce((acc, record) => {
      acc[record.biting_animal] = (acc[record.biting_animal] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const exposureSites = patientRecords.reduce((acc, record) => {
      acc[record.exposure_site] = (acc[record.exposure_site] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timeline = patientRecords
      .sort((a, b) => new Date(a.referral_date).getTime() - new Date(b.referral_date).getTime())
      .map(record => ({
        date: new Date(record.referral_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        count: 1
      }));

    return {
      totalIncidents: patientRecords.length,
      exposureTypes: Object.entries(exposureTypes).map(([name, value]) => ({ name, value })),
      animalTypes: Object.entries(animalTypes).map(([name, value]) => ({ name, value })),
      exposureSites: Object.entries(exposureSites).map(([name, value]) => ({ name, value })),
      timeline,
      mostCommonAnimal: Object.entries(animalTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
      mostCommonSite: Object.entries(exposureSites).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A",
    };
  }, [patientRecords]);

  const handlePrintClick = (record: PatientRecordDetail) => {
    setSelectedRecord(record);
    setPrintModalOpen(true);
  };

  const tableColumns = useMemo<ColumnDef<PatientRecordDetail>[]>(
    () => [
      { 
        accessorKey: "referral_date", 
        header: "Date", 
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-blue-500" />
            {new Date(row.original.referral_date).toLocaleDateString()}
          </div>
        )
      },
      { 
        accessorKey: "exposure_type", 
        header: "Exposure Type",
        cell: ({ row }) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.original.exposure_type.toLowerCase().includes('bite') 
              ? 'bg-red-100 text-red-700' 
              : 'bg-yellow-100 text-yellow-700'
          }`}>
            {row.original.exposure_type}
          </span>
        )
      },
      { 
        accessorKey: "biting_animal", 
        header: "Biting Animal",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <PawPrint size={14} className="text-orange-500" />
            {row.original.biting_animal}
          </div>
        )
      },
      { accessorKey: "exposure_site", header: "Site of Exposure" },
      { accessorKey: "actions_taken", header: "Actions Taken" },
      { accessorKey: "referredby", header: "Referred By" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-4 justify-center">
            <Button size="sm" onClick={() => handlePrintClick(row.original)} className="bg-blue-600 hover:bg-blue-700">
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
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading patient records...</p>
      </div>
    );
  }

  if (isError || !patientId) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <p className="text-red-600 font-semibold text-lg">
          {error?.message || "Patient ID not provided or could not load patient history."}
        </p>
      </div>
    );
  }

  const patientName = patientData
    ? `${patientData.personal_info.per_fname} ${patientData.personal_info.per_lname}`
    : "Patient";

  return (
    <LayoutWithBack title="Animal Bite Patient History" description="Comprehensive analysis of animal bite incidents">
      <div className="container mx-auto space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
        <PatientInfoCard patient={patientInfo} />

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Activity size={28} />}
            title="Total Incidents"
            value={stats.totalIncidents}
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={<PawPrint size={28} />}
            title="Common Animal Case"
            value={stats.mostCommonAnimal}
            bgColor="bg-gradient-to-br from-orange-100 to-orange-200"
            iconColor="text-orange-600"
          />
          <StatCard
            icon={<MapPin size={28} />}
            title="Common Exposure Site"
            value={stats.mostCommonSite}
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            iconColor="text-green-600"
          />
          <StatCard
            icon={<TrendingUp size={28} />}
            title="Latest Incident"
            value={patientRecords.length > 0 ? new Date(patientRecords[patientRecords.length - 1].referral_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "N/A"}
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            iconColor="text-purple-600"
          />
        </div>

        {/* Charts Section */}
       

        {/* Records Summary Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
            <FileText size={24} className="text-blue-600" />
            Detailed Records
          </h2>
          <DataTable columns={tableColumns} data={patientRecords} />
        </div>

        {/* Timeline History */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
            <Calendar size={24} className="text-indigo-600" />
            Incident Timeline Comparison
          </h2>
          {patientRecords.length > 0 ? (
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-4 min-w-max">
                <div className="flex-shrink-0 w-48 space-y-4 pt-20 sticky left-0 bg-white z-10">
                  {historyFields.map((field) => (
                    <div key={field.key} className="h-20 flex items-center border-r-2 border-gray-200 pr-4">
                      <div className="flex items-center gap-2">
                        {field.icon}
                        <span className="font-semibold text-gray-700">{field.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {patientRecords.map((record, index) => (
                  <div key={record.bite_id} className="flex-shrink-0 w-72 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-5 border-2 border-blue-200 shadow-md hover:shadow-xl transition-all">
                    <div className="border-b-2 border-blue-300 pb-3 mb-4 text-center">
                      <div className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md">
                        <Calendar size={18} />
                        {new Date(record.referral_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      {/* <div className="mt-2 text-xs text-gray-500 font-medium">Incident #{patientRecords.length - index}</div> */}
                    </div>
                    <div className="space-y-4">
                      {historyFields.map((field) => (
                        <div key={`${record.bite_id}-${field.key}`} className="h-20 flex items-center text-gray-800 text-sm break-words bg-white rounded-lg p-3 shadow-sm">
                          <p className="font-medium">{record[field.key as keyof PatientRecordDetail] || "N/A"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl">
              <AlertCircle size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No records found for this patient.</p>
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
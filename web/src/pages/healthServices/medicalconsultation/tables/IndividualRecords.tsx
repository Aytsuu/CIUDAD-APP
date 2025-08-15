import React, { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Search, ChevronLeft, HeartPulse, Calendar } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Syringe, AlertCircle } from "lucide-react";
import { PatientInfoCard } from "@/components/ui/patientInfoCard";
import { Label } from "@/components/ui/label";
import { TableSkeleton } from "../../skeleton/table-skeleton";
import { Patient } from "../../restful-api-patient/type";
import { MedicalConsultationHistory } from "../types";
import { usePatientMedicalRecords } from "../queries/fetchQueries";
import { getMedicalConsultationColumns } from "./columns/indiv_col";
import { usePrenatalPatientMedHistory } from "../../maternal/queries/maternalFetchQueries";
import CardLayout from "@/components/ui/card/card-layout";
import { Badge } from "@/components/ui/badge";

export default function InvMedicalConRecords() {
  const location = useLocation();
  const { params } = location.state || {};
  const { patientData } = params || {};

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null);

  useEffect(() => {
    if (patientData) {
      setSelectedPatientData(patientData);
    }
  }, [patientData]);

  const { data: medicalRecords, isLoading } = usePatientMedicalRecords(patientData?.pat_id);
  const {data: medHistoryData,isLoading: medHistoryLoading,error,} = usePrenatalPatientMedHistory(patientData?.pat_id);

  const getMedicalHistoryCardsData = useCallback(() => {
    if (medHistoryLoading) {
      return [];
    }

    if (error) {
      console.error("Error fetching medical history:", error);
      return [];
    }

    const historyList = medHistoryData?.medical_history || [];

    if (!historyList?.length) {
      return [];
    }

    return historyList.map((history: any) => ({
      id: history.medhist_id || Math.random().toString(36).substring(2, 9),
      illness: history.illness_name || history.ill?.illname || "N/A",
      year: history.year ? history.year : "Not specified",
    }));
  }, [medHistoryData, medHistoryLoading, error]);

  const formatMedicalData = useCallback((): MedicalConsultationHistory[] => {
    if (!medicalRecords || !Array.isArray(medicalRecords)) {
      return [];
    }

    return medicalRecords.map((record: any) => {
      const vitalSigns = record.vital_signs || {};
      const bmiDetails = record.bmi_details || {};
      const patrecDetails = record.patrec_details || {};

      const staffDetails = record.staff_details || null;
      const staffPer = staffDetails?.rp?.per || null;

      return {
        medrec_chief_complaint: record.medrec_chief_complaint || "N/A",
        medrec_id: record.medrec_id,
        created_at: record.created_at || "N/A",
        vital_signs: {
          vital_id: vitalSigns.vital_id || 0,
          vital_bp_systolic: vitalSigns.vital_bp_systolic || "N/A",
          vital_bp_diastolic: vitalSigns.vital_bp_diastolic || "N/A",
          vital_temp: vitalSigns.vital_temp || "N/A",
          vital_RR: vitalSigns.vital_RR || "N/A",
          vital_pulse: vitalSigns.vital_pulse || "N/A",
          created_at: vitalSigns.created_at || "N/A",
        },
        bmi_details: {
          bm_id: bmiDetails.bm_id || 0,
          age: bmiDetails.age || "N/A",
          height: bmiDetails.height || 0,
          weight: bmiDetails.weight || 0,
          bmi: bmiDetails.bmi || "N/A",
          bmi_category: bmiDetails.bmi_category || "N/A",
          created_at: bmiDetails.created_at || "N/A",
          pat: bmiDetails.pat || null,
        },
        find_details: record.find_details || null,
        patrec_details: {
          pat_id: patrecDetails.pat_id || 0,
          medicalrec_count: patrecDetails.medicalrec_count || 0,
          patient_details: patrecDetails.patient_details || null,
        },
        staff_details: staffDetails
          ? {
              rp: staffPer
                ? {
                    per: {
                      per_fname: staffPer.per_fname || "",
                      per_lname: staffPer.per_lname || "",
                      per_mname: staffPer.per_mname || "",
                      per_suffix: staffPer.per_suffix || "",
                      per_dob: staffPer.per_dob || "",
                    },
                  }
                : null,
            }
          : null,
      };
    });
  }, [medicalRecords]);

  const filteredData = React.useMemo(() => {
    return formatMedicalData().filter((record) => {
      const searchText = `${record.medrec_id} 
        ${record.vital_signs.vital_bp_systolic}/${record.vital_signs.vital_bp_diastolic} 
        ${record.bmi_details.bmi} 
        ${record.created_at}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, formatMedicalData]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = getMedicalConsultationColumns(patientData);

  if (!patientData?.pat_id) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <Label className="text-base font-semibold text-yellow-500">
            No patient selected
          </Label>
        </div>
        <p className="text-sm text-gray-700">
          Please select a patient from the medical records page first.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Medical Consultation Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view patient's medical consultation records
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      {selectedPatientData && (
        <div className="mb-4">
          <PatientInfoCard patient={selectedPatientData} />
        </div>
      )}

     <div className="flex w-full">
       {/* Medical History Section - Now using Card Layout */}
       <div className="mb-6 w-full">
        <div className="bg-white border rounded-lg overflow-hidden ">
          {medHistoryLoading ? (
            <div className="p-4 text-center">Loading medical history...</div>
          ) : error ? (
            <div className="p-4 text-red-500">
              Error loading Illness history
            </div>
          ) : (
            <CardLayout
              title={
                <div className="flex items-center gap-2 text-red-500">
                  <HeartPulse className="h-5 w-5 text-red-500" />
                  <span className="text-lg font-semibold text-red-500">
                    Illness/Diagnoses History
                  </span>
                </div>
              }
              content={
                <div className="flex flex-col gap-4">
                  {getMedicalHistoryCardsData().length > 0 ? (
                    getMedicalHistoryCardsData().map((history:any) => (
                      <div 
                        key={history.id}
                        className="border rounded-lg p-4 "
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900">
                            {history.illness}
                          </h3>
                          <Badge variant="outline" className="text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            Diagnosed in {history.year}
                          </Badge>
                        </div>
                        
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500 py-4">
                      No medical history records found
                    </div>
                  )}
                </div>
              }
            />
          )}
        </div>
      </div>

       {/* Medical History Section - Now using Card Layout */}
       <div className="mb-6 w-full">
        <div className="bg-white border rounded-lg overflow-hidden">
          {medHistoryLoading ? (
            <div className="p-4 text-center">Loading medical history...</div>
          ) : error ? (
            <div className="p-4 text-red-500">
              Error loading Illness history
            </div>
          ) : (
            <CardLayout
              title={
                <div className="flex items-center gap-2 text-red-500">
                  <HeartPulse className="h-5 w-5 text-red-500" />
                  <span className="text-lg font-semibold text-red-500">
                    Follow Up Visits
                  </span>
                </div>
              }
              content={
                <div className="flex flex-col gap-4">
                  {getMedicalHistoryCardsData().length > 0 ? (
                    getMedicalHistoryCardsData().map((history:any) => (
                      <div 
                        key={history.id}
                        className="border rounded-lg p-4 "
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900">
                            {history.illness}
                          </h3>
                          <Badge variant="outline" className="text-gray-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            Diagnosed in {history.year}
                          </Badge>
                        </div>
                        
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500 py-4">
                      No medical history records found
                    </div>
                  )}
                </div>
              }
            />
          )}
        </div>
      </div>
     </div>

      {/* Medical Consultations Section */}
      <div className="w-full lg:flex justify-between items-center mb-4 gap-6">
        <div className="flex gap-2 items-center p-2">
          <Syringe className="h-6 w-6 text-blue" />
          <p className="text-sm font-medium text-gray-800 pr-2">
            Total Medical Consultations
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {formatMedicalData().length}
          </p>
        </div>

        <div className="flex flex-1 justify-between items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search records..."
              className="pl-10 w-full bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button className="w-full sm:w-auto">
            <Link
              to="/medical-consultation-form"
              state={{ params: { patientData, mode: "fromindivrecord" } }}
            >
              New Consultation Record
            </Link>
          </Button>
        </div>
      </div>

      <div className="h-full w-full rounded-md">
        <div className="w-full sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-8"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                setPageSize(value >= 1 ? value : 1);
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="Export data">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="bg-white w-full overflow-x-auto">
          {isLoading ? (
            <TableSkeleton columns={columns} rowCount={3} />
          ) : (
            <DataTable columns={columns} data={paginatedData} />
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} records
          </p>

          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}



// import React, { useState, useEffect, useCallback } from "react";
// import { DataTable } from "@/components/ui/table/data-table";
// import { Button } from "@/components/ui/button/button";
// import { Input } from "@/components/ui/input";
// import { ArrowUpDown, Search, ChevronLeft, HeartPulse } from "lucide-react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown/dropdown-menu";
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";
// import { Syringe, AlertCircle } from "lucide-react";
// import { PatientInfoCard } from "@/components/ui/patientInfoCard";
// import { Label } from "@/components/ui/label";
// import { TableSkeleton } from "../../skeleton/table-skeleton";
// import { Patient } from "../../restful-api-patient/type";
// import { MedicalConsultationHistory, previousIllness } from "../types";
// import { usePatientMedicalRecords } from "../queries/fetchQueries";
// import { getMedicalConsultationColumns } from "./columns/indiv_col";
// import { usePrenatalPatientMedHistory } from "../../maternal/queries/maternalFetchQueries";
// import { ColumnDef } from "@tanstack/react-table";
// import CardLayout from "@/components/ui/card/card-layout";
// export default function InvMedicalConRecords() {
//   const location = useLocation();
//   const { params } = location.state || {};
//   const { patientData } = params || {};

//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [pageSize, setPageSize] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedPatientData, setSelectedPatientData] =
//     useState<Patient | null>(null);

//   useEffect(() => {
//     if (patientData) {
//       setSelectedPatientData(patientData);
//     }
//   }, [patientData]);

//   const { data: medicalRecords, isLoading } = usePatientMedicalRecords(
//     patientData?.pat_id
//   );
//   const {
//     data: medHistoryData,
//     isLoading: medHistoryLoading,
//     error,
//   } = usePrenatalPatientMedHistory(patientData?.pat_id);

//   const getMedicalHistoryTableData = useCallback(() => {
//     if (medHistoryLoading) {
//       return [];
//     }

//     if (error) {
//       console.error("Error fetching medical history:", error);
//       return [];
//     }

//     const historyList = medHistoryData?.medical_history || [];

//     if (!historyList?.length) {
//       return [];
//     }

//     return historyList.map((history: any) => ({
//       id: history.medhist_id || Math.random().toString(36).substring(2, 9),
//       illness: history.illness_name || history.ill?.illname || "N/A",
//       year: history.year ? history.year : "Not specified",
//     }));
//   }, [medHistoryData, medHistoryLoading, error]);

//   const illnessColumns: ColumnDef<previousIllness>[] = [
//     {
//       accessorKey: "illness",
//       header: "Previous Illness",
//       cell: ({ row }) => (
//         <div className="capitalize min-w-[200px] px-2">
//           {row.getValue("illness")}
//         </div>
//       ),
//     },
//     {
//       accessorKey: "year",
//       header: "Year",
//       cell: ({ row }) => (
//         <div className="min-w-[100px] px-2">{row.getValue("year")}</div>
//       ),
//     },
//   ];

//   const formatMedicalData = useCallback((): MedicalConsultationHistory[] => {
//     // First check if medicalRecords exists and is an array
//     if (!medicalRecords || !Array.isArray(medicalRecords)) {
//       return [];
//     }

//     return medicalRecords.map((record: any) => {
//       const vitalSigns = record.vital_signs || {};
//       const bmiDetails = record.bmi_details || {};
//       const patrecDetails = record.patrec_details || {};

//       const staffDetails = record.staff_details || null;
//       const staffPer = staffDetails?.rp?.per || null;

//       return {
//         medrec_chief_complaint: record.medrec_chief_complaint || "N/A",
//         medrec_id: record.medrec_id,
//         created_at: record.created_at || "N/A",
//         vital_signs: {
//           vital_id: vitalSigns.vital_id || 0,
//           vital_bp_systolic: vitalSigns.vital_bp_systolic || "N/A",
//           vital_bp_diastolic: vitalSigns.vital_bp_diastolic || "N/A",
//           vital_temp: vitalSigns.vital_temp || "N/A",
//           vital_RR: vitalSigns.vital_RR || "N/A",
//           vital_pulse: vitalSigns.vital_pulse || "N/A",
//           created_at: vitalSigns.created_at || "N/A",
//         },
//         bmi_details: {
//           bm_id: bmiDetails.bm_id || 0,
//           age: bmiDetails.age || "N/A",
//           height: bmiDetails.height || 0,
//           weight: bmiDetails.weight || 0,
//           bmi: bmiDetails.bmi || "N/A",
//           bmi_category: bmiDetails.bmi_category || "N/A",
//           created_at: bmiDetails.created_at || "N/A",
//           pat: bmiDetails.pat || null,
//         },
//         find_details: record.find_details || null,
//         patrec_details: {
//           pat_id: patrecDetails.pat_id || 0,
//           medicalrec_count: patrecDetails.medicalrec_count || 0,
//           patient_details: patrecDetails.patient_details || null,
//         },
//         staff_details: staffDetails
//           ? {
//               rp: staffPer
//                 ? {
//                     per: {
//                       per_fname: staffPer.per_fname || "",
//                       per_lname: staffPer.per_lname || "",
//                       per_mname: staffPer.per_mname || "",
//                       per_suffix: staffPer.per_suffix || "",
//                       per_dob: staffPer.per_dob || "",
//                     },
//                   }
//                 : null,
//             }
//           : null,
//       };
//     });
//   }, [medicalRecords]);

//   const filteredData = React.useMemo(() => {
//     return formatMedicalData().filter((record) => {
//       const searchText = `${record.medrec_id} 
//         ${record.vital_signs.vital_bp_systolic}/${record.vital_signs.vital_bp_diastolic} 
//         ${record.bmi_details.bmi} 
//         ${record.created_at}`.toLowerCase();
//       return searchText.includes(searchQuery.toLowerCase());
//     });
//   }, [searchQuery, formatMedicalData]);

//   const totalPages = Math.ceil(filteredData.length / pageSize);
//   const paginatedData = filteredData.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const columns = getMedicalConsultationColumns(patientData);

//   if (!patientData?.pat_id) {
//     return (
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
//         <div className="flex items-center gap-3 mb-4">
//           <AlertCircle className="h-4 w-4 text-yellow-500" />
//           <Label className="text-base font-semibold text-yellow-500">
//             No patient selected
//           </Label>
//         </div>
//         <p className="text-sm text-gray-700">
//           Please select a patient from the medical records page first.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-full flex flex-col">
//       <div className="flex flex-col sm:flex-row gap-4 mb-4">
//         <Button
//           className="text-black p-2 mb-2 self-start"
//           variant={"outline"}
//           onClick={() => navigate(-1)}
//         >
//           <ChevronLeft />
//         </Button>
//         <div className="flex-col items-center">
//           <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
//             Medical Consultation Records
//           </h1>
//           <p className="text-xs sm:text-sm text-darkGray">
//             Manage and view patient's medical consultation records
//           </p>
//         </div>
//       </div>
//       <hr className="border-gray mb-5 sm:mb-8" />

//       {selectedPatientData && (
//         <div className="mb-4">
//           <PatientInfoCard patient={selectedPatientData} />
//         </div>
//       )}

//       {/* Medical History Section */}
//       <div className="mb-6">
//         <div className="bg-white border rounded-lg overflow-hidden">
//             {medHistoryLoading ? (
//             <div className="p-4 text-center">Loading medical history...</div>
//             ) : error ? (
//             <div className="p-4 text-red-500">
//               Error loading Illness history
//             </div>
//             ) : (
//             <CardLayout
//               title={
//                 <div className="flex items-center gap-2 text-red-500">
//                 <HeartPulse className="h-5 w-5 text-red-500" />
//                 <span className="text-lg font-semibold text-red-500">
//                   Illness/Diagnoses History
//                 </span>
//                 </div>
//               }
//               content={
//               <DataTable
//                 columns={illnessColumns}
//                 data={getMedicalHistoryTableData()}
//               />
//               }
//             />
//             )}
//         </div>
//       </div>

//       {/* Medical Consultations Section */}
//       <div className="w-full lg:flex justify-between items-center mb-4 gap-6">
//         <div className="flex gap-2 items-center p-2">
//           <Syringe className="h-6 w-6 text-blue" />
//           <p className="text-sm font-medium text-gray-800 pr-2">
//             Total Medical Consultations
//           </p>
//           <p className="text-2xl font-bold text-gray-900">
//             {formatMedicalData().length}
//           </p>
//         </div>

//         <div className="flex flex-1 justify-between items-center gap-2">
//           <div className="relative flex-1">
//             <Search
//               className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
//               size={17}
//             />
//             <Input
//               placeholder="Search records..."
//               className="pl-10 w-full bg-white"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>

//           <Button className="w-full sm:w-auto">
//             <Link
//               to="/medical-consultation-form"
//               state={{ params: { patientData, mode: "fromindivrecord" } }}
//             >
//               New Consultation Record
//             </Link>
//           </Button>
//         </div>
//       </div>

//       <div className="h-full w-full rounded-md">
//         <div className="w-full sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
//           <div className="flex gap-x-2 items-center">
//             <p className="text-xs sm:text-sm">Show</p>
//             <Input
//               type="number"
//               className="w-14 h-8"
//               value={pageSize}
//               onChange={(e) => {
//                 const value = +e.target.value;
//                 setPageSize(value >= 1 ? value : 1);
//               }}
//               min="1"
//             />
//             <p className="text-xs sm:text-sm">Entries</p>
//           </div>
//           <div>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" aria-label="Export data">
//                   <ArrowUpDown className="mr-2 h-4 w-4" />
//                   Export
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent>
//                 <DropdownMenuItem>Export as CSV</DropdownMenuItem>
//                 <DropdownMenuItem>Export as Excel</DropdownMenuItem>
//                 <DropdownMenuItem>Export as PDF</DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>

//         <div className="bg-white w-full overflow-x-auto">
//           {isLoading ? (
//             <TableSkeleton columns={columns} rowCount={3} />
//           ) : (
//             <DataTable columns={columns} data={paginatedData} />
//           )}
//         </div>

//         <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
//           <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
//             Showing{" "}
//             {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
//             {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
//             {filteredData.length} records
//           </p>

//           <div className="w-full sm:w-auto flex justify-center">
//             <PaginationLayout
//               currentPage={currentPage}
//               totalPages={totalPages}
//               onPageChange={setCurrentPage}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

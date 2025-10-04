import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { usePatientPostpartumAllRecords } from "../../queries/maternalFetchQueries";

interface PostpartumRecord {
  date: string;
  familyNo: string;
  name: string;
  age: string;
  husbandName: string;
  address: string;
  dateTimeOfDelivery: string;
  placeOfDelivery: string;
  attendedBy: string;
  outcome: string;
  ttStatus: string;
  ironSupplementationDate: string;
  lochialDischarges: string;
  vitASupplementation: string;
  numOfPadsPerDay: string;
  mebendazoleGiven: string;
  dateTimeInitiatedBF: string;
  bloodPressure: string;
  feeding: string;
  findings: string;
  nursesNotes: string;
}

interface PostpartumCareHistoryProps {
  pregnancyId?: string;
}

export default function PostpartumCareHistory({ pregnancyId: propPregnancyId }: PostpartumCareHistoryProps) {
  const [postpartumRecords, setPostpartumRecords] = useState<PostpartumRecord[]>([]);
  const [pregnancyId, setPregnancyId] = useState<string>("");
  
  const location = useLocation();
  
  // Get pregnancy ID from props or location state
  useEffect(() => {
    if (propPregnancyId) {
      setPregnancyId(propPregnancyId);
    } else if (location.state?.params?.pregnancyId) {
      setPregnancyId(location.state.params.pregnancyId);
    }
  }, [propPregnancyId, location.state]);

  // Fetch postpartum records using the hook
  const { data: postpartumData, isLoading, error } = usePatientPostpartumAllRecords(pregnancyId);

  // Transform API data to table format
  useEffect(() => {
    if (postpartumData && Array.isArray(postpartumData)) {
      const transformedRecords: PostpartumRecord[] = postpartumData.map((record: any) => {
        const personalInfo = record.patient_details?.personal_info;
        const address = record.patient_details?.address;
        const family = record.patient_details?.family;
        const deliveryRecord = record.delivery_records?.[0];
        const vitalSigns = record.vital_signs;
        const assessment = record.assessments?.[0]; // Get first assessment
        
        // Check if patient is resident and get spouse information
        const isResident = record.patient_details?.pat_type?.toLowerCase() === "resident";
        const fatherInfo = record.patient_details?.family?.family_heads?.father?.personal_info;
        const spouseInfo = record.spouse;
        
        // Calculate age
        const age = personalInfo?.per_dob ? 
          Math.floor((new Date().getTime() - new Date(personalInfo.per_dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000)).toString() 
          : "";

        return {
          date: assessment?.ppa_date_of_visit || "N/A",
          familyNo: family?.fam_id || "N/A",
          name: `${personalInfo?.per_lname || ""}, ${personalInfo?.per_fname || ""} ${personalInfo?.per_mname || ""}`.trim(),
          age: age,
          husbandName: isResident && fatherInfo ? 
            `${fatherInfo.per_lname || ""}, ${fatherInfo.per_fname || ""} ${fatherInfo.per_mname || ""}`.trim() :
            spouseInfo ? `${spouseInfo.spouse_lname || ""}, ${spouseInfo.spouse_fname || ""} ${spouseInfo.spouse_mname || ""}`.trim() : "N/A",
          address: `${address?.add_street || ""} ${address?.add_sitio || ""} ${address?.add_barangay || ""} ${address?.add_city || ""} ${address?.add_province || ""}`.trim(),
          dateTimeOfDelivery: deliveryRecord ? 
            `${deliveryRecord.ppdr_date_of_delivery || ""} ${deliveryRecord.ppdr_time_of_delivery || ""}`.trim() : "N/A",
          placeOfDelivery: deliveryRecord?.ppdr_place_of_delivery || "N/A",
          attendedBy: deliveryRecord?.ppdr_attended_by || "N/A",
          outcome: deliveryRecord?.ppdr_outcome || "N/A",
          ttStatus: "N/A", // Not available in current API structure
          ironSupplementationDate: "N/A", // Not available in current API structure
          lochialDischarges: record.ppr_lochial_discharges || "N/A",
          vitASupplementation: record.ppr_vit_a_date_given || "N/A",
          numOfPadsPerDay: record.ppr_num_of_pads?.toString() || "N/A",
          mebendazoleGiven: record.ppr_mebendazole_date_given || "N/A",
          dateTimeInitiatedBF: record.ppr_date_of_bf && record.ppr_time_of_bf ? 
            `${record.ppr_date_of_bf} ${record.ppr_time_of_bf}`.trim() : "N/A",
          bloodPressure: vitalSigns ? `${vitalSigns.vital_bp_systolic}/${vitalSigns.vital_bp_diastolic}` : "N/A",
          feeding: assessment?.ppa_feeding || "N/A",
          findings: assessment?.ppa_findings || "N/A",
          nursesNotes: assessment?.ppa_nurses_notes || "N/A"
        };
      });
      
      setPostpartumRecords(transformedRecords);
    }
  }, [postpartumData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8 mr-2" />
        Loading postpartum records...
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-slate-200 shadow-sm font-poppins">
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Failed to load postpartum care history. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort data from most recent to oldest
  const sortedData = [...postpartumRecords].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  if (!postpartumRecords || postpartumRecords.length === 0) {
    return (
      <Card className="border-slate-200 shadow-sm font-poppins">
        <CardContent className="p-8 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-700 mb-2">
            No Postpartum Records Available
          </h3>
          <p className="text-slate-500">
            No postpartum records have been documented for this patient.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasMoreRecords = sortedData.length > 3;

  interface TableRowConfig {
    label: string;
    icon?: React.ReactNode;
    accessor: (record: PostpartumRecord) => string | React.ReactNode;
    cellClassName?: string;
  }

  const tableRows: TableRowConfig[] = [
    {
      label: "Date",
      accessor: (record) => new Date(record.date).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" }),
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Family No.",
      accessor: (record) => (
        <Badge variant="outline" className="font-poppins text-sm">
          {record.familyNo}
        </Badge>
      ),
      cellClassName: "text-center"
    },
    {
      label: "Name",
      accessor: (record) => record.name,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Age",
      accessor: (record) => record.age,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Husband's Name",
      accessor: (record) => record.husbandName,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Address",
      accessor: (record) => record.address,
      cellClassName: "font-poppins text-sm text-center max-w-xs"
    },
    {
      label: "Date & Time of Delivery",
      accessor: (record) => record.dateTimeOfDelivery,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Place of Delivery",
      accessor: (record) => record.placeOfDelivery,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Attended By",
      accessor: (record) => record.attendedBy,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Outcome",
      accessor: (record) => record.outcome,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "TT Status",
      accessor: (record) => record.ttStatus,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Iron Supplementation Date",
      accessor: (record) => record.ironSupplementationDate,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Lochial Discharges",
      accessor: (record) => record.lochialDischarges,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Vit A Supplementation",
      accessor: (record) => record.vitASupplementation,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "No. of Pad / Day",
      accessor: (record) => record.numOfPadsPerDay,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Mebendazole Given",
      accessor: (record) => record.mebendazoleGiven,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Date & Time Initiated BF",
      accessor: (record) => record.dateTimeInitiatedBF,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "B/P",
      accessor: (record) => record.bloodPressure,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Feeding",
      accessor: (record) => record.feeding,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Findings",
      accessor: (record) => (
        <div className="text-sm leading-relaxed">
          <div className="p-2 rounded border-blue-200">
            {record.findings}
          </div>
        </div>
      ),
      cellClassName: "text-center max-w-xs"
    },
    {
      label: "Nurses Notes",
      accessor: (record) => (
        <div className="text-sm leading-relaxed">
          <div className="p-2 rounded border-green-200">
            {record.nursesNotes}
          </div>
        </div>
      ),
      cellClassName: "text-center max-w-sm"
    }
  ];

  return (
    <Card className="border-slate-300 shadow-sm font-poppins">
      <CardContent className="p-0">
        <div className={hasMoreRecords ? "overflow-x-auto" : ""}>
          <Table className={hasMoreRecords ? "w-max" : "w-full"}>
            <TableHeader className="bg-slate-100">
              <TableRow className="border-slate-200">
                <TableHead className={`font-semibold text-slate-700 text-xs uppercase tracking-wide w-44 ${hasMoreRecords ? 'sticky left-0 bg-slate-100 z-10' : ''}`}>
                  Clinical Parameter
                </TableHead>
                {sortedData.map((_, index) => (
                  <TableHead 
                    key={index} 
                    className={`font-semibold text-slate-700 p-5 text-xs uppercase tracking-wide text-center ${hasMoreRecords ? 'min-w-48' : 'w-auto'}`}
                  >
                    Visit {sortedData.length - index}
                    {index === 0 && <span className="text-blue-500 ml-1">[CURRENT]</span>}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="border-slate-100 hover:bg-slate-50/50">
                  <TableCell className={`font-semibold text-slate-700 bg-slate-50 align-middle p-5 ${hasMoreRecords ? 'sticky left-0 z-5' : ''}`}>
                    <div className="flex items-center gap-2">
                      {row.icon}
                      <span>{row.label}</span>
                    </div>
                  </TableCell>
                  {sortedData.map((record, recordIndex) => (
                    <TableCell 
                      key={recordIndex} 
                      className={`${row.cellClassName} ${hasMoreRecords ? 'min-w-48' : ''}`}
                    >
                      {row.accessor(record)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {hasMoreRecords && (
          <div className="bg-slate-50 border-t border-slate-200 p-3 text-center text-sm text-slate-600">
            Showing all {sortedData.length} records. Scroll left/right to see all records.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
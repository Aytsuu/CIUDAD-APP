import { Card, CardContent } from "@/components/ui/card";
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
      <div className="text-center text-red-600 p-4">
        Failed to load postpartum records. Please try again.
      </div>
    );
  }

  const hasData = postpartumRecords && postpartumRecords.length > 0;

  const fieldLabels = [
    { key: 'date', label: 'Date' },
    { key: 'familyNo', label: 'Family No.' },
    { key: 'name', label: 'Name' },
    { key: 'age', label: 'Age' },
    { key: 'husbandName', label: "Husband's Name" },
    { key: 'address', label: 'Address' },
    { key: 'dateTimeOfDelivery', label: 'Date and Time of Delivery' },
    { key: 'placeOfDelivery', label: 'Place of Delivery' },
    { key: 'attendedBy', label: 'Attended By' },
    { key: 'outcome', label: 'Outcome' },
    { key: 'ttStatus', label: 'TT Status' },
    { key: 'ironSupplementationDate', label: 'Iron Supplementation Date' },
    { key: 'lochialDischarges', label: 'Lochial Discharges' },
    { key: 'vitASupplementation', label: 'Vit A Supplementation' },
    { key: 'numOfPadsPerDay', label: 'No. of Pad / Day' },
    { key: 'mebendazoleGiven', label: 'Mebendazole Given' },
    { key: 'dateTimeInitiatedBF', label: 'Date and Time Initiated BF' },
    { key: 'bloodPressure', label: 'B/P' },
    { key: 'feeding', label: 'Feeding' },
    { key: 'findings', label: 'Findings' },
    { key: 'nursesNotes', label: 'Nurses Notes' }
  ];

  return (
    <div className="space-y-4">
      {hasData ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {postpartumRecords.length} Postpartum Record{postpartumRecords.length !== 1 ? 's' : ''} Found
              </span>
            </div>
          </div>
          
          {/* Postpartum Records - Each record displayed vertically */}
          <div className="space-y-6">
            {postpartumRecords.map((record, recordIndex) => (
              <div key={recordIndex} className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-blue-50 px-4 py-3 border-b border-gray-300">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Postpartum Record #{recordIndex + 1} - {record.name}
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {fieldLabels.map((field, fieldIndex) => (
                        <tr key={fieldIndex} className={fieldIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-700 border-r border-gray-300 w-1/3">
                            {field.label}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {record[field.key as keyof PostpartumRecord] || "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card className="text-center py-16 border-slate-200">
          <CardContent>
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">
              No Postpartum Records Available
            </h3>
            <p className="text-slate-500">
              No postpartum records have been documented for this patient.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
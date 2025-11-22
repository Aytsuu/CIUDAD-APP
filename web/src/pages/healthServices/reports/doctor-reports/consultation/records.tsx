// components/MonthlyConsultedDetails.tsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, Search } from "lucide-react";
import { useMonthlyDetails } from "./queries/fetch";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

export default function MonthlyConsultedDetails() {
  const location = useLocation();
  const state = location.state as { month: string; monthName: string };
  const { month, monthName } = state || {};

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data: apiResponse, isLoading, error } = useMonthlyDetails(
    month,
    1, // Default page
    10, // Default page size
    undefined,
    "all",
    debouncedSearchQuery
  );

  const records = apiResponse?.data?.records || [];

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch monthly details");
    }
  }, [error]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  // Helper function to get patient name
  const getPatientName = (record: any) => {
    if (record.record_type === "medical-consultation") {
      const personalInfo = record.data.patrec_details.patient_details.personal_info;
      return `${personalInfo.per_fname} ${personalInfo.per_lname}`;
    } else {
      const personalInfo = record.data.chrec_details.patrec_details.pat_details.personal_info;
      return `${personalInfo.per_fname} ${personalInfo.per_lname}`;
    }
  };

  // Helper function to get patient address
  const getPatientAddress = (record: any) => {
    if (record.record_type === "medical-consultation") {
      return record.data.patrec_details.patient_details.address.full_address;
    } else {
      return record.data.chrec_details.patrec_details.pat_details.address.full_address;
    }
  };

  // Helper function to get find details
  const getFindDetails = (record: any) => {
    if (record.record_type === "medical-consultation") {
      return record.data.find_details;
    } else if (record.data.child_health_vital_signs?.[0]?.find_details) {
      return record.data.child_health_vital_signs[0].find_details;
    }
    return null;
  };

  // Helper function to get date consulted from find details
  const getDateConsulted = (record: any) => {
    const findDetails = getFindDetails(record);
    return findDetails?.created_at || record.data.created_at;
  };

  // Helper function to get organized findings
  const getOrganizedFindings = (record: any) => {
    const findDetails = getFindDetails(record);
    if (!findDetails) return "No findings available";

    const sections = [];

    // Subjective
    if (findDetails.subj_summary) {
      sections.push(`SUBJECTIVE:\n${findDetails.subj_summary}`);
    }

    // Objective
    if (findDetails.obj_summary) {
      const groupedObjective = findDetails.obj_summary.split("\n").reduce((acc: Record<string, string[]>, line: string) => {
        const [category, detail] = line.split(":").map((part) => part.trim());
        if (category && detail) {
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(detail);
        }
        return acc;
      }, {});

      const groupedObjectiveString = Object.entries(groupedObjective)
        .map(([category, details]) => `${category}: ${(details as string[]).join(", ")}`)
        .join("\n");

      sections.push(`OBJECTIVE:\n${groupedObjectiveString}`);
    }

    // Assessment
    if (findDetails.assessment_summary) {
      sections.push(`ASSESSMENT:\n${findDetails.assessment_summary}`);
    }

    // Plan Treatment
    if (findDetails.plantreatment_summary) {
      sections.push(`TREATMENT PLAN:\n${findDetails.plantreatment_summary}`);
    }

    // Lab Details
    if (findDetails.lab_details) {
      const labTests = [];
      const labDetails = findDetails.lab_details;

      // As required tests
      if (labDetails.is_cbc) labTests.push("• CBC w/ platelet count");
      if (labDetails.is_urinalysis) labTests.push("• Urinalysis");
      if (labDetails.is_fecalysis) labTests.push("• Fecalysis");
      if (labDetails.is_sputum_microscopy) labTests.push("• Sputum Microscopy");
      if (labDetails.is_creatine) labTests.push("• Creatinine");
      if (labDetails.is_hba1c) labTests.push("• HbA1C");

      // Mandatory tests
      if (labDetails.is_chestxray) labTests.push("• Chest X-Ray (≥10)");
      if (labDetails.is_papsmear) labTests.push("• Pap smear (≥20)");
      if (labDetails.is_fbs) labTests.push("• FBS (≥40)");
      if (labDetails.is_oralglucose) labTests.push("• Oral Glucose Tolerance Test (≥40)");
      if (labDetails.is_lipidprofile) labTests.push("• Lipid profile (≥40)");
      if (labDetails.is_fecal_occult_blood) labTests.push("• Fecal Occult Blood (≥50)");
      if (labDetails.is_ecg) labTests.push("• ECG (≥60)");

      if (labDetails.others) {
        labTests.push(`• ${labDetails.others}`);
      }

      if (labTests.length > 0) {
        sections.push(`LABORATORY TESTS:\n${labTests.join('\n')}`);
      }
    }

    return sections.join('\n\n');
  };

  return (
    <LayoutWithBack
      title={`Monthly Consulted Records`}
      description={`${monthName} - Doctor Assessed Records`}
    >
      <div className="bg-white p-4 border flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by patient name..."
            className="pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-b-lg overflow-hidden mt-4">
        {isLoading ? (
          <div className="w-full h-[200px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : records.length === 0 ? (
          <div className="w-full h-[200px] flex items-center justify-center">
            <p className="text-gray-600">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left font-medium text-gray-900 border border-gray-300 w-1/6">Name</th>
                  <th className="p-3 text-left font-medium text-gray-900 border border-gray-300 w-1/6">Address</th>
                  <th className="p-3 text-left font-medium text-gray-900 border border-gray-300 w-2">Findings</th>
                  <th className="p-3 text-left font-medium text-gray-900 border border-gray-300 w-1/6">Date Consulted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {records.map((record:any, index:any) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3 border border-gray-300 align-top">
                      <div className="flex items-center gap-2">
                       
                        <div>
                          <p className="font-medium text-gray-900">
                            {getPatientName(record)}
                          </p>
                          <p className="text-xs text-gray-600 capitalize">
                            {record.record_type === "medical-consultation" ? 
                              "Medical Consultation" : "Child Health"
                            }
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-gray-900 border border-gray-300 align-top">
                      {getPatientAddress(record)}
                    </td>
                    <td className="p-3 text-gray-900 border border-gray-300 align-top">
                      <div className="max-w-none">
                        <pre className="text-sm whitespace-pre-wrap font-sans">
                          {getOrganizedFindings(record)}
                        </pre>
                      </div>
                    </td>
                    <td className="p-3 text-gray-900 border border-gray-300 align-top">
                      {formatDate(getDateConsulted(record))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </LayoutWithBack>
  );
}
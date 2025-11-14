import { Card } from "@/components/ui/card";
import { ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { calculateAge } from "@/helpers/ageCalculator";
import { useCombinedHealthRecords } from "@/pages/healthServices/doctor/reffered_patients/queries/fetch";
export const ReferredPatientsSidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const staffId = user?.staff?.staff_id || "";

  const { data: combinedData, isLoading } = useCombinedHealthRecords(
    staffId, 
    "", // No search query
    "all", // All record types
    1, // First pageF
    5 // Only need 5 records for sidebar
  );

  const records = combinedData?.results || [];
  const totalCount = combinedData?.count || 0;

  const formatName = (personalInfo: any) => {
    if (!personalInfo) return "Unknown Patient";
    
    const firstName = personalInfo.per_fname || "";
    const middleName = personalInfo.per_mname || "";
    const lastName = personalInfo.per_lname || "";
    
    const middle = middleName && middleName.trim() ? `${middleName[0].toUpperCase()}.` : "";
    return `${firstName.trim()} ${middle} ${lastName.trim()}`.replace(/\s+/g, " ").trim();
  };

  const getPatientDetails = (record: any) => {
    let patientDetails = null;
    let personalInfo = null;

    if (record.record_type === "child-health") {
      patientDetails = record.data.chrec_details?.patrec_details?.pat_details;
      personalInfo = patientDetails?.personal_info || {};
    } else {
      patientDetails = record.data.patrec_details?.patient_details;
      personalInfo = patientDetails?.personal_info || {};
    }

    return {
      personalInfo,
      patientDetails,
      recordType: record.record_type,
      recordData: record.data
    };
  };

  const handleClick = (record: any) => {
    const { personalInfo, patientDetails, recordType, recordData } = getPatientDetails(record);
    const address = patientDetails?.address || {};

    const patientData = {
      pat_id: patientDetails?.pat_id,
      pat_type: patientDetails?.pat_type,
      age: personalInfo.per_dob ? calculateAge(personalInfo.per_dob).toString() : "",
      addressFull: address.full_address,
      address: {
        add_street: address.add_street,
        add_barangay: address.add_barangay,
        add_city: address.add_city,
        add_province: address.add_province,
        add_sitio: address.add_sitio
      },
      households: patientDetails?.households || [],
      personal_info: personalInfo
    };

    navigate(recordType === "child-health" ? "/referred-patients/child" : "/referred-patients/adult", {
      state: {
        patientData,
        recordData: recordData,
        recordType: recordType,
        ...(recordType === "child-health" ? { checkupData: recordData } : { MedicalConsultation: recordData })
      }
    });
  };

  const getRecordTypeBadge = (recordType: string) => {
    const types: { [key: string]: { label: string, color: string } } = {
      "child-health": { label: "Child", color: "text-green-600 bg-green-50 border-green-500" },
      "medical-consultation": { label: "Medical", color: "text-blue-600 bg-blue-50 border-blue-500" },
      "prenatal": { label: "Prenatal", color: "text-purple-600 bg-purple-50 border-purple-500" }
    };
    
    return types[recordType] || { label: recordType.replace("-", " "), color: "text-gray-600 bg-gray-50 border-gray-500" };
  };

  // Display only first 5 records
  const displayedRecords = records.slice(0, 5);

  return (
    <Card className="w-full bg-white h-full flex flex-col border-none">
      

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-4 bg-black/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-black/20 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedRecords.length > 0 ? (
          <div className="p-4 space-y-3">
            {displayedRecords.map((record: any) => {
              const { personalInfo, recordType } = getPatientDetails(record);
              const badge = getRecordTypeBadge(recordType);
              
              return (
                <Card 
                  key={`${record.record_type}-${record.data.id || record.data.medrec_id || record.data.chrec_id}`} 
                  className="p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-200" 
                  onClick={() => handleClick(record)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-700 truncate">
                          {formatName(personalInfo)}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 border rounded-full ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>
                          {personalInfo?.per_sex || "Unknown"}, {personalInfo?.per_dob ? calculateAge(personalInfo.per_dob) : "N/A"}
                        </span>
                        <span className="text-blue-600 font-medium">Referred</span>
                      </div>
                    </div>
                    
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-sm font-medium text-blue-700 mb-1">No referred patients</h3>
            <p className="text-sm text-gray-500">Referred patients will appear here</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {totalCount > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Link to="/referred-patients/pending-assessment">
            <Button variant="link" className="w-full justify-start text-blue-600 hover:text-blue-700">
              View All Referred Patients ({totalCount > 100 ? "100+" : totalCount})
              {totalCount > 5 && <span className="ml-1 text-gray-400">• Showing 5 of {totalCount}</span>}
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
};
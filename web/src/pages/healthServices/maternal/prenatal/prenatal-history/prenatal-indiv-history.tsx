// In prenatal-indiv-history.tsx - remove mock data and use real API data
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { usePrenatalPatientPrenatalCare } from "../../queries/maternalFetchQueries";
import { PrenatalHistoryTable } from "../../maternal-components/prenatal-history";
import PrenatalViewingOne from "./prenatal-viewing";
import PrenatalFormHistory from "./prenatal-form-history";

interface PrenatalVisit {
  date: string;
  aog: string;
  weight: string;
  bloodPressure: string;
  leopoldsFindings: {
    fundalHeight: string;
    fetalHeartbeat: string;
    fetalPosition: string;
  };
  notes: {
    complaint: string;
    advice: string;
  };
  changes?: {
    weight?: boolean;
    bloodPressure?: boolean;
    fundalHeight?: boolean;
    fetalHeartbeat?: boolean;
    fetalPosition?: boolean;
  };
}

export default function PrenatalIndivHistory() {
  const location = useLocation();
  const { patientData, pregnancyId, visitNumber } = location.state?.params || {};
  const [activeTab, setActiveTab] = useState("prenatalcare");

  // Fetch real API data
  const { 
    data: prenatalCareData, 
    isLoading, 
    error 
  } = usePrenatalPatientPrenatalCare(
    patientData?.pat_id || "", 
    pregnancyId || ""
  );

  // Get records up to the selected visit number
  const recordsToShow = prenatalCareData?.prenatal_records?.slice(0, visitNumber) || [];

  // Transform API data to PrenatalVisit format
  const transformedData: PrenatalVisit[] = recordsToShow.flatMap((record: any) => 
    record.prenatal_care_entries.map((entry: any) => ({
      date: new Date(entry.pfpc_date).toLocaleDateString(),
      aog: `${entry.pfpc_aog_weeks || 0}w ${entry.pfpc_aog_days || 0}d`,
      weight: `${entry.weight || entry.pfpc_weight || 0} kg`,
      bloodPressure: `${entry.bp_systolic || entry.pfpc_bp_systolic || 0}/${entry.bp_diastolic || entry.pfpc_bp_diastolic || 0}`,
      leopoldsFindings: {
        fundalHeight: entry.pfpc_fundal_height || "N/A",
        fetalHeartbeat: entry.pfpc_fetal_heart_rate || "N/A",
        fetalPosition: entry.pfpc_fetal_position || "N/A"
      },
      notes: {
        complaint: entry.pfpc_complaints || "No complaints",
        advice: entry.pfpc_advises || "No specific advice"
      }
    }))
  );

  // Sort data chronologically (oldest first for change detection)
  const chronologicalData = [...transformedData].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  const detectChanges = (currentVisit: PrenatalVisit, previousVisit: PrenatalVisit | null): PrenatalVisit => {
    if (!previousVisit) {
      return { ...currentVisit, changes: {} };
    }

    const changes = {
      weight: currentVisit.weight !== previousVisit.weight,
      bloodPressure: currentVisit.bloodPressure !== previousVisit.bloodPressure,
      fundalHeight: currentVisit.leopoldsFindings.fundalHeight !== previousVisit.leopoldsFindings.fundalHeight,
      fetalHeartbeat: currentVisit.leopoldsFindings.fetalHeartbeat !== previousVisit.leopoldsFindings.fetalHeartbeat,
      fetalPosition: currentVisit.leopoldsFindings.fetalPosition !== previousVisit.leopoldsFindings.fetalPosition,
    };

    return { ...currentVisit, changes };
  };

  // Process data to detect changes
  const processedPrenatalData = chronologicalData.map((visit, index) => {
    const previousVisit = index > 0 ? chronologicalData[index - 1] : null;
    return detectChanges(visit, previousVisit);
  });

  const hasData = processedPrenatalData && processedPrenatalData.length > 0;

  const getTabStyle = (tab: string) => {
    const baseClasses = "flex justify-center items-center cursor-pointer text-black/70 transition-colors duration-200 ease-in-out rounded-md p-2";
    
    if (activeTab === tab) {
      return `${baseClasses} bg-white shadow-md border text-blue-500`;
    } else {
      return `${baseClasses} bg-blue-50 text-gray-100 hover:bg-white/`;
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <LayoutWithBack 
        title="Prenatal Visit Records"
        description="Loading prenatal care history..."
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </LayoutWithBack>
    );
  }

  // Error state
  if (error) {
    return (
      <LayoutWithBack 
        title="Prenatal Visit Records"
        description="Error loading prenatal care history"
      >
        <div className="text-center text-red-600">
          Failed to load prenatal care history. Please try again.
        </div>
      </LayoutWithBack>
    );
  }

  return (
    <LayoutWithBack 
      title="Prenatal Visit Records"
      description="Complete record of prenatal visits and clinical notes"
    >
      <div className="bg-white p-3 space-y-2">
        {/* Patient Context Info */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
          <div className="text-sm">
            <div className="font-medium text-blue-800">
              {patientData?.personal_info?.per_fname} {patientData?.personal_info?.per_lname}
            </div>
            <div className="text-blue-600">
              Pregnancy ID: {pregnancyId} | Viewing visits 1 through {visitNumber}
            </div>
            <div className="text-blue-600">
              Total prenatal care entries: {processedPrenatalData.length}
            </div>
          </div>
        </div>

        <div className="">
          <PrenatalViewingOne />
        </div>
        
        <div className="bg-white/70 p-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={getTabStyle("prenatalcare")} onClick={() => setActiveTab("prenatalcare")}>
              <h2 className="font-semibold">Prenatal Care History</h2>
            </div>

            <div className={getTabStyle("prenatalform")} onClick={() => setActiveTab("prenatalform")}>
              <h2 className="font-semibold">Prenatal Form History</h2>
            </div>
          </div>
        </div>

        {/* Legend for changes */}
        {/* {hasData && activeTab === "prenatalcare" && (
          <div className="bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 bg-red-500 rounded"></span>
              <span className="text-red-700 font-medium">Red highlighting indicates values that changed from the previous visit</span>
            </div>
          </div>
        )} */}

        {/* Prenatal History Table with real data */}
        {hasData && activeTab === "prenatalcare" && (
          <PrenatalHistoryTable data={processedPrenatalData} />
        )}

        {/* No data message */}
        {!hasData && activeTab === "prenatalcare" && (
          <div className="text-center py-8 text-gray-500">
            No prenatal care records found for this pregnancy.
          </div>
        )}

        {activeTab === "prenatalform" && (
          <PrenatalFormHistory/>
        )}
      </div>
    </LayoutWithBack>
  );
}
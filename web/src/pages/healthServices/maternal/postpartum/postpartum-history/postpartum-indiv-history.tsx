// In prenatal-indiv-history.tsx - remove mock data and use real API data
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Loader2, Printer } from "lucide-react";

import PostpartumViewing from "./form-history/postpartum-viewing";
import PostpartumCareHistory from "./postpartum-care-history";

import { usePrenatalPatientPrenatalCare } from "../../queries/maternalFetchQueries";


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

export default function PostpartumIndivHistory() {
  const location = useLocation();
  const { patientData, pregnancyId, visitNumber, recordId } = location.state?.params || {};

  // fetching
  const { data: prenatalCareData, isLoading, error } = usePrenatalPatientPrenatalCare(patientData?.pat_id || "", pregnancyId || "");

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

  if (isLoading) {
    return (
      <LayoutWithBack 
        title="Postpartum Visit Records"
        description="Loading prenatal care history..."
      >
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 mr-2">Loading records...</Loader2>
        </div>
      </LayoutWithBack>
    );
  }

  if (error) {
    return (
      <LayoutWithBack 
        title="Postpartum Visit Records"
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
      title="Postpartum Visit Records"
      description="Complete record of prenatal visits and clinical notes"
    >
        <div className="bg-white p-3 space-y-2">
            <div className="flex justify-end pr-4 my-5">
                <Button variant="outline"><Printer/> Print</Button>
            </div>

            <div className="w-full">
                <div className="flex items-center justify-center">
                    <PostpartumViewing/>
                </div>
                <div>
                    <PostpartumCareHistory/>
                </div>
            </div>
        </div>
    </LayoutWithBack>
  );
}
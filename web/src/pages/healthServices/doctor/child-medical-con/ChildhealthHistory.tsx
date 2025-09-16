import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import { ChevronRight } from "lucide-react"; // Added Edit icon
import { Skeleton } from "@/components/ui/skeleton";
import { getSupplementStatusesFields } from "../../childservices/viewrecords/config";
import { PatientSummarySection } from "../../childservices/viewrecords/CurrentHistoryView";
import { useChildHealthHistory } from "../../childservices/forms/queries/fetchQueries";
import { useNavigate } from "react-router-dom"; // Added useNavigate

interface PendingDisplayMedicalConsultationProps {
  patientData: any;
  checkupData: any;
  onNext: () => void;
}

export default function PendingDisplayMedicalConsultation({
  checkupData,
  onNext,
  patientData // Added patientData to props
}: PendingDisplayMedicalConsultationProps) {
  const patId = checkupData.pat_details.pat_id;
  const chrecId = checkupData.chrec_id;
  const chhistId = checkupData.chhist_id;
  const navigate = useNavigate(); // Added navigate hook

  // State management
  const [activeTab, setActiveTab] = useState("current"); // 'current' or 'history'

  // Data fetching using custom hook
  const { data: historyData, isLoading } = useChildHealthHistory(chrecId);

  const [fullHistoryData, setFullHistoryData] = useState<any[]>([]);
  const [latestRecord, setLatestRecord] = useState<any | null>(null);

  useEffect(() => {
    if (historyData) {
      const sortedHistory = (historyData[0]?.child_health_histories || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setFullHistoryData(sortedHistory);
      setLatestRecord(sortedHistory[0] || null); // Set the latest record
    }
  }, [historyData, chhistId]);

  const supplementStatusesFields = useMemo(() => getSupplementStatusesFields(fullHistoryData), [fullHistoryData]);

  // Edit button functionality
  const navigateToUpdateLatest = () => {
    if (latestRecord) {
      navigate("/child-health-record/form", {
        state: {
          params: {
            chhistId: chhistId,
            patId: patId, // Use patientData from props
            originalRecord: latestRecord,
            patientData: patientData, // Use patientData from props
            chrecId: chrecId,
            mode: "addnewchildhealthrecord" // Changed to "edit" mode
          }
        }
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full p-6">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">Page 1 of 2</div>

      <PatientSummarySection recordsToDisplay={fullHistoryData.length > 0 ? [fullHistoryData.find((record) => record.chhist_id === chhistId) || fullHistoryData[0]] : []} fullHistoryData={fullHistoryData} chhistId={chhistId} />

      {/* Navigation Buttons */}
      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext} className={`w-[100px] flex items-center justify-center gap-2 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`} disabled={isLoading}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

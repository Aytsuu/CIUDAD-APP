import { Button } from "@/components/ui/button/button";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PatientSummarySection } from "../viewrecords/CurrentHistoryView";
import { History } from "lucide-react";
import { Link } from "react-router";

interface PendingDisplayMedicalConsultationProps {
  ChildHealthRecord: any;
  onNext: () => void;
  fullHistoryData: any[];
}

export default function PendingDisplayMedicalConsultation({ ChildHealthRecord, onNext, fullHistoryData }: PendingDisplayMedicalConsultationProps) {
  const chhistId = ChildHealthRecord.record?.chhist_id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(2);

  // Set initial index when fullHistoryData changes
  useEffect(() => {
    if (fullHistoryData.length > 0 && chhistId) {
      const initialIndex = fullHistoryData.findIndex((record) => record.chhist_id === chhistId);
      setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
    }
  }, [fullHistoryData, chhistId]);

  useEffect(() => {
    setRecordsPerPage(3);
  }, []);

  return (
    <div className="p-6">
      <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">Page 1 of 2</div>

      <div className="space-y-6 p-6">
        <div className="flex justify-end mb-4">
          <Link
            to={`/child-health-records`}
            state={{
              ChildHealthRecord: ChildHealthRecord,
              mode: "addnewchildhealthrecord"
            }}
          >
            <Button>
              <History className="h-4 w-4" />
              View History
            </Button>
          </Link>
        </div>
        <PatientSummarySection recordsToDisplay={[fullHistoryData[currentIndex]]} fullHistoryData={fullHistoryData} chhistId={chhistId} />
      </div>

      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

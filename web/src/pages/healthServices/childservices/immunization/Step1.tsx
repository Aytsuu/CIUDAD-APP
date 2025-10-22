import { Button } from "@/components/ui/button/button";
import { ChevronRight, Pencil } from "lucide-react";
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
  const chrecId = ChildHealthRecord.record?.chrec;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Set initial index when fullHistoryData changes
  useEffect(() => {
    if (fullHistoryData.length > 0 && chhistId) {
      const initialIndex = fullHistoryData.findIndex((record) => record.chhist_id === chhistId);
      setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
    }
  }, [fullHistoryData, chhistId]);

  return (
    <div className="p-6">
      <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">Page 1 of 2</div>

      <div className="space-y-6 p-6">
        <div className="flex justify-end gap-4 mb-4">
          <Link
            to={`/services/childhealthrecords/records`}
            state={{
              ChildHealthRecord: ChildHealthRecord
            }}
          >
            <Button>
              <History className="h-4 w-4" />
              View History
            </Button>
          </Link>

          <Link
            to={`/services/childhealthrecords/form`}
            state={{
              params: {
                ChildHealthRecord: ChildHealthRecord,
                chrecId: chrecId,
                chhistId: chhistId,
                mode: "addnewchildhealthrecord",
                status: "immunization"
              }
            }}
          >
            <Button>
              <Pencil className="h-4 w-4" />
              Edit
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

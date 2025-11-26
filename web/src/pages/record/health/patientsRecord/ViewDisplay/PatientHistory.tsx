import React from "react";
import { Label } from "@/components/ui/label";
import { SheetLayout } from "@/components/ui/sheet/sheet-layout";
import { History as HistoryIcon, Clock } from "lucide-react";
import { usePatientHistory } from "../queries/fetch"; 
import { RenderHistory } from "@/pages/record/profiling/ProfilingHistory";
import { useNavigate } from "react-router";

interface PatientHistoryProps {
  patientId: string;
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  onOpenChange?: () => void;
}

const PatientHistory: React.FC<PatientHistoryProps> = ({
  patientId,
  trigger,
  title,
  description,
  onOpenChange,
}) => {
  const { data: history, isLoading: isLoadingHistory, refetch } = usePatientHistory(patientId);
  const navigate = useNavigate();

  const defaultTrigger = (
    <HistoryIcon
      size={20}
      className="text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
      aria-label="Update history"
      role="img"
    />
  );

  const handleHistoryItemClick = (index: number) => {
    if (!history || !Array.isArray(history)) return;
    const newData = history[index];
    const oldData = history[index + 1];
    navigate('/patientrecords/history/view', {
      state: { params: { newData, oldData } }
    });
  };

  return (
    <SheetLayout
      trigger={trigger ?? defaultTrigger}
      title={
        title ?? (
          <Label className="flex items-center gap-2 text-lg text-darkBlue1">
            <Clock size={20} />
            Update History
          </Label>
        )
      }
      description={description ?? "View all changes made to this patient's record"}
      content={
        <RenderHistory
          history={history}
          isLoadingHistory={isLoadingHistory}
          itemTitle="Patient Record Update"
          handleHistoryItemClick={handleHistoryItemClick}
        />
      }
      onOpenChange={() => {
        // Refetch when the sheet is opened to reduce perceived delay
        refetch();
        if (onOpenChange) onOpenChange();
      }}
    />
  );
};

export default PatientHistory;

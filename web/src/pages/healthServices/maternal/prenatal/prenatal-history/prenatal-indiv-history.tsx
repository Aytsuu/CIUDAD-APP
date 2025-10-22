import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import PrenatalFormTableHistory from "./prenatal-form-history";
import PFHistoryTab from "./form-history/form-history-tab";
import PrenatalViewingOne from "./form-history/prenatal-viewing-one";
import PrenatalViewingTwo from "./form-history/prenatal-viewing-two";
import { usePrenatalRecordComplete } from "../../queries/maternalFetchQueries";
import { usePrenatalRecordComparison } from "../../queries/maternalFetchQueries";

// main component
export default function PrenatalIndivHistory() {
  const location = useLocation();
  const { recordId, pregnancyId } = location.state?.params || {};
  const [pfPageNum, setPfPageNum] = useState(1);

  // Fetch data from both APIs
  const { isLoading: isLoadingForm } = usePrenatalRecordComplete(recordId || "");
  const { isLoading: isLoadingComparison } = usePrenatalRecordComparison(pregnancyId || "");

  // Combined loading state
  const isLoading = isLoadingForm || isLoadingComparison;

  const handlePFPageChange = (pageNum: number) => {
    setPfPageNum(pageNum);
  };

  // Show loading screen if either data is still loading
  if (isLoading) {
    return (
      <LayoutWithBack 
        title="Prenatal Visit Records"
        description="Complete record of prenatal visits and clinical notes"
      >
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-8 w-8 mr-2" />
          <span>Loading prenatal records...</span>
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
        <div className="w-full mt-8" defaultValue={1}>
          <div className="flex items-center justify-center">
            <PFHistoryTab onPageChange={handlePFPageChange} />
          </div>

          {pfPageNum === 1 && (
            <PrenatalViewingOne pfId={recordId} />
          )}

          {pfPageNum === 2 && (
            <PrenatalViewingTwo />
          )}
        </div>
       
        <div className="bg-white/70 pt-5 px-2 py-2">
          <PrenatalFormTableHistory/>
        </div>
      </div>
        
    </LayoutWithBack>
  );
}
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useState } from "react";
import { useLocation } from "react-router-dom";

import PrenatalFormTableHistory from "./prenatal-form-history";
import PFHistoryTab from "./form-history/form-history-tab";
import PrenatalViewingOne from "./form-history/prenatal-viewing-one";
import PrenatalViewingTwo from "./form-history/prenatal-viewing-two";
import { usePrenatalRecordComplete } from "../../queries/maternalFetchQueries";
import { usePrenatalRecordComparison } from "../../queries/maternalFetchQueries";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";

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
        <div className="flex items-center justify-center py-20">
            <Spinner size="md"/>
            <span className="ml-2 text-gray-600">Loading...</span>
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
        <div className="flex m-5 mb-10 p-2 border-b-2 border-black/40">
            <Label className="text-xl">Prenatal Form Overview</Label>
        </div>
        <div className="w-full" defaultValue={1}>
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
       
       <div className="flex m-5 p-2 border-b-2 border-black/40">
            <Label className="text-xl">Prenatal Data Overview</Label>
        </div>
        <div className="bg-white/70 px-2">
          <PrenatalFormTableHistory/>
        </div>
      </div>
        
    </LayoutWithBack>
  );
}
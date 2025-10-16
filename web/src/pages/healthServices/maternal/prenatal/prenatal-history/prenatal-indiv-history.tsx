// In prenatal-indiv-history.tsx - remove mock data and use real API data
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useState } from "react";
import { useLocation } from "react-router-dom";

import PrenatalFormTableHistory from "./prenatal-form-history";
import PFHistoryTab from "./form-history/form-history-tab";
import PrenatalViewingOne from "./form-history/prenatal-viewing-one";
import PrenatalViewingTwo from "./form-history/prenatal-viewing-two";

// main component
export default function PrenatalIndivHistory() {
  const location = useLocation();
  const { recordId } = location.state?.params || {};
  const [pfPageNum, setPfPageNum] = useState(1);

  const handlePFPageChange = (pageNum: number) => {
    setPfPageNum(pageNum);
  };

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
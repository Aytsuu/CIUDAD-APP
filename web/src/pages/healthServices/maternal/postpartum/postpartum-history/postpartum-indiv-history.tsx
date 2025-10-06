// In prenatal-indiv-history.tsx - remove mock data and use real API data
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import PostpartumViewing from "./form-history/postpartum-care-viewing";
import PostpartumCareHistory from "./postpartum-care-history";

import { usePrenatalPatientPrenatalCare } from "../../queries/maternalFetchQueries";


export default function PostpartumIndivHistory() {
  const location = useLocation();
  const { patientData, pregnancyId, recordId } = location.state?.params || {};

  // fetching
  const { isLoading, error } = usePrenatalPatientPrenatalCare(patientData?.pat_id || "", pregnancyId || "");

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
        <div className="w-full">
          {/* form section */}
          <div>
            <div className="flex m-5 p-2 ">
                {/* <Label className="text-xl">Form</Label> */}
            </div>
            <div className="flex items-center justify-center">
                <PostpartumViewing pprId={recordId} />
            </div>
          </div>

          {/* table comparison section */}
          <div>
            {/* <div className="flex m-5 p-2 border-b-2 border-black/50">
                <Label className="text-xl">Data Comparison</Label>
            </div> */}
            <div className="px-5">
                <PostpartumCareHistory pregnancyId={pregnancyId} />
            </div>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}
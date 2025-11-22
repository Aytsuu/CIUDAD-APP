// In prenatal-indiv-history.tsx - remove mock data and use real API data
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { useLocation } from "react-router-dom";

import PostpartumViewing from "./form-history/postpartum-care-viewing";
import PostpartumCareHistory from "./postpartum-care-history";

import { Label } from "@/components/ui/label";

export default function PostpartumIndivHistory() {
  const location = useLocation();
  const { pregnancyId, recordId } = location.state?.params || {};

  return (
    <LayoutWithBack 
      title="Postpartum Visit Records"
      description="Complete record of postpartum visits and clinical notes"
    >
      <div className="bg-white p-3 space-y-2">
        <div className="w-full">
          {/* form section */}
          <div>
            <div className="flex m-5 p-2 border-b-2 border-black/50">
                <Label className="text-xl">Form Overview</Label>
            </div>
            <div className="flex items-center justify-center">
                <PostpartumViewing pprId={recordId} />
            </div>
          </div>

          {/* table comparison section */}
          <div>
            <div className="flex m-5 p-2 border-b-2 border-black/50">
                <Label className="text-xl">Comparison Data Overview</Label>
            </div>
            <div className="px-5">
                <PostpartumCareHistory pregnancyId={pregnancyId} recordId={recordId} />
            </div>
          </div>
        </div>
      </div>
    </LayoutWithBack>
  );
}
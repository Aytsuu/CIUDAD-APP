// components/pages/Page2.tsx
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import { PagelastProps } from "./type";
import MonthlyMorbidityDetails from "../fhis_pge17";

export default function Page7({ state, onBack }: PagelastProps) {
  return (
    <>
     
      <MonthlyMorbidityDetails state={state} />

      {/* Navigation Buttons */}
      <div className="flex justify-end gap-2 mt-8 pt-6 border-t">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        
      </div>
    </>
  );
}

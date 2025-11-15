// components/pages/Page2.tsx
import { Button } from "@/components/ui/button/button";
import { ChevronLeft } from "lucide-react";
import { PagelastProps } from "./type";
import MonthlyMorbidityDetails from "../../monthly_morbidity/records";

export default function Page17({ state, onBack }: PagelastProps) {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page 2 – Morbidity Report</h2>
      </div>

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

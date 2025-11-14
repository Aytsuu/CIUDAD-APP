// components/pages/Page2.tsx
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageProps } from "./type";
import MonthlyMorbidityDetails from "../../monthly_morbidity/records";

export default function Page2({ state, onBack, onNext }: PageProps) {
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

        <Button onClick={onNext}>
          Continue
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </>
  );
}

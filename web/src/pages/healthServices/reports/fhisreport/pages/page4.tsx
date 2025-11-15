import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { PageProps } from "./type";
import { useVaccinationStatistics } from "../queries/fetch";
import VaccinationStatisticsTable from "../fhis_page4";


export default function Page4({ state, onBack, onNext }: PageProps) {
  const { data, isLoading, isError } = useVaccinationStatistics(state.month);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page 4: Immunization</h2>
      </div>
      <div className=" overflow-x-auto">
        {isError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Data</h3>
              <p className="text-red-700">Failed to load vaccination statistics. Please try again later.</p>
            </div>
          </div>
        ) : (
          <VaccinationStatisticsTable data={data!} isLoading={isLoading} monthName={state.monthName} />
        )}
      </div>

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
    </div>
  );
}

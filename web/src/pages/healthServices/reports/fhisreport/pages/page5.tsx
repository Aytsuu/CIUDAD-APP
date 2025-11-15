// components/pages/Page5.tsx - Child Health Nutrition Statistics
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageProps } from "./type";
import NutritionStatisticsTable from "../fhis_page5";
import { useNutritionStatistics } from "../queries/fetch";
import TableLoading from "@/components/ui/table-loading";

export default function Page5({ state, onBack, onNext }: PageProps) {
  const { data, isLoading, error } = useNutritionStatistics(state.month);

  return (
    <div className="min-h-[500px] flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Page 5: Child Health and Nutrition Services</h2>
      </div>

      <div className="overflow-x-auto">
        {error && (
          <div className="bg-red-50 p-6 rounded-lg mb-6 border border-red-200">
            <h3 className="font-semibold text-red-900 mb-2">Error Loading Data</h3>
            <p className="text-red-700">Failed to load nutrition statistics. Please try again.</p>
          </div>
        )}

        {isLoading && <TableLoading />}
        {!error && !isLoading && data && <NutritionStatisticsTable data={data} />}
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

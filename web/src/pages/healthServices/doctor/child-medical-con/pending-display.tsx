import { Button } from "@/components/ui/button/button";
import { Card, CardContent } from "@/components/ui/card/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api2 } from "@/api/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";
import { Accordion } from "@/components/ui/accordion";
import { ChildHealthHistoryRecord } from "../../childservices/viewrecords/types";
import { getSupplementStatusesFields } from "../../childservices/viewrecords/config";
import { PatientSummarySection } from "../../childservices/viewrecords/CurrentHistoryView";
import { HealthHistoryAccordions } from "@/components/ui/childhealth-history-accordion";




interface PendingDisplayMedicalConsultationProps {
  patientData: any;
  checkupData: any;
  onNext: () => void;
}

export default function PendingDisplayMedicalConsultation({
  patientData,
  checkupData,
  onNext,
}: PendingDisplayMedicalConsultationProps) {
  const navigate = useNavigate();
  const patId = checkupData.pat_details.pat_id;
  const chrecId = checkupData.chrec_id;
  const chhistId = checkupData.chhist_id;

  // State management
  const [fullHistoryData, setFullHistoryData] = useState<ChildHealthHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(2);

  const supplementStatusesFields = useMemo(
    () => getSupplementStatusesFields(fullHistoryData),
    [fullHistoryData]
  );

  // Data fetching
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const historyResponse = await api2.get(
          `/child-health/history/${chrecId}/`
        );
        const sortedHistory = (
          historyResponse.data[0]?.child_health_histories || []
        ).sort(
          (a: ChildHealthHistoryRecord, b: ChildHealthHistoryRecord) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setFullHistoryData(sortedHistory);

        // Set initial index to the selected record
        const initialIndex = sortedHistory.findIndex(
          (record: ChildHealthHistoryRecord) => record.chhist_id === chhistId
        );
        setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
      } catch (error) {
        console.error("Error fetching child health history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (patId) {
      fetchAllData();
    }
  }, [patId, chrecId, chhistId]);

  // Memoized data for display
  const recordsToDisplay = useMemo(() => {
    if (fullHistoryData.length === 0) return [];
    return fullHistoryData.slice(currentIndex, currentIndex + recordsPerPage);
  }, [fullHistoryData, currentIndex, recordsPerPage]);

  // Navigation handlers
  const handleSwipeLeft = () => {
    if (currentIndex < fullHistoryData.length - recordsPerPage) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRecordsPerPageChange = (value: string) => {
    const newRecordsPerPage = parseInt(value);
    setRecordsPerPage(newRecordsPerPage);

    // Adjust currentIndex if necessary to prevent empty display
    if (currentIndex > fullHistoryData.length - newRecordsPerPage) {
      setCurrentIndex(Math.max(0, fullHistoryData.length - newRecordsPerPage));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full p-6">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  return (
    <div className="p-6">
      
     
      <PatientSummarySection
        recordsToDisplay={recordsToDisplay}
        fullHistoryData={fullHistoryData}
        chhistId={chhistId}
      />

      {/* No Records Fallback */}
      {recordsToDisplay.length === 0 ? (
        <div className="p-6 text-center text-gray-600">
          <p>No health history found for this child.</p>
        </div>
      ) : (
        <div className="bg-white py-10">
          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwipeRight}
              disabled={currentIndex === 0}
              className="bg-white shadow-lg text-black hover:bg-gray-100"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-700">Records per page:</span>
                <Select
                  value={recordsPerPage.toString()}
                  onValueChange={handleRecordsPerPageChange}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSwipeLeft}
              disabled={currentIndex >= fullHistoryData.length - recordsPerPage}
              className="bg-white shadow-lg text-black hover:bg-gray-100"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Accordion Sections */}
          <div >
            <Accordion
              type="multiple"
              className="w-full space-y-4"
              defaultValue={["record-overview", "child-details"]}
            >
              <HealthHistoryAccordions
                recordsToDisplay={recordsToDisplay}
                chhistId={chhistId}
                supplementStatusesFields={supplementStatusesFields}
              />
            </Accordion>
          </div>
        </div>
      )}

       {/* Navigation Buttons */}
       <div className="flex justify-end mt-6 sm:mt-8">
            <Button className="mr-2 w-[100px]" variant={"outline"}>
              Cancel
            </Button>
            <Button
              onClick={onNext}
              className={`w-[100px] ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              Next
            </Button>
          </div>
    </div>
  );
}
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api2 } from "@/api/api";
import { Skeleton } from "@/components/ui/skeleton";


import { Accordion } from "@/components/ui/accordion";
import { ChildHealthHistoryRecord } from "../../childservices/viewrecords/types";
import { getSupplementStatusesFields } from "../../childservices/viewrecords/config";
import { PatientSummarySection } from "../../childservices/viewrecords/CurrentHistoryView";
import { HealthHistoryAccordions } from "@/components/ui/childhealth-history-accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Baby, History } from "lucide-react";
import CardLayout from "@/components/ui/card/card-layout";

interface PendingDisplayMedicalConsultationProps {
  patientData: any;
  checkupData: any;
  onNext: () => void;
}

export default function PendingDisplayMedicalConsultation({
  checkupData,
  onNext,
}: PendingDisplayMedicalConsultationProps) {
  const patId = checkupData.pat_details.pat_id;
  const chrecId = checkupData.chrec_id;
  const chhistId = checkupData.chhist_id;

  // State management
  const [fullHistoryData, setFullHistoryData] = useState<
    ChildHealthHistoryRecord[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(2);
  const [activeTab, setActiveTab] = useState("current"); // 'current' or 'history'

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

  // Set default value for recordsPerPage
  useEffect(() => {
    setRecordsPerPage(3);
  }, []);

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
      <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">
        Page 1 of 2
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto bg-slate-100 mb-6">
          <TabsTrigger
            value="current"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Baby />
            Current Record
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <History />
            View History
          </TabsTrigger>
        </TabsList>

        {/* Current Record Tab */}
        <TabsContent value="current">
          <PatientSummarySection
            recordsToDisplay={[fullHistoryData[currentIndex]]}
            fullHistoryData={fullHistoryData}
            chhistId={chhistId}
          />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          {recordsToDisplay.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              <p>No health history found for this child.</p>
            </div>
          ) : (
            <CardLayout
              cardClassName="border rounded-lg shadow-sm"
              content={
                <div className="space-y-6 p-6">
                  {/* Pagination Controls with Record Count */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-500 font-medium">
                      Showing records {currentIndex + 1}-
                      {Math.min(
                        currentIndex + recordsPerPage,
                        fullHistoryData.length
                      )}{" "}
                      of {fullHistoryData.length}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSwipeRight}
                        disabled={currentIndex === 0}
                        className="border-gray-300 hover:bg-gray-50 transition-colors"
                        aria-label="Previous records"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSwipeLeft}
                        disabled={
                          currentIndex >=
                          fullHistoryData.length - recordsPerPage
                        }
                        className="border-gray-300 hover:bg-gray-50 transition-colors"
                        aria-label="Next records"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Divider */}
                  <hr className="border-gray-200" />

                  {/* Accordion Sections */}
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

                  {/* Bottom Pagination Controls (for mobile) */}
                  <div className="sm:hidden flex justify-center gap-4 pt-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSwipeRight}
                      disabled={currentIndex === 0}
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSwipeLeft}
                      disabled={
                        currentIndex >= fullHistoryData.length - recordsPerPage
                      }
                      className="border-gray-300 hover:bg-gray-50"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              }
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Navigation Buttons */}
      <div className="flex justify-end mt-6 sm:mt-8">
        <Button
          onClick={onNext}
          className={`w-[100px] flex items-center justify-center gap-2 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

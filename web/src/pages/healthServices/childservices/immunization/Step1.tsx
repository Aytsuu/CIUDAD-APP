import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion } from "@/components/ui/accordion";
import { ChildHealthHistoryRecord } from "../viewrecords/types";
import { getSupplementStatusesFields } from "../viewrecords/config";
import { PatientSummarySection } from "../viewrecords/CurrentHistoryView";
import { HealthHistoryAccordions } from "@/components/ui/childhealth-history-accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Baby, History } from "lucide-react";
import CardLayout from "@/components/ui/card/card-layout";

interface PendingDisplayMedicalConsultationProps {
  ChildHealthRecord: any;
  onNext: () => void;
  fullHistoryData: ChildHealthHistoryRecord[];
}

export default function PendingDisplayMedicalConsultation({ ChildHealthRecord, onNext, fullHistoryData }: PendingDisplayMedicalConsultationProps) {
  const chhistId = ChildHealthRecord.chhist_id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(2);
  const [activeTab, setActiveTab] = useState("current");
  const supplementStatusesFields = useMemo(() => getSupplementStatusesFields(fullHistoryData), [fullHistoryData]);

  // Set initial index when fullHistoryData changes
  useEffect(() => {
    if (fullHistoryData.length > 0 && chhistId) {
      const initialIndex = fullHistoryData.findIndex((record) => record.chhist_id === chhistId);
      setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
    }
  }, [fullHistoryData, chhistId]);

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

  useEffect(() => {
    setRecordsPerPage(3);
  }, []);

  return (
    <div className="p-6">
      <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">Page 1 of 2</div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto bg-slate-100 mb-6">
          <TabsTrigger value="current" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Baby />
            Current Record
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <History />
            View History
          </TabsTrigger>
        </TabsList>

        {/* Current Record Tab */}
        <TabsContent value="current">{fullHistoryData.length > 0 && <PatientSummarySection recordsToDisplay={[fullHistoryData[currentIndex]]} fullHistoryData={fullHistoryData} chhistId={chhistId} />}</TabsContent>

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
                  {/* Pagination Controls */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-500 font-medium">
                      Showing records {currentIndex + 1}-{Math.min(currentIndex + recordsPerPage, fullHistoryData.length)} of {fullHistoryData.length}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={handleSwipeRight} disabled={currentIndex === 0} className="border-gray-300 hover:bg-gray-50 transition-colors" aria-label="Previous records">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleSwipeLeft} disabled={currentIndex >= fullHistoryData.length - recordsPerPage} className="border-gray-300 hover:bg-gray-50 transition-colors" aria-label="Next records">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  <Accordion type="multiple" className="w-full space-y-4" defaultValue={["record-overview", "child-details"]}>
                    <HealthHistoryAccordions recordsToDisplay={recordsToDisplay} chhistId={chhistId} supplementStatusesFields={supplementStatusesFields} />
                  </Accordion>

                  {/* Mobile Pagination */}
                  <div className="sm:hidden flex justify-center gap-4 pt-4">
                    <Button variant="outline" size="icon" onClick={handleSwipeRight} disabled={currentIndex === 0} className="border-gray-300 hover:bg-gray-50">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleSwipeLeft} disabled={currentIndex >= fullHistoryData.length - recordsPerPage} className="border-gray-300 hover:bg-gray-50">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              }
            />
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HealthHistoryAccordions } from "@/components/ui/childhealth-history-accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button/button";
import { Accordion } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChildHealthHistoryRecord } from "./types";
import { getSupplementStatusesFields } from "./Config";
import { PatientSummarySection } from "./CurrentHistoryView";
import CardLayout from "@/components/ui/card/card-layout";
import { History, Baby } from "lucide-react";
import { useChildHealthHistory } from "../forms/queries/fetchQueries";


export default function ChildHealthHistoryDetail() {
  // Navigation and routing
  const navigate = useNavigate();
  const location = useLocation();
  const { patId, chrecId, chhistId } = location.state?.params || {};

  // State management
  const [fullHistoryData, setFullHistoryData] = useState<
    ChildHealthHistoryRecord[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordsPerPage, setRecordsPerPage] = useState(2);
  const [activeTab, setActiveTab] = useState("current"); // 'current' or 'history'

  const supplementStatusesFields = useMemo(
    () => getSupplementStatusesFields(fullHistoryData),
    [fullHistoryData]
  );


  const { 
    data: historyData, 
    isLoading, 
    isError 
  } = useChildHealthHistory(chrecId);

  
  useEffect(() => {
    if (historyData) {
      const sortedHistory = (historyData[0]?.child_health_histories || [])
        .sort((a: ChildHealthHistoryRecord, b: ChildHealthHistoryRecord) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      
      setFullHistoryData(sortedHistory);

      // Set initial index to the selected record
      const initialIndex = sortedHistory.findIndex(
        (record: ChildHealthHistoryRecord) => record.chhist_id === chhistId
      );
      setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
    }
  }, [historyData, chhistId]);

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
    <>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-center relative">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Child Health History Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            View and compare child's health history
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <CardLayout
        cardClassName="px-6"
        title=""
        content={
          <>
            {/* Tab Navigation */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 h-auto bg-white mb-6">
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
                              currentIndex >=
                              fullHistoryData.length - recordsPerPage
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
          </>
        }
      />
    </>
  );
}

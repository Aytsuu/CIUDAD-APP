"use client";

import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { HealthHistoryTable } from "./health-history-table"; // Updated import
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getSupplementStatusesFields } from "./config";
import { PatientSummarySection } from "./CurrentHistoryView";
import CardLayout from "@/components/ui/card/card-layout";
import { History, Baby } from "lucide-react";
import { useChildHealthHistory } from "../forms/queries/fetchQueries";

export default function ChildHealthHistoryDetail() {
  // Navigation and routing
  const navigate = useNavigate();
  const location = useLocation();
  const { chrecId, chhistId } = location.state?.params || {};
  const { data: historyData, isLoading } = useChildHealthHistory(chrecId);

  // State management
  const [fullHistoryData, setFullHistoryData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("current"); // 'current' or 'history'

  useEffect(() => {
    if (historyData) {
      const sortedHistory = (historyData[0]?.child_health_histories || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setFullHistoryData(sortedHistory);
    }
  }, [historyData, chhistId]);

  const supplementStatusesFields = useMemo(() => getSupplementStatusesFields(fullHistoryData), [fullHistoryData]);

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
        <Button className="text-black p-2 mb-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Child Health History Records</h1>
          <p className="text-xs sm:text-sm text-darkGray">View and compare child's health history</p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <CardLayout
        cardClassName="px-6"
        title=""
        content={
          <>
            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-auto bg-white mb-6">
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
              <TabsContent value="current">
                <PatientSummarySection recordsToDisplay={fullHistoryData.length > 0 ? [fullHistoryData.find((record) => record.chhist_id === chhistId) || fullHistoryData[0]] : []} fullHistoryData={fullHistoryData} chhistId={chhistId} />
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history">
                {fullHistoryData.length === 0 ? (
                  <div className="p-6 text-center text-gray-600">
                    <p>No health history found for this child.</p>
                  </div>
                ) : (
                  <CardLayout
                    cardClassName="border rounded-lg shadow-sm"
                    content={
                      <div className="space-y-6 p-6">
                        {/* Record Count */}
                        <div className="flex justify-center">
                          <div className="text-sm text-gray-500 font-medium">
                            Showing {fullHistoryData.length} health {fullHistoryData.length === 1 ? "record" : "records"}
                          </div>
                        </div>

                        {/* Divider */}
                        <hr className="border-gray-200" />

                        {/* Table View */}
                        <div className="w-full">
                          <HealthHistoryTable
                            recordsToDisplay={fullHistoryData} // Show all records for horizontal scrolling
                            chhistId={chhistId}
                            supplementStatusesFields={supplementStatusesFields}
                          />
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

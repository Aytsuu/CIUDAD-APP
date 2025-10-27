"use client";

import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { HealthHistoryTable } from "./health-history-table"; // Updated import
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { getSupplementStatusesFields } from "./config";
import { PatientSummarySection } from "./CurrentHistoryView";
import CardLayout from "@/components/ui/card/card-layout";
import { History, Baby } from "lucide-react";
import { useChildHealthCurrentAndPreviousHistory } from "../forms/queries/fetchQueries";
import { LayoutWithBack } from "../../../../components/ui/layout/layout-with-back";

export default function ChildHealthHistoryDetail() {
  // Navigation and routing
  const location = useLocation();
  const { chrecId, chhistId } = location.state?.params || {};

  // Fetch current and previous records
  const { data: historyData, isLoading } = useChildHealthCurrentAndPreviousHistory(chrecId, chhistId);

  // Extract child health histories directly
  const childHealthHistories = useMemo(() => historyData?.results?.[0]?.child_health_histories || [], [historyData]);

  // const supplementStatusesFields = useMemo(() => getSupplementStatusesFields(childHealthHistories), [childHealthHistories]);

  // State management
  const [activeTab, setActiveTab] = useState("current"); // 'current' or 'history'


  return (
    <>
      <LayoutWithBack title="Child Health History" description="View detailed health history records for the child.">
        <>
          {isLoading ? (
                <div className="w-full h-full p-6">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
          ) : (
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
                      <PatientSummarySection
                        recordsToDisplay={childHealthHistories.filter((record: any) => record.chhist_id === chhistId)}
                        fullHistoryData={childHealthHistories}
                        chhistId={chhistId}
                      />
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history">
                      {childHealthHistories.length === 0 ? (
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
                                  Showing {childHealthHistories.length} health {childHealthHistories.length === 1 ? "record" : "records"}
                                </div>
                              </div>

                              {/* Divider */}
                              <hr className="border-gray-200" />

                              {/* Table View */}
                              <div className="w-full">
                                <HealthHistoryTable
                                  recordsToDisplay={childHealthHistories.slice().sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())} // Reverse order
                                  chhistId={chhistId}
                                  // supplementStatusesFields={supplementStatusesFields}
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
          )}
        </>
      </LayoutWithBack>
    </>
  );
}

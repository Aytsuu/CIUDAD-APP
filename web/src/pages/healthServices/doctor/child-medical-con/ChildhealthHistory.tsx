import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { ChevronRight } from "lucide-react";
import { PatientSummarySection } from "../../childservices/viewrecords/CurrentHistoryView";
import { useChildHealthCurrentAndPreviousHistory } from "../../childservices/forms/queries/fetchQueries";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CardLayout from "@/components/ui/card/card-layout";
import { History, Baby } from "lucide-react";
import TableLoading from "../../table-loading";
import { HealthHistoryTable } from "../../childservices/viewrecords/health-history-table";
import { Link } from "react-router";

export default function PendingDisplayMedicalConsultation({
  patientData,
  checkupData,
  onNext,
}: any) {
  const chrecId = checkupData.chrec;
  const chhistId = checkupData.chhist_id;

  // Fetch current and previous records
  const { data: historyData, isLoading } = useChildHealthCurrentAndPreviousHistory(chrecId, chhistId);

  // Extract child health histories directly
  const childHealthHistories = historyData?.results?.[0]?.child_health_histories || [];

  const [activeTab, setActiveTab] = useState("current"); // 'current' or 'history'

  if (isLoading) {
    return <TableLoading />;
  }

  return (
    <div className="p-6">

  <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">Page 1 of 2</div>

      {/* <div className="flex justify-end mb-4">
        <Link
          to="/patientrecords/view"
          state={{
            patientId: patientData.pat_id,
            patientData: {
              id: patientData?.pat_id,
            },
          }}
        >
          <Button className="flex gap-2 items-center text-white">
            <History className="w-4 h-4" /> View patient records
          </Button>
        </Link>
      </div> */}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full border p-4">
        <TabsList className="grid w-full grid-cols-2 h-auto bg-white mb-6">
          <TabsTrigger value="current" 
          className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
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
                    />
                  </div>
                </div>
              }
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Navigation Buttons */}
      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext} className="w-[100px] flex items-center justify-center gap-2">
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
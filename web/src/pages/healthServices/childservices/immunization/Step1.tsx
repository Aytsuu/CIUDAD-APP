import { Button } from "@/components/ui/button/button";
import { ChevronRight, History, Baby } from "lucide-react";
import { useEffect, useState } from "react";
import { PatientSummarySection } from "../viewrecords/CurrentHistoryView";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CardLayout from "@/components/ui/card/card-layout";
import { HealthHistoryTable } from "../viewrecords/health-history-table";

interface PendingDisplayMedicalConsultationProps {
  ChildHealthRecord: any;
  onNext: () => void;
  fullHistoryData: any[];
}

export default function PendingDisplayMedicalConsultation({ 
  ChildHealthRecord, 
  onNext, 
  fullHistoryData 
}: PendingDisplayMedicalConsultationProps) {
  const chhistId = ChildHealthRecord.record?.chhist_id;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("current"); // 'current' or 'history'

  // Set initial index when fullHistoryData changes
  useEffect(() => {
    if (fullHistoryData.length > 0 && chhistId) {
      const initialIndex = fullHistoryData.findIndex((record) => record.chhist_id === chhistId);
      setCurrentIndex(initialIndex !== -1 ? initialIndex : 0);
    }
  }, [fullHistoryData, chhistId]);

  return (
    <div className="p-6">
      <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">Page 1 of 2</div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full border p-4">
        <TabsList className="grid w-full grid-cols-2 h-auto bg-white mb-6">
          <TabsTrigger 
            value="current" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <Baby className="w-4 h-4" />
            Current Record
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex items-center gap-2 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
          >
            <History className="w-4 h-4" />
            View History
          </TabsTrigger>
        </TabsList>

        {/* Current Record Tab */}
        <TabsContent value="current">
          <div className="space-y-6 p-6">
            <PatientSummarySection 
              recordsToDisplay={[fullHistoryData[currentIndex]]} 
              fullHistoryData={fullHistoryData} 
              chhistId={chhistId} 
            />
          </div>
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
                      recordsToDisplay={fullHistoryData.slice().sort((a: any, b: any) => 
                        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                      )}
                      chhistId={chhistId}
                    />
                  </div>
                </div>
              }
            />
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext} className="w-[100px] flex items-center justify-center gap-2">
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
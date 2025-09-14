import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import {  ChevronRight, Edit } from "lucide-react"; // Added Edit icon
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Baby, History } from "lucide-react";
import CardLayout from "@/components/ui/card/card-layout";
import { HealthHistoryTable } from "../../childservices/viewrecords/health-history-table";
import { getSupplementStatusesFields } from "../../childservices/viewrecords/config";
import { PatientSummarySection } from "../../childservices/viewrecords/CurrentHistoryView";
import { useChildHealthHistory } from "../../childservices/forms/queries/fetchQueries";
import { useNavigate } from "react-router-dom"; // Added useNavigate

interface PendingDisplayMedicalConsultationProps {
  patientData: any;
  checkupData: any;
  onNext: () => void;
}

export default function PendingDisplayMedicalConsultation({
  checkupData,
  onNext,
  patientData, // Added patientData to props
}: PendingDisplayMedicalConsultationProps) {
  const patId = checkupData.pat_details.pat_id;
  const chrecId = checkupData.chrec_id;
  const chhistId = checkupData.chhist_id;
  const navigate = useNavigate(); // Added navigate hook

  // State management
  const [activeTab, setActiveTab] = useState("current"); // 'current' or 'history'

  // Data fetching using custom hook
  const { 
    data: historyData, 
    isLoading 
  } = useChildHealthHistory(chrecId);

  const [fullHistoryData, setFullHistoryData] = useState<any[]>([]);
  const [latestRecord, setLatestRecord] = useState<any | null>(null);

  useEffect(() => {
    if (historyData) {
      const sortedHistory = (historyData[0]?.child_health_histories || [])
        .sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      
      setFullHistoryData(sortedHistory);
      setLatestRecord(sortedHistory[0] || null); // Set the latest record
    }
  }, [historyData, chhistId]);

  const supplementStatusesFields = useMemo(
    () => getSupplementStatusesFields(fullHistoryData),
    [fullHistoryData]
  );

  // Edit button functionality
  const navigateToUpdateLatest = () => {
    if (latestRecord) {
      navigate("/child-health-record/form", {
        state: {
          params: {
            chhistId: chhistId,
            patId:patId, // Use patientData from props
            originalRecord: latestRecord,
            patientData: patientData, // Use patientData from props
            chrecId: chrecId,
            mode: "addnewchildhealthrecord" // Changed to "edit" mode
          }
        }
      });
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
          {/* Edit Button - Only show if there's a latest record */}
          {latestRecord && (
            <div className="flex justify-end mb-4">
              <Button
                onClick={navigateToUpdateLatest}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Current Record
              </Button>
            </div>
          )}
          
          <PatientSummarySection
            recordsToDisplay={fullHistoryData.length > 0 ? [fullHistoryData.find(record => record.chhist_id === chhistId) || fullHistoryData[0]] : []}
            fullHistoryData={fullHistoryData}
            chhistId={chhistId}
            
          />
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
                      Showing {fullHistoryData.length} health {fullHistoryData.length === 1 ? 'record' : 'records'}
                    </div>
                  </div>

                  {/* Divider */}
                  <hr className="border-gray-200" />

                  {/* Table View */}
                  <div className="w-full">
                    <HealthHistoryTable
                      recordsToDisplay={fullHistoryData}
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
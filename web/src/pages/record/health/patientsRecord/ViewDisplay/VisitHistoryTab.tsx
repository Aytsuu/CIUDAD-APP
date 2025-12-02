import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardLayout from "@/components/ui/card/card-layout";
import { format } from "date-fns";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface VisitHistoryTabProps {
  completedData: any;
  pendingData: any;
  missedData: any;
}

export default function VisitHistoryTab({ completedData, pendingData, missedData }: VisitHistoryTabProps) {
  // Check if there are no follow-up visits at all
  const hasNoVisits = 
    (!pendingData?.results || pendingData.results.length === 0) &&
    (!completedData?.results || completedData.results.length === 0) &&
    (!missedData?.results || missedData.results.length === 0);

  return (
    <TabsContent value="visits" className="mt-0">
      <CardLayout
        title="Visit History"
        description="Record of patient visits and consultations"
        content={
          hasNoVisits ? (
            <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700">No Follow-up Visits Found</h3>
              <p className="text-sm text-gray-500 mt-2">
                There are currently no follow-up visits scheduled or recorded for this patient.
              </p>
            </div>
          ) : (
          <div className="mx-auto border-none">
            <div className="pt-4">
              <div className="mt-4">
                <Tabs defaultValue="pending" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-full">
                    <TabsTrigger value="pending" className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none bg-transparent font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Upcoming
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none bg-transparent font-medium">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="missed" className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none bg-transparent font-medium">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        Missed
                      </div>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="pending">
                    <div className="space-y-3 mt-6">
                      {pendingData?.results?.length > 0 ? (
                        pendingData.results.map((visit: any) => (
                          <div key={visit.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-900">{visit.description}</h3>
                                <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Scheduled: {format(new Date(visit.date), "MMM dd, yyyy")}
                                </p>
                              </div>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No pending follow-up visits</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="completed">
                    <div className="space-y-3 mt-6">
                      {completedData?.results?.length > 0 ? (
                        completedData.results.map((visit: any) => (
                          <div key={visit.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{visit.description}</h3>
                                <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Date: {format(new Date(visit.date), "MMM dd, yyyy")}
                                </p>
                                {visit.updated_at && <p className="text-xs text-gray-500 mt-1">Recorded on: {format(new Date(visit.updated_at), "MMM dd, yyyy HH:mm")}</p>}
                              </div>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No completed follow-up visits</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="missed">
                    <div className="space-y-3 mt-6">
                      {missedData?.results?.length > 0 ? (
                        missedData.results.map((visit: any) => (
                          <div key={visit.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-gray-900">{visit.description}</h3>
                                <p className="text-sm text-gray-600 mt-2 flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Scheduled: {format(new Date(visit.date), "MMM dd, yyyy")}
                                </p>
                              </div>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <XCircle className="w-3 h-3 mr-1" />
                                Missed
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No missed follow-up visits</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
          )
        }
        cardClassName="border shadow-sm rounded-md"
        headerClassName="pb-2"
        contentClassName="pt-0"
      />
    </TabsContent>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EventCalendar from "@/components/ui/calendar/EventCalendar"
import WasteHotspotMain from "./waste-hotspot/waste-hotspot-main"
import WasteCollectionMain from "./waste-colllection/waste-col-main"
import { useGetHotspotRecords, type Hotspot } from "./waste-hotspot/queries/hotspotFetchQueries"
import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull  } from "./waste-colllection/queries/wasteColFetchQueries"
import { formatTime } from "@/helpers/timeFormatter"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, MapPin, Calendar } from "lucide-react"
import { hotspotColumns } from "./event-columns/event-cols"
import { wasteColColumns } from "./event-columns/event-cols"


const WasteMainScheduling = () => {
  const { data: hotspotData = [], isLoading } = useGetHotspotRecords()
  const { data: wasteCollectionData = [], isLoading: isWasteColLoading } = useGetWasteCollectionSchedFull();
  const [activeTab, setActiveTab] = useState("calendar")


   const calendarSources = [
    {
      name: "Hotspot Assignment",
      data: hotspotData.filter((row) => row.wh_is_archive === false),
      columns: hotspotColumns,
      titleAccessor: "watchman",
      dateAccessor: "wh_date",
      timeAccessor: "wh_start_time",
      endTimeAccessor: "wh_end_time",
      defaultColor: "#3b82f6", // blue
    },
    {
      name: "Waste Collection",
      data: wasteCollectionData.filter((row) => row.wc_is_archive === false),
      columns: wasteColColumns,
      titleAccessor: "collectors_names",
      dateAccessor: "wc_date",
      timeAccessor: "wc_time",
      defaultColor: "#10b981", // emerald
    }
  ];

  // Filter upcoming events (non-archived and future dates)
  // const upcomingEvents = fetchedData.filter((event) => {
  //   const eventDate = new Date(`${event.wh_date}T${event.wh_start_time}`)
  //   const now = new Date()
  //   return !event.wh_is_archive && eventDate >= now
  // })

  if (isLoading || isWasteColLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      {/* Header Section */}
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Calendar</h1>
        <p className="text-xs sm:text-sm text-darkGray">Manage and view scheduled tasks and events.</p>
      </div>
      <hr className="border-gray mb-6 sm:mb-8" />

      {/* Tabs Section */}
      <Tabs defaultValue="calendar" className="mb-6">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white h-[50px] rounded-lg shadow-sm border border-gray-100 text-center">
          <TabsTrigger
            value="calendar"
            onClick={() => setActiveTab("calendar")}
            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 data-[state=active]:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Calendar
          </TabsTrigger>
          <TabsTrigger
            value="waste-collection"
            onClick={() => setActiveTab("waste-collection")}
            className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 data-[state=active]:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Waste Collection
          </TabsTrigger>
          <TabsTrigger
            value="hotspot"
            onClick={() => setActiveTab("hotspot")}
            className="data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-800 data-[state=active]:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Hotspot
          </TabsTrigger>
          <TabsTrigger
            value="waste-events"
            onClick={() => setActiveTab("waste-events")}
            className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800 data-[state=active]:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
          >
            Waste Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar - Takes 2/3 width on large screens */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 mb-5">
              <EventCalendar
                sources={calendarSources}
                legendItems={[
                  { label: "Hotspot Assignments", color: "#3b82f6" },
                  { label: "Waste Collection", color: "#10b981" }
                ]}
              />
            </div>

            {/* Upcoming Events Panel - Takes 1/3 width on large screens */}
            {/* <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-5">
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Upcoming Assignments
                </h2>
                <p className="text-sm text-gray-600 mt-1">{upcomingEvents.length} scheduled</p>
              </div> */}

              {/* {upcomingEvents.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto">
                  {upcomingEvents.map((event, index) => (
                    <div
                      key={event.wh_num}
                      className="relative border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors duration-200"
                    >
                   
                      {index < upcomingEvents.length - 1 && (
                        <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-200"></div>
                      )}

                      <div className="absolute left-6 top-6 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>

                      <div className="pl-16 pr-6 py-5">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-gray-900 text-base leading-tight">{event.watchman}</h3>
                          <div className="text-right flex-shrink-0 ml-3">
                            <div className="flex items-center text-sm font-medium text-gray-700 mb-1">
                              <Clock className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                                {`${formatTime(event.wh_start_time)} - ${formatTime(event.wh_end_time)}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(event.wh_date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600 mr-2">Sitio:</span>
                          <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2.5 py-1 rounded-full">
                            {event.sitio}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-900 font-medium mb-2">No upcoming assignments</h3>
                  <p className="text-sm text-gray-500">All assignments are completed or archived</p>
                </div>
              )}
            </div> */}
          </div>
        </TabsContent>

        <TabsContent value="waste-collection" className="space-y-4">
          <WasteCollectionMain />
        </TabsContent>

        <TabsContent value="hotspot" className="space-y-4">
          <WasteHotspotMain />
        </TabsContent>

        <TabsContent value="waste-events" className="space-y-4">
          {/* <WasteEventSched /> */}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WasteMainScheduling

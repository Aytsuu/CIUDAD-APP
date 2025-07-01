// import {Tabs,TabsContent,TabsList,TabsTrigger} from "@/components/ui/tabs";
// import EventCalendar from "@/components/ui/calendar/EventCalendar";
// import WasteHotspotMain from "./waste-hotspot/waste-hotspot-main";
// import {useGetHotspotRecords,type Hotspot,} from "./waste-hotspot/queries/hotspotFetchQueries";
// import { formatTime } from "@/helpers/timeFormatter";
// import { EventDetailColumn } from "@/components/ui/calendar/EventCalendar";
// import { useState } from "react";
// import { Skeleton } from "@/components/ui/skeleton";

// const commonColumns: EventDetailColumn<Hotspot>[] = [
//   { accessorKey: "watchman", header: "Watchman" },
//   { accessorKey: "wh_date", header: "Assignment Date" },
//   {
//     accessorKey: "wh_time",
//     header: "Assignment Time",
//     cell: (props: { row: { original: Hotspot } }) =>
//       formatTime(props.row.original.wh_time),
//   },
//   { accessorKey: "sitio", header: "Sitio" },
//   { accessorKey: "wh_add_info", header: "Additional Info" },
// ];

// const WasteMainScheduling = () => {
//   const { data: fetchedData = [], isLoading } = useGetHotspotRecords();
//   const [activeTab, setActiveTab] = useState("calendar");

//   // Filter upcoming events (non-archived and future dates)
//   const upcomingEvents = fetchedData.filter((event) => {
//     const eventDate = new Date(`${event.wh_date}T${event.wh_time}`);
//     const now = new Date();
//     return !event.wh_is_archive && eventDate >= now;
//   });

//   if (isLoading) {
//     return (
//       <div className="space-y-4">
//         <Skeleton className="h-10 w-full" />
//         <Skeleton className="h-32 w-full" />
//         <Skeleton className="h-10 w-full" />
//         <Skeleton className="h-10 w-full" />
//         <Skeleton className="h-10 w-full" />
//         <div className="flex justify-end">
//           <Skeleton className="h-10 w-24" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-full">
//       {/* Header Section */}
//       <div className="flex-col items-center mb-4">
//         <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
//           Calendar
//         </h1>
//         <p className="text-xs sm:text-sm text-darkGray">
//           Manage and view scheduled tasks and events.
//         </p>
//       </div>
//       <hr className="border-gray mb-6 sm:mb-8" />

//       {/* Tabs Section */}
//       <Tabs defaultValue="calendar" className="mb-6">
//         <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white h-[50px] rounded-lg shadow-sm border border-gray-100 text-center">
//           <TabsTrigger
//             value="calendar"
//             onClick={() => setActiveTab("calendar")}
//             className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-800 data-[state=active]:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
//           >
//             Calendar
//           </TabsTrigger>
//           <TabsTrigger
//             value="waste-collection"
//             onClick={() => setActiveTab("waste-collection")}
//             className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 data-[state=active]:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
//           >
//             Waste Collection
//           </TabsTrigger>
//           <TabsTrigger
//             value="hotspot"
//             onClick={() => setActiveTab("hotspot")}
//             className="data-[state=active]:bg-cyan-100 data-[state=active]:text-cyan-800 data-[state=active]:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
//           >
//             Hotspot
//           </TabsTrigger>
//           <TabsTrigger
//             value="waste-events"
//             onClick={() => setActiveTab("waste-events")}
//             className="data-[state=active]:bg-orange-100 data-[state=active]:text-orange-800 data-[state=active]:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition-colors duration-200 py-2 px-4 rounded-md border border-transparent font-medium text-sm flex items-center justify-center"
//           >
//             Waste Events
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="calendar" className="mt-4">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Calendar - Takes 2/3 width on large screens */}
//             <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4 mb-5">
//               <EventCalendar
//                 name="Hotspot Assignment & Schedule"
//                 titleAccessor="watchman"
//                 data={fetchedData.filter(row => row.wh_is_archive === false)}
//                 columns={commonColumns}
//               />
//             </div>

//             {/* Upcoming Events Panel - Takes 1/3 width on large screens */}
//             {/* <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4 mb-5">
//               <h2 className="font-semibold text-lg mb-4 text-gray-800">
//                 Upcoming Assignments
//               </h2>
              
//               {upcomingEvents.length > 0 ? (
//                 <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-custom">
//                   {upcomingEvents.map((event) => (
//                     <div
//                       key={event.wh_num}
//                       className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
//                     >
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <h3 className="font-medium text-gray-800">
//                             {event.watchman}
//                           </h3>
//                           <p className="text-sm text-gray-600 mt-1">
//                             <span className="font-medium">Sitio:</span> {event.sitio}
//                           </p>
//                           <p className="text-sm text-gray-600">
//                             <span className="font-medium">Time:</span> {formatTime(event.wh_time)}
//                           </p>
//                           <p className="text-xs text-gray-500 mt-2">
//                             {new Date(event.wh_date).toLocaleDateString('en-US', {
//                               month: 'short',
//                               day: 'numeric',
//                               year: 'numeric'
//                             })}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-6 text-gray-500 border border-gray-200 rounded-lg bg-gray-50">
//                   No upcoming assignments found
//                 </div>
//               )}
//             </div> */}

//             <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-5">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="font-semibold text-xl text-gray-900">
//                   Upcoming Assignments
//                 </h2>
//               </div>
              
//               {upcomingEvents.length > 0 ? (
//                 <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
//                   {upcomingEvents.map((event, index) => (
//                     <div
//                       key={event.wh_num}
//                       className="group relative p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:from-blue-50 hover:to-white transition-all duration-200 border border-gray-200 hover:border-blue-200 hover:shadow-sm"
//                     >
//                       {/* Timeline connector */}
//                       {index < upcomingEvents.length - 1 && (
//                         <div className="absolute left-6 top-16 w-0.5 h-6 bg-gray-200 group-hover:bg-blue-200 transition-colors"></div>
//                       )}
                      
//                       {/* Timeline dot */}
//                       <div className="absolute left-4 top-4 w-3 h-3 bg-blue-500 rounded-full group-hover:bg-blue-600 transition-colors"></div>
                      
//                       <div className="ml-8">
//                         <div className="flex justify-between items-start mb-3">
//                           <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-900 transition-colors">
//                             {event.watchman}
//                           </h3>
//                           <div className="text-right">
//                             <div className="text-sm font-medium text-gray-900">
//                               {formatTime(event.wh_time)}
//                             </div>
//                             <div className="text-xs text-gray-500 mt-0.5">
//                               {new Date(event.wh_date).toLocaleDateString('en-US', {
//                                 month: 'short',
//                                 day: 'numeric',
//                                 year: 'numeric'
//                               })}
//                             </div>
//                           </div>
//                         </div>
                        
//                         <div className="flex items-center justify-between">
//                           <div className="flex items-center space-x-2">
//                             <span className="text-sm text-gray-600">Sitio:</span>
//                             <span className="text-sm font-medium text-gray-800 px-2 py-1 bg-gray-100 rounded-md group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
//                               {event.sitio}
//                             </span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
//                   </div>
//                   <h3 className="text-gray-900 font-medium mb-2">No upcoming assignments</h3>
//                 </div>
//               )}
//             </div>
//           </div>
//         </TabsContent>

//         <TabsContent value="waste-collection" className="space-y-4">
//           {/* <WasteColSched /> */}
//         </TabsContent>

//         <TabsContent value="hotspot" className="space-y-4">
//           <WasteHotspotMain />
//         </TabsContent>

//         <TabsContent value="waste-events" className="space-y-4">
//           {/* <WasteEventSched /> */}
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default WasteMainScheduling;

"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EventCalendar from "@/components/ui/calendar/EventCalendar"
import WasteHotspotMain from "./waste-hotspot/waste-hotspot-main"
import { useGetHotspotRecords, type Hotspot } from "./waste-hotspot/queries/hotspotFetchQueries"
import { formatTime } from "@/helpers/timeFormatter"
import type { EventDetailColumn } from "@/components/ui/calendar/EventCalendar"
import { useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, MapPin, Calendar } from "lucide-react"

const commonColumns: EventDetailColumn<Hotspot>[] = [
  { accessorKey: "watchman", header: "Watchman" },
  { accessorKey: "wh_date", header: "Assignment Date" },
  {
    accessorKey: "wh_start_time",
    header: "Start Time",
    cell: (props: { row: { original: Hotspot } }) => formatTime(props.row.original.wh_start_time),
  },
  {
    accessorKey: "wh_end_time",
    header: "End Time",
    cell: (props: { row: { original: Hotspot } }) => formatTime(props.row.original.wh_end_time),
  },
  { accessorKey: "sitio", header: "Sitio" },
  { accessorKey: "wh_add_info", header: "Additional Info" },
]

const WasteMainScheduling = () => {
  const { data: fetchedData = [], isLoading } = useGetHotspotRecords()
  const [activeTab, setActiveTab] = useState("calendar")

  // Filter upcoming events (non-archived and future dates)
  const upcomingEvents = fetchedData.filter((event) => {
    const eventDate = new Date(`${event.wh_date}T${event.wh_start_time} - ${event.wh_end_time}`)
    const now = new Date()
    return !event.wh_is_archive && eventDate >= now
  })

  if (isLoading) {
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
                name="Hotspot Assignment & Schedule"
                titleAccessor="watchman"
                data={fetchedData.filter((row) => row.wh_is_archive === false)}
                columns={commonColumns}
              />
            </div>

            {/* Upcoming Events Panel - Takes 1/3 width on large screens */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-5">
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Upcoming Assignments
                </h2>
                <p className="text-sm text-gray-600 mt-1">{upcomingEvents.length} scheduled</p>
              </div>

              {upcomingEvents.length > 0 ? (
                <div className="max-h-[600px] overflow-y-auto">
                  {upcomingEvents.map((event, index) => (
                    <div
                      key={event.wh_num}
                      className="relative border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors duration-200"
                    >
                      {/* Timeline connector */}
                      {index < upcomingEvents.length - 1 && (
                        <div className="absolute left-8 top-16 w-0.5 h-8 bg-gray-200"></div>
                      )}

                      {/* Timeline dot */}
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
            </div>
          </div>
        </TabsContent>

        <TabsContent value="waste-collection" className="space-y-4">
          {/* <WasteColSched /> */}
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

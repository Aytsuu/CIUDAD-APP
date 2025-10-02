import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EventCalendar from "@/components/ui/calendar/EventCalendar";
import WasteHotspotMain from "./waste-hotspot/waste-hotspot-main";
import WasteCollectionMain from "./waste-collection/waste-col-main";
import { useGetHotspotRecords } from "./waste-hotspot/queries/hotspotFetchQueries";
import { useGetWasteCollectionSchedFull } from "./waste-collection/queries/wasteColFetchQueries";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { hotspotColumns } from "./event-columns/event-cols";
import {
  wasteColColumns,
  councilEventColumns,
} from "./event-columns/event-cols";
import { useGetCouncilEvents } from "../council/Calendar/queries/councilEventfetchqueries";
// import { getWasteEvents } from "./waste-event/queries/wasteEventQueries";
import WasteEventSched from "./waste-event/waste-event-sched";

const WasteMainScheduling = () => {
  const { data: hotspotData = [], isLoading: isHotspotLoading } = useGetHotspotRecords();
  const { data: wasteCollectionData = [], isLoading: isWasteColLoading } = useGetWasteCollectionSchedFull();
  // const { data: wasteEventData = [], isLoading: isWasteEventLoading } = useQuery({
  //   queryKey: ['wasteEvents'],
  //   queryFn: getWasteEvents
  // });
  const [_activeTab, setActiveTab] = useState("calendar");
  const { data: councilEvents = [] } = useGetCouncilEvents();
  const calendarEvents = councilEvents.filter((event) => !event.ce_is_archive);
  console.log('Hotspots:', hotspotData)

  const calendarSources = [
    {
      name: "Hotspot Assignment",
      data: hotspotData,
      columns: hotspotColumns,
      titleAccessor: "watchman",
      dateAccessor: "wh_date",
      timeAccessor: "wh_start_time",
      endTimeAccessor: "wh_end_time",
      defaultColor: "#3b82f6", // blue
    },
    {
      name: "Waste Collection",
      data: wasteCollectionData,
      columns: wasteColColumns,
      titleAccessor: "sitio_name",
      dateAccessor: "wc_day",
      timeAccessor: "wc_time",
      defaultColor: "#10b981", // emerald
    },
    // {
    //   name: "Waste Events",
    //   data: wasteEventData.filter((event: any) => !event.we_is_archive && event.we_date && event.we_time),
    //   columns: [
    //     { accessorKey: "we_name", header: "Event Name" },
    //     { accessorKey: "we_location", header: "Location" },
    //     { accessorKey: "we_date", header: "Date" },
    //     { accessorKey: "we_time", header: "Time" },
    //     { accessorKey: "we_description", header: "Event Description" },
    //     { accessorKey: "we_organizer", header: "Organizer" },
    //     { accessorKey: "we_invitees", header: "Invitees" },
    //   ],
    //   titleAccessor: "we_name",
    //   dateAccessor: "we_date",
    //   timeAccessor: "we_time",
    //   defaultColor: "#f59e0b", // amber
    // },
    {
      name: "Council Events",
      data: calendarEvents,
      columns: councilEventColumns,
      titleAccessor: "ce_title",
      dateAccessor: "ce_date",
      timeAccessor: "ce_time",
      defaultColor: "#191970", // midnight blue
    },
  ];

  if (isHotspotLoading || isWasteColLoading ) {
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
    );
  }

  return (
    <div className="w-full h-full">
      {/* Header Section */}
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Calendar
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view scheduled tasks and events.
        </p>
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
          <div className="w-full bg-white rounded-lg shadow-md p-4 mb-5">
            <EventCalendar
              sources={calendarSources}
              legendItems={[
                { label: "Hotspot Assignments", color: "#3b82f6" },
                { label: "Waste Collection", color: "#10b981" },
                { label: "Waste Events", color: "#f59e0b" },
                { label: "Council Events", color: "#191970" },
              ]}
            />
          </div>
        </TabsContent>

        <TabsContent value="waste-collection" className="space-y-4">
          <WasteCollectionMain />
        </TabsContent>

        <TabsContent value="hotspot" className="space-y-4">
          <WasteHotspotMain />
        </TabsContent>

        <TabsContent value="waste-events" className="space-y-4">
          <WasteEventSched />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WasteMainScheduling;

// import React from "react";
// import { useGetUpcomingHotspots, type UpcomingHotspots } from "./waste-sidebar-analytics-query";
// // import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull } from "./your-waste-collection-query-path";
// import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull } from "@/pages/record/waste-scheduling/waste-collection/queries/wasteColFetchQueries";
// import { Card } from "@/components/ui/card";
// import { Clock, ChevronRight, Calendar, Info } from "lucide-react";
// import { Button } from "@/components/ui/button/button";
// import { useNavigate } from "react-router";
// import { format, isSameDay, isWithinInterval, addDays } from "date-fns";
// import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Label } from "@/components/ui/label";

// type ActivityItem = {
//   type: 'hotspot' | 'collection';
//   data: any;
//   date: Date;
// };

// export const WasteActivitySidebar = () => {
//   const [period, setPeriod] = React.useState<string>("today");
//   const [_, setSelectedActivity] = React.useState<ActivityItem | null>(null);
//   const { data: upcomingHotspots, isLoading: isLoadingHotspots } = useGetUpcomingHotspots();
//   const { data: wasteCollections, isLoading: isLoadingCollections } = useGetWasteCollectionSchedFull();
//   const navigate = useNavigate();

//   // Combine and filter activities based on selected period
//   const filteredActivities = React.useMemo(() => {
//     const activities: ActivityItem[] = [];
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     // Add hotspots
//     if (upcomingHotspots) {
//       upcomingHotspots.forEach((hotspot) => {
//         const hotspotDate = new Date(hotspot.wh_date);
//         hotspotDate.setHours(0, 0, 0, 0);
        
//         if (period === "today" && isSameDay(hotspotDate, today)) {
//           activities.push({
//             type: 'hotspot',
//             data: hotspot,
//             date: hotspotDate
//           });
//         } else if (period === "this_week" && isWithinInterval(hotspotDate, {
//           start: today,
//           end: addDays(today, 7)
//         })) {
//           activities.push({
//             type: 'hotspot',
//             data: hotspot,
//             date: hotspotDate
//           });
//         }
//       });
//     }
    
//     // Add waste collections
//     if (wasteCollections) {
//       wasteCollections.forEach((collection: any) => {
//         const collectionDate = new Date(collection.wc_date);
//         collectionDate.setHours(0, 0, 0, 0);
        
//         if (period === "today" && isSameDay(collectionDate, today)) {
//           activities.push({
//             type: 'collection',
//             data: collection,
//             date: collectionDate
//           });
//         } else if (period === "this_week" && isWithinInterval(collectionDate, {
//           start: today,
//           end: addDays(today, 7)
//         })) {
//           activities.push({
//             type: 'collection',
//             data: collection,
//             date: collectionDate
//           });
//         }
//       });
//     }
    
//     // Sort activities by date
//     return activities.sort((a, b) => a.date.getTime() - b.date.getTime());
//   }, [upcomingHotspots, wasteCollections, period]);

//   const isLoading = isLoadingHotspots || isLoadingCollections;

//   return (
//     <Card className="w-80 bg-white h-full flex flex-col">
//       {/* Header */}
//       <div className="p-4 border-b border-black/10">
//         <div className="flex items-center gap-2 mb-3">
//           <h2 className="text-lg font-semibold text-black/90">
//             Upcoming Waste Activities
//           </h2>
//         </div>
        
//         {/* Period Selector */}
//         <div className="flex bg-gray-100 rounded-lg p-1">
//           <button
//             onClick={() => setPeriod("today")}
//             className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
//               period === "today"
//                 ? "bg-white text-buttonBlue shadow-sm"
//                 : "text-black/60 hover:text-black/90"
//             }`}
//           >
//             Today
//           </button>
//           <button
//             onClick={() => setPeriod("this_week")}
//             className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
//               period === "this_week"
//                 ? "bg-white text-buttonBlue shadow-sm"
//                 : "text-black/60 hover:text-black/90"
//             }`}
//           >
//             This Week
//           </button>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="flex-1 overflow-y-auto">
//         {isLoading ? (
//           <div className="p-4 space-y-3">
//             {[...Array(3)].map((_, i) => (
//               <div key={i} className="animate-pulse">
//                 <div className="bg-gray-100 rounded-lg p-4">
//                   <div className="h-4 bg-black/20 rounded w-3/4 mb-2"></div>
//                   <div className="h-3 bg-black/20 rounded w-1/2"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : filteredActivities.length > 0 ? (
//           <div className="p-4 space-y-3">
//             {filteredActivities.map((activity) => (
//               <DialogLayout
//                 key={activity.type === 'hotspot' 
//                   ? `hotspot-${(activity.data as UpcomingHotspots).wh_num}` 
//                   : `collection-${(activity.data as WasteCollectionSchedFull).wc_num}`}
//                 trigger={
//                   <Card 
//                     className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-200"
//                     onClick={() => setSelectedActivity(activity)}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1 min-w-0">
//                         <h3 className="font-medium text-gray-900 truncate mb-1">
//                           {activity.type === 'hotspot' ? 'Hotspot Assignment' : 'Waste Collection'}
//                         </h3>
//                         <div className="flex flex-col gap-1 text-xs text-gray-500">
//                           <div className="flex items-center gap-1">
//                             <Calendar className="w-3 h-3" />
//                             <span>{activity.date.toLocaleDateString()}</span>
//                           </div>
//                           <div className="flex items-center gap-1">
//                             {activity.type === 'hotspot' ? (
//                               <>
//                                 <Clock className="w-3 h-3" />
//                                 <span>
//                                   {format(new Date(`2000-01-01T${(activity.data as UpcomingHotspots).wh_start_time}`), "h:mm a")} - 
//                                   {format(new Date(`2000-01-01T${(activity.data as UpcomingHotspots).wh_end_time}`), "h:mm a")}
//                                 </span>
//                               </>
//                             ) : (
//                               <>
//                                 <Clock className="w-3 h-3" />
//                                 <span>
//                                   {format(new Date(`2000-01-01T${(activity.data as WasteCollectionSchedFull).wc_time}`), "h:mm a")}
//                                 </span>
//                               </>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                       <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
//                     </div>
//                   </Card>
//                 }
//                 title={activity.type === 'hotspot' ? "Hotspot Assignment Details" : "Waste Collection Details"}
//                 description=""
//                 mainContent={
//                   activity.type === 'hotspot' ? (
//                     <HotspotDetails hotspot={activity.data as UpcomingHotspots} />
//                   ) : (
//                     <CollectionDetails collection={activity.data as WasteCollectionSchedFull} />
//                   )
//                 }
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center justify-center p-8 text-center">
//             <div className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center mb-4">
//               <Clock className="w-8 h-8 text-black/40" />
//             </div>
//             <h3 className="text-sm font-medium text-gray-900 mb-1">
//               No upcoming activities
//             </h3>
//             <p className="text-xs text-gray-500">
//               {period === "today" 
//                 ? "No activity scheduled for today"
//                 : "No activity scheduled this week"}
//             </p>
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       {filteredActivities.length > 0 && (
//         <div className="p-4 border-t border-gray-100">
//           <Button onClick={() => navigate("/waste-calendar-scheduling")}>
//             View Calendar
//           </Button>
//         </div>
//       )}
//     </Card>
//   );
// };

// // Helper component for hotspot details
// const HotspotDetails = ({ hotspot }: { hotspot: UpcomingHotspots }) => (
//   <div className="space-y-4">
//     <div className="grid grid-cols-2 gap-4">
//       <div>
//         <Label>Date</Label>
//         <p>{new Date(hotspot.wh_date).toLocaleDateString()}</p>
//       </div>
//       <div>
//         <Label>Time</Label>
//         <p>
//           {format(new Date(`2000-01-01T${hotspot.wh_start_time}`), "h:mm a")} - 
//           {format(new Date(`2000-01-01T${hotspot.wh_end_time}`), "h:mm a")}
//         </p>
//       </div>
//       <div>
//         <Label className="flex items-center gap-1">
//           Watchman
//         </Label>
//         <p>{hotspot.watchman || "Not assigned"}</p>
//       </div>
//       <div>
//         <Label className="flex items-center gap-1">
//           Sitio
//         </Label>
//         <p>{hotspot.sitio || "Not specified"}</p>
//       </div>
//     </div>
//     {hotspot.wh_add_info && (
//       <div>
//         <Label className="flex items-center gap-1">
//           <Info className="w-4 h-4" />
//           Additional Information
//         </Label>
//         <p className="whitespace-pre-wrap mt-1 p-2 bg-gray-50 rounded-md">
//           {hotspot.wh_add_info}
//         </p>
//       </div>
//     )}
//   </div>
// );

// // Helper component for collection details
// const CollectionDetails = ({ collection }: { collection: any }) => (
//   <div className="space-y-4">
//     <div className="grid grid-cols-2 gap-4">
//       <div>
//         <Label>Date</Label>
//         <p>{new Date(collection.wc_date).toLocaleDateString()}</p>
//       </div>
//       <div>
//         <Label>Time</Label>
//         <p>
//           {format(new Date(`2000-01-01T${collection.wc_time}`), "h:mm a")}
//         </p>
//       </div>
//       <div>
//         <Label>Sitio</Label>
//         <p>{collection.sitio_name || "Not specified"}</p>
//       </div>
//       <div>
//         <Label>Driver</Label>
//         <p>{collection.driver_name || "Not assigned"}</p>
//       </div>
//     </div>
//     <div>
//       <Label>Waste Collector(s)</Label>
//       <p>{collection.collectors_names || "Not assigned"}</p>
//     </div>
//   </div>
// );







import React from "react";
import { useGetUpcomingHotspots, type UpcomingHotspots } from "./waste-sidebar-analytics-query";
import { useGetWasteCollectionSchedFull, type WasteCollectionSchedFull } from "@/pages/record/waste-scheduling/waste-collection/queries/wasteColFetchQueries";
import { Card } from "@/components/ui/card";
import { Clock, ChevronRight, Calendar, Info } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";
import { format, isSameDay, isWithinInterval, addDays } from "date-fns";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Label } from "@/components/ui/label";

type ActivityItem = {
  type: 'hotspot' | 'collection';
  data: any;
  date: Date;
};

export const WasteActivitySidebar = () => {
  const [period, setPeriod] = React.useState<string>("today");
  const [_, setSelectedActivity] = React.useState<ActivityItem | null>(null);
  const { data: upcomingHotspots, isLoading: isLoadingHotspots } = useGetUpcomingHotspots();
  
  // Fetch waste collections with pagination - get all non-archived collections
  const { data: wasteCollectionsData = { results: [], count: 0 }, isLoading: isLoadingCollections } = useGetWasteCollectionSchedFull(
    1,
    1000, // Large page size to get all schedules
    undefined,
    undefined,
    false // Only get active (non-archived) schedules
  );

  console.log("WASTE ANALYTICS ", wasteCollectionsData)
  
  const navigate = useNavigate();

  // Combine and filter activities based on selected period
  const filteredActivities = React.useMemo(() => {
    const activities: ActivityItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's day name (e.g., "Monday", "Tuesday", etc.)
    const todayDayName = today.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Get array of day names for this week
    const thisWeekDays = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(today, i);
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    });
    
    // Add hotspots
    if (upcomingHotspots) {
      upcomingHotspots.forEach((hotspot) => {
        const hotspotDate = new Date(hotspot.wh_date);
        hotspotDate.setHours(0, 0, 0, 0);
        
        if (period === "today" && isSameDay(hotspotDate, today)) {
          activities.push({
            type: 'hotspot',
            data: hotspot,
            date: hotspotDate
          });
        } else if (period === "this_week" && isWithinInterval(hotspotDate, {
          start: today,
          end: addDays(today, 7)
        })) {
          activities.push({
            type: 'hotspot',
            data: hotspot,
            date: hotspotDate
          });
        }
      });
    }
    
    // Add waste collections - now using wc_day instead of wc_date
    if (wasteCollectionsData.results) {
      wasteCollectionsData.results.forEach((collection: WasteCollectionSchedFull) => {
        // Skip archived collections
        if (collection.wc_is_archive) return;
        
        if (period === "today" && collection.wc_day === todayDayName) {
          // For today, create a date object for sorting purposes
          const collectionDate = new Date(today);
          collectionDate.setHours(0, 0, 0, 0);
          
          activities.push({
            type: 'collection',
            data: collection,
            date: collectionDate
          });
        } else if (period === "this_week" && thisWeekDays.includes(collection.wc_day)) {
          // For this week, find the next occurrence of this day
          const dayIndex = thisWeekDays.indexOf(collection.wc_day);
          const collectionDate = addDays(today, dayIndex);
          collectionDate.setHours(0, 0, 0, 0);
          
          activities.push({
            type: 'collection',
            data: collection,
            date: collectionDate
          });
        }
      });
    }
    
    // Sort activities by date
    return activities.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [upcomingHotspots, wasteCollectionsData.results, period]);

  const isLoading = isLoadingHotspots || isLoadingCollections;

  return (
    <Card className="w-80 bg-white h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-black/10">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-semibold text-black/90">
            Upcoming Waste Activities
          </h2>
        </div>
        
        {/* Period Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setPeriod("today")}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              period === "today"
                ? "bg-white text-buttonBlue shadow-sm"
                : "text-black/60 hover:text-black/90"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod("this_week")}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              period === "this_week"
                ? "bg-white text-buttonBlue shadow-sm"
                : "text-black/60 hover:text-black/90"
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="h-4 bg-black/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-black/20 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="p-4 space-y-3">
            {filteredActivities.map((activity, index) => (
              <DialogLayout
                key={activity.type === 'hotspot' 
                  ? `hotspot-${(activity.data as UpcomingHotspots).wh_num}` 
                  : `collection-${(activity.data as WasteCollectionSchedFull).wc_num}-${index}`}
                trigger={
                  <Card 
                    className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-200"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate mb-1">
                          {activity.type === 'hotspot' ? 'Hotspot Assignment' : 'Waste Collection'}
                        </h3>
                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {activity.type === 'hotspot' 
                                ? activity.date.toLocaleDateString()
                                : `${(activity.data as WasteCollectionSchedFull).wc_day} (${activity.date.toLocaleDateString()})`
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {activity.type === 'hotspot' ? (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>
                                  {format(new Date(`2000-01-01T${(activity.data as UpcomingHotspots).wh_start_time}`), "h:mm a")} - 
                                  {format(new Date(`2000-01-01T${(activity.data as UpcomingHotspots).wh_end_time}`), "h:mm a")}
                                </span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" />
                                <span>
                                  {format(new Date(`2000-01-01T${(activity.data as WasteCollectionSchedFull).wc_time}`), "h:mm a")}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </Card>
                }
                title={activity.type === 'hotspot' ? "Hotspot Assignment Details" : "Waste Collection Details"}
                description=""
                mainContent={
                  activity.type === 'hotspot' ? (
                    <HotspotDetails hotspot={activity.data as UpcomingHotspots} />
                  ) : (
                    <CollectionDetails collection={activity.data as WasteCollectionSchedFull} />
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-black/40" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              No upcoming activities
            </h3>
            <p className="text-xs text-gray-500">
              {period === "today" 
                ? "No activity scheduled for today"
                : "No activity scheduled this week"}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredActivities.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Button onClick={() => navigate("/waste-calendar-scheduling")}>
            View Calendar
          </Button>
        </div>
      )}
    </Card>
  );
};

// Helper component for hotspot details
const HotspotDetails = ({ hotspot }: { hotspot: UpcomingHotspots }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Date</Label>
        <p>{new Date(hotspot.wh_date).toLocaleDateString()}</p>
      </div>
      <div>
        <Label>Time</Label>
        <p>
          {format(new Date(`2000-01-01T${hotspot.wh_start_time}`), "h:mm a")} - 
          {format(new Date(`2000-01-01T${hotspot.wh_end_time}`), "h:mm a")}
        </p>
      </div>
      <div>
        <Label className="flex items-center gap-1">
          Watchman
        </Label>
        <p>{hotspot.watchman || "Not assigned"}</p>
      </div>
      <div>
        <Label className="flex items-center gap-1">
          Sitio
        </Label>
        <p>{hotspot.sitio || "Not specified"}</p>
      </div>
    </div>
    {hotspot.wh_add_info && (
      <div>
        <Label className="flex items-center gap-1">
          <Info className="w-4 h-4" />
          Additional Information
        </Label>
        <p className="whitespace-pre-wrap mt-1 p-2 bg-gray-50 rounded-md">
          {hotspot.wh_add_info}
        </p>
      </div>
    )}
  </div>
);

// Helper component for collection details
const CollectionDetails = ({ collection }: { collection: WasteCollectionSchedFull }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Day</Label>
        <p>{collection.wc_day}</p>
      </div>
      <div>
        <Label>Time</Label>
        <p>
          {format(new Date(`2000-01-01T${collection.wc_time}`), "h:mm a")}
        </p>
      </div>
      <div>
        <Label>Sitio</Label>
        <p>{collection.sitio_name || "Not specified"}</p>
      </div>
      <div>
        <Label>Driver</Label>
        <p>{collection.driver_name || "Not assigned"}</p>
      </div>
    </div>
    {collection.collectors_names && (
      <div>
        <Label>Waste Collector(s)</Label>
        <p>{collection.collectors_names}</p>
      </div>
    )}
    {collection.wc_add_info && collection.wc_add_info !== "None" && (
      <div>
        <Label className="flex items-center gap-1">
          <Info className="w-4 h-4" />
          Additional Information
        </Label>
        <p className="whitespace-pre-wrap mt-1 p-2 bg-gray-50 rounded-md">
          {collection.wc_add_info}
        </p>
      </div>
    )}
  </div>
);
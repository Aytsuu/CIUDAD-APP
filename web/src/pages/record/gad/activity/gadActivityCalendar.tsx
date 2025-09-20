import { useState, useMemo } from "react";
import EventCalendar from "@/components/ui/calendar/EventCalendar.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAnnualDevPlansByYear } from "../annual_development_plan/queries/annualDevPlanFetchQueries";
import { useGetCouncilEvents } from "../../council/Calendar/queries/councilEventfetchqueries";
import { useQuery } from "@tanstack/react-query";
import { getWasteEvents } from "../../waste-scheduling/waste-event/queries/wasteEventQueries";
import { useGetHotspotRecords } from "../../waste-scheduling/waste-hotspot/queries/hotspotFetchQueries";
import { useGetWasteCollectionSchedFull } from "../../waste-scheduling/waste-collection/queries/wasteColFetchQueries";
import { hotspotColumns, wasteColColumns } from "../../waste-scheduling/event-columns/event-cols";
import { useGetProjectProposals } from "../project-proposal/queries/projprop-fetchqueries";



function GADActivityPage() {
  const [isLoading] = useState(false);
  

  const currentYear = new Date().getFullYear();
  const { data: annualDevPlans = [], isLoading: isAnnualDevPlansLoading } = useGetAnnualDevPlansByYear(currentYear);
  
  // Fetch project proposals to filter annual dev plans
  const { data: projectProposals = [], isLoading: isProjectProposalsLoading } = useGetProjectProposals();
 
  const { data: wasteEventData = [], isLoading: isWasteEventLoading } = useQuery({
    queryKey: ['wasteEvents'],
    queryFn: getWasteEvents
  });
  const { data: councilEvents = [] } = useGetCouncilEvents();
  const calendarEvents = councilEvents.filter((event) => !event.ce_is_archive);
  
  // Fetch hotspot and waste collection data
  const { data: hotspotData = [], isLoading: isHotspotLoading } = useGetHotspotRecords();
  const { data: wasteCollectionData = [], isLoading: isWasteColLoading } = useGetWasteCollectionSchedFull();

  // Create a set of dev_ids that have project proposals
  const devIdsWithProposals = useMemo(() => {
    return new Set(projectProposals.map((proposal: any) => proposal.devId).filter(Boolean));
  }, [projectProposals]);

  // Transform annual development plans for calendar display - only include those with project proposals
  const transformedAnnualDevPlans = useMemo(() => {
    return annualDevPlans
      .filter((plan: any) => devIdsWithProposals.has(plan.dev_id))
      .map((plan: any) => ({
        id: plan.dev_id,
        title: plan.dev_client,
        date: plan.dev_date,
        time: "09:00", // Default time since plans don't have specific times
        place: "Municipal Office", // Default place
        description: plan.dev_issue,
        project: plan.dev_project,
        activity: plan.dev_activity,
        indicator: plan.dev_indicator,
        responsible_person: plan.dev_res_person,
        staff: plan.staff,
        total: plan.total,
        type: "annual_development_plan"
      }));
  }, [annualDevPlans, devIdsWithProposals]);

  // Column definitions for annual development plans
  const annualDevPlanColumns = [
    { accessorKey: "title", header: "GAD Mandate" },
    { accessorKey: "project", header: "Project/Activity" },
    { accessorKey: "description", header: "Issue Description" },
    { 
      accessorKey: "indicator", 
      header: "Performance Indicator",
      cell: ({ row }: { row: { original: any } }) => {
        const raw = row.original.indicator;
        if (!raw) return "-";
        
        try {
          // Handle different formats of indicator data
          if (typeof raw === 'string') {
            const trimmed = raw.trim();
            
  
            if (trimmed.includes('participants)') && trimmed.includes(',')) {
              return trimmed.split(',').map(item => item.trim()).join(', ');
            }
            
          
            if (trimmed.includes('participants)')) {
              return trimmed;
            }
            
            // Try to parse JSON string
            if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
              const parsed = JSON.parse(trimmed);
              if (Array.isArray(parsed)) {
                return parsed.map((item: any) => {
                  if (typeof item === 'object' && item.count && item.category) {
                    return `${item.category}: ${item.count}`;
                  }
                  return String(item);
                }).join(', ');
              }
            }
            return trimmed;
          } else if (Array.isArray(raw)) {
            return raw.map((item: any) => {
              if (typeof item === 'object' && item.count && item.category) {
                return `${item.category}: ${item.count}`;
              }
              return String(item);
            }).join(', ');
          }
          return String(raw);
        } catch (error) {
          return String(raw);
        }
      }
    },
    { accessorKey: "responsible_person", header: "Responsible Person" },
    { 
      accessorKey: "total", 
      header: "Budget",
      cell: ({ row }: { row: { original: any } }) => {
        const total = row.original.total;
        return total ? `₱${Number(total).toFixed(2)}` : "-";
      }
    },
  ];

  // Column definitions for waste events
  const wasteEventColumns = [
    { accessorKey: "we_name", header: "Event Name" },
    { accessorKey: "we_location", header: "Location" },
    { accessorKey: "we_date", header: "Date" },
    { accessorKey: "we_time", header: "Time" },
    { accessorKey: "we_description", header: "Event Description" },
    { accessorKey: "we_organizer", header: "Organizer" },
    { accessorKey: "we_invitees", header: "Invitees" },
  ];

  // Column definitions for council events
  const councilEventColumns = [
    { accessorKey: "ce_title", header: "Event Title" },
    { accessorKey: "ce_place", header: "Location" },
    { 
      accessorKey: "ce_date", 
      header: "Date",
      cell: ({ row }: { row: { original: any } }) => {
        return new Date(row.original.ce_date).toLocaleDateString('en-US', { 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        });
      }
    },
    { accessorKey: "ce_time", header: "Time" },
  ];

  // Prepare calendar sources for GAD activities
  const calendarSources = [
    {
      name: "Annual Development Plans",
      data: transformedAnnualDevPlans,
      columns: annualDevPlanColumns,
      titleAccessor: "title",
      dateAccessor: "date",
      timeAccessor: "time",
      defaultColor: "#8b5cf6", // purple for annual development plans (same as GAD activities)
    },
    {
      name: "Waste Events",
      data: wasteEventData.filter((event: any) => !event.we_is_archive && event.we_date && event.we_time),
      columns: wasteEventColumns,
      titleAccessor: "we_name",
      dateAccessor: "we_date",
      timeAccessor: "we_time",
      defaultColor: "#f59e0b", // amber for waste events
    },
    {
      name: "Council Events",
      data: calendarEvents,
      columns: councilEventColumns,
      titleAccessor: "ce_title",
      dateAccessor: "ce_date",
      timeAccessor: "ce_time",
      defaultColor: "#191970", // midnight blue for council events
    },
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
    }
  ];

  if (isLoading || isAnnualDevPlansLoading || isProjectProposalsLoading || isWasteEventLoading || isHotspotLoading || isWasteColLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
          <Skeleton className="h-8 w-32 opacity-30" />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <Skeleton className="h-[500px] w-full opacity-30" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GAD Activities Calendar</h1>
          </div>
        </div>
      
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <EventCalendar
              sources={calendarSources}
              legendItems={[
                { label: "GAD Annual Development Plans", color: "#8b5cf6" },
                { label: "Waste Events", color: "#f59e0b" },
                { label: "Council Events", color: "#191970" },
                { label: "Hotspot Assignments", color: "#3b82f6" },
                { label: "Waste Collection", color: "#10b981" },
              ]}
        />
      </div>
    </div>
  );
}

export default GADActivityPage;
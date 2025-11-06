import { useMemo, useEffect } from "react";
import EventCalendar from "@/components/ui/calendar/EventCalendar.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCouncilEvents } from "../../council/Calendar/queries/councilEventfetchqueries";
import { useQuery, useQueries } from "@tanstack/react-query";
import { getWasteEvents } from "../../waste-scheduling/waste-event/queries/wasteEventQueries";
import { useGetHotspotRecords } from "../../waste-scheduling/waste-hotspot/queries/hotspotFetchQueries";
import { useGetWasteCollectionSchedFull } from "../../waste-scheduling/waste-collection/queries/wasteColFetchQueries";
import { useGetProjectProposals } from "../project-proposal/queries/projprop-fetchqueries";
import { useResolution } from "@/pages/record/council/resolution/queries/resolution-fetch-queries";
import { useLoading } from "@/context/LoadingContext";
import { getAnnualDevPlansByYear, getAnnualDevPlans } from "../annual_development_plan/restful-api/annualGetAPI";

const transformAnnualDevPlans = (annualDevPlans: any[], devIdsWithProposals: Set<number>) => {
  if (!Array.isArray(annualDevPlans)) {
    return [];
  }
  
  
  const filteredPlans = annualDevPlans.filter((plan: any) => {
    // COMMENTED OUT: Archiving filtering disabled
    // // STRICT: Check archived status - handle all possible formats
    // const archivedValue = plan?.dev_archived;
    // if (archivedValue === true) {
    //   return false; // Exclude archived
    // }
    // 
    // // STRICT: Also exclude past dates (backend should archive but frontend backup)
    // if (plan?.dev_date) {
    //   const planDate = new Date(plan.dev_date);
    //   const today = new Date();
    //   today.setHours(0, 0, 0, 0);
    //   planDate.setHours(0, 0, 0, 0);
    //   if (planDate < today) {
    //     return false; // Exclude past dates
    //   }
    // }
    
    const isMandated = Boolean(plan?.dev_mandated);
    const hasProposal = devIdsWithProposals.has(plan.dev_id);
    const shouldInclude = isMandated || hasProposal;
    
    return shouldInclude;
  });
  
  
  return filteredPlans.map((plan: any) => {
    // Parse budget items to calculate correct total
    let budgetItems = [];
    let calculatedTotal = 0;
    
    try {
      const rawBudgetItems = plan.dev_budget_items;
      if (rawBudgetItems) {
        if (typeof rawBudgetItems === 'string') {
          budgetItems = JSON.parse(rawBudgetItems);
        } else if (Array.isArray(rawBudgetItems)) {
          budgetItems = rawBudgetItems;
        }
        
        // Calculate total from budget items
        calculatedTotal = budgetItems.reduce((sum: number, item: any) => {
          const quantity = Number(item.quantity || item.pax || 0);
          const price = Number(item.price || item.amount || 0);
          return sum + (quantity * price);
        }, 0);
      }
    } catch (error) {
      console.error('Error parsing budget items:', error);
    }
    
    // Use calculated total if available, otherwise fall back to plan.total
    const finalTotal = calculatedTotal > 0 ? calculatedTotal : (Number(plan.total) || 0);
    
    return {
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
      total: finalTotal,
      budget_items: budgetItems,
      type: "annual_development_plan"
    };
  });
};

const createDevIdsWithProposals = (projectProposals: any[], resolutions: any[]) => {
  const resolutionsList = Array.isArray(resolutions) ? resolutions : [];
  const projectProposalsList = Array.isArray(projectProposals) ? projectProposals : [];
  
  const resolutionGprIds = new Set(resolutionsList.map((r: any) => r.gpr_id).filter(Boolean));
  return new Set(
    projectProposalsList
      .filter((p: any) => p?.devId && p?.gprId && resolutionGprIds.has(p.gprId))
      .map((p: any) => p.devId)
  );
};

const filterCalendarEvents = (councilEvents: any[]) => {
  if (!Array.isArray(councilEvents)) {
    return [];
  }
  return councilEvents.filter((event) => !event.ce_is_archive);
};

const filterWasteEvents = (wasteEventData: any[]) => {
  if (!Array.isArray(wasteEventData)) {
    return [];
  }
  return wasteEventData.filter((event: any) => 
    !event.we_is_archive && event.we_date && event.we_time
  );
};

const parsePerformanceIndicator = (raw: any) => {
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
      
      // Handle comma-separated JSON objects like "{'count': 10, 'category': 'PWD'}, {'count': 11, 'category': 'LGBTQIA+'}"
      if (trimmed.includes("'count'") && trimmed.includes("'category'")) {
        // Split by '}, {' and clean up the format
        const objects = trimmed.split(/},\s*{/).map(obj => {
          // Clean up the object string
          let cleanObj = obj.replace(/^\{/, '').replace(/\}$/, '');
          // Convert single quotes to double quotes for JSON parsing
          cleanObj = cleanObj.replace(/'/g, '"');
          return `{${cleanObj}}`;
        });
        
        const parsedObjects = objects.map(objStr => {
          try {
            return JSON.parse(objStr);
          } catch {
            return null;
          }
        }).filter(Boolean);
        
        if (parsedObjects.length > 0) {
          return parsedObjects.map((item: any) => {
            if (typeof item === 'object' && item.count && item.category) {
              return `${item.category}: ${item.count}`;
            }
            return String(item);
          }).join(', ');
        }
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
        // Handle single object
        if (typeof parsed === 'object' && parsed.count && parsed.category) {
          return `${parsed.category}: ${parsed.count}`;
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
    } else if (typeof raw === 'object' && raw.count && raw.category) {
      // Handle single object directly
      return `${raw.category}: ${raw.count}`;
    }
    return String(raw);
  } catch (error) {
    return String(raw);
  }
};

const formatBudget = (total: any) => {
  return total ? `₱${Number(total).toFixed(2)}` : "-";
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};


// Column definitions and constants moved from constants directory
const annualDevPlanColumns = [
  { accessorKey: "title", header: "GAD Mandate" },
  { accessorKey: "project", header: "Project/Activity" },
  { accessorKey: "description", header: "Issue Description" },
  { 
    accessorKey: "indicator", 
    header: "Performance Indicator",
    cell: ({ row }: { row: { original: any } }) => {
      return parsePerformanceIndicator(row.original.indicator);
    }
  },
  { accessorKey: "responsible_person", header: "Responsible Person" },
  { 
    accessorKey: "budget_items", 
    header: "Budget Breakdown",
    cell: ({ row }: { row: { original: any } }) => {
      const budgetItems = row.original.budget_items || [];
      if (!Array.isArray(budgetItems) || budgetItems.length === 0) {
        return (
          <div className="text-gray-600">
            <p className="font-semibold mb-2">GAD Budget:</p>
            <p className="text-lg">{formatBudget(row.original.total)}</p>
          </div>
        );
      }
      
      return (
        <div className="w-full">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b border-gray-300">CLIENT FOCUSED</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border-b border-gray-300">pax/quantity</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 border-b border-gray-300">amount (PHP)</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700 border-b border-gray-300">total</th>
                </tr>
              </thead>
              <tbody>
                {budgetItems.map((item: any, index: number) => {
                  const quantity = Number(item.quantity || item.pax || 0);
                  const price = Number(item.price || item.amount || 0);
                  const itemTotal = quantity * price;
                  
                  return (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-3 py-2 text-sm text-gray-900 border-b border-gray-200">{item.name || "-"}</td>
                      <td className="px-3 py-2 text-sm text-center text-gray-700 border-b border-gray-200">{quantity}</td>
                      <td className="px-3 py-2 text-sm text-right text-gray-700 border-b border-gray-200">₱{price.toFixed(2)}</td>
                      <td className="px-3 py-2 text-sm text-right font-medium text-gray-900 border-b border-gray-200">₱{itemTotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
                <tr className="bg-blue-50">
                  <td colSpan={3} className="px-3 py-2 text-sm font-semibold text-gray-900 text-right border-t-2 border-gray-400">Total GAD Budget:</td>
                  <td className="px-3 py-2 text-sm font-bold text-blue-700 text-right border-t-2 border-gray-400">{formatBudget(row.original.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );
    }
  },
];

const wasteEventColumns = [
  { accessorKey: "we_name", header: "Event Name" },
  { accessorKey: "we_location", header: "Location" },
  { accessorKey: "we_date", header: "Date" },
  { accessorKey: "we_time", header: "Time" },
  { accessorKey: "we_description", header: "Event Description" },
  { accessorKey: "we_organizer", header: "Organizer" },
  { accessorKey: "we_invitees", header: "Invitees" },
];

const councilEventColumns = [
  { accessorKey: "ce_title", header: "Event Title" },
  { accessorKey: "ce_place", header: "Location" },
  { 
    accessorKey: "ce_date", 
    header: "Date",
    cell: ({ row }: { row: { original: any } }) => {
      return formatDate(row.original.ce_date);
    }
  },
  { accessorKey: "ce_time", header: "Time" },
];

const getCalendarSources = (
  transformedAnnualDevPlans: any[],
  wasteEventData: any[],
  calendarEvents: any[],
  _hotspotData: any[],
  _wasteCollectionData: any[]
) => {
  // Ensure all data arrays are properly initialized
  const safeTransformedAnnualDevPlans = Array.isArray(transformedAnnualDevPlans) ? transformedAnnualDevPlans : [];
  const safeWasteEventData = Array.isArray(wasteEventData) ? wasteEventData : [];
  const safeCalendarEvents = Array.isArray(calendarEvents) ? calendarEvents : [];

  return [
  {
    name: "Annual Development Plans",
    data: safeTransformedAnnualDevPlans,
    columns: annualDevPlanColumns,
    titleAccessor: "title",
    dateAccessor: "date",
    timeAccessor: "time",
    defaultColor: "#8b5cf6", // purple for annual development plans
  },
  {
    name: "Waste Events",
    data: safeWasteEventData,
    columns: wasteEventColumns,
    titleAccessor: "we_name",
    dateAccessor: "we_date",
    timeAccessor: "we_time",
    defaultColor: "#f59e0b", // amber for waste events
  },
  {
    name: "Council Events",
    data: safeCalendarEvents,
    columns: councilEventColumns,
    titleAccessor: "ce_title",
    dateAccessor: "ce_date",
    timeAccessor: "ce_time",
    defaultColor: "#191970", // midnight blue for council events
  },
  
];
};

const legendItems = [
  { label: "GAD Annual Development Plans", color: "#8b5cf6" },
  { label: "Waste Events", color: "#f59e0b" },
  { label: "Council Events", color: "#191970" },
  { label: "Hotspot Assignments", color: "#3b82f6" },
  { label: "Waste Collection", color: "#10b981" },
];

// Helper function to safely extract array from API response
const safeExtractArray = (data: any): any[] => {
  return Array.isArray(data) ? data : data?.results || [];
};

// Custom hook to get GAD Annual Development Plans calendar source
export const useGADCalendarSource = (enabled: boolean = true) => {
  // First, fetch all annual dev plans to determine the start year (including archived)
  const { data: allAnnualDevPlansData } = useQuery({
    queryKey: ["annualDevPlans", "all"],
    queryFn: async () => getAnnualDevPlans(undefined, 1, 10000, true), // Fetch all plans including archived
    enabled: enabled,
    staleTime: 0, // Always refetch to get latest data
  });
  
  const { data: projectProposals = [] } = useGetProjectProposals(1, 1000, undefined, false, undefined, { enabled });
  const { data: resolutions = [] } = useResolution(1, 1000);
  
  // Determine the start year based on plans with proposals and resolutions
  const startYear = useMemo(() => {
    if (!enabled) return new Date().getFullYear();
    
    const allPlans = safeExtractArray(allAnnualDevPlansData);
    const proposalsList = safeExtractArray(projectProposals);
    const resolutionsList = safeExtractArray(resolutions);
    const devIdsWithProposals = createDevIdsWithProposals(proposalsList, resolutionsList);
    
    // Filter plans that are either mandated or have proposals with resolutions
    const qualifyingPlans = allPlans.filter((plan: any) => {
      const isMandated = Boolean(plan?.dev_mandated);
      const hasProposal = devIdsWithProposals.has(plan.dev_id);
      return isMandated || hasProposal;
    });
    
    // Extract years from qualifying plans
    const years = qualifyingPlans
      .map((plan: any) => {
        if (plan?.dev_date) {
          const year = new Date(plan.dev_date).getFullYear();
          return isNaN(year) ? null : year;
        }
        return null;
      })
      .filter((year): year is number => year !== null);
    
    // Return the minimum year, or current year if no qualifying plans found
    return years.length > 0 ? Math.min(...years) : new Date().getFullYear();
  }, [allAnnualDevPlansData, projectProposals, resolutions, enabled]);
  
  // Dynamically generate years from start year to current year
  const yearsToFetch = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
  }, [startYear]);
  
  // Fetch data for all years using useQueries for cleaner parallel fetching (including archived)
  const yearQueries = useQueries({
    queries: yearsToFetch.map((year) => ({
      queryKey: ["annualDevPlans", year],
      queryFn: async () => getAnnualDevPlansByYear(year, undefined, undefined, undefined, true), // Include archived plans
      enabled: enabled && Boolean(year),
      staleTime: 0, // Always refetch to get latest data
    })),
  });
  
  // Combine all year plans into a single array using helper function
  // COMMENTED OUT: Archiving filtering disabled
  const annualDevPlans = useMemo(() => {
    if (!enabled) return [];
    const allPlans = yearQueries.map(query => safeExtractArray(query.data)).flat();
    // COMMENTED OUT: Archiving disabled
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // 
    // return allPlans.filter((plan: any) => {
    //   // STRICT archived check
    //   const archivedValue = plan?.dev_archived;
    //   if (archivedValue === true || archivedValue === "true" || archivedValue === "True" || archivedValue === "TRUE" || archivedValue === 1) {
    //     return false;
    //   }
    //   
    //   // STRICT past date check
    //   if (plan?.dev_date) {
    //     const planDate = new Date(plan.dev_date);
    //     planDate.setHours(0, 0, 0, 0);
    //     if (planDate < today) {
    //       return false;
    //     }
    //   }
    //   
    //   return true;
    // });
    return allPlans;
  }, [yearQueries, enabled]);
  
  const devIdsWithProposals = useMemo(() => {
    if (!enabled) return new Set<number>();
    const proposalsList = safeExtractArray(projectProposals);
    const resolutionsList = safeExtractArray(resolutions);
    return createDevIdsWithProposals(proposalsList, resolutionsList);
  }, [projectProposals, resolutions, enabled]);
  
  const transformedAnnualDevPlans = useMemo(() => {
    if (!enabled) return [];
    return transformAnnualDevPlans(annualDevPlans, devIdsWithProposals);
  }, [annualDevPlans, devIdsWithProposals, enabled]);
  
  return useMemo(() => {
    if (!enabled || transformedAnnualDevPlans.length === 0) return null;
    
    return {
      name: "Annual Development Plans",
      data: transformedAnnualDevPlans,
      columns: annualDevPlanColumns,
      titleAccessor: "title",
      dateAccessor: "date",
      timeAccessor: "time",
      defaultColor: "#8b5cf6", // purple for annual development plans
    };
  }, [transformedAnnualDevPlans, enabled]);
};

// Export legend item for GAD
export const gadLegendItem = { label: "GAD Activity", color: "#8b5cf6" };

function GADActivityPage() {
  const { showLoading, hideLoading } = useLoading();
  
  // First, fetch all annual dev plans to determine the start year (including archived)
  const { data: allAnnualDevPlansData } = useQuery({
    queryKey: ["annualDevPlans", "all"],
    queryFn: async () => getAnnualDevPlans(undefined, 1, 10000, true), // Fetch all plans including archived
    staleTime: 0, // Always refetch to get latest data
  });
  
  // Fetch project proposals and resolutions to filter annual dev plans
  const { data: projectProposals = [], isLoading: isProjectProposalsLoading } = useGetProjectProposals();
  const { data: resolutions = [], isLoading: isResolutionsLoading } = useResolution();
  
  // Determine the start year based on plans with proposals and resolutions
  const startYear = useMemo(() => {
    const allPlans = safeExtractArray(allAnnualDevPlansData);
    const proposalsList = safeExtractArray(projectProposals);
    const resolutionsList = safeExtractArray(resolutions);
    const devIdsWithProposals = createDevIdsWithProposals(proposalsList, resolutionsList);
    
    // Filter plans that are either mandated or have proposals with resolutions
    const qualifyingPlans = allPlans.filter((plan: any) => {
      const isMandated = Boolean(plan?.dev_mandated);
      const hasProposal = devIdsWithProposals.has(plan.dev_id);
      return isMandated || hasProposal;
    });
    
    // Extract years from qualifying plans
    const years = qualifyingPlans
      .map((plan: any) => {
        if (plan?.dev_date) {
          const year = new Date(plan.dev_date).getFullYear();
          return isNaN(year) ? null : year;
        }
        return null;
      })
      .filter((year): year is number => year !== null);
    
    return years.length > 0 ? Math.min(...years) : new Date().getFullYear();
  }, [allAnnualDevPlansData, projectProposals, resolutions]);
  
  const yearsToFetch = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
  }, [startYear]);
  
  const yearQueries = useQueries({
    queries: yearsToFetch.map((year) => ({
      queryKey: ["annualDevPlans", year],
      queryFn: async () => getAnnualDevPlansByYear(year, undefined, undefined, undefined, true), // Include archived plans
      enabled: Boolean(year),
      staleTime: 0, // Always refetch to get latest data
    })),
  });
  
  // Combine plans from all years using helper function
  // COMMENTED OUT: Archiving filtering disabled
  const annualDevPlans = useMemo(() => {
    const allPlans = yearQueries.map(query => safeExtractArray(query.data)).flat();
    // COMMENTED OUT: Archiving disabled
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // 
    // return allPlans.filter((plan: any) => {
    //   // STRICT archived check
    //   const archivedValue = plan?.dev_archived;
    //   if (archivedValue === true || archivedValue === "true" || archivedValue === "True" || archivedValue === "TRUE" || archivedValue === 1) {
    //     return false;
    //   }
    //   
    //   // STRICT past date check
    //   if (plan?.dev_date) {
    //     const planDate = new Date(plan.dev_date);
    //     planDate.setHours(0, 0, 0, 0);
    //     if (planDate < today) {
    //       return false;
    //     }
    //   }
    //   
    //   return true;
    // });
    return allPlans;
  }, [yearQueries]);
  
  const isAnnualDevPlansLoading = yearQueries.some(query => query.isLoading);
 
  const { data: wasteEventData = [], isLoading: isWasteEventLoading } = useQuery({
    queryKey: ['wasteEvents'],
    queryFn: () => getWasteEvents(false)
  });
  const { data: councilEvents = [] } = useGetCouncilEvents();
  const calendarEvents = filterCalendarEvents(safeExtractArray(councilEvents));
  
  // Fetch hotspot and waste collection data
  const { data: hotspotData = [], isLoading: isHotspotLoading } = useGetHotspotRecords();
  const { data: wasteCollectionData = [], isLoading: isWasteColLoading } = useGetWasteCollectionSchedFull();

  // Handle loading state
  useEffect(() => {
    if (isAnnualDevPlansLoading || isProjectProposalsLoading || isResolutionsLoading || isWasteEventLoading || isHotspotLoading || isWasteColLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isAnnualDevPlansLoading, isProjectProposalsLoading, isResolutionsLoading, isWasteEventLoading, isHotspotLoading, isWasteColLoading, showLoading, hideLoading]);

  // Create a set of dev_ids that have project proposals
  const devIdsWithProposals = useMemo(() => {
    const proposalsList = safeExtractArray(projectProposals);
    const resolutionsList = safeExtractArray(resolutions);
    return createDevIdsWithProposals(proposalsList, resolutionsList);
  }, [projectProposals, resolutions]);

  // Transform annual development plans for calendar display - only include those with project proposals
  const transformedAnnualDevPlans = useMemo(() => {
    return transformAnnualDevPlans(annualDevPlans, devIdsWithProposals);
  }, [annualDevPlans, devIdsWithProposals]);

  // Prepare calendar sources for GAD activities
  const calendarSources = getCalendarSources(
    transformedAnnualDevPlans,
    filterWasteEvents(wasteEventData),
    calendarEvents,
    hotspotData,
    safeExtractArray(wasteCollectionData)
  );

  if (isAnnualDevPlansLoading || isProjectProposalsLoading || isResolutionsLoading || isWasteEventLoading || isHotspotLoading || isWasteColLoading) {
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
              legendItems={legendItems}
        />
      </div>
    </div>
  );
}

export default GADActivityPage;
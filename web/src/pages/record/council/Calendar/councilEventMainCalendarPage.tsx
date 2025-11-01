import { useState, useEffect, useMemo } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import EventCalendar from "@/components/ui/calendar/EventCalendar.tsx";
import { Button } from "@/components/ui/button/button.tsx";
import SchedEventForm from "./councilEventCreate.tsx";
import { Plus, ArchiveRestore, Trash, Eye, Archive } from "lucide-react";
import { useGetCouncilEvents } from "./queries/councilEventfetchqueries.tsx";
import { format } from "date-fns";
import EditEventForm from "./councilEventEdit.tsx";
import { useDeleteCouncilEvent, useRestoreCouncilEvent } from "./queries/councilEventdelqueries.tsx";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { councilEventColumns } from "./council-event-cols.tsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { useLoading } from "@/context/LoadingContext";
import { CouncilEvent } from "./councilEventTypes";
import { useAuth } from "@/context/AuthContext";
import { useGADCalendarSource, gadLegendItem } from "../../gad/activity/gadActivityCalendar";
import { useWasteCalendarSource, wasteLegendItem } from "../../waste-scheduling/waste-event/waste-event-sched";
import WasteEventSched from "../../waste-scheduling/waste-event/waste-event-sched";
import { useGetWasteEvents, WasteEvent } from "../../waste-scheduling/waste-event/queries/wasteEventQueries";
import { useDeleteWasteEvent, useRestoreWasteEvent } from "../../waste-scheduling/waste-event/queries/wasteEventDelQueries";
import WasteEventView from "../../waste-scheduling/waste-event/waste-event-view";
import { useGetArchivedAnnualDevPlans, useRestoreAnnualDevPlans, useDeleteAnnualDevPlans } from "../../gad/annual_development_plan/queries/annualDevPlanFetchQueries";

function CalendarPage() {
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"calendar" | "archive">("calendar");
  const [viewEvent, setViewEvent] = useState<CouncilEvent | null>(null);
  const [viewWasteEvent, setViewWasteEvent] = useState<WasteEvent | null>(null);
  const [_actionInProgress, setActionInProgress] = useState(false);
  const isSecretary = user?.staff?.pos?.toLowerCase() === "secretary";
  const isWaste = ["waste", "admin"].includes(user?.staff?.pos?.toLowerCase() || "");
  


  // Fetch NON-archived events for calendar tab
  const { data: activeEventsData, isLoading: isActiveEventsLoading } = useGetCouncilEvents(
    1, 
    1000, 
    undefined, 
    "all", 
    false  
  );
  
  // Fetch ARCHIVED events for archive tab
  const { data: archivedEventsData, isLoading: isArchivedEventsLoading } = useGetCouncilEvents(
    1,
    1000,
    undefined,
    "all",
    true,  
  );

  // Fetch archived waste events for archive tab
  const { data: archivedWasteEventsData = [], isLoading: isArchivedWasteEventsLoading } = useGetWasteEvents(true);

  // Fetch archived GAD activities for archive tab
  const { data: archivedGADData, isLoading: isArchivedGADLoading } = useGetArchivedAnnualDevPlans(1, 1000);
  const archivedGADActivities = activeTab === "archive" 
    ? (archivedGADData?.results || [])
    : [];

  const councilEvents = activeTab === "archive" 
    ? archivedEventsData?.results || [] 
    : activeEventsData?.results || [];
  
  const archivedWasteEvents = activeTab === "archive" 
    ? (Array.isArray(archivedWasteEventsData) ? archivedWasteEventsData : [])
    : [];

  const calendarEvents = councilEvents.filter((event: CouncilEvent) => !event.ce_is_archive);
  const { showLoading, hideLoading } = useLoading();
  // Always fetch all calendar sources so everyone can see the data
  const gadCalendarSource = useGADCalendarSource(true);
  const wasteCalendarSource = useWasteCalendarSource(true);
  
 
  const calendarSources = useMemo(() => {
    const sources: any[] = [
      {
        name: "Council Events",
        data: calendarEvents,
        columns: councilEventColumns,
        titleAccessor: "ce_title",
        dateAccessor: "ce_date",
        timeAccessor: "ce_time",
        defaultColor: "#191970", // midnight blue
        viewEditComponent: EditEventForm,
      }
    ];
    
    if (gadCalendarSource) {
      sources.unshift(gadCalendarSource);
    }
    
    if (wasteCalendarSource) {
      sources.push(wasteCalendarSource);
    }
    
    return sources;
  }, [calendarEvents, gadCalendarSource, wasteCalendarSource]);
  
  const legendItems = useMemo(() => {
    const items: any[] = [];
      items.push(gadLegendItem);
    items.push({ label: "Council Events", color: "#191970" });
    items.push(wasteLegendItem);
    return items;
  }, []);

  const filteredEvents = councilEvents.filter((event: CouncilEvent) => {
    if (activeTab === "archive") {
      return true;
    } else {
      const eventDateTime = new Date(`${event.ce_date}T${event.ce_time}`);
      const now = new Date();
      const fiveDaysFromNow = new Date(now);
      fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
      return eventDateTime >= now && eventDateTime <= fiveDaysFromNow;
    }
  });

  const { mutate: deleteCouncilEvent } = useDeleteCouncilEvent();
  const { mutate: restoreCouncilEvent } = useRestoreCouncilEvent();
  const { mutate: deleteWasteEvent } = useDeleteWasteEvent();
  const { mutate: restoreWasteEvent } = useRestoreWasteEvent();
  const { mutate: restoreGADActivities } = useRestoreAnnualDevPlans();
  const { mutate: deleteGADActivities } = useDeleteAnnualDevPlans();
  
  const handleRestore = (ce_id: number) => {
    setActionInProgress(true);
    restoreCouncilEvent(ce_id, {
      onSuccess: () => setActionInProgress(false),
      onError: () => setActionInProgress(false),
    });
  };

  const handlePermanentDelete = (ce_id: number) => {
    setActionInProgress(true);
    deleteCouncilEvent({ ce_id, permanent: true }, {
      onSuccess: () => setActionInProgress(false),
      onError: () => setActionInProgress(false),
    });
  };

  const handleRestoreWasteEvent = (we_num: number) => {
    setActionInProgress(true);
    restoreWasteEvent(we_num, {
      onSuccess: () => setActionInProgress(false),
      onError: () => setActionInProgress(false),
    });
  };

  const handlePermanentDeleteWasteEvent = (we_num: number) => {
    setActionInProgress(true);
    deleteWasteEvent({ we_num, permanent: true }, {
      onSuccess: () => setActionInProgress(false),
      onError: () => setActionInProgress(false),
    });
  };

  const handleRestoreGADActivity = (dev_id: number) => {
    setActionInProgress(true);
    restoreGADActivities([dev_id], {
      onSuccess: () => setActionInProgress(false),
      onError: () => setActionInProgress(false),
    });
  };

  const handlePermanentDeleteGADActivity = (dev_id: number) => {
    setActionInProgress(true);
    deleteGADActivities([dev_id], {
      onSuccess: () => setActionInProgress(false),
      onError: () => setActionInProgress(false),
    });
  };

  const isLoading = activeTab === "calendar" 
    ? isActiveEventsLoading 
    : (isArchivedEventsLoading || isArchivedWasteEventsLoading || isArchivedGADLoading);
  
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4">
      {/* Header controls for creating events */}
      {(isSecretary || isWaste) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "calendar" | "archive")}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="archive">
                <div className="flex items-center gap-2">
                  <Archive size={16} /> Archive
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {activeTab === "calendar" && (
            <div className="flex items-center gap-2">
              {isSecretary && (
            <DialogLayout
              isOpen={isAddDialogOpen}
              onOpenChange={setIsAddDialogOpen}
              trigger={
                <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus size={16} className="mr-2" /> Add Council Event
                </Button>
              }
              className="max-w-[90%] sm:max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
              title="Add Event"
              description="Create a new council event"
              mainContent={
                <div className="w-full h-full">
                  <SchedEventForm onSuccess={() => setIsAddDialogOpen(false)} />
                </div>
              }
            />
              )}
              {isWaste && <WasteEventSched />}
            </div>
          )}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "calendar" | "archive")}>
          <TabsContent value="calendar">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
                <Spinner size="lg" />
                Loading calendar...
              </div>
            ) : (
              <EventCalendar
                sources={calendarSources}
                legendItems={legendItems}
                viewEditComponentSources={["Council Events"]}
              />
            )}
          </TabsContent>
          <TabsContent value="archive">
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
                <Spinner size="lg" />
                Loading archived events...
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-custom">
                {/* Council Events */}
                {filteredEvents.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Council Events</h3>
                    {filteredEvents.map((event: CouncilEvent) => (
                    <div
                      key={event.ce_id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors mb-2"
                    >
                      <div className="flex items-center justify-end gap-2">
                        <TooltipLayout
                          trigger={
                            <DialogLayout
                              isOpen={viewEvent?.ce_id === event.ce_id}
                              onOpenChange={(open) => !open && setViewEvent(null)}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewEvent(event);
                                  }}
                                >
                                  <Eye className="h-4 w-4 text-blue-500" />
                                </Button>
                              }
                              className="max-w-[90%] sm:max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                              title="View Event"
                              description="View event details"
                              mainContent={
                                <div className="w-full h-full">
                                  {viewEvent && (
                                    <EditEventForm
                                      initialValues={viewEvent}
                                      onClose={() => setViewEvent(null)}
                                    />
                                  )}
                                </div>
                              }
                            />
                          }
                          content="View"
                        />
                        <TooltipLayout
                          trigger={
                            <ConfirmationModal
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ArchiveRestore className="h-4 w-4 text-green-500" />
                                </Button>
                              }
                              title="Confirm Restore"
                              description={`Are you sure you want to restore the event "${event.ce_title}"?`}
                              actionLabel="Restore"
                              onClick={() => handleRestore(event.ce_id)}
                            />
                          }
                          content="Restore"
                        />
                        <TooltipLayout
                          trigger={
                            <ConfirmationModal
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              }
                              title="Confirm Permanent Delete"
                              description={`This will permanently delete the event "${event.ce_title}".`}
                              actionLabel="Delete"
                              onClick={() => handlePermanentDelete(event.ce_id)}
                            />
                          }
                          content="Delete"
                        />
                      </div>
                      <div className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                        {event.ce_title}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(`${event.ce_date}T${event.ce_time}`), "MMM d, yyyy 'at' h:mm a")} - {event.ce_place}
                      </div>
                    </div>
                    ))}
                  </div>
                )}
                
                {/* Waste Events */}
                {archivedWasteEvents.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Waste Events</h3>
                    {archivedWasteEvents.map((event: WasteEvent) => (
                      <div
                        key={event.we_num}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors mb-2"
                      >
                        <div className="flex items-center justify-end gap-2">
                          <TooltipLayout
                            trigger={
                              <DialogLayout
                                isOpen={viewWasteEvent?.we_num === event.we_num}
                                onOpenChange={(open) => !open && setViewWasteEvent(null)}
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewWasteEvent(event);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 text-blue-500" />
                                  </Button>
                                }
                                className="max-w-[90%] sm:max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                                title="View Event"
                                description="View event details"
                                mainContent={
                                  <div className="w-full h-full">
                                    {viewWasteEvent && (
                                      <WasteEventView
                                        event={viewWasteEvent}
                                        onClose={() => setViewWasteEvent(null)}
                                      />
                                    )}
                                  </div>
                                }
                              />
                            }
                            content="View"
                          />
                          <TooltipLayout
                            trigger={
                              <ConfirmationModal
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ArchiveRestore className="h-4 w-4 text-green-500" />
                                  </Button>
                                }
                                title="Confirm Restore"
                                description={`Are you sure you want to restore the waste event "${event.we_name}"?`}
                                actionLabel="Restore"
                                onClick={() => handleRestoreWasteEvent(event.we_num)}
                              />
                            }
                            content="Restore"
                          />
                          <TooltipLayout
                            trigger={
                              <ConfirmationModal
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash className="h-4 w-4 text-red-500" />
                                  </Button>
                                }
                                title="Confirm Permanent Delete"
                                description={`This will permanently delete the waste event "${event.we_name}".`}
                                actionLabel="Delete"
                                onClick={() => handlePermanentDeleteWasteEvent(event.we_num)}
                              />
                            }
                            content="Delete"
                          />
                        </div>
                        <div className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                          {event.we_name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {event.we_date && event.we_time 
                            ? `${format(new Date(`${event.we_date}T${event.we_time}`), "MMM d, yyyy 'at' h:mm a")} - ${event.we_location}`
                            : `${event.we_location || 'No location'}`
                          }
                        </div>
                        {event.we_description && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {event.we_description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* GAD Activities */}
                {archivedGADActivities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">GAD Activities</h3>
                    {archivedGADActivities.map((activity: any) => (
                      <div
                        key={activity.dev_id}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors mb-2"
                      >
                        <div className="flex items-center justify-end gap-2">
                          <TooltipLayout
                            trigger={
                              <DialogLayout
                                isOpen={false}
                                onOpenChange={() => {}}
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // View GAD activity details - you can navigate to edit page or show in dialog
                                      window.open(`/record/gad/annual-development-plan/edit/${activity.dev_id}`, '_blank');
                                    }}
                                  >
                                    <Eye className="h-4 w-4 text-blue-500" />
                                  </Button>
                                }
                                className="max-w-[90%] sm:max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                                title="View GAD Activity"
                                description="View activity details"
                                mainContent={<div>View GAD Activity</div>}
                              />
                            }
                            content="View"
                          />
                          <TooltipLayout
                            trigger={
                              <ConfirmationModal
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <ArchiveRestore className="h-4 w-4 text-green-500" />
                                  </Button>
                                }
                                title="Confirm Restore"
                                description={`Are you sure you want to restore the GAD activity "${activity.dev_client || activity.dev_project}"?`}
                                actionLabel="Restore"
                                onClick={() => handleRestoreGADActivity(activity.dev_id)}
                              />
                            }
                            content="Restore"
                          />
                          <TooltipLayout
                            trigger={
                              <ConfirmationModal
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash className="h-4 w-4 text-red-500" />
                                  </Button>
                                }
                                title="Confirm Permanent Delete"
                                description={`This will permanently delete the GAD activity "${activity.dev_client || activity.dev_project}".`}
                                actionLabel="Delete"
                                onClick={() => handlePermanentDeleteGADActivity(activity.dev_id)}
                              />
                            }
                            content="Delete"
                          />
                        </div>
                        <div className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                          {activity.dev_client || "GAD Activity"}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.dev_date 
                            ? `${format(new Date(activity.dev_date), "MMM d, yyyy")} - ${activity.dev_project || 'N/A'}`
                            : `${activity.dev_project || 'N/A'}`
                          }
                        </div>
                        {activity.dev_issue && (
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {activity.dev_issue}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {filteredEvents.length === 0 && archivedWasteEvents.length === 0 && archivedGADActivities.length === 0 && (
                  <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No archived events found.
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default CalendarPage;
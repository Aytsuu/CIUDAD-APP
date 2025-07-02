import { useState } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import EventCalendar from "@/components/ui/calendar/EventCalendar.tsx";
import { Button } from "@/components/ui/button/button.tsx";
import SchedEventForm from "./SchedEventForm.tsx";
import { Plus, Archive, ArchiveRestore, Trash, Eye } from "lucide-react";
import { useGetCouncilEvents} from "./queries/fetchqueries";
import { format } from "date-fns";
import EditEventForm from "./EditEvent.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteCouncilEvent, useRestoreCouncilEvent } from "./queries/delqueries";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { useGetWasteCollectionSchedFull } from "../../waste-scheduling/waste-colllection/queries/wasteColFetchQueries.tsx";
import { useGetHotspotRecords } from "../../waste-scheduling/waste-hotspot/queries/hotspotFetchQueries.tsx";
import { hotspotColumns, wasteColColumns, councilEventColumns } from "./council-event-cols.tsx";

function CalendarPage() {
  const { data: councilEvents = [], isLoading } = useGetCouncilEvents();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [eventViewMode, setEventViewMode] = useState<"upcoming" | "archive">("upcoming");
  const [viewEvent, setViewEvent] = useState<any | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const calendarEvents = councilEvents.filter((event) => !event.ce_is_archive);
  const { data: hotspotData = [] } = useGetHotspotRecords()
  const { data: wasteCollectionData = [], isLoading: isWasteColLoading } = useGetWasteCollectionSchedFull();

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
      titleAccessor: "collectors_names",
      dateAccessor: "wc_date",
      timeAccessor: "wc_time",
      defaultColor: "#10b981", // emerald
    },
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

const filteredEvents = councilEvents.filter((event) => {
  const eventDateTime = new Date(`${event.ce_date}T${event.ce_time}`);
  const now = new Date();
  
  // Calculate 5 days from now (including time component)
  const fiveDaysFromNow = new Date(now);
  fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
  
  if (eventViewMode === "upcoming") {
    // Show events from now up to 5 days in the future
    return (
      eventDateTime >= now && 
      eventDateTime <= fiveDaysFromNow && 
      !event.ce_is_archive
    );
  } else {
    // Show archived events
    return event.ce_is_archive;
  }
});

  const handleDialogClose = () => {
    setViewEvent(null);
  };

  const { mutate: deleteCouncilEvent } = useDeleteCouncilEvent();
  const { mutate: restoreCouncilEvent } = useRestoreCouncilEvent();

  const handleArchive = (ce_id: number) => {
    setActionInProgress(true);
    deleteCouncilEvent({ ce_id, permanent: false }, {
      onSuccess: () => setActionInProgress(false),
      onError: () => setActionInProgress(false),
    });
  };

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

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <div className="p-2 sm:p-4 md:p-6 lg:p-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-between">
            <Skeleton className="h-6 sm:h-8 w-24 sm:w-32 opacity-30" />
            <Skeleton className="h-8 sm:h-10 w-24 sm:w-32 mt-2 sm:mt-0 opacity-30" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 sm:p-4">
              <Skeleton className="h-[300px] sm:h-[400px] md:h-[500px] w-full opacity-30" />
            </div>
            <div className="sm:col-span-1 lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 sm:p-4">
              <Skeleton className="h-4 sm:h-6 w-32 sm:w-40 mb-2 sm:mb-4 opacity-30" />
              <div className="space-y-2 sm:space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-2 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                    <Skeleton className="h-4 sm:h-5 w-1/2 sm:w-3/4 mb-1 sm:mb-2 opacity-30" />
                    <Skeleton className="h-3 sm:h-4 w-1/3 sm:w-1/2 opacity-30" />
                    <Skeleton className="h-3 sm:h-4 w-2/3 sm:w-2/3 mt-1 sm:mt-1 opacity-30" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <div className="p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 sm:p-4 mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100">
            Council Events
          </h1>
          <div className="flex items-center mt-2 sm:mt-0">
            {eventViewMode === "upcoming" && (
              <DialogLayout
                isOpen={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                trigger={
                  <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus size={16} /> Add Event
                  </Button>
                }
                className="max-w-[90%] sm:max-w-[55%] h-[300px] sm:h-[540px] flex flex-col overflow-auto scrollbar-custom"
                title="Add Event"
                description="Create a new council event"
                mainContent={
                  <div className="w-full h-full">
                    <SchedEventForm onSuccess={() => setIsAddDialogOpen(false)} />
                  </div>
                }
              />
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 sm:p-4">
            <EventCalendar
              sources={calendarSources}
              legendItems={[
                { label: "Hotspot Assignments", color: "#3b82f6" },
                { label: "Waste Collection", color: "#10b981" },
                { label: "Council Events", color: "#191970" },
              ]}
              viewEditComponentSources={["Council Events"]}
              />
          </div>
          <div className="sm:col-span-1 lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 sm:p-4">
            <div className="flex flex-col sm:flex-row items-center mb-4">
              <div className="flex flex-col sm:flex-row justify-center border rounded-lg p-1 sm:p-2 bg-gray-100 dark:bg-gray-700 w-full">
                <button
                  className={`w-full sm:w-auto px-2 py-1 sm:py-2 rounded-md text-sm font-medium transition-colors ${
                    eventViewMode === "upcoming"
                      ? "bg-white dark:bg-gray-600 shadow text-primary dark:text-gray-100"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setEventViewMode("upcoming")}
                >
                  Upcoming
                </button>
                <button
                  className={`w-full sm:w-auto px-2 py-1 sm:py-2 rounded-md text-sm font-medium transition-colors ${
                    eventViewMode === "archive"
                      ? "bg-white dark:bg-gray-600 shadow text-primary dark:text-gray-100"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => setEventViewMode("archive")}
                >
                  Archived
                </button>
              </div>
            </div>
            {isLoading ? (
              <div className="text-gray-500 dark:text-gray-400">Loading events...</div>
            ) : filteredEvents.length > 0 ? (
              <div className="space-y-2 sm:space-y-4 max-h-[400px] overflow-y-auto scrollbar-custom">
                {filteredEvents.map((event) => (
                  <div
                    key={event.ce_id}
                    className="p-2 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-end">
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
                            className="max-w-[90%] sm:max-w-[55%] h-[300px] sm:h-[540px] flex flex-col overflow-auto scrollbar-custom"
                            title="Edit Event"
                            description="Edit or view event details"
                            mainContent={
                              <div className="w-full h-full">
                                {viewEvent ? (
                                  <EditEventForm
                                    initialValues={viewEvent}
                                    onClose={() => setViewEvent(null)}
                                  />
                                ) : null}
                              </div>
                            }
                          />
                        }
                        content="View"
                      />
                      {eventViewMode === "upcoming" ? (
                        <TooltipLayout
                          trigger={
                            <ConfirmationModal
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              }
                              title="Confirm Archive"
                              description={`Are you sure you want to archive the event "${event.ce_title}"? It will be moved to the archived events list.`}
                              actionLabel="Archive"
                              onClick={() => handleArchive(event.ce_id)}
                            />
                          }
                          content="Archive"
                        />
                      ) : (
                        <>
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
                                description={`Are you sure you want to restore the event "${event.ce_title}"? It will be moved back to upcoming events.`}
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
                                description={`This will permanently delete the event "${event.ce_title}". This action cannot be undone.`}
                                actionLabel="Delete"
                                onClick={() => handlePermanentDelete(event.ce_id)}
                              />
                            }
                            content="Delete"
                          />
                        </>
                      )}
                    </div>
                    <div className="font-medium text-gray-800 dark:text-gray-200 text-sm sm:text-base mb-1">
                      {event.ce_title}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {`${format(new Date(event.ce_date), "MMM d, yyyy")} at ${event.ce_time} - ${event.ce_place}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                {eventViewMode === "upcoming" ? "No upcoming events." : "No archived events."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;
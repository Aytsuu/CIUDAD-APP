import { useState } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import EventCalendar from "@/components/ui/calendar/EventCalendar.tsx";
import { Button } from "@/components/ui/button/button.tsx";
import SchedEventForm from "./councilEventCreate.tsx";
import { Plus, ArchiveRestore, Trash, Eye } from "lucide-react";
import { useGetCouncilEvents } from "./queries/councilEventfetchqueries.tsx";
import { format } from "date-fns";
import EditEventForm from "./councilEventEdit.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteCouncilEvent, useRestoreCouncilEvent } from "./queries/councilEventdelqueries.tsx";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { useGetWasteCollectionSchedFull } from "../../waste-scheduling/waste-collection/queries/wasteColFetchQueries.tsx";
import { useGetHotspotRecords } from "../../waste-scheduling/waste-hotspot/queries/hotspotFetchQueries.tsx";
import { hotspotColumns, wasteColColumns, councilEventColumns } from "./council-event-cols.tsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function CalendarPage() {
  const { data: councilEvents = [], isLoading } = useGetCouncilEvents();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"calendar" | "archive">("calendar");
  const [viewEvent, setViewEvent] = useState<any | null>(null);
  const [_actionInProgress, setActionInProgress] = useState(false);
  const calendarEvents = councilEvents.filter((event) => !event.ce_is_archive);
  const { data: hotspotData = [] } = useGetHotspotRecords();
  const { data: wasteCollectionData = [], isLoading: _isWasteColLoading } = useGetWasteCollectionSchedFull();

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
    if (activeTab === "archive") {
      return event.ce_is_archive;
    } else {
      const eventDateTime = new Date(`${event.ce_date}T${event.ce_time}`);
      const now = new Date();
      const fiveDaysFromNow = new Date(now);
      fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
      return eventDateTime >= now && eventDateTime <= fiveDaysFromNow && !event.ce_is_archive;
    }
  });

  const { mutate: deleteCouncilEvent } = useDeleteCouncilEvent();
  const { mutate: restoreCouncilEvent } = useRestoreCouncilEvent();
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
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "calendar" | "archive")}>
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="archive">Archive</TabsTrigger>
          </TabsList>
        </Tabs>
        {activeTab === "calendar" && (
          <DialogLayout
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            trigger={
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus size={16} className="mr-2" /> Add Event
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
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "calendar" | "archive")}>
          <TabsContent value="calendar">
            <EventCalendar
              sources={calendarSources}
              legendItems={[
                { label: "Hotspot Assignments", color: "#3b82f6" },
                { label: "Waste Collection", color: "#10b981" },
                { label: "Council Events", color: "#191970" },
              ]}
              viewEditComponentSources={["Council Events"]}
            />
          </TabsContent>

          <TabsContent value="archive">
            <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-custom">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <div
                    key={event.ce_id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
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
                ))
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No archived events found.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default CalendarPage;
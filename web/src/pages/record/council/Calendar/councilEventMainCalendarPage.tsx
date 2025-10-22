import { useState, useEffect } from "react";
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

function CalendarPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"calendar" | "archive">("calendar");
  const [viewEvent, setViewEvent] = useState<CouncilEvent | null>(null);
  const [_actionInProgress, setActionInProgress] = useState(false);

// Fetch NON-archived events for calendar tab
  const { data: activeEventsData, isLoading: isActiveEventsLoading } = useGetCouncilEvents(
    1, 
    1000, 
    undefined, 
    "all", 
    false  // is_archive=false
  );
  
  // Fetch ARCHIVED events for archive tab
  const { data: archivedEventsData, isLoading: isArchivedEventsLoading } = useGetCouncilEvents(
    1,
    1000,
    undefined,
    "all",
    true,  // is_archive=true
  );

  // Use the appropriate data based on active tab
  const councilEvents = activeTab === "archive" 
    ? archivedEventsData?.results || [] 
    : activeEventsData?.results || [];


  const calendarEvents = councilEvents.filter((event: CouncilEvent) => !event.ce_is_archive);
  const { showLoading, hideLoading } = useLoading();
  
  const calendarSources = [
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

  const filteredEvents = councilEvents.filter((event: CouncilEvent) => {
    if (activeTab === "archive") {
      return true; // All events in archivedEventsData are already archived
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

  const isLoading = (activeTab === "calendar" ? isActiveEventsLoading : isArchivedEventsLoading);
  
  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4">
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
            {isLoading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
                <Spinner size="lg" />
                Loading council calendar...
              </div>
            ) : (
              <EventCalendar
                sources={calendarSources}
                legendItems={[
                  // { label: "Council Events", color: "#191970" },
                ]}
                viewEditComponentSources={["Council Events"]}
              />
            )}
          </TabsContent>

          <TabsContent value="archive">
            {isArchivedEventsLoading ? (
              <div className="flex items-center justify-center py-16 gap-2 text-gray-500">
                <Spinner size="lg" />
                Loading council calendar...
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto scrollbar-custom">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event: CouncilEvent) => (
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default CalendarPage;
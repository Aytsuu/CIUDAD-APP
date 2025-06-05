import { useState } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import EventCalendar from "@/components/ui/calendar/EventCalendar.tsx";
import { Button } from "@/components/ui/button/button.tsx";
import AddEvent from "./SchedEventForm.tsx";
import { Plus } from "lucide-react";
import { useGetCouncilEvents } from "./queries/fetchqueries";
import { format } from "date-fns";

function CalendarPage() {
  const { data: councilEvents = [], isLoading } = useGetCouncilEvents();
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null); // Store the selected event for editing

  // Convert council events to the format expected by EventCalendar
  const events = councilEvents.map((event) => ({
    start: new Date(`${event.ce_date}T${event.ce_time}`),
    end: new Date(`${event.ce_date}T${event.ce_time}`), // Adjust end time if needed
    title: event.ce_title,
  }));

  // Filter upcoming events (after current date and time: June 05, 2025, 03:22 PM PST)
  const currentDateTime = new Date("2025-06-05T15:22:00"); // Current time in PST
  const upcomingEvents = councilEvents.filter((event) => {
    const eventDateTime = new Date(`${event.ce_date}T${event.ce_time}`);
    return eventDateTime >= currentDateTime && !event.ce_is_archive;
  });

  // Handle closing the dialog and resetting the selected event
  const handleDialogClose = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-800 dark:to-gray-900">
      <div className="p-4 sm:p-6 md:p-8">
        {/* Toolbar (Static Header) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Events
          </h1>
          <div className="flex items-center">
            <DialogLayout
              trigger={
                <Button>
                  <Plus size={20} /> Add Event
                </Button>
              }
              className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
              title=""
              description=""
              mainContent={
                <div className="w-full h-full">
                  <AddEvent />
                </div>
              }
            />
          </div>
        </div>

        {/* Calendar and Sidebar Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <EventCalendar />
          </div>
          {/* Upcoming Events Sidebar */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hidden lg:block">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Upcoming Events
            </h2>
            {isLoading ? (
              <div className="text-gray-500 dark:text-gray-400">Loading events...</div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.ce_id}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setSelectedEvent(event)} // Open dialog on click
                  >
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      {event.ce_title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(event.ce_date), "MMM d, yyyy")} at {event.ce_time}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {event.ce_place}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">
                No upcoming events.
              </div>
            )}
            {/* Dialog for editing/viewing the selected event */}
            {selectedEvent && (
              <DialogLayout
                isOpen={!!selectedEvent}
                onOpenChange={handleDialogClose} // Close dialog and reset selected event
                trigger={<div />}
                className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                title={selectedEvent.ce_title}
                description="Edit or view event details"
                mainContent={
                  <div className="w-full h-full">
                    <AddEvent
                      initialValues={selectedEvent} // Pass initial values to pre-fill the form
                      onClose={handleDialogClose} // Optional callback to close after submission
                    />
                  </div>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarPage;
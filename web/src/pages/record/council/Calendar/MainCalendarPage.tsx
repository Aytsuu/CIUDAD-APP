import { useState } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import EventCalendar from "@/components/ui/calendar/EventCalendar.tsx";
import { Button } from "@/components/ui/button/button.tsx";
import AddEvent from "./SchedEventForm.tsx";
import { Plus } from "lucide-react";

function CalendarPage() {
  const [events, setEvents] = useState<
    { start: Date; end: Date; title: string }[]
  >([]);

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
                <Button aria-label="Add new event">
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
            {/* Placeholder for event list or summary */}
            <div className="text-gray-500 dark:text-gray-400">
              No upcoming events.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CalendarPage;

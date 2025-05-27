// Dashboard.tsx
import { useState } from "react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import EventCalendar from "@/components/ui/calendar/EventCalendar.tsx";
import AddEvent from "./SchedEventForm.tsx";
import { Plus } from "lucide-react";

function CalendarPage() {
  const [events, setEvents] = useState<
    { start: Date; end: Date; title: string }[]
  >([]);

  return (
    <div className="w-full">
      <div className="p-10">
        <div>
          <div className="flex justify-end">
            <DialogLayout
              trigger={
                <div className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded cursor-pointer">
                  <Plus></Plus>Event{" "}
                </div>
              }
              className="max-w-[55%] h-[540px] flex flex-col overflow-auto"
              title="Schedule Event"
              description="Set an upcoming event."
              mainContent={<AddEvent />}
            />
          </div>

          {/* Calendar Section */}
          <div className="w-full bg-white">
            <EventCalendar />
          </div>
        </div>
      </div>
    </div>
  );
}
export default CalendarPage;

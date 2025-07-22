import { Card } from "@/components/ui/card/card";
import { Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { useNavigate } from "react-router";
import { useGetCouncilEvents, CouncilEvent } from "./ce-event-analytics-queries";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

// Utility function to capitalize the first letter
const capitalize = (str: string) =>
  str.charAt(0).toLocaleUpperCase() + str.slice(1).toLocaleLowerCase();

export const CouncilEventsSidebar = () => {
  const navigate = useNavigate();
  const { data: events, isLoading } = useGetCouncilEvents();
  const [selectedEvent, setSelectedEvent] = useState<CouncilEvent | null>(null);

  // Filter events for the next 5 days (upcoming, non-archived)
  const filteredEvents = events?.filter((event) => {
    const eventDateTime = new Date(`${event.ce_date}T${event.ce_time}`);
    const now = new Date();
    const fiveDaysFromNow = new Date(now);
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    return (
      eventDateTime >= now &&
      eventDateTime <= fiveDaysFromNow &&
      !event.ce_is_archive
    );
  }) ?? [];

  return (
    <Card className="w-80 bg-white h-full flex flex-col">
      <div className="p-4 border-b border-black/10">
        <h2 className="text-lg font-semibold text-black/90">Upcoming Events</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            <div className="animate-pulse">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="h-4 bg-black/20 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-black/20 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="p-4 space-y-3">
            {filteredEvents.slice(0, 2).map((event) => (
              <DialogLayout
                key={event.ce_id}
                trigger={
                  <Card
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate mb-1">{event.ce_title}</h3>
                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                          <span>{new Date(`${event.ce_date}T${event.ce_time}`).toLocaleDateString()}</span>
                          <span>{format(new Date(`${event.ce_date}T${event.ce_time}`), "h:mm a")}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 mt-1" />
                    </div>
                  </Card>
                }
                title="Event Details"
                description=''
                mainContent={
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Title</Label>
                        <p>{event.ce_title}</p>
                      </div>
                      <div>
                        <Label>Type</Label>
                        <p>{event.ce_type ? capitalize(event.ce_type) : "N/A"}</p>
                      </div>
                      <div>
                        <Label>Date</Label>
                        <p>{new Date(event.ce_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <Label>Time</Label>
                        <p>{format(new Date(`${event.ce_date}T${event.ce_time}`), "h:mm a")}</p>
                      </div>
                      <div>
                        <Label>Location</Label>
                        <p>{event.ce_place || "N/A"}</p>
                      </div>
                    </div>
                    {event.ce_description && (
                      <div>
                        <Label>Description</Label>
                        <p className="whitespace-pre-wrap">{event.ce_description}</p>
                      </div>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Clock className="w-8 h-8 text-black/40 mb-4" />
            <h3 className="text-sm font-medium mb-1">No upcoming events</h3>
          </div>
        )}
      </div>

      {filteredEvents.length > 0 && (
         <div className="p-4 border-t border-gray-100">
          <Button onClick={() => navigate("/calendar-page")}>View Calendar</Button>
        </div>
      )}
    </Card>
  );
};
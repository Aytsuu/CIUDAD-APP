import { Clock, MapPin, Calendar } from "lucide-react";
import { useGetCouncilEvents } from "@/pages/record/council/Calendar/queries/councilEventfetchqueries";
import { CouncilEvent } from "@/pages/record/council/Calendar/councilEventTypes";
import { format } from "date-fns";

export const CouncilEventsDashboard = () => {
  const { data, isLoading } = useGetCouncilEvents(1, 100, undefined, undefined, false);

  // Filter events for the next 5 days (upcoming, non-archived)
  const upcomingEvents = data?.results.filter((event: CouncilEvent) => {
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

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-white/20 rounded w-3/4"></div>
          <div className="h-3 bg-white/20 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (upcomingEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="w-12 h-12 text-white/40 mb-3" />
        <p className="text-white/80 text-sm">No upcoming events in the next 5 days</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
      {upcomingEvents.slice(0, 3).map((event: CouncilEvent) => (
        <div
          key={event.ce_id}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all cursor-pointer border border-white/10"
        >
          <h3 className="text-white font-semibold text-base mb-2 line-clamp-1">
            {event.ce_title}
          </h3>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{new Date(event.ce_date).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </div>
            
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(`${event.ce_date}T${event.ce_time}`), "h:mm a")}</span>
            </div>
            
            {event.ce_place && (
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{event.ce_place}</span>
              </div>
            )}
          </div>
          
          {event.ce_description && (
            <p className="text-white/70 text-xs mt-2 line-clamp-2">
              {event.ce_description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

// Hook for dashboard configuration
export const useCouncilUpcomingEvents = () => {
  return {
    upcomingEvents: <CouncilEventsDashboard />,
  };
};
import { Clock, MapPin, Calendar } from "lucide-react";
import { useGetWasteEvents, WasteEvent } from "@/pages/record/waste-scheduling/waste-event/queries/wasteEventQueries";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export const WasteEventsDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetWasteEvents(false);

  // Filter events for the next 5 days (upcoming, non-archived)
  const upcomingEvents = data?.filter((event: WasteEvent) => {
    if (!event.we_date || !event.we_time) return false;
    
    const eventDateTime = new Date(`${event.we_date}T${event.we_time}`);
    const now = new Date();
    const fiveDaysFromNow = new Date(now);
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    
    return (
      eventDateTime >= now &&
      eventDateTime <= fiveDaysFromNow &&
      !event.we_is_archive
    );
  }) ?? [];

  // Sort by date
  upcomingEvents.sort((a: WasteEvent, b: WasteEvent) => {
    const dateA = new Date(`${a.we_date}T${a.we_time || '00:00:00'}`).getTime();
    const dateB = new Date(`${b.we_date}T${b.we_time || '00:00:00'}`).getTime();
    return dateA - dateB;
  });

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
    return null;
  }

  return (
    <div className="space-y-3">
      {upcomingEvents.slice(0, 3).map((event: WasteEvent) => (
        <div
          key={event.we_num}
          onClick={() => navigate('/calendar-page')}
          className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-all cursor-pointer border border-white/10"
        >
          <h3 className="text-white font-semibold text-base mb-2 line-clamp-1">
            {event.we_name}
          </h3>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{new Date(event.we_date!).toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </div>
            
            {event.we_time && (
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Clock className="w-4 h-4" />
                <span>{format(new Date(`${event.we_date}T${event.we_time}`), "h:mm a")}</span>
              </div>
            )}
            
            {event.we_location && (
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <MapPin className="w-4 h-4" />
                <span className="line-clamp-1">{event.we_location}</span>
              </div>
            )}
          </div>
          
          {event.we_description && (
            <p className="text-white/70 text-xs mt-2 line-clamp-2">
              {event.we_description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

// Hook for dashboard configuration
export const useWasteUpcomingEvents = () => {
  return {
    upcomingEvents: <WasteEventsDashboard />,
  };
};


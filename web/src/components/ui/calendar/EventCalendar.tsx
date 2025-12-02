import { useEffect, useState } from "react";
import { Box, Card, CardContent, CardHeader, Container } from "@mui/material";
import { Calendar, type Event, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Legend from "./Legend";
import EventInfoModal from "./EventInfoModal";
import { SelectLayout } from "@/components/ui/select/select-layout";
import DialogLayout from "../dialog/dialog-layout";

// Types
export interface EventDetailColumn<T> {
  accessorKey: keyof T;
  header: string;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
}

export interface EventSource<T extends Record<string, any>> {
  name?: string; 
  data: T[];
  columns: EventDetailColumn<T>[];
  titleAccessor: keyof T;
  dateAccessor: keyof T;
  timeAccessor: keyof T;
  endTimeAccessor?: keyof T;
  colorAccessor?: keyof T;
  defaultColor?: string;
  viewEditComponent?: React.ComponentType<{
    initialValues: T;
    onClose: () => void;
  }>;
}

export interface IEventInfo<T = any> extends Event {
  _id: string;
  description: string;
  color: string;
  originalData: T;
  sourceName: string; 
  title: string;
  start: Date;
  end: Date;
}

export const generateId = (item: any, sourceName: string, index: number) => {
  // Create a stable hash from the event data
  const dataString = JSON.stringify(item);
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `${sourceName}-${Math.abs(hash)}-${index}`;
};

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const EventCalendar = ({
  sources,
  legendItems: initialLegendItems = [],
  viewEditComponentSources = [],
}: {
  sources: EventSource<any>[];
  legendItems?: Array<{ label: string; color: string }>;
  viewEditComponentSources?: string[];
}) => {
  const [events, setEvents] = useState<IEventInfo<any>[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<IEventInfo<any> | null>(null);
  const [legendItems, setLegendItems] = useState(initialLegendItems);
  const [activeSource, setActiveSource] = useState<string | 'all'>('all');

  useEffect(() => {
    const allEvents: IEventInfo<any>[] = [];

    sources.forEach((source, index) => {
      const {
        data,
        titleAccessor,
        dateAccessor,
        timeAccessor,
        endTimeAccessor,
        colorAccessor,
        defaultColor = "#b32aa9",
        name: sourceName = `Source ${index + 1}`,
      } = source;

      const convertedEvents = data.map((item, itemIndex) => {
        const dateStr = String(item[dateAccessor]);
        const timeStr = String(item[timeAccessor]);
        
        if (!dateStr || !timeStr) {
          console.warn("Invalid date/time format", item);
          return null;
        }

        try {
          // Validate date and time strings
          if (!dateStr || dateStr === 'undefined' || dateStr === 'null' || 
              !timeStr || timeStr === 'undefined' || timeStr === 'null') {
            console.warn("Skipping event with invalid date/time:", { dateStr, timeStr, item });
            return null;
          }

          const start = new Date(`${dateStr}T${timeStr}`);
          if (isNaN(start.getTime())) {
            console.warn("Invalid date format:", { dateStr, timeStr, item });
            return null;
          }
          
          let end: Date;
          if (endTimeAccessor) {
            const endTimeStr = String(item[endTimeAccessor]);
            if (endTimeStr && endTimeStr !== 'undefined' && endTimeStr !== 'null') {
              end = new Date(`${dateStr}T${endTimeStr}`);
              if (isNaN(end.getTime())) {
                end = new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour duration
              }
            } else {
              end = new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour duration
            }
          } else {
            end = new Date(start.getTime() + 60 * 60 * 1000);
          }

          return {
            _id: generateId(item, sourceName, itemIndex),
            title: String(item[titleAccessor] || 'Untitled Event'),
            start,
            end,
            color: colorAccessor ? String(item[colorAccessor]) : defaultColor,
            description: JSON.stringify(item),
            originalData: item,
            sourceName,
          };
        } catch (error) {
          console.error("Error processing event:", error, item);
          return null;
        }
      }).filter(Boolean) as IEventInfo<any>[];

      allEvents.push(...convertedEvents);
    });

    setEvents(allEvents);
  }, [sources]);

  const handleLegendColorChange = (label: string, newColor: string) => {
    setLegendItems((prevItems) =>
      prevItems.map((item) => (item.label === label ? { ...item, color: newColor } : item))
    );
  };

  const filteredEvents = activeSource === 'all' 
    ? events 
    : events.filter(event => event.sourceName === activeSource);

  const sourceOptions = [
    { id: 'all', name: 'All' },
    ...sources.map((source, index) => ({
      id: source.name || `source-${index}`,
      name: source.name || `Source ${index + 1}`
    }))
  ];

  const handleSourceChange = (value: string) => {
    setActiveSource(value);
  };

  return (
    <Box mb={2} component="main" sx={{ flexGrow: 1, py: 1 }}>
      <Container>
        <Card>
          <CardHeader 
            title="Calendar"
            action={
              sourceOptions.length > 1 && (
                <div className="flex flex-row gap-2 justify-center items-center min-w-[180px]">
                  <SelectLayout
                    className="gap-2"
                    label=""
                    placeholder=""
                    valueLabel="Filter by Source"
                    options={sourceOptions}
                    value={activeSource}
                    onChange={handleSourceChange}
                  />
                </div>
              )
            }
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px'
            }}
          />
          <CardContent>
            {legendItems.length > 0 && (
              <>
                <Legend legendItems={legendItems} onColorChange={handleLegendColorChange} />
                <br />
              </>
            )}
            
            <Calendar
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              defaultView="month"
              components={{
                event: ({ event }) => (
                  <div
                    className="text-white text-sm font-semibold rounded px-1.5 py-0.5"
                    style={{ backgroundColor: event.color }}
                  >
                    {event.title}
                  </div>
                )
              }}
              eventPropGetter={(event) => ({
                className: "border text-white text-sm font-semibold rounded px-1.5 py-0.5",
                style: {
                  backgroundColor: event.color,
                  borderColor: event.color,
                },
              })}
              onSelectEvent={(event) => {
                console.log("Selected event sourceName:", event.sourceName);
                setSelectedEvent(event as IEventInfo<any>);
              }}
              style={{ height: 900, width: "100%" }}
              selectable={false}
            />
          </CardContent>
        </Card>
      </Container>

      {selectedEvent && (
        (() => {
          const source = sources.find(s => (s.name || `Source ${sources.indexOf(s) + 1}`) === selectedEvent.sourceName);
          if (source && viewEditComponentSources.includes(selectedEvent.sourceName) && source.viewEditComponent) {
            return (
              <DialogLayout
                isOpen={!!selectedEvent}
                onOpenChange={(open) => !open && setSelectedEvent(null)}
                title="Event Details"
                description="View or edit event details"
                mainContent={
                  <source.viewEditComponent
                    initialValues={selectedEvent.originalData}
                    onClose={() => setSelectedEvent(null)}
                  />
                }
                className="max-w-[90%] sm:max-w-[55%] h-[300px] sm:h-[540px] flex flex-col overflow-auto scrollbar-custom"
              />
            );
          }
          return (
            <EventInfoModal<any>
              open={!!selectedEvent}
              handleClose={() => setSelectedEvent(null)}
              currentEvent={selectedEvent}
              columns={source?.columns || []}
              title={selectedEvent.sourceName}
            />
          );
        })()
      )}
    </Box>
  );
};

export default EventCalendar;

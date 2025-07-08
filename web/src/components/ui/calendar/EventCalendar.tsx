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

export const generateId = () => (Math.floor(Math.random() * 10000) + 1).toString();

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const EventCalendar = <T extends Record<string, any>>({
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

      const convertedEvents = data.map((item) => {
        const dateStr = String(item[dateAccessor]);
        const timeStr = String(item[timeAccessor]);
        
        if (!dateStr || !timeStr) {
          console.warn("Invalid date/time format", item);
          return null;
        }

        try {
          const start = new Date(`${dateStr}T${timeStr}`);
          if (isNaN(start.getTime())) throw new Error("Invalid date");
          
          let end: Date;
          if (endTimeAccessor) {
            const endTimeStr = String(item[endTimeAccessor]);
            end = new Date(`${dateStr}T${endTimeStr}`);
          } else {
            end = new Date(start.getTime() + 60 * 60 * 1000);
          }

          return {
            _id: generateId(),
            title: String(item[titleAccessor]),
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
    { id: 'all', name: 'All Sources' },
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
                <div className="w-64">
                  <SelectLayout
                    className="w-full"
                    label=""
                    placeholder="Filter by Source"
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

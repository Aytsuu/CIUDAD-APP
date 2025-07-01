// import { useEffect, useState } from "react";
// import { Box, Card, CardContent, CardHeader, Container } from "@mui/material";
// import { Calendar, type Event, dateFnsLocalizer } from "react-big-calendar";
// import format from "date-fns/format";
// import parse from "date-fns/parse";
// import startOfWeek from "date-fns/startOfWeek";
// import getDay from "date-fns/getDay";
// import enUS from "date-fns/locale/en-US";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import Legend from "./Legend";
// import EventInfoModal from "./EventInfoModal";

// // Types
// export interface EventDetailColumn<T> {
//   accessorKey: keyof T;
//   header: string;
//   cell?: (props: { row: { original: T } }) => React.ReactNode;
// }

// export interface EventCalendarProps<T extends Record<string, any>> {
//   name: string;
//   columns: EventDetailColumn<T>[];
//   data: T[];
//   titleAccessor: keyof T;
//   colorAccessor?: keyof T;
//   defaultColor?: string;
//   legendItems?: Array<{ label: string; color: string }>;
// }

// export interface IEventInfo<T = any> extends Event {
//   _id: string;
//   description: string;
//   color: string;
//   originalData: T;
//   title: string;
//   start: Date;
//   end: Date;
// }

// export const generateId = () => (Math.floor(Math.random() * 10000) + 1).toString();

// const locales = { "en-US": enUS };
// const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// const EventCalendar = <T extends Record<string, any>>({
//   name,
//   columns,
//   data,
//   titleAccessor,
//   colorAccessor,
//   defaultColor = "#b32aa9",
//   legendItems: initialLegendItems = [],
// }: EventCalendarProps<T>) => {
//   const [events, setEvents] = useState<IEventInfo<T>[]>([]);
//   const [selectedEvent, setSelectedEvent] = useState<IEventInfo<T> | null>(null);
//   const [legendItems, setLegendItems] = useState(initialLegendItems);


//   // Auto-detect date/time fields from columns
//   const dateAccessor = columns.find(col => 
//     col.header.toLowerCase().includes('date') || 
//     col.accessorKey.toString().toLowerCase().includes('date')
//   )?.accessorKey;

//   const timeAccessor = columns.find(col => 
//     col.header.toLowerCase().includes('time') || 
//     col.accessorKey.toString().toLowerCase().includes('time')
//   )?.accessorKey;

  
//   useEffect(() => {
//     if (!dateAccessor || !timeAccessor) {
//       console.error('Could not automatically detect date/time fields from columns');
//       return;
//     }

//     const convertedEvents = data.map((item) => {
//       const dateStr = String(item[dateAccessor]);
//       const timeStr = String(item[timeAccessor]);
      
//       if (!dateStr || !timeStr) {
//         console.warn("Invalid date/time format", item);
//         return null;
//       }

//       try {
//         const start = new Date(`${dateStr}T${timeStr}`);
//         if (isNaN(start.getTime())) throw new Error("Invalid date");
        
//         return {
//           _id: generateId(),
//           title: String(item[titleAccessor]),
//           start,
//           end: new Date(start.getTime() + 60 * 60 * 1000), // 1 hour duration
//           color: colorAccessor ? String(item[colorAccessor]) : defaultColor,
//           description: JSON.stringify(item),
//           originalData: item,
//         };
//       } catch (error) {
//         console.error("Error processing event:", error, item);
//         return null;
//       }
//     }).filter(Boolean) as IEventInfo<T>[];

//     setEvents(convertedEvents);
//   }, [data, titleAccessor, dateAccessor, timeAccessor, colorAccessor, defaultColor]);


//   const handleLegendColorChange = (label: string, newColor: string) => {
//     setLegendItems((prevItems) =>
//       prevItems.map((item) => (item.label === label ? { ...item, color: newColor } : item))
//     );
//   };

//   return (
//     <Box mb={2} component="main" sx={{ flexGrow: 1, py: 1 }}>
//       <Container>
//         <Card>
//           <CardHeader title={name} />
//           <CardContent>
//             <Legend legendItems={legendItems} onColorChange={handleLegendColorChange} />
//             <br />
//             <Calendar
//               localizer={localizer}
//               events={events}
//               startAccessor="start"
//               endAccessor="end"
//               defaultView="month"
//               components={{
//                 event: ({ event }) => (
//                   <div
//                     className="text-white text-sm font-semibold rounded px-1.5 py-0.5"
//                     style={{ backgroundColor: event.color }}
//                   >
//                     {event.title}
//                   </div>
//                 )
//               }}

//               eventPropGetter={(event) => ({
//                 className: "border text-white text-sm font-semibold rounded px-1.5 py-0.5",
//                 style: {
//                   backgroundColor: event.color,
//                   borderColor: event.color,
//                 },
//               })}
//               onSelectEvent={(event) => {
//                 console.log("Event clicked:", event); // Debugging
//                 setSelectedEvent(event as IEventInfo<T>);
//               }}
//               style={{ height: 900, width: "100%" }}
//               selectable={false}
//             />
//           </CardContent>
//         </Card>
//       </Container>

//       {selectedEvent && (
//         <EventInfoModal<T>
//           open={!!selectedEvent}
//           handleClose={() => setSelectedEvent(null)}
//           currentEvent={selectedEvent}
//           columns={columns}
//           title={name}
//         />
//       )}
//     </Box>
//   );
// };

// export default EventCalendar;

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

// Types
export interface EventDetailColumn<T> {
  accessorKey: keyof T;
  header: string;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
}

export interface EventSource<T extends Record<string, any>> {
  name?: string; // Made optional here
  data: T[];
  columns: EventDetailColumn<T>[];
  titleAccessor: keyof T;
  dateAccessor: keyof T;
  timeAccessor: keyof T;
  endTimeAccessor?: keyof T; // Optional for events with duration
  colorAccessor?: keyof T;
  defaultColor?: string;
}

export interface IEventInfo<T = any> extends Event {
  _id: string;
  description: string;
  color: string;
  originalData: T;
  sourceName: string; // Will use a default if name not provided
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
}: {
  sources: EventSource<any>[];
  legendItems?: Array<{ label: string; color: string }>;
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
        name: sourceName = `Source ${index + 1}` // Default name if not provided
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
          
          // Calculate end time - use endTimeAccessor if provided, otherwise add 1 hour
          let end: Date;
          if (endTimeAccessor) {
            const endTimeStr = String(item[endTimeAccessor]);
            end = new Date(`${dateStr}T${endTimeStr}`);
          } else {
            end = new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour duration
          }

          return {
            _id: generateId(),
            title: String(item[titleAccessor]),
            start,
            end,
            color: colorAccessor ? String(item[colorAccessor]) : defaultColor,
            description: JSON.stringify(item),
            originalData: item,
            sourceName, // Will use the provided name or default
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

  // Filter events based on active source
  const filteredEvents = activeSource === 'all' 
    ? events 
    : events.filter(event => event.sourceName === activeSource);

  // Get unique source names for filter (with fallback for unnamed sources)
  const sourceNames = [...new Set(sources.map((source, index) => 
    source.name || `Source ${index + 1}`
  ))];

  return (
    <Box mb={2} component="main" sx={{ flexGrow: 1, py: 1 }}>
      <Container>
        <Card>
          <CardHeader 
            title="Calendar" 
          />
          <CardContent>
            {sourceNames.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setActiveSource('all')}
                  className={`px-3 py-1 rounded-md ${
                    activeSource === 'all' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  All Sources
                </button>
                {sourceNames.map(name => (
                  <button
                    key={name}
                    onClick={() => setActiveSource(name)}
                    className={`px-3 py-1 rounded-md ${
                      activeSource === name 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            )}
            
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
                setSelectedEvent(event as IEventInfo<any>);
              }}
              style={{ height: 900, width: "100%" }}
              selectable={false}
            />
          </CardContent>
        </Card>
      </Container>

      {selectedEvent && (
        <EventInfoModal<any>
          open={!!selectedEvent}
          handleClose={() => setSelectedEvent(null)}
          currentEvent={selectedEvent}
          columns={
            sources.find(s => (s.name || `Source ${sources.indexOf(s) + 1}`) === selectedEvent.sourceName)?.columns || []
          }
          title={selectedEvent.sourceName}
        />
      )}
    </Box>
  );
};

export default EventCalendar;
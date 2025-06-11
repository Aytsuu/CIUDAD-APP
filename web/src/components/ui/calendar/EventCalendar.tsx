// import { useEffect, useState } from "react";
// import {
//   Box,
//   Card,
//   CardContent,
//   CardHeader,
//   Container,
// } from "@mui/material";
// import { Calendar, type Event, dateFnsLocalizer } from "react-big-calendar";
// import format from "date-fns/format";
// import parse from "date-fns/parse";
// import startOfWeek from "date-fns/startOfWeek";
// import getDay from "date-fns/getDay";
// import enUS from "date-fns/locale/en-US";
// import "react-big-calendar/lib/css/react-big-calendar.css";

// import EventInfo from "./EventInfo";
// import Legend from "./Legend";

// // Types for event details
// export interface EventDetailColumn<T> {
//   accessorKey: keyof T | string;
//   header: string;
//   cell?: (props: { row: { original: T } }) => React.ReactNode;
// }

// export interface EventCalendarProps<T> {
//   name: string;
//   columns: EventDetailColumn<T>[];
//   data: T[];
//   startAccessor: keyof T;
//   endAccessor: keyof T;
//   titleAccessor: keyof T;
//   colorAccessor?: keyof T;
//   defaultColor?: string;
//   legendItems?: Array<{ label: string; color: string }>;
// }

// const locales = {
//   "en-US": enUS,
// };

// const localizer = dateFnsLocalizer({
//   format,
//   parse,
//   startOfWeek,
//   getDay,
//   locales,
// });

// export interface IEventInfo<T = any> extends Event {
//   _id: string;
//   description: string;
//   color: string;
//   originalData: T;
//   title: string;
//   start: Date;
//   end: Date;
// }

// export const generateId = () =>
//   (Math.floor(Math.random() * 10000) + 1).toString();

// const EventCalendar = <T,>({
//   name,
//   columns,
//   data,
//   startAccessor,
//   endAccessor,
//   titleAccessor,
//   colorAccessor,
//   defaultColor = "#b32aa9",
//   legendItems: initialLegendItems = [
//     { label: "Council", color: "#b32aa9" },
//     { label: "GAD", color: "#32a852" },
//     { label: "DRR", color: "#3264a8" },
//     { label: "Waste Management Council", color: "#3264a8" },
//   ],
// }: EventCalendarProps<T>) => {
//   const [events, setEvents] = useState<IEventInfo<T>[]>([]);
//   const [legendItems, setLegendItems] = useState(initialLegendItems);

//   useEffect(() => {
//     const convertedEvents = data.map((item) => ({
//       _id: generateId(),
//       title: String(item[titleAccessor]),
//       start: new Date(String(item[startAccessor])),
//       end: new Date(String(item[endAccessor])),
//       color: colorAccessor ? String(item[colorAccessor]) : defaultColor,
//       description: JSON.stringify(item),
//       originalData: item,
//     }));
//     setEvents(convertedEvents);
//   }, [data, startAccessor, endAccessor, titleAccessor, colorAccessor, defaultColor]);

//   const handleLegendColorChange = (label: string, newColor: string) => {
//     setLegendItems((prevItems) =>
//       prevItems.map((item) =>
//         item.label === label ? { ...item, color: newColor } : item
//       )
//     );
//   };

//   return (
//     <Box
//       mb={2}
//       component="main"
//       sx={{ flexGrow: 1, py: 1 }}
//     >
//       <Container>
//         <Card>
//           <CardHeader title={name} />
//           <CardContent>
//             <Legend
//               legendItems={legendItems}
//               onColorChange={handleLegendColorChange}
//             />
//             <br />
//             <Calendar
//               localizer={localizer}
//               events={events}
//               startAccessor="start"
//               endAccessor="end"
//               defaultView="month"
//               components={{ event: EventInfo }}
//               eventPropGetter={(event) => ({
//                 style: {
//                   backgroundColor: event.color,
//                   borderColor: event.color,
//                 },
//               })}
//               style={{ height: 900, width: "100%" }}
//               selectable={false}
//               onSelectEvent={() => {}} // disabled event viewing modal
//               onSelectSlot={() => {}}  // disabled click-to-add
//             />
//           </CardContent>
//         </Card>
//       </Container>
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

export interface EventCalendarProps<T extends Record<string, any>> {
  name: string;
  columns: EventDetailColumn<T>[];
  data: T[];
  titleAccessor: keyof T;
  colorAccessor?: keyof T;
  defaultColor?: string;
  legendItems?: Array<{ label: string; color: string }>;
}

export interface IEventInfo<T = any> extends Event {
  _id: string;
  description: string;
  color: string;
  originalData: T;
  title: string;
  start: Date;
  end: Date;
}

export const generateId = () => (Math.floor(Math.random() * 10000) + 1).toString();

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const EventCalendar = <T extends Record<string, any>>({
  name,
  columns,
  data,
  titleAccessor,
  colorAccessor,
  defaultColor = "#b32aa9",
  legendItems: initialLegendItems = [],
}: EventCalendarProps<T>) => {
  const [events, setEvents] = useState<IEventInfo<T>[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<IEventInfo<T> | null>(null);
  const [legendItems, setLegendItems] = useState(initialLegendItems);

  useEffect(() => {
    console.log("Raw data:", data); // Debugging
    
    const convertedEvents = data.map((item) => {
      const dateStr = String(item["wh_date" as keyof T]);
      const timeStr = String(item["wh_time" as keyof T]);
      
      // Validate date format
      if (!dateStr || !timeStr) {
        console.warn("Invalid date/time format", item);
        return null;
      }

      try {
        const start = new Date(`${dateStr}T${timeStr}`);
        if (isNaN(start.getTime())) throw new Error("Invalid date");
        
        return {
          _id: generateId(),
          title: String(item[titleAccessor]),
          start,
          end: new Date(start.getTime() + 60 * 60 * 1000), // 1 hour duration
          color: colorAccessor ? String(item[colorAccessor]) : defaultColor,
          description: JSON.stringify(item),
          originalData: item,
        };
      } catch (error) {
        console.error("Error processing event:", error, item);
        return null;
      }
    }).filter(Boolean) as IEventInfo<T>[];

    console.log("Converted events:", convertedEvents); // Debugging
    setEvents(convertedEvents);
  }, [data, titleAccessor, colorAccessor, defaultColor]);

  const handleLegendColorChange = (label: string, newColor: string) => {
    setLegendItems((prevItems) =>
      prevItems.map((item) => (item.label === label ? { ...item, color: newColor } : item))
    );
  };

  return (
    <Box mb={2} component="main" sx={{ flexGrow: 1, py: 1 }}>
      <Container>
        <Card>
          <CardHeader title={name} />
          <CardContent>
            <Legend legendItems={legendItems} onColorChange={handleLegendColorChange} />
            <br />
            <Calendar
              localizer={localizer}
              events={events}
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
                console.log("Event clicked:", event); // Debugging
                setSelectedEvent(event as IEventInfo<T>);
              }}
              style={{ height: 900, width: "100%" }}
              selectable={false}
            />
          </CardContent>
        </Card>
      </Container>

      {selectedEvent && (
        <EventInfoModal<T>
          open={!!selectedEvent}
          handleClose={() => setSelectedEvent(null)}
          currentEvent={selectedEvent}
          columns={columns}
          title={name}
        />
      )}
    </Box>
  );
};

export default EventCalendar;


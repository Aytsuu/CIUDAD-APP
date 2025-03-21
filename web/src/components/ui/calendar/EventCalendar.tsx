// import { useState, MouseEvent } from "react";
// import {
//   Box,
//   Button,
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
// import AddEventModal from "./AddEventModal";
// import EventInfoModal from "./EventInfoModal";
// import { AddTodoModal } from "./AddTodoModal";
// import AddDatePickerEventModal from "./AddDatePickerEventModal";

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

// export interface ITodo {
//   _id: string;
//   title: string;
//   color?: string;
// }

// export interface IEventInfo extends Event {
//   _id: string;
//   description: string;
//   todoId?: string;
// }

// export interface EventFormData {
//   description: string;
//   todoId?: string;
// }

// export interface DatePickerEventFormData {
//   description: string;
//   todoId?: string;
//   allDay: boolean;
//   start?: Date;
//   end?: Date;
// }

// export const generateId = () =>
//   (Math.floor(Math.random() * 10000) + 1).toString();

// const initialEventFormState: EventFormData = {
//   description: "",
//   todoId: undefined,
// };

// const initialDatePickerEventFormData: DatePickerEventFormData = {
//   description: "",
//   todoId: undefined,
//   allDay: false,
//   start: undefined,
//   end: undefined,
// };

// const EventCalendar = () => {
//   const [openSlot, setOpenSlot] = useState(false);
//   const [openDatepickerModal, setOpenDatepickerModal] = useState(false);
//   const [openTodoModal, setOpenTodoModal] = useState(false);
//   const [currentEvent, setCurrentEvent] = useState<Event | IEventInfo | null>(
//     null
//   );

//   const [eventInfoModal, setEventInfoModal] = useState(false);

//   const [events, setEvents] = useState<IEventInfo[]>([]);
//   const [todos, setTodos] = useState<ITodo[]>([]);

//   const [eventFormData, setEventFormData] = useState<EventFormData>(
//     initialEventFormState
//   );

//   const [datePickerEventFormData, setDatePickerEventFormData] =
//     useState<DatePickerEventFormData>(initialDatePickerEventFormData);

//   const handleSelectSlot = (event: Event) => {
//     setOpenSlot(true);
//     setCurrentEvent(event);
//   };

//   const handleSelectEvent = (event: IEventInfo) => {
//     setCurrentEvent(event);
//     setEventInfoModal(true);
//   };

//   const handleClose = () => {
//     setEventFormData(initialEventFormState);
//     setOpenSlot(false);
//   };

//   const handleDatePickerClose = () => {
//     setDatePickerEventFormData(initialDatePickerEventFormData);
//     setOpenDatepickerModal(false);
//   };

//   const onAddEvent = (e: MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();

//     const data: IEventInfo = {
//       ...eventFormData,
//       _id: generateId(),
//       start: currentEvent?.start,
//       end: currentEvent?.end,
//     };

//     const newEvents = [...events, data];

//     setEvents(newEvents);
//     handleClose();
//   };

//   const onAddEventFromDatePicker = (e: MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();

//     const addHours = (date: Date | undefined, hours: number) => {
//       return date ? date.setHours(date.getHours() + hours) : undefined;
//     };

//     const setMinToZero = (date: any) => {
//       date.setSeconds(0);

//       return date;
//     };

//     const data: IEventInfo = {
//       ...datePickerEventFormData,
//       _id: generateId(),
//       start: setMinToZero(datePickerEventFormData.start),
//       end: datePickerEventFormData.allDay
//         ? addHours(datePickerEventFormData.start, 12)
//         : setMinToZero(datePickerEventFormData.end),
//     };

//     const newEvents = [...events, data];

//     setEvents(newEvents);
//     setDatePickerEventFormData(initialDatePickerEventFormData);
//   };

//   const onDeleteEvent = () => {
//     setEvents(() =>
//       [...events].filter((e) => e._id !== (currentEvent as IEventInfo)._id!)
//     );
//     setEventInfoModal(false);
//   };

//   return (
//     <Box
//       mb={2}
//       component="main"
//       sx={{
//         flexGrow: 1,
//         py: 1,
//       }}
//     >
//       <Container>
//       <Card >
//           <CardHeader
//             title=""
//             subheader=""
//           />
//           <CardContent>
//             {/* Updated Button Layout */}
//             <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//               <Button
//                 onClick={() => setOpenTodoModal(true)}
//                 size="small"
//                 variant="contained"
//               >
//                 Add Category
//               </Button>
//             </Box>
//             <br/>
//             <AddEventModal
//               open={openSlot}
//               handleClose={handleClose}
//               eventFormData={eventFormData}
//               setEventFormData={setEventFormData}
//               onAddEvent={onAddEvent}
//               todos={todos}
//             />
//             <AddDatePickerEventModal
//               open={openDatepickerModal}
//               handleClose={handleDatePickerClose}
//               datePickerEventFormData={datePickerEventFormData}
//               setDatePickerEventFormData={setDatePickerEventFormData}
//               onAddEvent={onAddEventFromDatePicker}
//               todos={todos}
//             />
//             <EventInfoModal
//               open={eventInfoModal}
//               handleClose={() => setEventInfoModal(false)}
//               onDeleteEvent={onDeleteEvent}
//               currentEvent={currentEvent as IEventInfo}
//             />
//             <AddTodoModal
//               open={openTodoModal}
//               handleClose={() => setOpenTodoModal(false)}
//               todos={todos}
//               setTodos={setTodos}
//             />
//             <Calendar
//               localizer={localizer}
//               events={events}
//               onSelectEvent={handleSelectEvent}
//               onSelectSlot={handleSelectSlot}
//               selectable
//               startAccessor="start"
//               components={{ event: EventInfo }}
//               endAccessor="end"
//               defaultView="month"
//               eventPropGetter={(event) => {
//                 const hasTodo = todos.find((todo) => todo._id === event.todoId);
//                 return {
//                   style: {
//                     backgroundColor: hasTodo ? hasTodo.color : "#b64fc8",
//                     borderColor: hasTodo ? hasTodo.color : "#b64fc8",
//                   },
//                 };
//               }}
//               style={{
//                 height: 900,
//                 width: "100%",
//               }}
//             />
//           </CardContent>
//         </Card>
//       </Container>
//     </Box>
//   );
// };

// export default EventCalendar;

// import { useState, MouseEvent } from "react";
// import {
//   Box,
//   Button,
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
// import AddEventModal from "./AddEventModal";
// import EventInfoModal from "./EventInfoModal";
// import { AddTodoModal } from "./AddTodoModal";
// import AddDatePickerEventModal from "./AddDatePickerEventModal";
// import Legend from "./Legend"; // Import the Legend component

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

// export interface ITodo {
//   _id: string;
//   title: string;
//   color?: string;
// }

// export interface IEventInfo extends Event {
//   _id: string;
//   description: string;
//   color: string; // Ensure color is part of the event info
// }

// export interface EventFormData {
//   description: string;
//   color: string; // Include color in the event form data
// }

// export interface DatePickerEventFormData {
//   description: string;
//   color: string; // Include color in the date picker event form data
//   allDay: boolean;
//   start?: Date;
//   end?: Date;
// }

// export const generateId = () =>
//   (Math.floor(Math.random() * 10000) + 1).toString();

// const initialEventFormState: EventFormData = {
//   description: "",
//   color: "#b32aa9", // Default color
// };

// const initialDatePickerEventFormData: DatePickerEventFormData = {
//   description: "",
//   color: "#b32aa9", // Default color
//   allDay: false,
//   start: undefined,
//   end: undefined,
// };

// const EventCalendar = () => {
//   const [openSlot, setOpenSlot] = useState(false);
//   const [openDatepickerModal, setOpenDatepickerModal] = useState(false);
//   const [openTodoModal, setOpenTodoModal] = useState(false);
//   const [currentEvent, setCurrentEvent] = useState<Event | IEventInfo | null>(
//     null
//   );

//   const [eventInfoModal, setEventInfoModal] = useState(false);

//   const [events, setEvents] = useState<IEventInfo[]>([]);
//   const [todos, setTodos] = useState<ITodo[]>([]);

//   const [eventFormData, setEventFormData] = useState<EventFormData>(
//     initialEventFormState
//   );

//   const [datePickerEventFormData, setDatePickerEventFormData] =
//     useState<DatePickerEventFormData>(initialDatePickerEventFormData);

//   // State for legend items
//   const [legendItems, setLegendItems] = useState([
//     { label: "Waste Management Council", color: "#b32aa9" },
//     { label: "Donation", color: "#32a852" },
//     { label: "Council", color: "#3264a8" },
//   ]);

//   // Handle color change for legend items
//   const handleLegendColorChange = (label: string, color: string) => {
//     setLegendItems((prevItems) =>
//       prevItems.map((item) =>
//         item.label === label ? { ...item, color } : item
//       )
//     );
//   };

//   const handleSelectSlot = (event: Event) => {
//     setOpenSlot(true);
//     setCurrentEvent(event);
//   };

//   const handleSelectEvent = (event: IEventInfo) => {
//     setCurrentEvent(event);
//     setEventInfoModal(true) };

//   const handleClose = () => {
//     setEventFormData(initialEventFormState);
//     setOpenSlot(false);
//   };

//   const handleDatePickerClose = () => {
//     setDatePickerEventFormData(initialDatePickerEventFormData);
//     setOpenDatepickerModal(false);
//   };

//   const onAddEvent = (e: MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();

//     const data: IEventInfo = {
//       ...eventFormData,
//       _id: generateId(),
//       start: currentEvent?.start,
//       end: currentEvent?.end,
//     };

//     const newEvents = [...events, data];

//     setEvents(newEvents);
//     handleClose();
//   };

//   const onAddEventFromDatePicker = (e: MouseEvent<HTMLButtonElement>) => {
//     e.preventDefault();

//     const addHours = (date: Date | undefined, hours: number) => {
//       return date ? date.setHours(date.getHours() + hours) : undefined;
//     };

//     const setMinToZero = (date: any) => {
//       date.setSeconds(0);
//       return date;
//     };

//     const data: IEventInfo = {
//       ...datePickerEventFormData,
//       _id: generateId(),
//       start: setMinToZero(datePickerEventFormData.start),
//       end: datePickerEventFormData.allDay
//         ? addHours(datePickerEventFormData.start, 12)
//         : setMinToZero(datePickerEventFormData.end),
//     };

//     const newEvents = [...events, data];

//     setEvents(newEvents);
//     setDatePickerEventFormData(initialDatePickerEventFormData);
//   };

//   const onDeleteEvent = () => {
//     setEvents(() =>
//       [...events].filter((e) => e._id !== (currentEvent as IEventInfo)._id!)
//     );
//     setEventInfoModal(false);
//   };

//   return (
//     <Box
//       mb={2}
//       component="main"
//       sx={{
//         flexGrow: 1,
//         py: 1,
//       }}
//     >
//       <Container>
//         <Card>
//           <CardHeader title="" subheader="" />
//           <CardContent>
//             {/* Add the Legend component */}
//             <Legend
//               legendItems={legendItems}
//               onColorChange={handleLegendColorChange}
//             />

//             {/* Updated Button Layout */}
//             <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
//               <Button
//                 onClick={() => setOpenTodoModal(true)}
//                 size="small"
//                 variant="contained"
//               >
//                 Add Category
//               </Button>
//             </Box>
//             <br />
//             <AddEventModal
//               open={openSlot}
//               handleClose={handleClose}
//               eventFormData={eventFormData}
//               setEventFormData={setEventFormData}
//               onAddEvent={onAddEvent}
//             />
//             <AddDatePickerEventModal
//               open={openDatepickerModal}
//               handleClose={handleDatePickerClose}
//               datePickerEventFormData={datePickerEventFormData}
//               setDatePickerEventFormData={setDatePickerEventFormData}
//               onAddEvent={onAddEventFromDatePicker}
//             />
//             <EventInfoModal
//               open={eventInfoModal}
//               handleClose={() => setEventInfoModal(false)}
//               onDeleteEvent={onDeleteEvent}
//               currentEvent={currentEvent as IEventInfo}
//             />
//             <AddTodoModal
//               open={openTodoModal}
//               handleClose={() => setOpenTodoModal(false)}
//               todos={todos}
//               setTodos={setTodos}
//             />
//             <Calendar
//               localizer={localizer}
//               events={events}
//               onSelectEvent={handleSelectEvent}
//               onSelectSlot={handleSelectSlot}
//               selectable
//               startAccessor="start"
//               components={{ event: EventInfo }}
//               endAccessor="end"
//               defaultView="month"
//               eventPropGetter={(event) => {
//                 return {
//                   style: {
//                     backgroundColor: event.color,
//                     borderColor: event.color,
//                   },
//                 };
//               }}
//               style={{
//                 height: 900,
//                 width: "100%",
//               }}
//             />
//           </CardContent>
//         </Card>
//       </Container>
//     </Box>
//   );
// };

// export default EventCalendar;

import { useState, MouseEvent, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
} from "@mui/material";
import { Calendar, type Event, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

import EventInfo from "./EventInfo";
import AddEventModal from "./AddEventModal";
import EventInfoModal from "./EventInfoModal";
// import { AddTodoModal } from "./AddTodoModal";
import AddDatePickerEventModal from "./AddDatePickerEventModal";
import Legend from "./Legend";

// npm install date-fns@2.30.0 react-big-calendar@1.8.2 react-colorful@5.6.1 @mui/x-date-pickers@5.0.12 @types/react-big-calendar
// npm install @mui/material@5.14.6 @mui/icons-material@5.14.6 @emotion/react@11.11.1 @emotion/styled@11.11.0

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export interface ITodo {
  _id: string;
  title: string;
  color?: string;
}

export interface IEventInfo extends Event {
  _id: string;
  description: string;
  color: string; // Ensure color is part of the event info
}

export interface EventFormData {
  description: string;
  color: string; // Include color in the event form data
}

export interface DatePickerEventFormData {
  description: string;
  color: string; // Include color in the date picker event form data
  allDay: boolean;
  start?: Date;
  end?: Date;
}

export const generateId = () =>
  (Math.floor(Math.random() * 10000) + 1).toString();

const initialEventFormState: EventFormData = {
  description: "",
  color: "#b32aa9", // Default color
};

const initialDatePickerEventFormData: DatePickerEventFormData = {
  description: "",
  color: "#b32aa9", // Default color
  allDay: false,
  start: undefined,
  end: undefined,
};

const EventCalendar = () => {
  const [openSlot, setOpenSlot] = useState(false);
  const [openDatepickerModal, setOpenDatepickerModal] = useState(false);
  // const [openTodoModal, setOpenTodoModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | IEventInfo | null>(
    null
  );

  const [eventInfoModal, setEventInfoModal] = useState(false);

  const [events, setEvents] = useState<IEventInfo[]>([]);
  // const [todos, setTodos] = useState<ITodo[]>([]);

  const [eventFormData, setEventFormData] = useState<EventFormData>(
    initialEventFormState
  );

  const [datePickerEventFormData, setDatePickerEventFormData] =
    useState<DatePickerEventFormData>(initialDatePickerEventFormData);

  // State for legend items
  const [legendItems, setLegendItems] = useState([
    { label: "Council", color: "#b32aa9" },
    { label: "GAD", color: "#32a852" },
    { label: "DRR", color: "#3264a8" },
    { label: "Waste Management Council", color: "#3264a8" },
  ]);

  useEffect(() => {
    console.log("Legend Colors:", legendItems.map(i => `${i.label}: ${i.color}`));
  }, [legendItems]);

  useEffect(() => {
    console.log("Legend Items Updated:", legendItems);
  }, [legendItems]);
  

  const handleLegendColorChange = (label: string, newColor: string) => {
    setLegendItems((prevItems) =>
      prevItems.map((item) =>
        item.label === label ? { ...item, color: newColor } : item
      )
    );
  };  

  const handleSelectSlot = (event: Event) => {
    setOpenSlot(true);
    setCurrentEvent(event);
  };

  const handleSelectEvent = (event: IEventInfo) => {
    setCurrentEvent(event);
    setEventInfoModal(true);
  };

  const handleClose = () => {
    setEventFormData(initialEventFormState);
    setOpenSlot(false);
  };

  const handleDatePickerClose = () => {
    setDatePickerEventFormData(initialDatePickerEventFormData);
    setOpenDatepickerModal(false);
  };

  const onAddEvent = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const data: IEventInfo = {
      ...eventFormData,
      _id: generateId(),
      start: currentEvent?.start,
      end: currentEvent?.end,
    };

    const newEvents = [...events, data];

    setEvents(newEvents);
    handleClose();
  };

  const onAddEventFromDatePicker = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const addHours = (date: Date | undefined, hours: number) => {
      return date ? date.setHours(date.getHours() + hours) : undefined;
    };

    const setMinToZero = (date: any) => {
      date.setSeconds(0);
      return date;
    };

    const data: IEventInfo = {
      ...datePickerEventFormData,
      _id: generateId(),
      start: setMinToZero(datePickerEventFormData.start),
      end: datePickerEventFormData.allDay
        ? addHours(datePickerEventFormData.start, 12)
        : setMinToZero(datePickerEventFormData.end),
    };

    const newEvents = [...events, data];

    setEvents(newEvents);
    setDatePickerEventFormData(initialDatePickerEventFormData);
  };

  const onDeleteEvent = () => {
    setEvents(() =>
      [...events].filter((e) => e._id !== (currentEvent as IEventInfo)._id!)
    );
    setEventInfoModal(false);
  };

  return (
    <Box
      mb={2}
      component="main"
      sx={{
        flexGrow: 1,
        py: 1,
      }}
    >
      <Container>
        <Card>
          <CardHeader title="" subheader="" />
          <CardContent>
            {/* Add the Legend component */}
            <Legend
              legendItems={ legendItems}
              onColorChange={handleLegendColorChange}
            />

            {/* Updated Button Layout */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              {/* <Button
                // onClick={() => setOpenTodoModal(true)}
                size="small"
                variant="contained"
              >
                Add Category
              </Button> */}
            </Box>
            <br />
            <AddEventModal
              open={openSlot}
              handleClose={handleClose}
              eventFormData={eventFormData}
              setEventFormData={setEventFormData}
              onAddEvent={onAddEvent}
            />
            <AddDatePickerEventModal
              open={openDatepickerModal}
              handleClose={handleDatePickerClose}
              datePickerEventFormData={datePickerEventFormData}
              setDatePickerEventFormData={setDatePickerEventFormData}
              onAddEvent={onAddEventFromDatePicker}
            />
            <EventInfoModal
              open={eventInfoModal}
              handleClose={() => setEventInfoModal(false)}
              onDeleteEvent={onDeleteEvent}
              currentEvent={currentEvent as IEventInfo}
            />
            {/* <AddTodoModal
              open={openTodoModal}
              handleClose={() => setOpenTodoModal(false)}
              todos={todos}
              setTodos={setTodos}
            /> */}
            <Calendar
              localizer={localizer}
              events={events}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              startAccessor="start"
              components={{ event: EventInfo }}
              endAccessor="end"
              defaultView="month"
              eventPropGetter={(event) => {
                return {
                  style: {
                    backgroundColor: event.color,
                    borderColor: event.color,
                  },
                };
              }}
              style={{
                height: 900,
                width: "100%",
              }}
            />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default EventCalendar;
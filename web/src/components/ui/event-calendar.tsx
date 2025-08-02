import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';


const localizer = momentLocalizer(moment);

// Define the type for an event
interface Event {
    start: Date;
    end: Date;
    title: string;
}

// Define the props type for CalendarComp
interface CalendarCompProps {
    events: Event[];
    setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
    className: string;
}



// function CalendarComp({ events, setEvents, className}: CalendarCompProps) {
function CalendarComp({className, events}: CalendarCompProps) {

    const handleEventClick = (event: Event) => {
        alert(`Event: ${event.title}\nStart: ${event.start}\nEnd: ${event.end}`);
        // You can also implement further logic here, like opening a modal to edit the event
    };

    return (
        <div className="h-screen">
            <Calendar
                className={className}
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                selectable
                onSelectEvent={handleEventClick}
            />
        </div>
    );
}

export default CalendarComp;


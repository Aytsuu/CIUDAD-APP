import CalendarPage from "@/pages/record/council/Calendar/CalendarPage"
import AddEvent from "@/pages/record/council/Calendar/AddEvent-Modal"

export const council_calendar_router = [
    {
        path: '/calendar-page',
        element: <CalendarPage/>
    },
    {
        path: '/add-event',
        element: <AddEvent/>
    }
]
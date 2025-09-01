import CalendarPage from "@/pages/record/council/Calendar/MainCalendarPage"
import AddEvent from "@/pages/record/council/Calendar/councilEventCreate"

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
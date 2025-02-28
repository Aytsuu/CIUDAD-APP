import CalendarPage from "@/pages/CalendarPage"
import AddEvent from "@/pages/AddEvent-Modal"

export const calendar_route = [
    {
        path: '/calendar-page',
        element: <CalendarPage/>
    },
    {
        path: '/add-event',
        element: <AddEvent/>
    }
]
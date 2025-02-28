import MinutesOfMeetingPage from "@/pages/record/council/MinutesOfMeeting/MinutesOfMeetingPage"
import AddMinutesOfMeeting from "@/pages/record/council/MinutesOfMeeting/addMinutesOfMeeting"
import UpdateMinutesOfMeeting from "@/pages/record/council/MinutesOfMeeting/updateMinutesOfMeeting"

export const mom_router = [
    {
        path: 'mom-page',
        element: <MinutesOfMeetingPage/>
    },
    {
        path: 'add-mom',
        element: <AddMinutesOfMeeting/>
    },
    {
        path: 'update-mom',
        element: <UpdateMinutesOfMeeting/>
    }
]
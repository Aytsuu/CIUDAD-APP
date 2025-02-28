import MinutesOfMeetingPage from "@/pages/records/council/MinutesOfMeeting/MinutesOfMeetingPage"
import AddMinutesOfMeeting from "@/pages/records/council/MinutesOfMeeting/addMinutesOfMeeting"
import UpdateMinutesOfMeeting from "@/pages/records/council/MinutesOfMeeting/updateMinutesOfMeeting"

export const mom_route = [
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
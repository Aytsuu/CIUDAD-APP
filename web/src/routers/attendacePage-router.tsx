import AttendancePage from "@/pages/record/council/Attendance/AttendancePage";
import AttendanceSheetView from "@/pages/record/council/Calendar/AttendanceSheetView";

export const attendance_router = [
    {
        path: '/attendance-page',
        element: <AttendancePage/>
    },
    {
        path: '/attendance-sheet',
        element: <AttendanceSheetView selectedAttendees={[]} date={""} activity={""} time={""} place={""}/>
    }
];
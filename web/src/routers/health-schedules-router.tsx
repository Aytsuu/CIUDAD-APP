import ScheduleRecords from "@/pages/healthServices/appointments/all-appointments";
import SchedulerMain from "@/pages/healthServices/scheduler/scheduler-main";

export const health_schedule_routes = [
	{
		path: '/services/scheduled/follow-ups',
		element: <ScheduleRecords />
	},
	{
		path: '/scheduler',
		element: <SchedulerMain />
	}
]
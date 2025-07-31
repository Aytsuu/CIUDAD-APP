import ScheduleRecords from "@/pages/healthServices/schedules/all-schedules";
import SchedulerMain from "@/pages/healthServices/schedules/scheduler-main";

export const health_schedule_routes = [
	{
		path: '/health-schedules',
		element: <ScheduleRecords />
	},
	{
		path: '/health-services/scheduler',
		element: <SchedulerMain />
	}
]
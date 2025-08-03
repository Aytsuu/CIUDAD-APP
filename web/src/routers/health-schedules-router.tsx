import ScheduleRecords from "@/pages/healthServices/appointments/all-appointments";
import SchedulerMain from "@/pages/healthServices/scheduler/scheduler-main";

export const health_schedule_routes = [
	{
		path: '/health-appointments',
		element: <ScheduleRecords />
	},
	{
		path: '/health-services/scheduler',
		element: <SchedulerMain />
	}
]
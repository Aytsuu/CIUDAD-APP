import ScheduleRecords from "@/pages/healthServices/appointments/all-appointments";
import SchedulerMain from "@/pages/healthServices/scheduler/scheduler-main";
import { ProtectedRoute } from "@/ProtectedRoutes";

export const health_schedule_routes = [
	{
		path: '/health-appointments',
		element: <ProtectedRoute requiredFeature="FOLLOW-UP VISITS">
			<ScheduleRecords />
		</ProtectedRoute>
	},
	{
		path: '/health-services/scheduler',
		element: <ProtectedRoute requiredFeature="SERVICE SCHEDULER">
			<SchedulerMain />
		</ProtectedRoute>
	}
]
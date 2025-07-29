import ScheduleDialog from "@/screens/health/admin/admin-scheduler/schedule-dialog"
import { WeeklySchedule } from "@/screens/health/admin/admin-scheduler/schedule-types"

// Define a defaultWeeklySchedule object according to the WeeklySchedule type
const defaultWeeklySchedule: WeeklySchedule = {
  // Fill with appropriate default values based on the WeeklySchedule structure
};


export default () => {

  return <ScheduleDialog weeklySchedule={defaultWeeklySchedule} weekDays={[]} services={[]} onSave={function (schedule: WeeklySchedule): void {
    throw new Error("Function not implemented.")
  } } onAddService={function (serviceName: string): void {
    throw new Error("Function not implemented.")
  } }/>
}
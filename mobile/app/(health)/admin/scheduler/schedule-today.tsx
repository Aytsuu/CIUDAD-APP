import TodayScheduleWidget from "@/screens/health/admin/admin-scheduler/schedule-today"


export default () => {
  
  return <TodayScheduleWidget onViewWeeklySchedule={function (): void {
    throw new Error("Function not implemented.")
  } }/>
}

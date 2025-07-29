import SchedulerMain from "@/screens/health/admin/admin-scheduler/schedule-main"

export default () => {
  return <SchedulerMain onGoBack={function (): void {
    throw new Error("Function not implemented.")
  } }/>

}
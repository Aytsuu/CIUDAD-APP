// Define the structure for individual service time slots
export interface ServiceTimeSlots {
	AM: boolean
	PM: boolean
 }
 
 // Define the structure for a single day's schedule
 export interface DailySchedule {
	[serviceName: string]: ServiceTimeSlots
 }
 
 // Define the structure for the entire weekly schedule
 export interface WeeklySchedule {
	[date: string]: DailySchedule // date in 'YYYY-MM-DD' format
 }
 
 // Define props for the form component
 export interface ServiceScheduleFormProps {
	initialSchedule: WeeklySchedule
	weekDays: Date[]
	services: string[]
	onSave: (schedule: WeeklySchedule) => void
	onAddService: (serviceName: string) => void
 }
 
 // Define props for the display component
 export interface ScheduleDisplayProps {
	schedule: WeeklySchedule
	weekDays: Date[]
	services: string[]
 }
 
 // Define props for the main schedule cards
 export interface ScheduleCardProps {
	day: Date
	dailySchedule: DailySchedule
	services: string[]
 }
 
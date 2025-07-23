"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import { enUS } from "date-fns/locale"

import ScheduleCard from "../schedules/schedule-card"
import ScheduleDialog from "../schedules/schedule-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card"
import type { WeeklySchedule, DailySchedule } from "../schedules/schedule-types"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"

export default function SchedulerMain() {
  const [services, setServices] = useState<string[]>([
    "Family Planning",
    "Prenatal",
    "Postpartum",
    "Child Immunization",
  ])
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({})
  const [weekDays, setWeekDays] = useState<Date[]>([])

  useEffect(() => {
    const today = new Date()
    const monday = startOfWeek(today, { weekStartsOn: 1, locale: enUS })
    const days: Date[] = []
    for (let i = 0; i < 5; i++) {
      days.push(addDays(monday, i))
    }
    setWeekDays(days)

    // Simulate fetching existing schedule data for the week
    const simulatedSchedule: WeeklySchedule = {}
    days.forEach((day) => {
      const formattedDate = format(day, "yyyy-MM-dd")
      const daily: DailySchedule = {}

      // Example: Pre-populate some services for specific days and times
      if (isSameDay(day, addDays(monday, 0))) {
        // Monday
        daily["Family Planning"] = { AM: true, PM: false }
        daily["Prenatal"] = { AM: false, PM: true }
      } else if (isSameDay(day, addDays(monday, 2))) {
        // Wednesday
        daily["Child Immunization"] = { AM: true, PM: true }
        daily["Postpartum"] = { AM: false, PM: true }
      }
      simulatedSchedule[formattedDate] = daily
    })
    setWeeklySchedule(simulatedSchedule)
  }, [])

  const handleSaveSchedule = (newSchedule: WeeklySchedule) => {
    setWeeklySchedule(newSchedule)
    console.log("Weekly schedule saved:", newSchedule)
    // In a real application, you would send `newSchedule` to your backend here
  }

  const handleAddService = (serviceName: string) => {
    if (!services.includes(serviceName)) {
      setServices((prev) => [...prev, serviceName])
      console.log("New service added:", serviceName)
      // In a real application, you would save the new service to your backend
    }
  }

  // const currentWeekStart = weekDays.length > 0 ? format(weekDays[0], "MMM d") : ""
  // const currentWeekEnd = weekDays.length > 0 ? format(weekDays[4], "MMM d, yyyy") : ""

  return (
	<LayoutWithBack
		title="Service Scheduler"
		description="Schedule services for the week"
	>
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="w-full flex mb-8 justify-end">
          
        </div>

		  {/* Services Overview */}
			<div className="mb-4">
				<Card className="flex">
					<div className="w-full">
						<CardHeader>
						<CardTitle>Available Services</CardTitle>
						<CardDescription>Current services that can be scheduled</CardDescription>
						</CardHeader>
						<CardContent>
						<div className="flex flex-wrap gap-2">
							{services.map((service) => (
								<span key={service} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
								{service}
								</span>
							))}
						</div>
						</CardContent>
					</div>
					
					<div className="w-full flex justify-end items-center">
						<div className="mr-5">
							<ScheduleDialog
								weeklySchedule={weeklySchedule}
								weekDays={weekDays}
								services={services}
								onSave={handleSaveSchedule}
								onAddService={handleAddService}
							/>
						</div>
					</div>
				</Card>
			</div>

        {/* Schedule Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weekDays.map((day) => {
            const formattedDate = format(day, "yyyy-MM-dd")
            const dailySchedule = weeklySchedule[formattedDate] || {}

            return <ScheduleCard key={formattedDate} day={day} dailySchedule={dailySchedule} services={services} />
          })}
        </div>

        
        
      </div>
    </main>
	 </LayoutWithBack>
  )
}

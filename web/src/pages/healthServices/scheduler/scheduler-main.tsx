"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, addDays } from "date-fns"
import { enUS } from "date-fns/locale"
import ScheduleCard from "../scheduler/schedule-card"
import ScheduleDialog from "../scheduler/schedule-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card"
import type { WeeklySchedule, DailySchedule } from "../scheduler/schedule-types"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { useGetServices, useGetScheduler } from "../scheduler/queries/schedulerFetchQueries"

export default function SchedulerMain() {
  // ✅ Fetch services from database instead of hardcoded values
  const { data: servicesData = []} = useGetServices()
  const { data: schedulersData = [] } = useGetScheduler()

  const [services, setServices] = useState<string[]>([])
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({})
  const [weekDays, setWeekDays] = useState<Date[]>([])

  // ✅ Update services state when data is fetched from database
  useEffect(() => {
    if (servicesData.length > 0) {
      const serviceNames = servicesData.map((service) => service.service_name)
      console.log("Setting services from database:", servicesData)
      setServices(serviceNames)
    }
  }, [servicesData])

  useEffect(() => {
    const today = new Date()
    const monday = startOfWeek(today, { weekStartsOn: 1, locale: enUS })
    const days: Date[] = []
    for (let i = 0; i < 5; i++) {
      days.push(addDays(monday, i))
    }
    setWeekDays(days)

    // build schedule from database data instead of simulated data
    if (schedulersData.length > 0) {
      // console.log("Building schedule from database:")
      // console.log("Schedulers data:", schedulersData)
      // console.log("Services data:", servicesData)

      const schedule: WeeklySchedule = {}

      days.forEach((day) => {
        const formattedDate = format(day, "yyyy-MM-dd")
        const dayName = format(day, "EEEE")
        const daily: DailySchedule = {}

        // Initialize all services with false values
        servicesData.forEach((service) => {
          daily[service.service_name] = { AM: false, PM: false }
        })

        // Set actual scheduled services from database
        schedulersData.forEach((scheduler) => {
          if (scheduler.day === dayName && daily[scheduler.service_name]) {
            daily[scheduler.service_name][scheduler.meridiem] = true
          }
        })

        schedule[formattedDate] = daily
      })

      setWeeklySchedule(schedule)
    } else {
      console.log("No schedulers data found")
    }
  }, [schedulersData, servicesData])


  const handleSaveSchedule = (newSchedule: WeeklySchedule) => {
    setWeeklySchedule(newSchedule)
    console.log("Weekly schedule saved:", newSchedule)
  }

  const handleAddService = (serviceName: string) => {
    if (!services.includes(serviceName)) {
      setServices((prev) => [...prev, serviceName])
      console.log("New service added:", serviceName)
    }
  }

  const handleAddDay = (newDay: Date) => {
    const newWeekDays = [...weekDays, newDay]
    setWeekDays(newWeekDays)

    // Initialize the new day in the schedule
    const formattedDate = format(newDay, "yyyy-MM-dd")
    const newDailySchedule: DailySchedule = {}

    services.forEach((serviceName) => {
      newDailySchedule[serviceName] = { AM: false, PM: false }
    })

    setWeeklySchedule((prev) => ({
      ...prev,
      [formattedDate]: newDailySchedule,
    }))
  }


  return (
    <LayoutWithBack title="Service Scheduler" description="Schedule services for the week">
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Services Overview */}
          <div className="mb-4">
            <Card className="flex">
              <div className="w-full">
                <CardHeader>
                  <CardTitle>Available Services</CardTitle>
                  <CardDescription>
                    Current services that can be scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service) => (
                      <span key={service} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                  {services.length === 0 && (
                    <div className="text-gray-500">No services found. Add some services to get started.</div>
                  )}
                </CardContent>
              </div>

              {/* schedule dialog */}
              <div className="w-full flex justify-end items-center">
                <div className="mr-5">
                  <ScheduleDialog
                    weeklySchedule={weeklySchedule}
                    weekDays={weekDays}
                    services={services}
                    onSave={handleSaveSchedule}
                    onAddService={handleAddService}
                    onAddDay={handleAddDay}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* schedule cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weekDays.map((day) => {
              const formattedDate = format(day, "yyyy-MM-dd")
              const dailySchedule = weeklySchedule[formattedDate] || {}
              return (
                <ScheduleCard 
                  key={formattedDate} 
                  day={day} 
                  dailySchedule={dailySchedule} 
                  services={services} />
                )
              })}
          </div>
        </div>
      </main>
    </LayoutWithBack>
  )
}

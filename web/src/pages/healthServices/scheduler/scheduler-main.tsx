"use client"

import { useState, useEffect } from "react"
import { format, startOfWeek, addDays, isSameDay } from "date-fns"
import { enUS } from "date-fns/locale"

import ScheduleCard from "../scheduler/schedule-card"
import ScheduleDialog from "../scheduler/schedule-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card"
import type { WeeklySchedule, DailySchedule } from "../scheduler/schedule-types"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { useGetUniqueServices, useGetServices } from "../scheduler/queries/schedulerFetchQueries"

export default function SchedulerMain() {
  // ✅ Fetch services from database instead of hardcoded values
  const { data: servicesFromDB = [], isLoading: servicesLoading, error: servicesError } = useGetUniqueServices()
  const { data: schedulersFromDB = [], isLoading: schedulersLoading } = useGetServices()
  
  const [services, setServices] = useState<string[]>([])
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({})
  const [weekDays, setWeekDays] = useState<Date[]>([])

  // ✅ Update services state when data is fetched from database
  useEffect(() => {
    if (servicesFromDB.length > 0) {
      console.log("Setting services from database:", servicesFromDB)
      setServices(servicesFromDB)
    }
  }, [servicesFromDB])

  useEffect(() => {
    const today = new Date()
    const monday = startOfWeek(today, { weekStartsOn: 1, locale: enUS })
    const days: Date[] = []
    for (let i = 0; i < 5; i++) {
      days.push(addDays(monday, i))
    }
    setWeekDays(days)

    // ✅ Build schedule from database data instead of simulated data
    if (schedulersFromDB.length > 0) {
      console.log("Building schedule from database:", schedulersFromDB)
      const scheduleFromDB: WeeklySchedule = {}
      
      days.forEach((day) => {
        const formattedDate = format(day, "yyyy-MM-dd")
        const daily: DailySchedule = {}
        
        // Initialize all services with false values
        servicesFromDB.forEach(serviceName => {
          daily[serviceName] = { AM: false, PM: false }
        })
        
        // Set actual scheduled services from database
        schedulersFromDB.forEach(scheduler => {
          if (daily[scheduler.service]) {
            daily[scheduler.service][scheduler.meridiem] = true
          }
        })
        
        scheduleFromDB[formattedDate] = daily
      })
      
      setWeeklySchedule(scheduleFromDB)
    } else {
      // ✅ Initialize empty schedule if no data from database
      const emptySchedule: WeeklySchedule = {}
      days.forEach((day) => {
        const formattedDate = format(day, "yyyy-MM-dd")
        const daily: DailySchedule = {}
        
        // Initialize all services with false values
        servicesFromDB.forEach(serviceName => {
          daily[serviceName] = { AM: false, PM: false }
        })
        
        emptySchedule[formattedDate] = daily
      })
      setWeeklySchedule(emptySchedule)
    }
  }, [schedulersFromDB, servicesFromDB])

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

  // ✅ Show loading state while fetching services
  if (servicesLoading || schedulersLoading) {
    return (
      <LayoutWithBack
        title="Service Scheduler"
        description="Schedule services for the week"
      >
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading services...</div>
            </div>
          </div>
        </main>
      </LayoutWithBack>
    )
  }

  // ✅ Show error state if services fetch fails
  if (servicesError) {
    return (
      <LayoutWithBack
        title="Service Scheduler"
        description="Schedule services for the week"
      >
        <main className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-red-600">
                Error loading services. Please try again later.
              </div>
            </div>
          </div>
        </main>
      </LayoutWithBack>
    )
  }

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
                  <CardDescription>
                    Current services that can be scheduled {/* ✅ Updated description */}
                    {services.length > 0 && `(${services.length} services loaded from database)`}
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
                  {/* ✅ Show message if no services */}
                  {services.length === 0 && (
                    <div className="text-gray-500">
                      No services found. Add some services to get started.
                    </div>
                  )}
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
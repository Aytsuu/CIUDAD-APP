"use client"

import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Badge } from "@/components/ui/badge"
import type { ScheduleCardProps, ServiceTimeSlots } from "../scheduler/schedule-types"

export default function ScheduleCard({ day, dailySchedule, services }: ScheduleCardProps) {
  const displayDate = format(day, "EEEE")
  const displayFullDate = format(day, "MMM d")

  const scheduledServices = services.filter((service) => {
    const serviceTimeSlots: ServiceTimeSlots = dailySchedule[service] || { AM: false, PM: false }
    return serviceTimeSlots.AM || serviceTimeSlots.PM
  })

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {displayDate}
          <span className="text-sm font-normal text-gray-500 ml-2">{displayFullDate}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {scheduledServices.length > 0 ? (
          <div className="space-y-2">
            {scheduledServices.map((service) => {
              const serviceTimeSlots: ServiceTimeSlots = dailySchedule[service] || { AM: false, PM: false }
              const activeSlots: string[] = []
              if (serviceTimeSlots.AM) activeSlots.push("AM")
              if (serviceTimeSlots.PM) activeSlots.push("PM")

              return (
                <div key={service} className="flex flex-col gap-1">
                  <span className="text-sm font-medium">{service}</span>
                  <div className="flex gap-1">
                    {activeSlots.map((slot) => (
                      <Badge key={slot} variant="secondary" className="text-xs">
                        {slot}
                      </Badge>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No services scheduled</p>
        )}
      </CardContent>
    </Card>
  )
}

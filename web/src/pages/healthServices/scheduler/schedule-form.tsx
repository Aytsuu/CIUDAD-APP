"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import type { ServiceScheduleFormProps, WeeklySchedule, DailySchedule, ServiceTimeSlots } from "../scheduler/schedule-types"

export default function ServiceScheduleForm({
  initialSchedule,
  weekDays,
  services,
  onSave,
  onAddService,
}: ServiceScheduleFormProps) {
  const [currentWeeklySchedule, setCurrentWeeklySchedule] = useState<WeeklySchedule>(initialSchedule)
  const [newServiceName, setNewServiceName] = useState("")
  const [isAddingService, setIsAddingService] = useState(false)

  // Update internal state if initialSchedule prop changes
  useEffect(() => {
    setCurrentWeeklySchedule(initialSchedule)
  }, [initialSchedule])

  const handleServiceToggle = (
    date: string,
    serviceName: string,
    timeSlot: keyof ServiceTimeSlots,
    checked: boolean,
  ) => {
    setCurrentWeeklySchedule((prevSchedule) => {
      const prevDailySchedule: DailySchedule = prevSchedule[date] || {}
      const prevServiceTimeSlots: ServiceTimeSlots = prevDailySchedule[serviceName] || { AM: false, PM: false }

      const updatedServiceTimeSlots: ServiceTimeSlots = {
        ...prevServiceTimeSlots,
        [timeSlot]: checked,
      }

      const updatedDailySchedule: DailySchedule = {
        ...prevDailySchedule,
        [serviceName]: updatedServiceTimeSlots,
      }

      return {
        ...prevSchedule,
        [date]: updatedDailySchedule,
      }
    })
  }

  const handleAddService = () => {
    if (newServiceName.trim() && !services.includes(newServiceName.trim())) {
      onAddService(newServiceName.trim())
      setNewServiceName("")
      setIsAddingService(false)
    }
  }

  const handleSave = () => {
    onSave(currentWeeklySchedule)
  }

  return (
    <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
      <CardHeader>
        <CardTitle>Weekly Service Schedule Editor</CardTitle>
        <CardDescription>Manage service availability for Monday to Friday, including AM/PM slots.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        {/* Add Service Section */}
        <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
          {isAddingService ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                placeholder="Enter new service name"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddService()}
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddService} disabled={!newServiceName.trim()}>
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAddingService(false)
                  setNewServiceName("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setIsAddingService(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Service
            </Button>
          )}
        </div>

        {/* Schedule Grid */}
        {weekDays.map((day, index) => {
          const formattedDate = format(day, "yyyy-MM-dd")
          const displayDate = format(day, "EEEE, MMM d")
          const currentDaySchedule: DailySchedule = currentWeeklySchedule[formattedDate] || {}

          return (
            <div key={formattedDate}>
              <h3 className="text-lg font-semibold mb-3">{displayDate}</h3>
              <div className="grid gap-3">
                {services.map((service) => {
                  const serviceTimeSlots: ServiceTimeSlots = currentDaySchedule[service] || { AM: false, PM: false }
                  return (
                    <div key={`${formattedDate}-${service}`} className="flex flex-col gap-2">
                      <Label className="text-base font-medium">{service}</Label>
                      <div className="flex items-center justify-between pl-4">
                        <Label htmlFor={`${formattedDate}-${service}-am`} className="text-sm text-gray-600">
                          AM
                        </Label>
                        <Switch
                          id={`${formattedDate}-${service}-am`}
                          checked={serviceTimeSlots.AM}
                          onCheckedChange={(checked) => handleServiceToggle(formattedDate, service, "AM", checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between pl-4">
                        <Label htmlFor={`${formattedDate}-${service}-pm`} className="text-sm text-gray-600">
                          PM
                        </Label>
                        <Switch
                          id={`${formattedDate}-${service}-pm`}
                          checked={serviceTimeSlots.PM}
                          onCheckedChange={(checked) => handleServiceToggle(formattedDate, service, "PM", checked)}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
              {index < weekDays.length - 1 && <Separator className="my-6" />}
            </div>
          )
        })}

        <Button onClick={handleSave} className="w-full mt-4">
          Save Weekly Schedule
        </Button>
      </CardContent>
    </Card>
  )
}

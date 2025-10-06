"use client"

import { useEffect, useState } from "react"
import { Plus, X, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"

import type {
  ServiceScheduleFormProps,
  WeeklySchedule,
  DailySchedule,
  ServiceTimeSlots,
} from "../scheduler/schedule-types"

import { useAddScheduler, useAddService, useAddDay } from "../scheduler/queries/schedulerAddQueries"
import { useGetServices, useGetDays } from "./queries/schedulerFetchQueries"
import { useDeleteService, useDeleteDay } from "./queries/schedulerDeleteQueries"


// Define the ServiceScheduleForm component
export default function ServiceScheduleForm({
  initialSchedule,
  weekDays,
  services: initialServices,
  onSave,
  onAddService,
}: ServiceScheduleFormProps & { onAddDay?: (newDay: Date) => void }) {

  
  // fetch services and days
  const { data: servicesData } = useGetServices()
  const { data: daysData } = useGetDays()

  const [currentWeeklySchedule, setCurrentWeeklySchedule] = useState<WeeklySchedule>(initialSchedule)
  const [days, setDays] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>(initialServices || [])
  const [newServiceName, setNewServiceName] = useState("")
  const [isAddingService, setIsAddingService] = useState(false)
  const [isAddingDay, setIsAddingDay] = useState(false)

  // mutation hook
  const addServiceMutation = useAddService()
  const addDayMutation = useAddDay()
  const addSchedulerMutation = useAddScheduler()

  const deleteServiceMutation = useDeleteService()
  const deleteDayMutation = useDeleteDay()

  const sortDaysInWeekOrder = (dayNames: string[]): string[] => {
    const weekDaysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return dayNames.sort((a, b) => {
      const indexA = weekDaysOrder.indexOf(a)
      const indexB = weekDaysOrder.indexOf(b)

      if(indexA === -1 || indexB === -1) return a.localeCompare(b)
      if(indexA === -1) return 1
      if(indexB === -1) return -1

      return indexA - indexB
    })
  }

  const getNextAvailableDay = (): string => {
    const weekDaysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    for(const day of weekDaysOrder) {
      if(!days.includes(day)) {
        return day
      }
    }

    return `Day ${days.length + 1}` 
  }
  
  // update fetched services
  useEffect(() => {
    if (servicesData && servicesData.length > 0) {
      const serviceNames = servicesData.map(service => service.service_name)
      setServices(serviceNames)
    }
  }, [servicesData])

  // update fetched days
  useEffect(() => {
    if(daysData && daysData.length > 0) {
      const dayNames = daysData.map(day => day.day)
      const sortedDays = sortDaysInWeekOrder(dayNames)
      setDays(sortedDays)
    }
  }, [daysData])

  // update internal state if initialSchedule prop changes
  useEffect(() => {
    setCurrentWeeklySchedule(initialSchedule)
  }, [initialSchedule])

  const handleServiceToggle = (
    dayName: string,
    serviceName: string,
    timeSlot: keyof ServiceTimeSlots,
    checked: boolean,
  ) => {
    setCurrentWeeklySchedule((prevSchedule) => {
      const prevDailySchedule: DailySchedule = prevSchedule[dayName] || {}
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
        [dayName]: updatedDailySchedule,
      }
    })
  }

  // add service
  const handleAddService = async () => {
    if (newServiceName.trim() && !services.includes(newServiceName.trim())) {
      try {
        await addServiceMutation.mutateAsync({ service_name: newServiceName.trim() })
        
        setNewServiceName("")
        setIsAddingService(false)
        onAddService(newServiceName.trim())

      } catch (error) {
        console.error("Error adding service: ", error)
      }
    }
  }

  // remove service
  const handleRemoveService = async (service: string) => {
    try {
        const serviceObj = servicesData?.find(s => s.service_name === service)
        if (!serviceObj) {
          console.error("Service not found: ", service)
          return
        }

        await deleteServiceMutation.mutateAsync(serviceObj.service_id)

        setServices(prev => prev.filter(service => service !== service))
        
        // Remove from schedule state if it exists
        setCurrentWeeklySchedule(prev => {
          const updatedSchedule = { ...prev }
          Object.keys(updatedSchedule).forEach(day => {
            if (updatedSchedule[day][service]) {
              delete updatedSchedule[day][serviceObj.service_id]
            }
          })
          return updatedSchedule
        })
        
        console.log(`Removed service: ${service}`)
    } catch (error) {
      console.error("Error removing service:", error)
    }
  }

  // add day
  const handleAddDay = async () => {
    if (weekDays.length >= 7) {
      return
    }

    const nextDay = getNextAvailableDay()

    try {
      await addDayMutation.mutateAsync({day: nextDay, day_description: `${nextDay} Schedule`})

      console.log("Successfully added day: ", nextDay)
    } catch (error) {
      console.error("Error adding day: ", error)
    }
  }

  // remove day
  const handleRemoveDay = async (day: string) => {
  try {
    const dayObj = daysData?.find(d => d.day === day)

    if (!dayObj) {
          console.error("Day not found: ", day)
          return
        }
    
      await deleteDayMutation.mutateAsync(dayObj.day_id)

    setDays(prev => prev.filter(day => day !== day))
    
    setCurrentWeeklySchedule(prev => {
      const updatedSchedule = { ...prev }
      if (updatedSchedule[day]) {
        delete updatedSchedule[day][dayObj.day_id]
      }
      return updatedSchedule
    })
    
    console.log(`Removed day: ${day}`)
  } catch (error) {
    console.error("Error removing day:", error)
  }
}

  // updated handleSave to create individual scheduler entries using your API
  const handleSave = async () => {
    try {
      console.log("Saving weekly schedule: ", currentWeeklySchedule);

      const schedulerEntries = [];
      for (const dayName of days) {
        const dailySchedule = currentWeeklySchedule[dayName] || {};

        for (const [serviceName, timeSlots] of Object.entries(dailySchedule)) {
          if(timeSlots.AM) {
            schedulerEntries.push({
              service_name: serviceName,
              day: dayName,
              meridiem: "AM" as const,
            })
          }
          if(timeSlots.PM) {
            schedulerEntries.push({
              service_name: serviceName,
              day: dayName,
              meridiem: "PM" as const,
            })
          }
        }
      }
      console.log('Scheduler entries to create: ', schedulerEntries)

      const createdEntries = []
      for (const entry of schedulerEntries) {
        const result = await addSchedulerMutation.mutateAsync(entry)
        createdEntries.push(result)
      }
      console.log("Created scheduler entries: ", createdEntries);

      onSave(currentWeeklySchedule)
    } catch (error){ 
      console.error("Error saving schedule: ", error)
    }
  }


  return (
    <Card className="w-full max-w-6xl max-h-[80vh] overflow-y-auto">
      <CardHeader>
        <CardTitle>Weekly Service Schedule Editor</CardTitle>
        <CardDescription>Manage service availability and add new services or days as needed.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Add Service Section */}
          <div className="border grid grid-rows-2 items-center gap-2 px-4 bg-gray-50 rounded-lg">
            <div className="border border-black/30 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 min-w-0">
                <Plus className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Add Service:</span>
              </div>
              {isAddingService ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    placeholder="Enter service name"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddService()}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAddService} disabled={!newServiceName.trim() || addServiceMutation.isPending}>
                    {addServiceMutation.isPending ? "Adding..." : "Add"}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingService(true)}
                  className="flex items-center gap-2"
                >
                  Add New Service
                </Button>
              )}
            </div>

            <div className="flex-1">
              <div className="text-sm text-gray-500 pb-3">
                {services.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium">Active Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {services.map((service) => (
                        <div 
                          key={service} 
                          className="group flex items-center gap-2 border border-blue-200 rounded-lg px-3 py-1.5 bg-blue-50 hover:bg-blue-100 transition-all duration-200"
                        >
                          <span className="text-blue-800 text-sm font-medium">{service}</span>
                          <button 
                            onClick={() => handleRemoveService(service)}
                            className="text-blue-400 hover:text-red-500 opacity-70 group-hover:opacity-100 transition-all duration-200"
                            title={`Remove ${service}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                    <span className="text-gray-400">No services available. Please add a service.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Day Section */}
          <div className="border grid grid-rows-2 items-center gap-2 px-4 bg-gray-50 rounded-lg">
            <div className="border border-black/30 flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 min-w-0">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="whitespace-nowrap">Add Day:</span>
              </div>
              {isAddingDay ? (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-gray-600 flex-1">
                    <Input
                      type="text"
                      value={getNextAvailableDay()}
                      className="bg-gray-100 text-gray-700 cursor-default"
                    />
                  </span>
                  <Button size="sm" onClick={handleAddDay} disabled={days.length >= 7 || addDayMutation.isPending}>
                    {addDayMutation.isPending ? "Adding..." : "Add Day"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsAddingDay(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingDay(true)}
                  disabled={weekDays.length >= 7}
                  className="flex items-center gap-2"
                >
                  Add New Day
                  {weekDays.length >= 7 && " (Max 7)"}
                </Button>
              )}
            </div>

            <div className="flex-1">
              <div className="text-sm text-gray-500 pb-3">
                {days.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 font-medium">Active Days:</p>
                    <div className="flex flex-wrap gap-2">
                      {days.map((day) => (
                        <div 
                          key={day} 
                          className="group flex items-center gap-2 border border-green-200 rounded-lg px-3 py-1.5 bg-green-50 hover:bg-green-100 transition-all duration-200"
                        >
                          <span className="text-green-800 text-sm font-medium">{day}</span>
                          <button 
                            onClick={() => handleRemoveDay(day)}
                            className="text-green-400 hover:text-red-500 opacity-70 group-hover:opacity-100 transition-all duration-200"
                            title={`Remove ${day}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed border-gray-300 rounded-lg">
                    <span className="text-gray-400">No days available. Please add a day.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {days.map((dayName) => {
            const currentDaySchedule: DailySchedule = currentWeeklySchedule[dayName] || {}

            return (
              <div key={dayName} className="border rounded-lg p-4 bg-white">
                <h3 className="border rounded-md p-1 text-lg text-center font-semibold mb-5">{dayName}</h3>
                <div className="grid gap-3">
                  {services.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 py-4">
                      No services available. Please add a service to manage the schedule.
                    </div>
                  ) : (
                    services.map((service) => {
                      const serviceTimeSlots: ServiceTimeSlots = currentDaySchedule[service] || { AM: false, PM: false }

                      return (
                        <div key={`${dayName}-${service}`} className="grid grid-cols-2 p-1 gap-2">
                          <Label className=" text-base font-medium ">{service}</Label>
                          <div className="flex items-center gap-4 pl-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`${dayName}-${service}-am`}
                                checked={serviceTimeSlots.AM}
                                onCheckedChange={(checked) =>
                                  handleServiceToggle(dayName, service, "AM", checked as boolean)
                                }
                              />
                              <Label htmlFor={`${dayName}-${service}-am`} className="text-sm text-gray-600">
                                AM
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`${dayName}-${service}-pm`}
                                checked={serviceTimeSlots.PM}
                                onCheckedChange={(checked) =>
                                  handleServiceToggle(dayName, service, "PM", checked as boolean)
                                }
                              />
                              <Label htmlFor={`${dayName}-${service}-pm`} className="text-sm text-gray-600">
                                PM
                              </Label>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {days.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No days available. Add some days to get started.</p>
          </div>
        )}

        <Button onClick={handleSave} className="w-full mt-4" disabled={addSchedulerMutation.isPending}>
          {addSchedulerMutation.isPending ? "Saving Schedule..." : "Save Weekly Schedule"}
        </Button>
      </CardContent>
    </Card>
  )
}

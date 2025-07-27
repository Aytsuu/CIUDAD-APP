"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog/dialog"
import { Button } from "@/components/ui/button/button"
import { Edit } from "lucide-react"
import ServiceScheduleForm from "../scheduler/schedule-form"
import type { WeeklySchedule } from "../scheduler/schedule-types"

interface ScheduleDialogProps {
  weeklySchedule: WeeklySchedule
  weekDays: Date[]
  services: string[]
  onSave: (schedule: WeeklySchedule) => void
  onAddService: (serviceName: string) => void
}

export default function ScheduleDialog({
  weeklySchedule,
  weekDays,
  services,
  onSave,
  onAddService,
}: ScheduleDialogProps) {
  const handleSave = (newSchedule: WeeklySchedule) => {
    onSave(newSchedule)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit Schedule
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Edit Weekly Schedule</DialogTitle>
          <DialogDescription>Update your service availability for the week.</DialogDescription>
        </DialogHeader>
        <ServiceScheduleForm
          initialSchedule={weeklySchedule}
          weekDays={weekDays}
          services={services}
          onSave={handleSave}
          onAddService={onAddService}
        />
      </DialogContent>
    </Dialog>
  )
}

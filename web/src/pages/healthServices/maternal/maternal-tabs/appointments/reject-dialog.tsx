"use client"

import { useState } from "react"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import { Button } from "@/components/ui/button/button"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface RejectAppointmentDialogProps {
  patientName: string
  onReject: (reason: string) => void
  isLoading?: boolean
}

export default function RejectAppointmentDialog({
  patientName,
  onReject,
  isLoading = false,
}: RejectAppointmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  const handleReject = () => {
    if (!reason.trim()) {
      setError("Rejection reason is required")
      return
    }
    
    onReject(reason)
    setReason("")
    setError("")
    setIsOpen(false)
  }

  const handleCancel = () => {
    setReason("")
    setError("")
    setIsOpen(false)
  }

  return (
    <DialogLayout
      trigger={
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-3 text-xs bg-red-600 text-white hover:bg-red-700 hover:text-white"
          onClick={() => setIsOpen(true)}
        >
          <X className="h-3.5 w-3.5" />
          Reject
        </Button>
      }
      title="Reject Appointment Request"
      description={
        <div className="text-sm text-muted-foreground">
          You are about to reject the appointment request for <span className="font-semibold">{patientName}</span>.
          Please provide a reason for the rejection.
        </div>
      }
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      className="max-w-md"
      mainContent={
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="reason"
              placeholder="e.g., Requested time slot not available, Staff unavailable, etc."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                setError("")
              }}
              rows={4}
              className={error ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading || !reason.trim()}
            >
              {isLoading ? "Rejecting..." : "Submit"}
            </Button>
          </div>
        </div>
      }
    />
  )
}

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface BeforeUnloadDialogProps {
  hasUnsavedChanges: boolean
  onConfirmLeave?: () => void
  onCancelLeave?: () => void
}

export interface BeforeUnloadDialogRef {
  confirmNavigation: (callback: () => void) => boolean
}

export const BeforeUnloadDialog = React.forwardRef<BeforeUnloadDialogRef, BeforeUnloadDialogProps>(
  ({ hasUnsavedChanges, onConfirmLeave, onCancelLeave }, ref) => {
  const [showDialog, setShowDialog] = React.useState(false)
  const [pendingNavigation, setPendingNavigation] = React.useState<(() => void) | null>(null)
  const [preventDialogs, setPreventDialogs] = React.useState(false)

  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !preventDialogs) {
        event.preventDefault()
        event.returnValue = "Changes you made may not be saved."
        return "Changes you made may not be saved."
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges, preventDialogs])

  const confirmNavigation = React.useCallback(
    (callback: () => void) => {
      if (hasUnsavedChanges && !preventDialogs) {
        setPendingNavigation(() => callback)
        setShowDialog(true)
        return false
      }
      callback()
      return true
    },
    [hasUnsavedChanges, preventDialogs],
  )

  const handleConfirmLeave = () => {
    setShowDialog(false)
    if (pendingNavigation) {
      pendingNavigation()
      setPendingNavigation(null)
    }
    onConfirmLeave?.()
  }

  const handleCancelLeave = () => {
    setShowDialog(false)
    setPendingNavigation(null)
    onCancelLeave?.()
  }

  React.useImperativeHandle(ref, () => ({
    confirmNavigation,
  }))

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="max-w-sm bg-gray-800 border-gray-700 text-white [&>button]:hidden">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-white text-base font-medium">Leave site?</DialogTitle>
          <DialogDescription className="text-gray-300 text-sm">Changes you made may not be saved.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-2">
          <Checkbox
            id="prevent-dialogs"
            checked={preventDialogs}
            onCheckedChange={(checked) => setPreventDialogs(checked === true)}
            className="border-gray-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <label htmlFor="prevent-dialogs" className="text-sm text-gray-300 cursor-pointer">
            Prevent this page from creating additional dialogs
          </label>
        </div>

        <DialogFooter className="flex-row justify-end space-x-2 space-y-0">
          <Button
            variant="secondary"
            onClick={handleCancelLeave}
            className="bg-gray-600 hover:bg-gray-500 text-white border-gray-500"
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmLeave} className="bg-blue-600 hover:bg-blue-700 text-white">
            Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

BeforeUnloadDialog.displayName = "BeforeUnloadDialog"

export function useBeforeUnload(hasUnsavedChanges: boolean) {
  const [showDialog, setShowDialog] = React.useState(false)
  const [pendingNavigation, setPendingNavigation] = React.useState<(() => void) | null>(null)
  const [preventDialogs, setPreventDialogs] = React.useState(false)

  React.useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !preventDialogs) {
        event.preventDefault()
        event.returnValue = "Changes you made may not be saved."
        return "Changes you made may not be saved."
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasUnsavedChanges, preventDialogs])

  const confirmNavigation = React.useCallback(
    (callback: () => void) => {
      if (hasUnsavedChanges && !preventDialogs) {
        setPendingNavigation(() => callback)
        setShowDialog(true)
        return false
      }
      callback()
      return true
    },
    [hasUnsavedChanges, preventDialogs],
  )

  const handleConfirmLeave = () => {
    setShowDialog(false)
    if (pendingNavigation) {
      pendingNavigation()
      setPendingNavigation(null)
    }
  }

  const handleCancelLeave = () => {
    setShowDialog(false)
    setPendingNavigation(null)
  }

  return {
    showDialog,
    confirmNavigation,
    handleConfirmLeave,
    handleCancelLeave,
    preventDialogs,
    setPreventDialogs: (checked: boolean) => setPreventDialogs(checked),
  }
}

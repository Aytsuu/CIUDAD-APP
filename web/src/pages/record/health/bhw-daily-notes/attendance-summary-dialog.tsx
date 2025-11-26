"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { useForm } from "react-hook-form"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button/button"
import { Form } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { Separator } from "@/components/ui/separator"
import { showErrorToast } from "@/components/ui/toast"
import { useCreateBHWAttendanceSummary } from "./queries/Add"
import { useMaternalStaff } from "@/pages/healthServices/maternal/queries/maternalFetchQueries"

// Optional number schema that allows empty strings
const optionalPositiveNumber = z.union([
   z.string().transform(val => val === "" ? undefined : parseFloat(val)),
   z.number(),
   z.undefined()
]).optional().refine(
   val => val === undefined || val === null || (typeof val === 'number' && val >= 0),
   { message: "Value must be a positive number" }
)

const AttendanceSummarySchema = z.object({
   numOfWorkingDays: optionalPositiveNumber,
   daysPresent: optionalPositiveNumber,
   daysAbsent: optionalPositiveNumber,
   notedBy: z.string().min(1, "Noted By is required"),
   approvedBy: z.string().min(1, "Approved By is required"),
})

interface AttendanceSummaryDialogProps {
   staffId?: string
   children?: React.ReactNode
}

export function AttendanceSummaryDialog({ staffId, children }: AttendanceSummaryDialogProps) {
   const [open, setOpen] = useState(false)
   const createAttendanceMutation = useCreateBHWAttendanceSummary()
   const { data: staffData, isLoading: isLoadingStaff } = useMaternalStaff()

   // Extract staff array from API response
   const staffList: any[] = Array.isArray((staffData as any)?.staff)
      ? (staffData as any).staff
      : []

   // Debug log
   useEffect(() => {
      if (staffData) {
         console.log("Staff data loaded:", staffData)
         console.log("Staff list:", staffList)
      }
   }, [staffData, staffList])

   // Find staff by position field
   const midwife = staffList.find((staff: any) => staff.position === "ADMIN")
   const doctor = staffList.find((staff: any) => staff.position === "DOCTOR")

   // Debug log for found staff
   useEffect(() => {
      console.log("Found midwife:", midwife)
      console.log("Found doctor:", doctor)
   }, [midwife, doctor])

   const form = useForm<z.infer<typeof AttendanceSummarySchema>>({
      resolver: zodResolver(AttendanceSummarySchema),
      defaultValues: {
         numOfWorkingDays: undefined,
         daysPresent: undefined,
         daysAbsent: undefined,
         notedBy: midwife?.full_name || "",
         approvedBy: doctor?.full_name || "",
      },
   })

   // Update default values when staff data loads
   useEffect(() => {
      const newDefaults = {
         numOfWorkingDays: undefined,
         daysPresent: undefined,
         daysAbsent: undefined,
         notedBy: midwife?.full_name || "",
         approvedBy: doctor?.full_name || "",
      }
      
      form.reset(newDefaults)
   }, [midwife?.full_name, doctor?.full_name, form])

   const handleSubmit = async (data: z.infer<typeof AttendanceSummarySchema>) => {
      try {
         console.log("Submitting Attendance Summary for staff:", staffId)
         console.log("Attendance data:", data)
         
         const payload = {
            staffId: staffId || "",
            ...data
         };
         
         console.log("Full payload being sent:", payload)
         
         await createAttendanceMutation.mutateAsync(payload as any)
         
         setOpen(false)
         form.reset()
      } catch (error: any) {
         console.error("Failed to submit attendance summary:", error)
         console.error("Error response:", error?.response?.data)
         showErrorToast(error?.response?.data?.detail || error?.response?.data?.error || "Failed to submit attendance summary")
      }
   }

   const handleFormError = (errors: any) => {
      console.log("Form validation errors:", errors)
      
      const firstError = Object.values(errors)[0] as any
      if (firstError?.message) {
         showErrorToast(firstError.message)
      }
   }

   return (
      <AlertDialog open={open} onOpenChange={setOpen}>
         <AlertDialogTrigger asChild>
            {children || <Button variant="outline">Attendance Summary</Button>}
         </AlertDialogTrigger>
         <AlertDialogContent className="max-w-3xl">
            <AlertDialogHeader>
               <AlertDialogTitle>Attendance Summary</AlertDialogTitle>
               <AlertDialogDescription>
                  Fill up the attendance summary for the reporting period
               </AlertDialogDescription>
            </AlertDialogHeader>
            
            <Form {...form}>
               <form onSubmit={form.handleSubmit(handleSubmit, handleFormError)}>
                  <div className="space-y-4">
                     <Separator />
                     
                     <div className="grid grid-cols-3 gap-4">
                        <FormInput
                           control={form.control}
                           label="Number of Working Days"
                           placeholder="Enter number of working days"
                           name="numOfWorkingDays"
                           type="number"
                        />
                        <FormInput
                           control={form.control}
                           label="Days Present"
                           placeholder="Enter days present"
                           name="daysPresent"
                           type="number"
                        />
                        <FormInput
                           control={form.control}
                           label="Days Absent"
                           placeholder="Enter days absent"
                           name="daysAbsent"
                           type="number"
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <FormInput
                           control={form.control}
                           label="Noted By"
                           placeholder="Noted By"
                           name="notedBy"
                           type="text"
                        />
                        <FormInput
                           control={form.control}
                           label="Approved By"
                           placeholder="Approved By"
                           name="approvedBy"
                           type="text"
                        />
                     </div>

                     <div className="flex justify-end gap-2 pt-4">
                        <Button
                           type="button"
                           variant="outline"
                           onClick={() => {
                              setOpen(false)
                              form.reset()
                           }}
                        >
                           Cancel
                        </Button>
                        <Button 
                           type="submit" 
                           disabled={createAttendanceMutation.isPending || isLoadingStaff}
                        >
                           {createAttendanceMutation.isPending ? "Submitting..." : "Submit"}
                        </Button>
                     </div>
                  </div>
               </form>
            </Form>
         </AlertDialogContent>
      </AlertDialog>
   )
}

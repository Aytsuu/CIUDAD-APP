"use client"

import { Button } from "@/components/ui/button/button"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Form } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import AnnouncementCreateSchema from "@/form-schema/Announcement/announcement-create"
import { toast } from "sonner"
import { CircleCheck, Calendar, FileText, Tag, Clock, Save, X, AlertCircle } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useAddAnnouncement } from "./queries/announcementAddQueries"

interface AnnouncementCreateFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

function AnnouncementCreateForm({ onSuccess, onCancel }: AnnouncementCreateFormProps) {
  const form = useForm<z.infer<typeof AnnouncementCreateSchema>>({
    resolver: zodResolver(AnnouncementCreateSchema),
    defaultValues: {
      ann_title: "",
      ann_details: "",
      ann_start_at: new Date().toISOString().split("T")[0],
      ann_end_at: new Date().toISOString().split("T")[0],
      ann_type: "General",
    },
  })

  const { mutate: addAnnouncement, isPending } = useAddAnnouncement()

  const onSubmit = (values: z.infer<typeof AnnouncementCreateSchema>) => {
    const toastId = toast.loading("Creating announcement...", {
      duration: Number.POSITIVE_INFINITY,
    })

    const payload = {
      ...values,
      ann_created_at: values.ann_created_at ? new Date(values.ann_created_at) : new Date(),
      ann_start_at: values.ann_start_at ? new Date(values.ann_start_at) : new Date(),
      ann_end_at: values.ann_end_at ? new Date(values.ann_end_at) : new Date(),
    }

    addAnnouncement(payload, {
      onSuccess: () => {
        toast.success("Announcement created successfully!", {
          id: toastId,
          icon: <CircleCheck size={20} className="fill-green-500 stroke-white" />,
          duration: 2000,
          onAutoClose: () => {
            if (onSuccess) onSuccess()
          },
        })
        form.reset()
      },
      onError: (error) => {
        toast.error("Failed to create announcement. Please try again.", {
          id: toastId,
          duration: 3000,
        })
        console.error("Error creating announcement:", error)
      },
    })
  }

  const selectedType = form.watch("ann_type")

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "urgent":
        return "bg-red-50 text-red-700 border-red-200"
      case "important":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "general":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create New Announcement</h2>
            <p className="text-sm text-gray-600">Fill in the details to create a new announcement</p>
          </div>
        </div>
        <Separator />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>

            <FormInput
              control={form.control}
              name="ann_title"
              label="Announcement Title"
              placeholder="Enter a clear and descriptive title"
              readOnly={false}
            />

            <FormInput
              control={form.control}
              name="ann_details"
              label="Announcement Details"
              placeholder="Provide detailed information about the announcement"
              readOnly={false}
              className="min-h-[100px]"
            />

            <div className="space-y-3">
              <FormSelect
                control={form.control}
                name="ann_type"
                label="Announcement Type"
                options={[
                  { id: "General", name: "General" },
                  { id: "Important", name: "Important" },
                  { id: "Urgent", name: "Urgent" },
                ]}
                readOnly={false}
              />
              {selectedType && (
                <div className="flex items-center gap-3 pl-1">
                  <Badge variant="outline" className={`${getTypeColor(selectedType)} border`}>
                    <Tag className="h-3 w-3 mr-1" />
                    {selectedType}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    {selectedType === "Urgent" && "High priority - requires immediate attention"}
                    {selectedType === "Important" && "Medium priority - should be noticed"}
                    {selectedType === "General" && "Standard announcement"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Schedule Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormDateTimeInput
                control={form.control}
                name="ann_start_at"
                label="Start Date"
                readOnly={false}
                type="date"
              />

              <FormDateTimeInput
                control={form.control}
                name="ann_end_at"
                label="End Date"
                readOnly={false}
                type="date"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Schedule Information</p>
                  <p className="text-blue-700">
                    The announcement will be active from the start date until the end date. Make sure the dates are
                    correct before saving.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Errors */}
          {form.formState.errors && Object.keys(form.formState.errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-900 mb-2">Please fix the following errors:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    {Object.entries(form.formState.errors).map(([field, error]) => (
                      <li key={field} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 bg-red-500 rounded-full flex-shrink-0" />
                        {error?.message}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isPending}
              className="flex items-center gap-2 sm:order-1"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue hover:bg-blue/90 flex items-center gap-2 sm:order-2 sm:ml-auto"
            >
              {isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Announcement
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default AnnouncementCreateForm


import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Form } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import AnnouncementSchema from "@/form-schema/Announcement/announcementschema"
import { useGetAnnouncement, useGetAnnouncementRecipient } from "./queries/announcementFetchQueries"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Megaphone, FileText, Calendar, Users, Clock, Eye } from "lucide-react"

type AnnouncementViewProps = {
  ann_id: number
}

function AnnouncementView({ ann_id }: AnnouncementViewProps) {
  const [isEditing] = useState(false)
  const { data: announcements } = useGetAnnouncement()
  const { data: recipients } = useGetAnnouncementRecipient()

  const announcement = announcements?.find((a) => a.ann_id === ann_id)
  const matchingRecipients = recipients?.filter((r) => r.ann === ann_id) || []

  // Use first matching recipient (or blank if none)
  const firstRecipient = matchingRecipients.length > 0 ? matchingRecipients[0] : null

  const formatDateTimeLocal = (value: string | Date) => {
    const date = new Date(value)
    return date.toISOString().slice(0, 16)
  }

  const form = useForm<z.infer<typeof AnnouncementSchema>>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues: {
      ann_title: announcement?.ann_title || "",
      ann_details: announcement?.ann_details || "",
      ann_start_at: announcement?.ann_start_at
        ? formatDateTimeLocal(announcement.ann_start_at)
        : formatDateTimeLocal(new Date()),
      ann_end_at: announcement?.ann_end_at
        ? formatDateTimeLocal(announcement.ann_end_at)
        : formatDateTimeLocal(new Date()),
      ann_type: announcement?.ann_type || "General",
      staff: announcement?.staff?.toString() || "0",
      ar_mode: [firstRecipient?.ar_mode || ""],
    },
  })

  if (!announcement) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                  <Megaphone className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-lg text-gray-600">Loading announcement details...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Announcement Details</h1>
              <p className="text-sm text-gray-600">View the complete details of this announcement</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form className="space-y-6">
            {/* Basic Information Card */}
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </div>
                <CardDescription>Main details of the announcement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormInput control={form.control} name="ann_title" label="Announcement Title" readOnly={!isEditing} />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Announcement Details</label>
                  <textarea
                    {...form.register("ann_details")}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    readOnly={!isEditing}
                  />
                </div>
                <FormInput control={form.control} name="ann_type" label="Announcement Type" readOnly={!isEditing} />
              </CardContent>
            </Card>

            {/* Attached Media Files */}
{announcement.files && announcement.files.length > 0 && (
  <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
    <CardHeader className="pb-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-gray-600" />
        <CardTitle className="text-lg">Attached Files</CardTitle>
      </div>
      <CardDescription>Media attached to the announcement</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-wrap gap-4">
      {announcement.files.map((file, index) => (
        <div key={index} className="w-40 h-40 border rounded overflow-hidden shadow-sm">
          {file.af_type.startsWith("image/") ? (
            <img
              src={file.af_url}
              alt={file.af_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-gray-500">
              {file.af_name}
            </div>
          )}
        </div>
      ))}
    </CardContent>
  </Card>
)}


            {/* Schedule Card */}
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Schedule</CardTitle>
                </div>
                <CardDescription>When this announcement is active</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="h-4 w-4" />
                    Start Date & Time
                  </div>
                  <FormDateTimeInput
                    control={form.control}
                    name="ann_start_at"
                    label=""
                    readOnly={!isEditing}
                    type="datetime-local"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Clock className="h-4 w-4" />
                    End Date & Time
                  </div>
                  <FormDateTimeInput
                    control={form.control}
                    name="ann_end_at"
                    label=""
                    readOnly={!isEditing}
                    type="datetime-local"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Recipients & Delivery Card */}
<Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
  <CardHeader className="pb-4">
    <div className="flex items-center gap-2">
      <Users className="h-5 w-5 text-gray-600" />
      <CardTitle className="text-lg">Recipients & Delivery</CardTitle>
    </div>
    <CardDescription>Who received this announcement and how</CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">

    {/* Position List */}
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">Target Positions</p>
      <div className="flex flex-wrap gap-2">
        {Array.from(new Set(matchingRecipients.map((r) => r.position_title)))
          .slice(0, 5)
          .map((title, i) => (
            <Badge key={i} variant="secondary" className="text-xs px-2 py-1">
              {title}
            </Badge>
        ))}
        {matchingRecipients.length > 5 && (
          <Badge variant="outline" className="text-xs px-2 py-1">
            +{matchingRecipients.length - 5} more
          </Badge>
        )}
      </div>
    </div>

    {/* Age Group List */}
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">Target Age Group</p>
      <div className="flex flex-wrap gap-2">
        {Array.from(new Set(matchingRecipients.map((r) => r.ar_age))).map((age, i) => (
          <Badge key={i} variant="secondary" className="text-xs px-2 py-1 capitalize">
            {age}
          </Badge>
        ))}
      </div>
    </div>

    {/* Delivery Mode List */}
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">Delivery Mode</p>
      <div className="flex flex-wrap gap-2">
        {Array.from(new Set(matchingRecipients.map((r) => r.ar_mode))).map((mode, i) => (
          <Badge key={i} variant="secondary" className="text-xs px-2 py-1 capitalize">
            {mode}
          </Badge>
        ))}
      </div>
    </div>

    <Separator />
  </CardContent>
</Card>


          </form>
        </Form>
      </div>
    </div>
  )
}

export default AnnouncementView

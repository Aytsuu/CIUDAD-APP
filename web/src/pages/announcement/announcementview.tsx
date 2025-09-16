import { Key, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { useParams } from "react-router-dom";

import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import AnnouncementSchema from "@/form-schema/Announcement/announcementschema";
import {
  useGetAnnouncement,
  useGetAnnouncementRecipient,
} from "./queries/announcementFetchQueries";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone, FileText, Calendar, Users, Clock } from "lucide-react";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

// --- Helper functions ---
const capitalizeWords = (str: string) =>
  str ? str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) : "";

const uniquePreserve = (arr: string[]) =>
  arr.filter((item, idx) => arr.indexOf(item) === idx);

function AnnouncementView() {
  const { id } = useParams<{ id: string }>();
  const ann_id = Number(id);

  const [isEditing] = useState(false);
  const { data: announcements } = useGetAnnouncement();
  const { data: recipients } = useGetAnnouncementRecipient(ann_id);

  const announcement = announcements?.find((a) => a.ann_id === ann_id);
  const matchingRecipients = recipients?.filter((r) => r.ann === ann_id) || [];

  const formatDateTimeLocal = (value?: string | Date | null) => {
    if (!value) return "";
    const date = new Date(value);
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);
    return localDate.toISOString().slice(0, 16);
  };

  const form = useForm<z.infer<typeof AnnouncementSchema>>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues: {
      ann_title: capitalizeWords(announcement?.ann_title || ""),
      ann_details: capitalizeWords(announcement?.ann_details || ""),
      ann_start_at: announcement?.ann_start_at
        ? formatDateTimeLocal(announcement.ann_start_at)
        : "",
      ann_end_at: announcement?.ann_end_at
        ? formatDateTimeLocal(announcement.ann_end_at)
        : "",
      ann_event_start: announcement?.ann_event_start
        ? formatDateTimeLocal(announcement.ann_event_start)
        : "",
      ann_event_end: announcement?.ann_event_end
        ? formatDateTimeLocal(announcement.ann_event_end)
        : "",
      ann_type: (announcement?.ann_type || "general").toLowerCase(),
      ann_to_sms: announcement?.ann_to_sms ?? true,
      ann_to_email: announcement?.ann_to_email ?? true,
    },
  });

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
                <p className="text-lg text-gray-600">
                  Loading announcement details...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <LayoutWithBack
      title="Announcement Details"
      description="View the complete details of this announcement"
    >
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form className="space-y-6">
            {/* Basic Info */}
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </div>
                <CardDescription>
                  Main details of the announcement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormInput
                  control={form.control}
                  name="ann_title"
                  label="Announcement Title"
                  readOnly={!isEditing}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Announcement Details
                  </label>
                  <textarea
                    {...form.register("ann_details")}
                    value={capitalizeWords(form.getValues("ann_details"))}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    readOnly={!isEditing}
                  />
                </div>
                <FormInput
                  control={form.control}
                  name="ann_type"
                  label="Announcement Type"
                  readOnly={!isEditing}
                />
              </CardContent>
            </Card>

            {/* Attached Files */}
            {(announcement.announcement_files?.length ?? 0) > 0 && (
              <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-lg">Attached Files</CardTitle>
                  </div>
                  <CardDescription>
                    Media attached to the announcement
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  {announcement.announcement_files?.map(
                    (
                      file: { af_type: string; af_url: string; af_name: string },
                      index: Key
                    ) => (
                      <div
                        key={index}
                        className="w-40 h-40 border rounded overflow-hidden shadow-sm"
                      >
                        {file.af_type.startsWith("image/") ? (
                          <img
                            src={file.af_url}
                            alt={capitalizeWords(file.af_name)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-sm text-gray-500 px-2 text-center">
                            {capitalizeWords(file.af_name)}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            )}

           {/* Schedule */}
{(
  (announcement.ann_type?.toLowerCase() === "event" &&
    (announcement.ann_event_start || announcement.ann_event_end)) ||
  (announcement.ann_type?.toLowerCase() !== "event" &&
    (announcement.ann_start_at || announcement.ann_end_at))
) && (
  <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
    <CardHeader className="pb-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-gray-600" />
        <CardTitle className="text-lg">Schedule</CardTitle>
      </div>
      <CardDescription>
        When this announcement is active
      </CardDescription>
    </CardHeader>
    <CardContent
      className={`grid grid-cols-1 ${
        announcement.ann_type?.toLowerCase() === "event"
          ? "md:grid-cols-2"
          : "md:grid-cols-2"
      } gap-4`}
    >
      {announcement.ann_type?.toLowerCase() === "event" ? (
        <>
          {announcement.ann_event_start && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4" />
                Event Start
              </div>
              <FormDateTimeInput
                control={form.control}
                name="ann_event_start"
                label=""
                readOnly
                type="datetime-local"
              />
            </div>
          )}
          {announcement.ann_event_end && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4" />
                Event End
              </div>
              <FormDateTimeInput
                control={form.control}
                name="ann_event_end"
                label=""
                readOnly
                type="datetime-local"
              />
            </div>
          )}
        </>
      ) : (
        <>
          {announcement.ann_start_at && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4" />
                Start Posting
              </div>
              <FormDateTimeInput
                control={form.control}
                name="ann_start_at"
                label=""
                readOnly
                type="datetime-local"
              />
            </div>
          )}
          {announcement.ann_end_at && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4" />
                End Posting
              </div>
              <FormDateTimeInput
                control={form.control}
                name="ann_end_at"
                label=""
                readOnly
                type="datetime-local"
              />
            </div>
          )}
        </>
      )}
    </CardContent>
  </Card>
)}



            {/* Delivery Options */}
            <Card className="shadow-md border-0 bg-white/80 backdrop-blur-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg font-semibold">
                    Delivery Options
                  </CardTitle>
                </div>
                <CardDescription className="text-gray-500 text-sm">
                  Indicates how this announcement was sent
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded shadow-sm">
                  <span className="text-gray-600 font-medium">
                    Send via SMS:
                  </span>
                  <span
                    className={`font-semibold ${
                      announcement.ann_to_sms ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {announcement.ann_to_sms ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded shadow-sm">
                  <span className="text-gray-600 font-medium">
                    Send via Email:
                  </span>
                  <span
                    className={`font-semibold ${
                      announcement.ann_to_email
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {announcement.ann_to_email ? "Yes" : "No"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recipients */}
            {announcement.ann_type?.toLowerCase() !== "public" &&
              matchingRecipients.some((r) => r.ar_type?.trim()) && (
                <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-gray-600" />
                      <CardTitle className="text-lg">Recipients</CardTitle>
                    </div>
                    <CardDescription>
                      Who received this announcement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Recipient Types
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {uniquePreserve(
                          matchingRecipients
                            .map((r) => r.ar_type?.trim())
                            .filter(Boolean)
                            .map(capitalizeWords)
                        ).map((type, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs px-2 py-1"
                          >
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
    <label className="text-sm font-medium text-gray-700">Created By</label>
    <div className="text-base font-semibold text-gray-900">
      {announcement.username || "Unknown"}
    </div>
  </div>
                  </CardContent>
                </Card>
              )}
          </form>
        </Form>
      </div>
    </LayoutWithBack>
  );
}

export default AnnouncementView;

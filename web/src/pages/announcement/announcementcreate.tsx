import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import AnnouncementSchema from "@/form-schema/Announcement/announcementschema";
import { usePostAnnouncement, usePostAnnouncementRecipient } from "./queries/announcementAddQueries";
import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Users, Clock, Send, MessageSquare } from "lucide-react";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import axios from "axios";

const AnnouncementCreate = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: postAnnouncement } = usePostAnnouncement();
  usePostAnnouncementRecipient();
  const { user } = useAuth();

  type AnnouncementCreateFormValues = z.infer<typeof AnnouncementSchema>;

  const defaultValues = {
    ann_title: "",
    ann_details: "",
    ann_start_at: "",
    ann_end_at: "",
    ann_event_start: "",
    ann_event_end: "",
    ann_type: "",
    ar_type: [],
    recipient: "everyone",
    staff: user?.staff?.staff_id || "",
    ann_to_sms: false,
    ann_to_email: false
  };

  const form = useForm<AnnouncementCreateFormValues>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues,
  });

  const annType = form.watch("ann_type");
  const recipientType = form.watch("recipient");

  React.useEffect(() => {
    if (annType === "general") {
      form.setValue("ann_start_at", "");
      form.setValue("ann_end_at", "");
      form.setValue("ann_event_start", "");
      form.setValue("ann_event_end", "");
    }
    // Reset ar_type when recipient changes
    form.setValue("ar_type", []);
  }, [annType, recipientType, form]);

  const onSubmit = async (data: AnnouncementCreateFormValues) => {
  try {
    const cleanedData: Record<string, any> = {};
    for (const key in data) {
      const value = (data as any)[key];
      if (value !== "" && value !== undefined) {
        cleanedData[key] = value;
      } else {
        cleanedData[key] = null;
      }
    }

    const { ar_type, ...announcementData } = cleanedData;

    if (ar_type && ar_type.length > 0) {
      announcementData.recipients = ar_type.map((type: string) => ({
        ar_type: type,
      }));
    }

    console.log("Sending announcement payload:", announcementData);

    const createdAnnouncement = await postAnnouncement(announcementData);

    queryClient.invalidateQueries(["announcements"]);

  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Validation errors from backend:", error.response.data);
    } else {
      console.error("Unexpected error:", error);
    }
  }
};


  return (
    <LayoutWithBack title="Create Announcement" description="Fill in the details below to create and distribute your announcement">
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </div>
                <CardDescription>Enter the main details of your announcement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormSelect
                  control={form.control}
                  name="ann_type"
                  label="Announcement Type"
                  options={[
                    { id: "general", name: "General" },
                    { id: "public", name: "Public" },
                    { id: "event", name: "Event" },
                    { id: "reminder", name: "Reminder" },
                    { id: "advisory", name: "Advisory" },
                  ]}
                />

                <FormInput
                  control={form.control}
                  name="ann_title"
                  label="Announcement Title"
                  placeholder="Enter a clear and descriptive title"
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Announcement Details</label>
                  <textarea
                    {...form.register("ann_details")}
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
                    placeholder="Provide detailed information about the announcement"
                  />
                  {form.formState.errors.ann_details && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.ann_details.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Schedule */}
            {["event", "public"].includes(annType) && (
              <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-lg">Schedule</CardTitle>
                  </div>
                  <CardDescription>Set when your announcement will be active</CardDescription>
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
                      type="datetime-local"
                      label=""
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
                      type="datetime-local"
                      label=""
                    />
                  </div>

                  {annType === "event" && (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Clock className="h-4 w-4" />
                          Event Start Date & Time
                        </div>
                        <FormDateTimeInput
                          control={form.control}
                          name="ann_event_start"
                          type="datetime-local"
                          label=""
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Clock className="h-4 w-4" />
                          Event End Date & Time
                        </div>
                        <FormDateTimeInput
                          control={form.control}
                          name="ann_event_end"
                          type="datetime-local"
                          label=""
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recipients */}
            {["event", "general"].includes(annType) && (
              <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-lg">Recipients</CardTitle>
                  </div>
                  <CardDescription>
                    Choose audience, positions, and age group
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Audience Select */}
                  <FormSelect
                    control={form.control}
                    name="recipient"
                    label="Target Audience"
                    options={[
                      { id: "everyone", name: "Everyone" },
                      { id: "resident", name: "Resident" },
                      { id: "staff", name: "Staff" },
                    ]}
                  />

                  {/* Show Positions if Staff */}
                  {recipientType === "staff" && (
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">Target Positions</Badge>
                      <FormComboCheckbox
                        control={form.control}
                        name="ar_type"
                        options={[
                          { id: "Midwife", name: "Midwife" },
                          { id: "Doctor", name: "Doctor" },
                          { id: "Barangay Health Worker", name: "Barangay Health Worker" },
                          { id: "Watchmen", name: "Watchmen" },
                          { id: "Waste Driver", name: "Waste Driver" },
                          { id: "Waste Collector", name: "Waste Collector" },
                          { id: "Barangay Captain", name: "Barangay Captain" }
                        ]}
                      />
                    </div>
                  )}

                  {/* Show Age Groups if Resident */}
                  {recipientType === "resident" && (
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">Age Group</Badge>
                      <FormComboCheckbox
                        control={form.control}
                        name="ar_type"
                        options={[
                          { id: "young", name: "Young" },
                          { id: "adult", name: "Adult" },
                          { id: "senior", name: "Senior Citizen" },
                        ]}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notification Options */}
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Notification Options</CardTitle>
                </div>
                <CardDescription>Choose how to notify recipients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ann_to_sms"
                      {...form.register("ann_to_sms")}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="ann_to_sms" className="text-sm font-medium text-gray-700">
                      Send SMS Notification
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ann_to_email"
                      {...form.register("ann_to_email")}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="ann_to_email" className="text-sm font-medium text-gray-700">
                      Send Email Notification
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </LayoutWithBack>
  );
};

export default AnnouncementCreate;
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
import { FileText, Calendar, Users, Clock, Send } from "lucide-react";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import React from "react";
import { postAnnouncementFile as postAnnouncementFileApi } from "./restful-api/announcementPostRequest";
import { useAuth } from "@/context/AuthContext";
import { usePositions } from "../record/administration/queries/administrationFetchQueries";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";

const AnnouncementCreate = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: postAnnouncement } = usePostAnnouncement();
  const { mutate: postAnnouncementRecipient } = usePostAnnouncementRecipient();
  const { mutate: postAnnouncementFile } = postAnnouncementFileApi();

  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = React.useState<string>("");
  const { user } = useAuth();
  const { data: positions = [] } = usePositions();

  type AnnouncementCreateFormValues = z.infer<typeof AnnouncementSchema> & {
    positions?: string[];
    ar_age?: string[];
  };

  const defaultValues = {
  ann_title: "",
  ann_details: "",
  ann_start_at: "",
  ann_end_at: "",
  ann_event_start: "",
  ann_event_end: "",
  ann_type: "",
  ar_mode: [],
  positions: [],
  ar_age: [],
  staff: ""
};


  const form = useForm<AnnouncementCreateFormValues>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues,
  });

  const annType = form.watch("ann_type");

9-

8-+  React.useEffect(() => {
    if (["general", "reminder", "public"].includes(annType)) {
      form.setValue("ar_mode", ["sms", "email"]);
    }
    if (annType === "general") {
      form.setValue("ann_start_at", "");
      form.setValue("ann_end_at", "");
    }
  }, [annType, form]);

  const onSubmit = async () => {
    const formIsValid = await form.trigger();
    const values = form.getValues();

    if (!formIsValid) {
      console.error("Form validation failed");
      console.log(form.formState.errors);
      return;
    }

    const { ar_mode, positions, ar_age, ...restVal } = values;
    
    const recipients = [
      ...positions,
      ...ar_age,
    ]

    try {
       const files = mediaFiles.map((media) => ({
        af_name: media.file.name,
        af_type: media.file.type,
        af_path: media.storagePath,
        af_url: media.publicUrl,
        ann: createdAnnouncement?.ann_id,
        staff: user?.staff?.staff_id
      }));

      const createdAnnouncement = await postAnnouncement(restVal);

       await postAnnouncementRecipient({
            recipients: recipients,
          });

     
    } catch (err) {
      console.error("Error during announcement creation:", err);
    }
  };

  const positionOptions = positions.map((pos: any) => ({
    id: pos.pos_id?.toString(),
    name: pos.pos_title,
  }));

  return (
    <LayoutWithBack title="Create Announcement " description="Fill in the details below to create and distribute your announcement">
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="space-y-6"
          >
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
                  )}z
                </CardContent>
              </Card>
            )}

            {/* Recipients & Delivery */}
            {["event", "general"].includes(annType) && (
  <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
    <CardHeader className="pb-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-gray-600" />
        <CardTitle className="text-lg">Recipients & Delivery</CardTitle>
      </div>
      <CardDescription>
        Choose audience, positions, age group, and delivery modes
      </CardDescription>
    </CardHeader>

    <CardContent className="space-y-6">
      {/* Audience Select */}
      <FormSelect
        control={form.control}
        name="recipient"
        label="Target Audience"
        options={[
          { id: "everyone", name: "everyone" },
          { id: "resident", name: "resident" },
          { id: "staff", name: "staff" },
        ]}
      />

      {/* Show Positions if Staff */}
      {form.watch("recipient") === "staff" && (
        <div className="space-y-2">
          <Badge variant="outline" className="text-xs">Target Positions</Badge>
          <FormComboCheckbox
            control={form.control}
            name="positions"
            options={positionOptions}
          />
        </div>
      )}

      {/* Show Age Groups if Resident */}
      {form.watch("recipient") === "resident" && (
        <div className="space-y-2">
          <Badge variant="outline" className="text-xs">Age Group</Badge>
          <FormComboCheckbox
            control={form.control}
            name="ar_age"
            options={[
              { id: "youth", name: "Youth" },
              { id: "adult", name: "Adult" },
              { id: "senior", name: "Senior Citizen" },
            ]}
          />
        </div>
      )}

      {/* Always show delivery mode */}
      <div className="space-y-2">
        <Badge variant="outline" className="text-xs">Delivery Mode</Badge>
        <FormComboCheckbox
          control={form.control}
          name="ar_mode"
          options={[
            { id: "sms", name: "SMS" },
            { id: "email", name: "Email" },
          ]}
          readOnly={["general", "reminder", "public"].includes(annType)}
        />
      </div>
    </CardContent>
  </Card>
)}


            {/* Upload */}
            <MediaUpload
              title="Upload Image"
              description="Upload images"
              mediaFiles={mediaFiles}
              activeVideoId={activeVideoId}
              setActiveVideoId={setActiveVideoId}
              setMediaFiles={setMediaFiles}
            />

            <div className="flex justify-end pt-4">
              <Button>
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

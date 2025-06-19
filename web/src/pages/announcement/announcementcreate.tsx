import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import AnnouncementSchema from "@/form-schema/Announcement/announcementschema";
import {
  usePostAnnouncement,
  usePostAnnouncementRecipient,
} from "./queries/announcementAddQueries";
import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox";
import { Button } from "@/components/ui/button/button";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  FileText,
  Calendar,
  Users,
  Mail,
  Clock,
  Send,
} from "lucide-react";
import {
  MediaUpload,
  MediaUploadType,
} from "@/components/ui/media-upload";
import React from "react";
import { postAnnouncementFile as postAnnouncementFileApi } from "./restful-api/announcementPostRequest";
import { useAuth } from "@/context/AuthContext";


const AnnouncementCreate = () => {
  const { mutateAsync: postAnnouncement } = usePostAnnouncement();
  const { mutate: postAnnouncementRecipient } = usePostAnnouncementRecipient();
  const { mutate: postAnnouncementFile } = postAnnouncementFileApi();

  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = React.useState<string>("");
  const { user } = useAuth();

  type AnnouncementCreateFormValues = z.infer<typeof AnnouncementSchema>;
  const defaultValues = generateDefaultValues(AnnouncementSchema);

  const form = useForm<AnnouncementCreateFormValues>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues,
  });

  const annType = form.watch("ann_type");
  const arType = form.watch("ar_type") ?? [];
React.useEffect(() => {
    const hasResident = arType.includes("resident");
    const hasStaff = arType.includes("staff");
    const hasEveryone = arType.includes("everyone");

    if (hasResident && hasStaff && !hasEveryone) {
      form.setValue("ar_type", ["everyone"]);
    }

    if (hasEveryone && (hasResident || hasStaff)) {
      form.setValue("ar_type", ["everyone"]);
    }
  }, [arType, form]);
  const onSubmit = async () => {
  const formIsValid = await form.trigger();
  if (!formIsValid) return;

  const values = form.getValues();

  // Convert empty strings to null for datetime fields
  const cleanedValues = {
    ...values,
    ann_start_at: values.ann_start_at || null,
    ann_end_at: values.ann_end_at || null,
    staff: user?.staff.staff_id,
  };

  try {
    const createdAnnouncement = await postAnnouncement(cleanedValues);

    const recipients = values.ar_type.flatMap((type: string) =>
      values.ar_mode.map((mode: string) => ({
        ar_type: type,
        ar_mode: mode,
        ann: createdAnnouncement?.ann_id,
      }))
    );

    recipients.forEach((recipient) =>
      postAnnouncementRecipient(recipient, {
        onSuccess: () => {
          const files = mediaFiles.map((media) => ({
            af_name: media.file.name,
            af_type: media.file.type,
            af_path: media.storagePath,
            af_url: media.publicUrl,
            ann: createdAnnouncement?.ann_id,
            staff: user?.staff.staff_id,
          }));

          postAnnouncementFile(files, {
            onSuccess: () => {
              console.log("File Created!");
            },
          });
        },
      })
    );

  } catch (err) {
    console.error("Error during announcement creation:", err);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Megaphone className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Announcement</h1>
              <p className="text-sm text-gray-600">
                Fill in the details below to create and distribute your announcement
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="space-y-6"
          >
            {/* Basic Information */}
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </div>
                <CardDescription>Enter the main details of your announcement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    placeholder="Provide detailed information about the announcement"
                  />
                </div>
                <FormSelect
                  control={form.control}
                  name="ann_type"
                  label="Announcement Type"
                  options={[
                    { id: "general", name: "General" },
                    { id: "urgent", name: "Urgent" },
                    { id: "event", name: "Event" },
                  ]}
                />
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
  <CardHeader className="pb-4">
    <div className="flex items-center gap-2">
      <Calendar className="h-5 w-5 text-gray-600" />
      <CardTitle className="text-lg">Schedule</CardTitle>
    </div>
    <CardDescription>Set when your announcement will be active</CardDescription>
  </CardHeader>
  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Start Date & Time */}
    <div
      className={`space-y-2 transition-all duration-300 ${
        !["event", "urgent"].includes(annType)
          ? "grayscale opacity-60 pointer-events-none"
          : ""
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Clock className="h-4 w-4" />
        Start Date & Time
      </div>
      <FormDateTimeInput
        control={form.control}
        name="ann_start_at"
        label=""
        type="datetime-local"
        disabled={!["event", "urgent"].includes(annType)}
      />
    </div>

    {/* End Date & Time */}
    <div
      className={`space-y-2 transition-all duration-300 ${
        !["event", "urgent"].includes(annType)
          ? "grayscale opacity-60 pointer-events-none"
          : ""
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Clock className="h-4 w-4" />
        End Date & Time
      </div>
      <FormDateTimeInput
        control={form.control}
        name="ann_end_at"
        label=""
        type="datetime-local"
        disabled={!["event", "urgent"].includes(annType)}
      />
    </div>
  </CardContent>
</Card>

            {/* Recipients & Delivery */}
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Recipients & Delivery</CardTitle>
                </div>
                <CardDescription>Choose who will receive this announcement and how</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Target Audience
                      </Badge>
                    </div>
                    <FormComboCheckbox
                      control={form.control}
                      name="ar_type"
                      options={[
                        { id: "everyone", name: "Everyone" },
                        { id: "resident", name: "All Residents", disabled: arType.includes("everyone") },
                        { id: "staff", name: "All Staff", disabled: arType.includes("everyone") },
                      ]}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Mail className="h-3 w-3 mr-1" />
                        Delivery Method
                      </Badge>
                    </div>
                    <FormComboCheckbox
                      control={form.control}
                      name="ar_mode"
                      options={[
                        { id: "email", name: "Email" },
                        { id: "sms", name: "SMS" },
                      ]}
                    />
                  </div>
                </div>

                <Separator />
              </CardContent>
            </Card>

            {/* Media Upload */}
            <MediaUpload
              title="Upload Image"
              description="Upload images"
              mediaFiles={mediaFiles}
              activeVideoId={activeVideoId}
              setActiveVideoId={setActiveVideoId}
              setMediaFiles={setMediaFiles}
            />

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                size="lg"
                className="bg-blue hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <Send className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default AnnouncementCreate;

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Calendar, Users, Send, MessageSquare } from "lucide-react";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { usePositions } from "@/pages/record/administration/queries/administrationFetchQueries";
import { useLocation } from "react-router-dom";
import { MediaUpload, MediaUploadType } from "@/components/ui/media-upload";
import { capitalize } from "@/helpers/capitalize";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { useUpdateAnnouncement } from "./queries/announcementUpdateQueries";
import { LoadButton } from "@/components/ui/button/load-button";

function normalizeTitle(value: string) {
  return String(value || "")
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ");
}

function uniquePreserve<T>(items: T[], keyFn: (x: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    const k = keyFn(it).toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(it);
    }
  }
  return out;
}

const AnnouncementCreate = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const location = useLocation();
  const params = React.useMemo(() => location.state?.params, [location.state])
  const data = React.useMemo(() => params?.data, [params])

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [mediaFiles, setMediaFiles] = React.useState<MediaUploadType>([]);
  const [activeVideoId, setActiveVideoId] = React.useState<string>("");

  type AnnouncementCreateFormValues = z.infer<typeof AnnouncementSchema> & {
    pos_category: string;
    pos_group: string;
  };

  const defaultValues: AnnouncementCreateFormValues = {
    ann_title: "",
    ann_details: "",
    ann_start_at: "",
    ann_end_at: "",
    ann_event_start: "",
    ann_event_end: "",
    ann_type: "",
    ar_type: [],
    ar_category: "",
    staff: user?.staff?.staff_id || "",
    pos_category: "",
    pos_group: "",
    ann_to_sms: false,
    ann_to_email: false,
  };

  const form = useForm<AnnouncementCreateFormValues>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues,
  });

  const annType = form.watch("ann_type");
  const recipientType = form.watch("ar_category");
  const posCategory = form.watch("pos_category");

  React.useEffect(() => {
    if (recipientType !== "STAFF") {
      form.reset((prev) => ({
        ...prev,
        ar_type: [],
        pos_category: "",
        pos_group: "",
      }));
    }
  }, [recipientType]);

  React.useEffect(() => {
    if (data) {
      form.setValue("ann_type", data?.ann_type);
      form.setValue("ann_title", data?.ann_title);
      form.setValue("ann_details", data?.ann_details);
      form.setValue("ar_category", data?.recipients?.ar_category);

      if (data?.recipients?.ar_types?.length > 0) {
        const types = data?.recipients?.ar_types;
        const category = new Set(
          positions
            .filter((pos: any) => types.includes(pos.pos_title) == true)
            .map((pos: any) => pos.pos_category)
        );
        console.log([...category][0]);
        if ([...category].length > 0) {
          form.setValue(
            "pos_category",
            [...category].length == 2 ? "ALL" : ([...category][0] as string)
          );
        }

        form.setValue("ar_type", types);
      }
      form.setValue("ann_start_at", data?.ann_start_at?.slice(0, 16));
      form.setValue("ann_end_at", data?.ann_end_at?.slice(0, 16));
      form.setValue("ann_event_start", data?.ann_event_start?.slice(0, 16));  
      form.setValue("ann_event_end", data?.ann_event_end?.slice(0, 16));
      form.setValue("ann_to_sms", data?.ann_to_sms);
      form.setValue("ann_to_email", data?.ann_to_email);
    }
  }, [data]);

  console.log(form.getValues())

  const { mutateAsync: postAnnouncement } = usePostAnnouncement();
  const { mutateAsync: postAnnouncementRecipient } =
    usePostAnnouncementRecipient();
  const { mutateAsync: updateAnnouncement } = useUpdateAnnouncement();
  const { data: positions = [] } = usePositions();

  const categoryOptions = React.useMemo(() => {
    const cats = positions
      .map((p: { pos_category: any }) => p.pos_category)
      .filter(Boolean);
    const uniqueCats = Array.from(new Set(cats));
    return uniqueCats.map((cat) => ({
      id: cat as string,
      name: cat as string,
    }));
  }, [positions]);

  const update = async () => {
    if (!(await form.trigger(["ann_title", "ann_details"]))) {
      showErrorToast("Please fill out all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const values = form.getValues();
      const {
        pos_group,
        pos_category,
        staff_group,
        ar_category,
        staff,
        ...announcementData
      } = values;

      const files = mediaFiles.map((file) => ({
        name: file.name,
        type: file.type,
        file: file.file,
      }));

      await updateAnnouncement({
        ann: data?.ann_id,
        data: {
          ...announcementData,
          ...(files.length > 0 && { files: files }),
        },
      });

      showSuccessToast("Updated successfully");
    } catch (err) {
      showErrorToast("Failed to update. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const create = async () => {
    if (!(await form.trigger(["ann_title", "ann_details"]))) {
      showErrorToast("Please fill out all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = form.getValues();
      const cleanedData: Record<string, any> = {};
      for (const key in data) {
        const value = (data as any)[key];
        cleanedData[key] = value !== "" && value !== undefined ? value : null;
      }

      let { ar_type, ar_category, pos_category, ...announcementData } =
        cleanedData;

      // Handle Event Type: Sync ann_end_at with ann_event_end if type is "event"
      if (announcementData.ann_type === "EVENT") {
        if (announcementData.ann_event_end && !announcementData.ann_end_at) {
          announcementData.ann_end_at = announcementData.ann_event_end;
        }
        if (!announcementData.ann_event_end && announcementData.ann_end_at) {
          announcementData.ann_event_end = announcementData.ann_end_at;
        }
      }

      // Handle Event Types
      if (["EVENT"].includes(announcementData.ann_type)) {
        if (announcementData.ann_event_end && !announcementData.ann_end_at) {
          announcementData.ann_end_at = announcementData.ann_event_end;
        }
        if (!announcementData.ann_event_end && announcementData.ann_end_at) {
          announcementData.ann_event_end = announcementData.ann_end_at;
        }
      }

      // **Force Active if no scheduler provided**
      if (!announcementData.ann_start_at && !announcementData.ann_end_at) {
        announcementData.ann_status = "ACTIVE";
      }

      if (Array.isArray(ar_type)) {
        const origWithKey = (ar_type as string[]).map((t: string) => ({
          orig: t,
          key: normalizeTitle(t),
        }));
        const unique = uniquePreserve(origWithKey, (o) => o.key).map(
          (o) => o.orig
        );
        ar_type = unique;
      }

      if (mediaFiles.length > 0) {
        const filesPayload = mediaFiles.map((file) => ({
          name: file.name,
          type: file.type,
          file: file.file,
        }));
        announcementData.files = filesPayload;
      }

      const createdAnnouncement = await postAnnouncement({
        ...announcementData,
        staff: user?.staff?.staff_id,
      });

      if (Array.isArray(ar_type) && ar_type.length > 0) {
        const recipientsPayload = (ar_type as string[])
          .filter(Boolean)
          .map((type: string) => ({
            ann: createdAnnouncement?.ann_id,
            ar_type: capitalize(type.trim()),
            ar_category: ar_category.trim(),
          }));

        await postAnnouncementRecipient({ recipients: recipientsPayload });
      }

      if (ar_category?.toLowerCase() !== "staff") {
        await postAnnouncementRecipient({
          recipients: [
            {
              ann: createdAnnouncement?.ann_id,
              ar_category: ar_category.trim(),
            },
          ],
        });
      }

      form.reset(defaultValues);
      setMediaFiles([]);
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      showSuccessToast("Announcement created");
    } catch (error) {
      showErrorToast("Failed to create a announcement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LayoutWithBack
      title="Create Announcement"
      description="Fill in the details below to create and distribute your announcement"
    >
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form className="space-y-6">
            {/* Announcement Type */}
            <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <CardTitle className="text-lg">Announcement Type</CardTitle>
                </div>
                <CardDescription>
                  Select the type of your announcement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormSelect
                  control={form.control}
                  name="ann_type"
                  label="Announcement Type"
                  options={[
                    { id: "GENERAL", name: "GENERAL" },
                    { id: "EVENT", name: "EVENT" },
                  ]}
                />
              </CardContent>
            </Card>

            {annType && (
              <>
                {/* Basic Info */}
                <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <CardTitle className="text-lg">
                        Basic Information
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Enter the main details of your announcement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormInput
                      control={form.control}
                      name="ann_title"
                      label="Announcement Title"
                      placeholder="Enter a clear and descriptive title"
                    />
                    <FormTextArea
                      control={form.control}
                      name="ann_details"
                      label="Announcement Details"
                      placeholder="Provide details"
                      rows={10}
                    />
                  </CardContent>
                </Card>

                {/* Recipients */}
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
                    <FormSelect
                      control={form.control}
                      name="ar_category"
                      label="Target Audience"
                      options={[
                        { id: "RESIDENT", name: "RESIDENT ONLY" },
                        { id: "STAFF", name: "STAFF ONLY" },
                        { id: "PUBLIC", name: "PUBLIC" },
                      ]}
                    />
                    {recipientType === "STAFF" && (
                      <>
                        <FormSelect
                          control={form.control}
                          name="pos_category"
                          label="Category"
                          options={[
                            { id: "ALL", name: "ALL" },
                            ...categoryOptions,
                          ]}
                        />
                        {posCategory && (
                          <FormComboCheckbox
                            label="Positions"
                            control={form.control}
                            name="ar_type"
                            options={positions
                              .filter(
                                (pos: any) =>
                                  (pos.pos_category == posCategory ||
                                    posCategory == "ALL") &&
                                  pos.pos_title !== "ADMIN"
                              )
                              .map((pos: any) => ({
                                id: pos.pos_title,
                                name: pos.pos_title,
                              }))}
                          />
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Schedule */}
                <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-gray-600" />
                      <CardTitle className="text-lg">Schedule</CardTitle>
                    </div>
                    <CardDescription>
                      Set when your announcement will be active
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {annType === "EVENT" ? (
                      <>
                        <FormDateTimeInput
                          control={form.control}
                          name="ann_start_at"
                          type="datetime-local"
                          label="Start Date & Time"
                        />
                        <FormDateTimeInput
                          control={form.control}
                          name="ann_event_start"
                          type="datetime-local"
                          label="Event Start"
                        />
                        <FormDateTimeInput
                          control={form.control}
                          name="ann_event_end"
                          type="datetime-local"
                          label="Event End"
                        />
                      </>
                    ) : (
                      <>
                        <FormDateTimeInput
                          control={form.control}
                          name="ann_start_at"
                          type="datetime-local"
                          label="Start Date & Time"
                        />
                        <FormDateTimeInput
                          control={form.control}
                          name="ann_end_at"
                          type="datetime-local"
                          label="End Date & Time"
                        />
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Media Upload */}
                <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <CardTitle className="text-lg">Media Upload</CardTitle>
                    </div>
                    <CardDescription>
                      Upload images or videos to include with your announcement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MediaUpload
                      title="Upload Image/Video"
                      description="Drag or select files to upload"
                      mediaFiles={mediaFiles}
                      activeVideoId={activeVideoId}
                      setActiveVideoId={setActiveVideoId}
                      setMediaFiles={setMediaFiles}
                      acceptableFiles="image"
                    />
                  </CardContent>
                </Card>

                {/* Notification Options */}
                {["EVENT", "GENERAL"].includes(annType) && (
                  <Card className="shadow-sm border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-gray-600" />
                        <CardTitle className="text-lg">
                          Notification Options
                        </CardTitle>
                      </div>
                      <CardDescription>
                        Choose how to notify recipients
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="ann_to_sms"
                            {...form.register("ann_to_sms")}
                            className="h-4 w-4"
                          />
                          <label
                            htmlFor="ann_to_sms"
                            className="text-sm font-medium text-gray-700"
                          >
                            Send SMS Notification
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="ann_to_email"
                            {...form.register("ann_to_email")}
                            className="h-4 w-4"
                          />
                          <label
                            htmlFor="ann_to_email"
                            className="text-sm font-medium text-gray-700"
                          >
                            Send Email Notification
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-4 pb-8">
                  {!isSubmitting ? (
                    <Button type="button"
                    onClick={() => {
                      data ? update() : create()
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" /> {data ? "Update Announcement" : "Create Announcement"}
                  </Button>
                  ) : (
                    <LoadButton>
                      {data ? "Saving..." : "Creating..."}
                    </LoadButton>
                  )}
                </div>
              </>
            )}
          </form>
        </Form>
      </div>
    </LayoutWithBack>
  );
};

export default AnnouncementCreate;

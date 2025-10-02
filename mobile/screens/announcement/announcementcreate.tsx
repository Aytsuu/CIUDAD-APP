import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useForm, Controller, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ChevronLeft} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { SubmitButton } from "@/components/ui/button/submit-button";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateAndTimeInput } from "@/components/ui/form/form-date-time-input";
import FormComboCheckbox from "@/components/ui/form/form-combo-checkbox";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import AnnouncementSchema from "@/form-schema/announcement-schema";
import { usePostAnnouncement, usePostAnnouncementRecipient } from "./queries";
import { usePositions } from "@/screens/_global_queries/Retrieve";
import { capitalize } from "@/helpers/capitalize";

// helpers
function capitalizeWords(str: string) {
  if (!str) return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
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

export default function AnnouncementCreate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

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

  const {
    control,
    handleSubmit,
    watch,
    reset,
    register,
  } = useForm<AnnouncementCreateFormValues>({
    resolver: zodResolver(AnnouncementSchema) as Resolver<any>,
    defaultValues,
  });

  const annType = watch("ann_type");
  const recipientType = watch("ar_category");
  const posCategory = watch("pos_category");
  const posGroup = watch("pos_group");

  const [mediaFiles, setMediaFiles] = React.useState<MediaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (recipientType !== "staff") {
      reset((prev) => ({
        ...prev,
        ar_type: [],
        pos_category: "",
        pos_group: "",
      }));
    }
  }, [recipientType]);

  const { mutateAsync: postAnnouncement } = usePostAnnouncement();
  const { mutateAsync: postAnnouncementRecipient } = usePostAnnouncementRecipient();
  const { data: positions = [] } = usePositions("Barangay Staff");

  const categoryOptions = React.useMemo(() => {
    const cats = positions.map((p: { pos_category: any }) => p.pos_category).filter(Boolean);
    const uniqueCats = Array.from(new Set(cats));
    return uniqueCats.map((cat) => ({
      label: capitalizeWords(String(cat)),
      value: String(cat),
    }));
  }, [positions]);

  const groupOptions = React.useMemo(() => {
    if (!posCategory) return [];
    const groups = positions
      .filter((p: { pos_category: string }) => p.pos_category === posCategory)
      .map((p: { pos_group: any }) => p.pos_group)
      .filter(Boolean);
    const uniqueGroups = Array.from(new Set(groups));
    return uniqueGroups.map((grp) => ({
      label: capitalizeWords(String(grp)),
      value: String(grp),
    }));
  }, [positions, posCategory]);

  const positionsForGroup = React.useMemo(() => {
    if (!posCategory || !posGroup) return [];
    const filtered = positions.filter(
      (p: { pos_category: string; pos_group: string }) =>
        p.pos_category === posCategory && p.pos_group === posGroup
    );
    return uniquePreserve(filtered, (p: any) => normalizeTitle(p.pos_title));
  }, [positions, posCategory, posGroup]);

  const onSubmit = async (data: AnnouncementCreateFormValues) => {
   try {
    const cleanedData: Record<string, any> = {};
    for (const key in data) {
      const value = (data as any)[key];
      cleanedData[key] = value !== "" && value !== undefined ? value : null;
    }

    let { ar_type, ar_category, pos_category, pos_group, ...announcementData } = cleanedData;

    // Handle Event Type: Sync ann_end_at with ann_event_end if type is "event"
    if (announcementData.ann_type === "event") {
      if (announcementData.ann_event_end && !announcementData.ann_end_at) {
        announcementData.ann_end_at = announcementData.ann_event_end;
      }
      if (!announcementData.ann_event_end && announcementData.ann_end_at) {
        announcementData.ann_event_end = announcementData.ann_end_at;
      }
    }

    // Handle Event & Public Types
if (["event", "public"].includes(announcementData.ann_type)) {
  if (announcementData.ann_event_end && !announcementData.ann_end_at) {
    announcementData.ann_end_at = announcementData.ann_event_end;
  }
  if (!announcementData.ann_event_end && announcementData.ann_end_at) {
    announcementData.ann_event_end = announcementData.ann_end_at;
  }
}

// Public: strip recipients + notifications
if (announcementData.ann_type === "public") {
  announcementData.ar_category = null;
  announcementData.ar_type = [];
  announcementData.pos_category = null;
  announcementData.pos_group = null;
  announcementData.ann_to_sms = false;
  announcementData.ann_to_email = false;
}


    // **Force Active if no scheduler provided**
    if (!announcementData.ann_start_at && !announcementData.ann_end_at) {
      announcementData.ann_status = "Active";
    }

    if (Array.isArray(ar_type)) {
      const origWithKey = (ar_type as string[]).map((t: string) => ({
        orig: t,
        key: normalizeTitle(t),
      }));
      const unique = uniquePreserve(origWithKey, (o) => o.key).map((o) => o.orig);
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

    const createdAnnouncement = await postAnnouncement(announcementData);

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

    if (ar_category?.toLowerCase() === "resident") {
      await postAnnouncementRecipient({
        recipients: [
          {
            ann: createdAnnouncement?.ann_id,
            ar_category: ar_category.trim(),
          },
        ],
      });
    }



    reset({ ...defaultValues, staff: user?.staff?.staff_id || "" });
    queryClient.invalidateQueries({ queryKey: ["announcements"] });
    router.back();
  } catch (error) {
    console.error("Error creating announcement:", error);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-xl bg-white items-center justify-center shadow-sm border border-gray-100"
        >
          <ChevronLeft size={22} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-semibold text-gray-900 -ml-10">
          Create Announcement
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Announcement Type */}
        <FormSelect
          control={control}
          name="ann_type"
          label="Announcement Type"
          options={[
            { label: "General", value: "general" },
            { label: "Public", value: "public" },
            { label: "Event", value: "event" },
          ]}
        />

        {annType ? (
  <>
    {/* Basic Info */}
    <FormInput
      control={control}
      name="ann_title"
      label="Announcement Title"
      placeholder="Enter a clear and descriptive title"
    />
    <FormInput
      control={control}
      name="ann_details"
      label="Announcement Details"
      placeholder="Provide details"
    />

    {/* Schedule */}
<Text className="text-gray-700 font-medium mt-4 mb-2">Schedule</Text>

{annType === "public" && (
  <>
    <FormDateAndTimeInput control={control} name="ann_event_start" label="Event Start" />
    <FormDateAndTimeInput control={control} name="ann_event_end" label="Event End" />
  </>
)}

{annType === "event" && (
  <>
    <FormDateAndTimeInput control={control} name="ann_start_at" label="Start Date & Time" />
    <FormDateAndTimeInput control={control} name="ann_event_start" label="Event Start" />
    <FormDateAndTimeInput control={control} name="ann_event_end" label="Event End" />
  </>
)}

{annType === "general" && (
  <>
    <FormDateAndTimeInput control={control} name="ann_start_at" label="Start Date & Time" />
    <FormDateAndTimeInput control={control} name="ann_end_at" label="End Date & Time" />
  </>
)}



    {["event", "general"].includes(annType) && (
      <>
        {/* Recipients */}
        <Text className="text-gray-700 font-medium mt-4 mb-2">Recipients</Text>
        <FormSelect
          control={control}
          name="ar_category"
          label="Target Audience"
          options={[
            { label: "Resident", value: "resident" },
            { label: "Staff", value: "staff" },
          ]}
        />
        {recipientType === "staff" && (
          <>
            <FormSelect
              control={control}
              name="pos_category"
              label="Category"
              options={categoryOptions}
            />
            {posCategory && (
              <FormSelect
                control={control}
                name="pos_group"
                label="Group"
                options={groupOptions}
              />
            )}
            {posGroup && (
              <FormComboCheckbox
                label="Positions"
                control={control}
                name="ar_type"
                options={positionsForGroup.map((pos: { pos_title: string }) => ({
                  id: pos.pos_title,
                  name: pos.pos_title,
                  label: pos.pos_title,
                  value: pos.pos_title,
                }))}
              />
            )}
          </>
        )}

        {/* Notifications */}
        <Text className="text-gray-700 font-medium mt-4 mb-2">Notifications</Text>
        <Controller
          control={control}
          name="ann_to_sms"
          render={({ field: { value, onChange } }) => (
            <TouchableOpacity
              className="flex-row items-center mb-2"
              onPress={() => onChange(!value)}
            >
              <View
                className={`w-5 h-5 mr-2 border rounded ${
                  value ? "bg-blue-500" : "bg-white"
                }`}
              />
              <Text className="text-gray-700">Send SMS</Text>
            </TouchableOpacity>
          )}
        />
        <Controller
          control={control}
          name="ann_to_email"
          render={({ field: { value, onChange } }) => (
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => onChange(!value)}
            >
              <View
                className={`w-5 h-5 mr-2 border rounded ${
                  value ? "bg-blue-500" : "bg-white"
                }`}
              />
              <Text className="text-gray-700">Send Email</Text>
            </TouchableOpacity>
          )}
        />
      </>
    )}

    <SubmitButton
  buttonLabel="Create Announcement"
  submittingLabel="Submitting..."
  isSubmitting={isSubmitting}
  handleSubmit={handleSubmit(onSubmit)}
/>
  </>
) : null}

      </ScrollView>
    </View>
  );
}

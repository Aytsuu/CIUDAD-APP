import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useForm, Controller, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ChevronLeft } from "lucide-react-native";
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
import PageLayout from "../_PageLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { useToastContext } from "@/components/ui/toast";
import { LoadingModal } from "@/components/ui/loading-modal";

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
  const { toast } = useToastContext();
  const queryClient = useQueryClient();
  const router = useRouter();

  type AnnouncementCreateFormValues = z.infer<typeof AnnouncementSchema> & {
    pos_category: string;
    pos_group: string;
  };

  const defaultValues = generateDefaultValues(AnnouncementSchema)

  const { control, watch, reset, getValues } =
    useForm<AnnouncementCreateFormValues>({
      resolver: zodResolver(AnnouncementSchema) as Resolver<any>,
      defaultValues: defaultValues,
    });

  const annType = watch("ann_type");
  const recipientType = watch("ar_category");
  const posCategory = watch("pos_category");
  const posGroup = watch("pos_group");

  const [selectedImages, setSelectedImages] = React.useState<MediaItem[]>([]);
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
  const { mutateAsync: postAnnouncementRecipient } =
    usePostAnnouncementRecipient();
  const { data: positions = [] } = usePositions("BARANGAY STAFF");

  const categoryOptions = React.useMemo(() => {
    const cats = positions
      .map((p: { pos_category: any }) => p.pos_category)
      .filter(Boolean);
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

  const onSubmit = async () => {
    try {
      const data = getValues()
      const cleanedData: Record<string, any> = {};
      for (const key in data) {
        const value = (data as any)[key];
        cleanedData[key] = value !== "" && value !== undefined ? value : null;
      }

      let {
        ar_type,
        ar_category,
        pos_category,
        pos_group,
        ...announcementData
      } = cleanedData;

      // Handle Event Type: Sync ann_end_at with ann_event_end if type is "event"
      if (announcementData.ann_type === "EVENT") {
        if (announcementData.ann_event_end && !announcementData.ann_end_at) {
          announcementData.ann_end_at = announcementData.ann_event_end;
        }
        if (!announcementData.ann_event_end && announcementData.ann_end_at) {
          announcementData.ann_event_end = announcementData.ann_end_at;
        }
      }

      // Handle Event & Public Types
      if (["EVENT", "PUBLIC"].includes(announcementData.ann_type)) {
        if (announcementData.ann_event_end && !announcementData.ann_end_at) {
          announcementData.ann_end_at = announcementData.ann_event_end;
        }
        if (!announcementData.ann_event_end && announcementData.ann_end_at) {
          announcementData.ann_event_end = announcementData.ann_end_at;
        }
      }

      // Public: strip recipients + notifications
      if (announcementData.ann_type === "PUBLIC") {
        announcementData.ar_category = null;
        announcementData.ar_type = [];
        announcementData.pos_category = null;
        announcementData.pos_group = null;
        announcementData.ann_to_sms = false;
        announcementData.ann_to_email = false;
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

      if (selectedImages.length > 0) {
        const filesPayload = selectedImages.map((file) => ({
          name: file.name,
          type: file.type,
          file: file.file,
        }));
        announcementData.files = filesPayload;
      }

      setIsSubmitting(true)
      const createdAnnouncement = await postAnnouncement({
        ...announcementData,
        staff: user?.staff?.staff_id
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

      reset(defaultValues);
      setSelectedImages([])
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement created")
    } catch (error) {
      toast.error("Failed to create a announcement. Please try again.")
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <Text className="text-gray-900 text-[13px]">Create Announcement</Text>
      }
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 px-6">
        {/* Announcement Type */}
        <FormSelect
          control={control}
          name="ann_type"
          label="Type"
          options={[
            { label: "GENERAL", value: "GENERAL" },
            { label: "PUBLIC", value: "PUBLIC" },
            { label: "EVENT", value: "EVENT" },
          ]}
        />

        {annType ? (
          <>
            {/* Basic Info */}
            <FormInput
              control={control}
              name="ann_title"
              label="Title"
              placeholder="Enter a clear and descriptive title"
            />
            <FormTextArea
              control={control}
              name="ann_details"
              label="Details"
              placeholder="Provide details"
            />

            {["EVENT", "GENERAL"].includes(annType) && (
              <>
                {/* Recipients */}
                <FormSelect
                  control={control}
                  name="ar_category"
                  label="Recipients"
                  options={[
                    { label: "RESIDENT", value: "RESIDENT" },
                    { label: "STAFF", value: "STAFF" },
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
                        options={positionsForGroup.map(
                          (pos: { pos_title: string }) => ({
                            id: pos.pos_title,
                            name: pos.pos_title,
                            label: pos.pos_title,
                            value: pos.pos_title,
                          })
                        )}
                      />
                    )}
                  </>
                )}

                {/* Schedule */}
                <Text className="text-gray-700 font-medium mt-3 mb-2">
                  Schedule
                </Text>

                {annType === "PUBLIC" && (
                  <>
                    <FormDateAndTimeInput
                      control={control}
                      name="ann_event_start"
                      label="Event Start"
                    />
                    <FormDateAndTimeInput
                      control={control}
                      name="ann_event_end"
                      label="Event End"
                    />
                  </>
                )}

                {annType === "EVENT" && (
                  <>
                    <FormDateAndTimeInput
                      control={control}
                      name="ann_start_at"
                      label="Start Date & Time"
                    />
                    <FormDateAndTimeInput
                      control={control}
                      name="ann_event_start"
                      label="Event Start"
                    />
                    <FormDateAndTimeInput
                      control={control}
                      name="ann_event_end"
                      label="Event End"
                    />
                  </>
                )}

                {annType === "GENERAL" && (
                  <>
                    <FormDateAndTimeInput
                      control={control}
                      name="ann_start_at"
                      label="Start Date & Time"
                    />
                    <FormDateAndTimeInput
                      control={control}
                      name="ann_end_at"
                      label="End Date & Time"
                    />
                  </>
                )}

                <View className="mt-6 mb-6">
                  <View className="mb-6">
                    <Text className="text-[14px] font-medium text-gray-700">
                      Images
                    </Text>
                    <Text className="text-sm text-gray-600">
                     Upload images, recommended but not required.
                    </Text>
                  </View>

                  <MediaPicker
                    selectedImages={selectedImages}
                    setSelectedImages={setSelectedImages}
                    multiple={true}
                    maxImages={2}
                  />
                </View>

                {/* Notifications */}
                <Text className="text-gray-700 font-medium mt-3 mb-2">
                  Additional Notifications
                </Text>
                <View className="flex-row gap-4 items-center">
                  <Controller
                    control={control}
                    name="ann_to_sms"
                    render={({ field: { value, onChange } }) => (
                      <TouchableOpacity
                        className="flex-row items-center gap-2"
                        onPress={() => onChange(!value)}
                        activeOpacity={1}
                      >
                        <Checkbox
                          checked={value}
                          onCheckedChange={(checked) => onChange(checked)}
                          className="border-gray-300 w-5 h-5"
                          indicatorClassName="bg-primaryBlue"
                        />
                        <Text className="text-gray-700">SMS</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <Controller
                    control={control}
                    name="ann_to_email"
                    render={({ field: { value, onChange } }) => (
                      <TouchableOpacity
                        className="flex-row items-center gap-2"
                        onPress={() => onChange(!value)}
                        activeOpacity={1}
                      >
                        <Checkbox
                          checked={value}
                          onCheckedChange={(checked) => onChange(checked)}
                          className="border-gray-300 w-5 h-5"
                          indicatorClassName="bg-primaryBlue"
                        />
                        <Text className="text-gray-700">EMAIL</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </>
            )}

            <View className="mt-8 mb-8">
              <SubmitButton
                buttonLabel="Create Announcement"
                submittingLabel="Submitting..."
                isSubmitting={isSubmitting}
                handleSubmit={onSubmit}
              />
            </View>
          </>
        ) : null}
      </View>
      <LoadingModal 
        visible={isSubmitting}
      />
    </PageLayout>
  );
}

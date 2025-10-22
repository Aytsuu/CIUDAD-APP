import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useForm, Controller, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { ChevronLeft } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { SubmitButton } from "@/components/ui/button/submit-button";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateAndTimeInput } from "@/components/ui/form/form-date-time-input";
import FormComboCheckbox from "@/components/ui/form/form-combo-checkbox";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import AnnouncementSchema from "@/form-schema/announcement-schema";
import {
  usePostAnnouncement,
  usePostAnnouncementRecipient,
  useUpdateAnnouncement,
} from "./queries";
import { usePositions } from "@/screens/_global_queries/Retrieve";
import { capitalize } from "@/helpers/capitalize";
import PageLayout from "../_PageLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { useToastContext } from "@/components/ui/toast";
import { LoadingModal } from "@/components/ui/loading-modal";

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
  const params = useLocalSearchParams();
  const data = React.useMemo(() => {
    try {
      return JSON.parse(params.data as string);
    } catch (error) {
      return null;
    }
  }, [params.data]);

  type AnnouncementCreateFormValues = z.infer<typeof AnnouncementSchema> & {
    pos_category: string;
    pos_group: string;
  };

  const defaultValues = generateDefaultValues(AnnouncementSchema);

  const { control, watch, reset, getValues, trigger, setValue } =
    useForm<AnnouncementCreateFormValues>({
      resolver: zodResolver(AnnouncementSchema) as Resolver<any>,
      defaultValues: defaultValues,
    });

  const annType = watch("ann_type");
  const recipientType = watch("ar_category");
  const posCategory = watch("pos_category");

  const [selectedImages, setSelectedImages] = React.useState<MediaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { mutateAsync: postAnnouncement } = usePostAnnouncement();
  const { mutateAsync: postAnnouncementRecipient } =
    usePostAnnouncementRecipient();
  const { mutateAsync: updateAnnouncement } = useUpdateAnnouncement();
  const { data: positions = [] } = usePositions();

  React.useEffect(() => {
    if (recipientType !== "STAFF") {
      reset((prev) => ({
        ...prev,
        ar_type: [],
        pos_category: "",
        pos_group: "",
      }));
    }
  }, [recipientType]);

  React.useEffect(() => {
    if (data) {
      setValue("ann_type", data?.ann_type);
      setValue("ann_title", data?.ann_title);
      setValue("ann_details", data?.ann_details);
      setValue("ar_category", data?.recipients?.ar_category);

      if (data?.recipients?.ar_types?.length > 0) {
        const types = data?.recipients?.ar_types;
        const category = new Set(
          positions
            .filter((pos: any) => types.includes(pos.pos_title) == true)
            .map((pos: any) => pos.pos_category)
        );
        console.log([...category][0]);
        if ([...category].length > 0) {
          setValue(
            "pos_category",
            [...category].length == 2 ? "ALL" : ([...category][0] as string)
          );
        }

        setValue("ar_type", types);
      }
      setValue("ann_start_at", data?.ann_start_at);
      setValue("ann_end_at", data?.ann_end_at);
      setValue("ann_event_start", data?.ann_event_start);
      setValue("ann_event_end", data?.ann_event_end);
      setValue("ann_to_sms", data?.ann_to_sms);
      setValue("ann_to_email", data?.ann_to_email);
    }
  }, [data]);

  const categoryOptions = React.useMemo(() => {
    const cats = positions
      .map((p: { pos_category: any }) => p.pos_category)
      .filter(Boolean);
    const uniqueCats = Array.from(new Set(cats));
    return uniqueCats.map((cat) => ({
      label: cat as string,
      value: cat as string,
    }));
  }, [positions]);

  const update = async () => {
    if (!(await trigger(["ann_title", "ann_details"]))) {
      toast.error("Please fill out all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const values = getValues();
      const {
        pos_group,
        pos_category,
        staff_group,
        ar_category,
        staff,
        ...announcementData
      } = values;

      const files = selectedImages.map((file) => ({
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

      router.back();
      toast.success("Updated successfully");
    } catch (err) {
      toast.error("Failed to update. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const create = async () => {
    if (!(await trigger(["ann_title", "ann_details"]))) {
      toast.error("Please fill out all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      const data = getValues();
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

      if (selectedImages.length > 0) {
        const filesPayload = selectedImages.map((file) => ({
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

      reset(defaultValues);
      setSelectedImages([]);
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Announcement created");
    } catch (error) {
      toast.error("Failed to create a announcement. Please try again.");
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
        <Text className="text-gray-900 text-[13px]">Post Announcement</Text>
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

            {/* Recipients */}
            <FormSelect
              control={control}
              name="ar_category"
              label="Recipients"
              options={[
                { label: "RESIDENT ONLY", value: "RESIDENT" },
                { label: "STAFF ONLY", value: "STAFF" },
                { label: "PUBLIC", value: "PUBLIC" },
              ]}
            />
            {recipientType === "STAFF" && (
              <>
                <FormSelect
                  control={control}
                  name="pos_category"
                  label="Category"
                  options={[{ label: "ALL", value: "ALL" }, ...categoryOptions]}
                />
                {posCategory && (
                  <FormComboCheckbox
                    label="Positions"
                    control={control}
                    name="ar_type"
                    options={positions
                      .filter(
                        (pos: any) =>
                          (pos.pos_category == posCategory ||
                            posCategory == "ALL") &&
                          pos.pos_title !== "ADMIN"
                      )
                      .map((pos: any) => ({
                        label: pos.pos_title,
                        value: pos.pos_title,
                      }))}
                  />
                )}
              </>
            )}

            {/* Schedule */}
            <Text className="text-gray-700 font-medium mt-6 mb-2">
              Schedule
            </Text>

            {annType === "EVENT" ? (
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
            ) : (
              <View>
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
              </View>
            )}

            <View className="mt-6 mb-6">
              <View className="mb-6">
                <Text className="text-[14px] font-medium text-gray-700">
                  Images
                </Text>
                <Text className="text-sm text-gray-600">
                  {data
                    ? "Uploading new image, will remove the current."
                    : "Upload images, recommended but not required."}
                </Text>
              </View>

              <MediaPicker
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                limit={2}
              />
            </View>

            {/* Notifications */}
            {!data && (
              <>
                <Text className="text-gray-700 font-medium mt-3 mb-4">
                  Additional Notifications
                </Text>
                <View className="flex-row gap-8 items-center">
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
                buttonLabel={
                  data ? "Update Announcement" : "Create Announcement"
                }
                submittingLabel={data ? "Saving..." : "Creating..."}
                isSubmitting={isSubmitting}
                handleSubmit={data ? update : create}
              />
            </View>
          </>
        ) : null}
      </View>
      <LoadingModal visible={isSubmitting} />
    </PageLayout>
  );
}

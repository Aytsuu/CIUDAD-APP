import "@/global.css";
import { useState } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react-native";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { CreateFolderSchema } from "@/form-schema/treasurer-inc-disbursement";
import { useCreateFolder, useUploadImage } from "./queries";
import { CreateFolderFormValues } from "./inc-disc-types";
import MultiImageUploader, {
  MediaFileType,
} from "@/components/ui/multi-media-upload";
import PageLayout from "@/screens/_PageLayout";

const CreateFolderForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFolderFormValues>({
    resolver: zodResolver(CreateFolderSchema),
    defaultValues: {
      type: "income",
      name: "",
      desc: "",
      year: new Date().getFullYear().toString(),
    },
    mode: "onBlur",
  });

  const type = useWatch({ control, name: "type" });
  const createFolderMutation = useCreateFolder();
  const uploadImageMutation = useUploadImage(type === "income");

  const onSubmit = async (data: CreateFolderFormValues) => {
    setIsSubmitting(true);
    try {
      const folderPayload = {
        type: data.type,
        name: data.name,
        year: data.year,
        desc: data.desc,
        is_archive: false,
      };

      const newFolder = await createFolderMutation.mutateAsync(folderPayload);
      const newFolderId =
        data.type === "income" ? newFolder.inf_num : newFolder.dis_num;

      if (!newFolderId)
        throw new Error("Failed to get folder ID from response");

      if (mediaFiles.length > 0) {
        await Promise.all(
          mediaFiles.map((file) => {
            const imagePayload = {
              upload_date: new Date().toISOString(),
              type: file.type || "image/jpeg",
              name:
                file.name ||
                file.path.split("/").pop() ||
                `image_${Date.now()}.jpg`,
              path: file.path,
              url: file.publicUrl || file.uri,
              folder: newFolderId,
            };
            return uploadImageMutation.mutateAsync(imagePayload);
          })
        );
      }
      router.push({
        pathname: "/(treasurer)/inc-disbursement/inc-disb-main",
        params: {
          isIncome: (data.type === "income").toString(),
          folderId: newFolderId.toString(),
        },
      });
    } catch (error) {
      console.error("Form submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerTitle={<Text>Create New Folder and Upload Images</Text>}
      rightAction={
        <View></View>
      }
    >
      <View className="flex-1 p-5">
        <FormSelect
          control={control}
          name="type"
          label="Folder Type"
          options={[
            { label: "Income", value: "income" },
            { label: "Disbursement", value: "disbursement" },
          ]}
        />

        <FormInput
          control={control}
          name="name"
          label="Folder Name"
          placeholder="Enter folder name"
        />

        <FormInput
          control={control}
          name="year"
          label="Year"
          placeholder="Enter year (e.g., 2025)"
          keyboardType="numeric"
          maxInput={4}
        />

        <FormInput
          control={control}
          name="desc"
          label="Description"
          placeholder="Enter description"
        />

        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Upload Images
          </Text>
          <MultiImageUploader
            mediaFiles={mediaFiles}
            setMediaFiles={setMediaFiles}
            maxFiles={5}
          />
        </View>

        <View className="mt-auto pt-4 bg-white border-t border-gray-200 px-4 pb-4">
          <TouchableWithoutFeedback
            onPress={handleSubmit(onSubmit)}
            disabled={
              isSubmitting || mediaFiles.some((f) => f.status === "uploading")
            }
          >
            <View
              className={`
                bg-primaryBlue py-3 rounded-lg
                ${
                  isSubmitting ||
                  mediaFiles.some((f) => f.status === "uploading")
                    ? "opacity-70"
                    : ""
                }
              `}
            >
              <Text className="text-white text-base font-semibold text-center">
                {isSubmitting ? "Submitting..." : "Create"}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </PageLayout>
  );
};

export default CreateFolderForm;

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
import { useCreateFolder, useUploadImages } from "./queries";
import { CreateFolderFormValues } from "./inc-disc-types";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import PageLayout from "@/screens/_PageLayout";

const CreateFolderForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);

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
  const uploadImagesMutation = useUploadImages(type === "income");

  const onSubmit = async (data: CreateFolderFormValues) => {
    setIsSubmitting(true);
    try {
      // Step 1: Create the folder
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

      if (!newFolderId) {
        throw new Error("Failed to get folder ID from response");
      }

      // Step 2: Upload images if any are selected
      if (selectedImages.length > 0) {
        // Convert MediaItem[] to the format expected by your backend
        const imageFiles = selectedImages.map((item) => ({
          name: item.name || `image_${Date.now()}.jpg`,
          type: item.type || "image/jpeg",
          file: `data:${item.type || "image/jpeg"};base64,${item.file}`,
        }));

        const imagePayload =
          data.type === "income"
            ? { inf_num: newFolderId, files: imageFiles }
            : { dis_num: newFolderId, files: imageFiles };

        await uploadImagesMutation.mutateAsync(imagePayload);
      }
      setSelectedImages([]);
      // Navigate to the folder view
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
      rightAction={<View></View>}
      footer={
        <View>
          <TouchableWithoutFeedback
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <View
              className={`
                bg-primaryBlue py-3 rounded-lg
                ${isSubmitting ? "opacity-70" : ""}
              `}
            >
              <Text className="text-white text-base font-semibold text-center">
                {isSubmitting ? "Submitting..." : "Create"}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
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

        <Text className="text-lg font-bold text-gray-800 mb-2">
          Upload Images
        </Text>
        <MediaPicker
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
          multiple={true}
        />
      </View>
    </PageLayout>
  );
};

export default CreateFolderForm;

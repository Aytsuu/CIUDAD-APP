import "@/global.css";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react-native";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { CreateFolderSchema } from "@/form-schema/treasurer-inc-disbursement";
import {
  useCreateFolder,
  useUpdateFolder,
  useGetIncomeFolder,
  useGetDisbursementFolder,
  useGetIncomeImages,
  useGetDisbursementImages,
  useUploadImages,
} from "./queries";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import {
  IncomeFolder,
  DisbursementFolder,
  IncomeImage,
  DisbursementImage,
  CreateFolderFormValues,
} from "./inc-disc-types";
import PageLayout from "@/screens/_PageLayout";

const EditFolderForm = () => {
  const { id: folderId, type: folderType } = useLocalSearchParams<{
    id: string;
    type: string;
  }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
  const [initialImageIds, setInitialImageIds] = useState<string[]>([]);

  const { control, handleSubmit, reset } = useForm<CreateFolderFormValues>({
    resolver: zodResolver(CreateFolderSchema),
    defaultValues: {
      type: "income",
      name: "",
      desc: undefined, // Matches optional desc
      year: new Date().getFullYear().toString(),
    },
    mode: "onBlur",
  });

  const updateFolderMutation = useUpdateFolder();
  const createFolderMutation = useCreateFolder();
  const { data: incomeFolder, isLoading: isIncomeFolderLoading } =
    useGetIncomeFolder(
      folderType === "income" ? parseInt(folderId || "0", 10) : null
    );
  const { data: disbursementFolder, isLoading: isDisbursementFolderLoading } =
    useGetDisbursementFolder(
      folderType === "disbursement" ? parseInt(folderId || "0", 10) : null
    );
  const { data: incomeImages } = useGetIncomeImages(
    false,
    folderType === "income" ? parseInt(folderId, 10) : undefined
  );
  const { data: disbursementImages } = useGetDisbursementImages(
    false,
    folderType === "disbursement" ? parseInt(folderId, 10) : undefined
  );
  

  useEffect(() => {
    if (folderId && folderType) {
      const folder =
        folderType === "income" ? incomeFolder : disbursementFolder;
      const isLoading =
        folderType === "income"
          ? isIncomeFolderLoading
          : isDisbursementFolderLoading;
      if (folder && !isLoading) {
        reset({
          type: folderType as "income" | "disbursement",
          name:
            folderType === "income"
              ? (folder as IncomeFolder).inf_name
              : (folder as DisbursementFolder).dis_name,
          year:
            folderType === "income"
              ? (folder as IncomeFolder).inf_year
              : (folder as DisbursementFolder).dis_year,
          desc:
            folderType === "income"
              ? (folder as IncomeFolder).inf_desc
              : (folder as DisbursementFolder).dis_desc,
        });
      }

      let images: (IncomeImage | DisbursementImage)[] = [];
      if (folderType === "income" && incomeImages) images = incomeImages;
      else if (folderType === "disbursement" && disbursementImages)
        images = disbursementImages;

      // Convert existing images to MediaItem format
      const initialMediaItems: MediaItem[] = images.map(
        (img) =>
          ({
            file: "", // Base64 not available for existing images
            type:
              folderType === "income"
                ? (img as IncomeImage).infi_type
                : (img as DisbursementImage).disf_type,
            name:
              folderType === "income"
                ? (img as IncomeImage).infi_name
                : (img as DisbursementImage).disf_name,
            uri:
              folderType === "income"
                ? (img as IncomeImage).infi_url
                : (img as DisbursementImage).disf_url,
            id: (folderType === "income"
              ? (img as IncomeImage).infi_num
              : (img as DisbursementImage).disf_num
            ).toString(),
          } as MediaItem)
      );

      const initialIds = initialMediaItems.map((item) => item.id || "");
      setInitialImageIds(initialIds);
      setSelectedImages(initialMediaItems);
    }
  }, [
    folderId,
    folderType,
    incomeFolder,
    disbursementFolder,
    isIncomeFolderLoading,
    isDisbursementFolderLoading,
    incomeImages,
    disbursementImages,
    reset,
  ]);

  const uploadImagesMutation = useUploadImages(folderType === "income");

  const onSubmit = async (data: {
    type: "income" | "disbursement";
    name: string;
    desc?: string;
    year: string;
  }) => {
    setIsSubmitting(true);
    try {
      if (folderId && folderType) {
        const folderIdNum = parseInt(folderId, 10);

        // 1. Update folder details
        await updateFolderMutation.mutateAsync({
          id: folderIdNum,
          type: data.type,
          data: { name: data.name, year: data.year, desc: data.desc ?? "" },
        });

        // 2. Handle new images (those not in initialImageIds and have file data)
        const newImages = selectedImages.filter(
          (image) => !initialImageIds.includes(image.id || "") && image.file
        );

        if (newImages.length > 0) {
          // Convert MediaItem[] to the format expected by your backend
          const imageFiles = newImages.map((item) => ({
            name: item.name || `image_${Date.now()}.jpg`,
            type: item.type || "image/jpeg",
            file: `data:${item.type || "image/jpeg"};base64,${item.file}`,
          }));

          const imagePayload =
            data.type === "income"
              ? { inf_num: folderIdNum, files: imageFiles }
              : { dis_num: folderIdNum, files: imageFiles };

          await uploadImagesMutation.mutateAsync(imagePayload);
        }
        setSelectedImages([]);
        
        router.push({
          pathname: "/(treasurer)/inc-disbursement/inc-disb-main",
          params: { isIncome: (data.type === "income").toString(), folderId },
        });
      } else {
        // Create new folder (same as create form)
        const folderPayload = {
          type: data.type,
          name: data.name,
          desc: data.desc ?? "",
          year: data.year,
          is_archive: false,
        };

        const newFolder = await createFolderMutation.mutateAsync(folderPayload);
        const newFolderId =
          data.type === "income" ? newFolder.inf_num : newFolder.dis_num;

        if (!newFolderId) {
          throw new Error("Failed to get folder ID from response");
        }

        // Upload images if any are selected
        if (selectedImages.length > 0) {
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

        router.push({
          pathname: "/(treasurer)/inc-disbursement/inc-disb-main",
          params: {
            isIncome: (data.type === "income").toString(),
            folderId: newFolderId.toString(),
          },
        });
      }
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
      headerTitle={<Text>Edit Folder and Manage Images</Text>}
      rightAction={<View></View>}
      footer={
        <View>
          <ConfirmationModal
            trigger={
              <TouchableOpacity
                className={`bg-primaryBlue py-3 rounded-lg ${
                  isSubmitting ? "opacity-70" : ""
                }`}
                disabled={isSubmitting}
              >
                <Text className="text-white text-base font-semibold text-center">
                  {isSubmitting ? "Submitting..." : "Update"}
                </Text>
              </TouchableOpacity>
            }
            title="Confirm Changes"
            description="Are you sure you want to save these changes to the folder and images?"
            actionLabel="Save Changes"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            loadingMessage="Saving changes..."
          />
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
          disabled={!!folderId}
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
          Manage Images
        </Text>
        <MediaPicker
          selectedImages={selectedImages}
          setSelectedImages={setSelectedImages}
          multiple={true}
          onlyRemoveNewImages={true}
          initialImageIds={initialImageIds}
        />
      </View>
    </PageLayout>
  );
};

export default EditFolderForm;

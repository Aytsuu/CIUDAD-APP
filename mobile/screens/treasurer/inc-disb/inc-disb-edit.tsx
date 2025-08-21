import "@/global.css";
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {  ChevronLeft } from "lucide-react-native";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { ConfirmationModal } from "@/components/ui/confirmationModal";
import { CreateFolderSchema } from "@/form-schema/treasurer-inc-disbursement";
import {
  useCreateFolder,
  useUpdateFolder,
  useGetIncomeFolder,
  useGetDisbursementFolder,
  useUpdateImage,
  useGetIncomeImages,
  useGetDisbursementImages,
  useUploadImage,
} from "./queries";
import MultiImageUploader, {
  MediaFileType,
} from "@/components/ui/multi-media-upload";
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
  const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>([]);
  const [initialImages, setInitialImages] = useState<MediaFileType[]>([]);
  const {
    control,
    handleSubmit,
    reset,
  } = useForm<CreateFolderFormValues>({
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
  const updateImageMutation = useUpdateImage();
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
      const initialMediaFiles = images.map(
        (img) =>
          ({
            uri:
              folderType === "income"
                ? (img as IncomeImage).infi_url
                : (img as DisbursementImage).disf_url,
            status: "uploaded" as const,
            type:
              folderType === "income"
                ? (img as IncomeImage).infi_type
                : (img as DisbursementImage).disf_type,
            name:
              folderType === "income"
                ? (img as IncomeImage).infi_name
                : (img as DisbursementImage).disf_name,
            path:
              folderType === "income"
                ? (img as IncomeImage).infi_path
                : (img as DisbursementImage).disf_path,
            id: (folderType === "income"
              ? (img as IncomeImage).infi_num
              : (img as DisbursementImage).disf_num
            ).toString(),
          } as MediaFileType)
      );
      setInitialImages(initialMediaFiles);
      setMediaFiles(initialMediaFiles);
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

  const uploadImageMutation = useUploadImage(folderType === "income");
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

        // 2. Handle new images using useUploadImage (same as create form)
        const newFiles = mediaFiles.filter(
          (file) =>
            file.status === "uploaded" &&
            !initialImages.some((i) => i.id === file.id)
        );

        await Promise.all(
          newFiles.map((file) => {
            return uploadImageMutation.mutateAsync({
              upload_date: new Date().toISOString(),
              type: file.type || "image/jpeg",
              name:
                file.name ||
                file.path.split("/").pop() ||
                `image_${Date.now()}.jpg`,
              path: file.path || "",
              url: file.publicUrl || file.uri || "",
              folder: folderIdNum,
            });
          })
        );

        // 3. Handle updated images (keep using updateImageMutation)
        const updatedFiles = mediaFiles.filter((file) =>
          initialImages.some(
            (i) =>
              i.id === file.id && (i.uri !== file.uri || i.path !== file.path)
          )
        );

        await Promise.all(
          updatedFiles.map((file) => {
            const initialImage = initialImages.find((i) => i.id === file.id);
            if (!initialImage) return Promise.resolve();

            return updateImageMutation.mutateAsync({
              id: parseInt(initialImage.id, 10),
              type: data.type,
              data: {
                [data.type === "income" ? "infi_url" : "disf_url"]:
                  file.publicUrl || file.uri,
                [data.type === "income" ? "infi_path" : "disf_path"]:
                  file.path || "",
              },
            });
          })
        );

        router.push({
          pathname: "/(treasurer)/inc-disbursement/inc-disb-main",
          params: { isIncome: (data.type === "income").toString(), folderId },
        });
      } else {
        const folderPayload = {
          type: data.type,
          name: data.name,
          desc: data.desc ?? "",
          year: data.year,
        };
        const newFolder = await createFolderMutation.mutateAsync(folderPayload);
        const newFolderId =
          data.type === "income" ? newFolder.inf_num : newFolder.dis_num;
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
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-2">
            Manage Images
          </Text>
          <MultiImageUploader
            mediaFiles={mediaFiles}
            setMediaFiles={setMediaFiles}
            maxFiles={5}
            hideRemoveButton={true}
          />
        </View>

        <View className="mt-auto pt-4 bg-white border-t border-gray-200 px-4 pb-4">
          <ConfirmationModal
            trigger={
              <TouchableOpacity
                className={`bg-primaryBlue py-3 rounded-lg ${
                  isSubmitting ||
                  mediaFiles.some((f) => f.status === "uploading")
                    ? "opacity-70"
                    : ""
                }`}
                disabled={
                  isSubmitting ||
                  mediaFiles.some((f) => f.status === "uploading")
                }
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
            loading={
              isSubmitting || mediaFiles.some((f) => f.status === "uploading")
            }
            loadingMessage="Saving changes..."
          />
      </View>
      </View>
    </PageLayout>
  );
};

export default EditFolderForm;

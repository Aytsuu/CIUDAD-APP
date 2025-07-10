import "@/global.css"
import { useState } from "react"
import { View, Text, TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, TouchableOpacity } from "react-native"
import { router } from "expo-router"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, ChevronLeft } from "lucide-react-native"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import ScreenLayout from "@/screens/_ScreenLayout"
import { CreateFolderSchema } from "@/form-schema/treasurer-inc-disbursement"
import { useCreateFolder, useUploadImage } from "./queries"
import type { CreateFolderFormValues } from "./queries"
import MultiImageUploader, { MediaFileType } from "@/components/ui/multi-media-upload"

const CreateFolderForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>([])

  const { control, handleSubmit, formState: { errors } } = useForm<CreateFolderFormValues>({
    resolver: zodResolver(CreateFolderSchema),
    defaultValues: {
      type: "income",
      name: "",
      desc: "",
      year: new Date().getFullYear().toString(),
    },
    mode: "onBlur",
  })

  const type = useWatch({ control, name: "type" })
  const createFolderMutation = useCreateFolder()
  const uploadImageMutation = useUploadImage(type === "income")

  const onSubmit = async (data: CreateFolderFormValues) => {
    setIsSubmitting(true)
    try {
      const folderPayload = {
        type: data.type,
        name: data.name,
        year: data.year,
        desc: data.desc,
        is_archive: false,
      }

      const newFolder = await createFolderMutation.mutateAsync(folderPayload)
      const newFolderId = data.type === "income" ? newFolder.inf_num : newFolder.dis_num
      
      if (!newFolderId) throw new Error("Failed to get folder ID from response")

      if (mediaFiles.length > 0) {
      await Promise.all(
        mediaFiles.map(file => {
          const imagePayload = {
            upload_date: new Date().toISOString(),
            type: file.type || "image/jpeg",
            name: file.name || file.path.split('/').pop() || `image_${Date.now()}.jpg`,
            path: file.path,
            url: file.publicUrl || file.uri,
            folder: newFolderId
          };
          return uploadImageMutation.mutateAsync(imagePayload);
        })
      );
    }
      router.push({
        pathname: "/(treasurer)/inc-disbursement/inc-disb-main",
        params: { 
          isIncome: (data.type === "income").toString(), 
          folderId: newFolderId.toString() 
        },
      })
    } catch (error) {
      console.error("Form submission failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Create New Folder and Upload Images</Text>}
      showExitButton={false}
      headerAlign="left"
      scrollable={true}
      keyboardAvoiding={true}
      contentPadding="medium"
      loading={isSubmitting}
      loadingMessage="Creating folder and uploading images..."
      error={errors.root?.message ? { message: errors.root.message, onDismiss: () => {} } : undefined}
    >

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
          />

          <FormInput
            control={control}
            name="desc"
            label="Description"
            placeholder="Enter description"
          />

          <View className="mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-2">Upload Images</Text>
            <MultiImageUploader
              mediaFiles={mediaFiles}
              setMediaFiles={setMediaFiles}
              maxFiles={5}
            />
          </View>

          <View className="flex-row justify-end mt-6">
            <TouchableWithoutFeedback 
              onPress={handleSubmit(onSubmit)} 
              disabled={isSubmitting || mediaFiles.some(f => f.status === 'uploading')}
            >
              <View className={`
                bg-blue-500 rounded-lg flex-row items-center px-6 py-3
                ${isSubmitting || mediaFiles.some(f => f.status === 'uploading') ? 'opacity-70' : ''}
              `}>
                <Text className="text-white text-lg font-medium">
                  {isSubmitting ? "Submitting..." : "Create"}
                </Text>
                {isSubmitting && <Loader2 size={20} color="white" className="ml-2 animate-spin" />}
              </View>
            </TouchableWithoutFeedback>
          </View>
    </ScreenLayout>
  )
}

export default CreateFolderForm
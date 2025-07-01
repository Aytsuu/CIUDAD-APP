// import "@/global.css"
// import { useState } from "react"
// import { View, Text, TouchableWithoutFeedback, ScrollView, KeyboardAvoidingView, TouchableOpacity } from "react-native"
// import { router } from "expo-router"
// import { useForm, useWatch } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { Loader2, ChevronLeft } from "lucide-react-native"
// import { FormInput } from "@/components/ui/form/form-input"
// import { FormSelect } from "@/components/ui/form/form-select"
// import ScreenLayout from "@/screens/_ScreenLayout"
// import { CreateFolderSchema } from "@/form-schema/treasurer-inc-disbursement"
// import { useCreateFolder, CreateFolderFormValues } from "./queries"
// import MultiImageUploader, { MediaFileType } from "@/components/ui/multi-media-upload"

// const CreateFolderForm = () => {
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>([])

//   const { control, handleSubmit, formState: { errors } } = useForm<CreateFolderFormValues>({
//     resolver: zodResolver(CreateFolderSchema),
//     defaultValues: {
//       type: "income",
//       name: "",
//       year: new Date().getFullYear().toString(),
//     },
//     mode: "onBlur",
//   })

//   const type = useWatch({ control, name: "type" })
//   const createFolderMutation = useCreateFolder()

//   const onSubmit = async (data: CreateFolderFormValues) => {
//     setIsSubmitting(true)
//     try {
//       // 1. Create folder first
//       const folderPayload = {
//         type: data.type,
//         name: data.name.trim(),
//         year: parseInt(data.year, 10),
//         is_archive: false,
//       }

//       const newFolder = await createFolderMutation.mutateAsync(folderPayload)
//       const newFolderId = data.type === "income" ? newFolder.inf_num : newFolder.dis_num
      
//       if (!newFolderId) throw new Error("Failed to get folder ID from response")

//       // 2. Save images to database if any were uploaded
//       if (mediaFiles.length > 0) {
//         const uploadedFiles = mediaFiles.filter(file => file.status === 'uploaded')
        
//         for (const file of uploadedFiles) {
//           const imagePayload = {
//             upload_date: new Date().toISOString(),
//             type: file.type || "image/jpeg",
//             name: file.name || file.path.split('/').pop() || `image_${Date.now()}.jpg`,
//             path: file.path,
//             url: file.publicUrl || file.uri,
//             folder: newFolderId,
//             // Include all required fields for both income and disbursement
//             ...(data.type === "income" 
//               ? { 
//                   infi_is_archive: false,
//                   infi_path: file.path,
//                   infi_url: file.publicUrl || file.uri,
//                   inf_num: newFolderId
//                 }
//               : { 
//                   disf_is_archive: false,
//                   disf_path: file.path,
//                   disf_url: file.publicUrl || file.uri,
//                   dis_num: newFolderId
//                 }
//             )
//           }

//           const endpoint = data.type === "income" 
//             ? "treasurer/income-tab/images/" 
//             : "treasurer/disbursement-tab/images/"
          
//           const response = await fetch(`http://192.168.254.100:8000/${endpoint}`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(imagePayload)
//           })

//           if (!response.ok) {
//             const errorData = await response.json()
//             console.error('Failed to save image:', errorData)
//             throw new Error(`Image save failed: ${JSON.stringify(errorData)}`)
//           }
//         }
//       }

//       // 3. Navigate
//       router.push({
//         pathname: "/treasurer/inc-disbursement/inc-disb-main",
//         params: { 
//           isIncome: (data.type === "income").toString(), 
//           folderId: newFolderId.toString() 
//         },
//       })
//     } catch (error) {
//       console.error("Form submission failed:", error)
//     } finally {
//       setIsSubmitting(false)
//     }
//   }
 
//   return (
//     <ScreenLayout
//  customLeftAction={
//         <TouchableOpacity onPress={() => router.back()}>
//           <ChevronLeft size={30} color="black" className="text-black" />
//         </TouchableOpacity>
//       }
//       headerBetweenAction={<Text className="text-[13px]">Create New Folder and Upload Images</Text>}
//       showExitButton={false}
//       headerAlign="left"
//       scrollable={true}
//       keyboardAvoiding={true}
//       contentPadding="medium"
//       loading={isSubmitting}
//       loadingMessage="Creating folder and uploading images..."
//       error={errors.root?.message ? { message: errors.root.message, onDismiss: () => {} } : undefined}
//     >
//       <KeyboardAvoidingView
//         behavior="height"
//         keyboardVerticalOffset={10}
//         enabled
//         style={{ flex: 1 }}
//       >
//         <ScrollView className="flex-1 px-4 py-4 space-y-4" keyboardShouldPersistTaps="handled">
//           <FormSelect
//             control={control}
//             name="type"
//             label="Folder Type"
//             options={[
//               { label: "Income", value: "income" },
//               { label: "Disbursement", value: "disbursement" },
//             ]}
//           />

//           <FormInput
//             control={control}
//             name="name"
//             label="Folder Name"
//             placeholder="Enter folder name"
//           />

//           <FormInput
//             control={control}
//             name="year"
//             label="Year"
//             placeholder="Enter year (e.g., 2025)"
//             keyboardType="numeric"
//           />

//           <View className="mb-4">
//             <Text className="text-lg font-bold text-gray-800 mb-2">Upload Images</Text>
//             <MultiImageUploader
//               mediaFiles={mediaFiles}
//               setMediaFiles={setMediaFiles}
//               maxFiles={5}
//             />
//           </View>

//           <View className="flex-row justify-end mt-6">
//             <TouchableWithoutFeedback 
//               onPress={handleSubmit(onSubmit)} 
//               disabled={isSubmitting || mediaFiles.some(f => f.status === 'uploading')}
//             >
//               <View className={`
//                 bg-blue-500 rounded-lg flex-row items-center px-6 py-3
//                 ${isSubmitting || mediaFiles.some(f => f.status === 'uploading') ? 'opacity-70' : ''}
//               `}>
//                 <Text className="text-white text-lg font-medium">
//                   {isSubmitting ? "Submitting..." : "Create"}
//                 </Text>
//                 {isSubmitting && <Loader2 size={20} color="white" className="ml-2 animate-spin" />}
//               </View>
//             </TouchableWithoutFeedback>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </ScreenLayout>
//   )
// }

// export default CreateFolderForm

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
        name: data.name.trim(),
        year: data.year,
        is_archive: false,
      }

      const newFolder = await createFolderMutation.mutateAsync(folderPayload)
      const newFolderId = data.type === "income" ? newFolder.inf_num : newFolder.dis_num
      
      if (!newFolderId) throw new Error("Failed to get folder ID from response")

      if (mediaFiles.length > 0) {
        const uploadPromises = mediaFiles
          .filter(file => file.status === 'uploaded')
          .map(file => {
            const imagePayload = {
              upload_date: new Date().toISOString(),
              type: file.type || "image/jpeg",
              name: file.name || file.path.split('/').pop() || `image_${Date.now()}.jpg`,
              path: file.path,
              url: file.publicUrl || file.uri,
              folder: newFolderId
            }
            return uploadImageMutation.mutateAsync(imagePayload)
          })

        await Promise.all(uploadPromises)
      }

      router.push({
        pathname: "/treasurer/inc-disbursement/inc-disb-main",
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
// import '@/global.css';
// import React, { useState } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
// import { Button } from '@/components/ui/button';
// import _ScreenLayout from '@/screens/_ScreenLayout';
// import { ChevronLeft } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
// import { LoadingModal } from '@/components/ui/loading-modal';
// import { useAddRemarks } from "../queries/summonInsertQueries";
// import { Checkbox } from '@/components/ui/checkbox';
// import { useLocalSearchParams } from 'expo-router';
// import { useForm, Controller } from 'react-hook-form';
// import { Textarea } from '@/components/ui/textarea';

// export default function SummonRemarksForm() {
//     const router = useRouter();
//     const params = useLocalSearchParams()
//     const {hs_id, st_id, sc_id, schedCount} = params
//     const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
//     const { mutate: addRemarks, isPending } = useAddRemarks();

//     const { control, handleSubmit, formState: { errors }, watch } = useForm({
//         defaultValues: {
//             remarks: '',
//             closeHearing: false,
//         }
//     });

//     // Watch the remarks field to get its current value
//     const remarksValue = watch('remarks');
    
//     // Check if both files and remarks are provided
//     const hasFiles = selectedImages.length > 0;
//     const hasRemarks = remarksValue?.trim().length > 0;
//     const isSubmitDisabled = isPending || !hasFiles || !hasRemarks;

//     const onSubmit = (data: { remarks: string; closeHearing: boolean }) => {
//         if (selectedImages.length === 0) {
//             Alert.alert("Upload Required", "Please upload at least one file");
//             return;
//         }

//         if (!data.remarks.trim()) {
//             Alert.alert("Remarks Required", "Please enter your remarks");
//             return;
//         }

//         const files = selectedImages.map((media) => ({
//             name: media.name,
//             type: media.type,
//             file: media.file
//         }));

//         const status_type = parseInt(schedCount as string) > 3 ? "Lupon" : "Council";

//         addRemarks({ 
//             hs_id: String(hs_id), 
//             st_id: String(st_id), 
//             sc_id: String(sc_id), 
//             remarks: data.remarks, 
//             close: data.closeHearing, 
//             status_type, 
//             files 
//         });
//     };

//     return (
//         <_ScreenLayout
//             showExitButton={false}
//             customLeftAction={
//                 <TouchableOpacity onPress={() => router.back()}>
//                     <ChevronLeft size={30} className="text-black" />
//                 </TouchableOpacity>
//             }
//             headerBetweenAction={<Text className="text-[13px]">Add Remarks</Text>}
//             stickyFooter={true}
//             footer={
//                  <View className="py-3">
//                         <Button
//                             onPress={handleSubmit(onSubmit)}
//                             disabled={isSubmitDisabled}
//                             className={`w-full rounded-xl shadow-lg ${
//                                 isSubmitDisabled ? 'bg-gray-400' : 'bg-primaryBlue'
//                             }`}
//                         >
//                             <Text className="text-white font-PoppinsSemiBold text-[16px]">
//                                 {isPending ? "Submitting..." : "Submit Remarks"}
//                             </Text>
//                         </Button>
                        
//                         {isSubmitDisabled && !isPending && (
//                             <Text className="text-center text-[12px] text-gray-500 mt-2 font-PoppinsRegular">
//                                 Please upload files and enter remarks to submit
//                             </Text>
//                         )}
//                     </View>
//             }
//         >
//             <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
//                 <View className="p-6">
//                     {/* Media Upload Section */}
//                     <View className="space-y-3">
//                         <View>
//                             <Text className="text-[16px] font-PoppinsSemiBold text-gray-900 mb-1">
//                                 Supporting Documents
//                             </Text>
//                             <Text className="text-[12px] font-PoppinsRegular pb-1">
//                                 Upload all required files as evidence or supporting documents
//                             </Text>
//                         </View>
                        
//                         <MediaPicker
//                             selectedImages={selectedImages}
//                             setSelectedImages={setSelectedImages}
//                             multiple={true}
//                         />
                        
//                         {selectedImages.length === 0 && (
//                             <Text className="text-[12px] text-amber-600 font-PoppinsRegular mt-2">
//                                 At least one file is required
//                             </Text>
//                         )}
//                     </View>

//                     {/* Remarks Section */}
//                     <View className="space-y-3 mt-3 mb-3">
//                         <Text className="text-[16px] font-PoppinsSemiBold text-gray-900">
//                             Remarks
//                         </Text>

//                         <Controller
//                             control={control}
//                             name="remarks"
//                             render={({ field: { value, onChange } }) => (
//                                 <Textarea
//                                     value={value}
//                                     onChangeText={onChange}
//                                     numberOfLines={6}
//                                     className="min-h-[120px] bg-white text-[12px] text-black font-PoppinsRegular border-gray-300"
//                                 />
//                             )}
//                         />
//                         {errors.remarks && (
//                             <Text className="text-[12px] text-amber-600 font-PoppinsRegular">
//                                 {errors.remarks.message}
//                             </Text>
//                         )}
//                     </View>

//                     {/* Close Hearing Checkbox */}
//                     <View className="flex-row items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
//                         <Controller
//                             control={control}
//                             name="closeHearing"
//                             render={({ field: { value, onChange } }) => (
//                                 <TouchableOpacity
//                                     className="flex-row items-center gap-2"
//                                     onPress={() => onChange(!value)}
//                                     activeOpacity={1}
//                                 >
//                                     <Checkbox
//                                         checked={value}
//                                         onCheckedChange={(checked) => onChange(checked)}
//                                         className="border-gray-300 w-5 h-5"
//                                         indicatorClassName="bg-primaryBlue"
//                                     />
//                                     <View className="flex-1">
//                                         <Text className="text-[14px] font-PoppinsSemiBold text-gray-900 mb-1">
//                                             Close Hearing Schedule
//                                         </Text>
//                                         <Text className="text-[12px] font-PoppinsRegular text-gray-600">
//                                             Check this box if this hearing schedule should be marked as closed.
//                                         </Text>
//                                     </View>
//                                 </TouchableOpacity>
//                             )}
//                         />
//                     </View>
//                 </View>
//             </ScrollView>

//             <LoadingModal visible={isPending} />
//         </_ScreenLayout>
//     );
// }

import '@/global.css';
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button } from '@/components/ui/button';
import _ScreenLayout from '@/screens/_ScreenLayout';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import { LoadingModal } from '@/components/ui/loading-modal';
import { useAddRemarks } from "../queries/summonInsertQueries";
import { Checkbox } from '@/components/ui/checkbox';
import { useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';

export default function SummonRemarksForm() {
    const router = useRouter();
    const params = useLocalSearchParams()
    const {hs_id, st_id, sc_id, schedCount} = params
    const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
    const { mutate: addRemarks, isPending } = useAddRemarks();

    const { control, handleSubmit, formState: { errors, isValid, isDirty } } = useForm({
        defaultValues: {
            remarks: '',
            closeHearing: false,
        },
        mode: 'onChange' // This enables real-time validation
    });

    // Check if both files and remarks are provided
    const hasFiles = selectedImages.length > 0;
    const isSubmitDisabled = isPending || !hasFiles || !isValid;

    const onSubmit = (data: { remarks: string; closeHearing: boolean }) => {
        if (selectedImages.length === 0) {
            Alert.alert("Upload Required", "Please upload at least one file");
            return;
        }

        if (!data.remarks.trim()) {
            Alert.alert("Remarks Required", "Please enter your remarks");
            return;
        }

        const files = selectedImages.map((media) => ({
            name: media.name,
            type: media.type,
            file: media.file
        }));

        const status_type = parseInt(schedCount as string) > 3 ? "Lupon" : "Council";

        addRemarks({ 
            hs_id: String(hs_id), 
            st_id: String(st_id), 
            sc_id: String(sc_id), 
            remarks: data.remarks, 
            close: data.closeHearing, 
            status_type, 
            files 
        });
    };

    return (
        <_ScreenLayout
            showExitButton={false}
            customLeftAction={
                <TouchableOpacity onPress={() => router.back()}>
                    <ChevronLeft size={30} className="text-black" />
                </TouchableOpacity>
            }
            headerBetweenAction={<Text className="text-[13px]">Add Remarks</Text>}
            stickyFooter={true}
            footer={
                 <View className="py-3">
                        <Button
                            onPress={handleSubmit(onSubmit)}
                            disabled={isSubmitDisabled}
                            className={`w-full rounded-xl shadow-lg ${
                                isSubmitDisabled ? 'bg-gray-400' : 'bg-primaryBlue'
                            }`}
                        >
                            <Text className="text-white font-PoppinsSemiBold text-[16px]">
                                {isPending ? "Submitting..." : "Submit"}
                            </Text>
                        </Button>
                        
                        {isSubmitDisabled && !isPending && (
                            <Text className="text-center text-[12px] text-gray-500 mt-2 font-PoppinsRegular">
                                Please upload files and enter remarks to submit
                            </Text>
                        )}
                    </View>
            }
        >
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-6">
                    {/* Media Upload Section */}
                    <View className="space-y-3">
                        <View>
                            <Text className="text-[16px] font-PoppinsSemiBold text-gray-900 mb-1">
                                Supporting Documents
                            </Text>
                            <Text className="text-[12px] font-PoppinsRegular pb-1">
                                Upload all required files as evidence or supporting documents
                            </Text>
                        </View>
                        
                        <MediaPicker
                            selectedImages={selectedImages}
                            setSelectedImages={setSelectedImages}
                            multiple={true}
                        />
                        
                        {selectedImages.length === 0 && (
                            <Text className="text-[12px] text-amber-600 font-PoppinsRegular mt-2">
                                At least one file is required
                            </Text>
                        )}
                    </View>

                    {/* Remarks Section */}
                    <View className="space-y-3 mt-3 mb-3">
                        <Text className="text-[16px] font-PoppinsSemiBold text-gray-900">
                            Remarks
                        </Text>

                        <Controller
                            control={control}
                            name="remarks"
                            rules={{
                                required: 'Remarks are required',
                                validate: (value) => value?.trim().length > 0 || 'Remarks cannot be empty'
                            }}
                            render={({ field: { value, onChange } }) => (
                                <Textarea
                                    value={value}
                                    onChangeText={onChange}
                                    numberOfLines={6}
                                    className="min-h-[120px] bg-white text-[12px] text-black font-PoppinsRegular border-gray-300"
                                />
                            )}
                        />
                        {errors.remarks && (
                            <Text className="text-[12px] text-red-500 font-PoppinsRegular">
                                {errors.remarks.message}
                            </Text>
                        )}
                    </View>

                    {/* Close Hearing Checkbox */}
                    <View className="flex-row items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <Controller
                            control={control}
                            name="closeHearing"
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
                                    <View className="flex-1">
                                        <Text className="text-[14px] font-PoppinsSemiBold text-gray-900 mb-1">
                                            Close Hearing Schedule
                                        </Text>
                                        <Text className="text-[12px] font-PoppinsRegular text-gray-600">
                                            Check this box if this hearing schedule should be marked as closed.
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </ScrollView>

            <LoadingModal visible={isPending} />
        </_ScreenLayout>
    );
}
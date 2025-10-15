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
// import { FormTextArea } from '@/components/ui/form/form-text-area';
// import { Checkbox } from '@/components/ui/checkbox';

// export default function SummonRemarksFormMobile({
//     hs_id,
//     st_id,
//     sc_id,
//     schedCount,
//     onSuccess
// }: {
//     hs_id: string;
//     st_id: string | number;
//     sc_id: string;
//     schedCount: number;
//     onSuccess?: () => void;
// }) {
//     const router = useRouter();
//     const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
//     const [remarks, setRemarks] = useState<string>("");
//     const [closeHearing, setCloseHearing] = useState(false);
//     const { mutate: addRemarks, isPending } = useAddRemarks(onSuccess);

//     const isSubmitDisabled = isPending || selectedImages.length === 0 || remarks.trim() === "";

//     const handleSubmit = () => {
//         if (selectedImages.length === 0) {
//             Alert.alert("Upload Required", "Please upload at least one file");
//             return;
//         }

//         if (remarks.trim() === "") {
//             Alert.alert("Remarks Required", "Please enter your remarks");
//             return;
//         }

//         const files = selectedImages.map((media) => ({
//             name: media.name,
//             type: media.type,
//             file: media.file
//         }));

//         const status_type = schedCount > 3 ? "Lupon" : "Council";

//         addRemarks({ 
//             hs_id, 
//             st_id: String(st_id), 
//             sc_id, 
//             remarks, 
//             close: closeHearing, 
//             status_type, 
//             files 
//         });
//     };

//     const handleCheckboxChange = (checked: boolean) => {
//         setCloseHearing(checked);
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
//         >
//             <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
//                 <View className="p-6 space-y-6">
//                     {/* Media Upload Section */}
//                     <View className="space-y-3">
//                         <View>
//                             <Text className="text-[16px] font-PoppinsSemiBold text-gray-900 mb-1">
//                                 Supporting Documents
//                             </Text>
//                             <Text className="text-[14px] font-PoppinsRegular text-gray-600">
//                                 Upload all required files as evidence or supporting documents
//                             </Text>
//                         </View>
                        
//                         <MediaPicker
//                             selectedImages={selectedImages}
//                             setSelectedImages={setSelectedImages}
//                             multiple={true}
//                         />
                        
//                         {selectedImages.length === 0 && (
//                             <Text className="text-[12px] text-amber-600 font-PoppinsRegular">
//                                 At least one file is required
//                             </Text>
//                         )}
//                     </View>

//                     {/* Remarks Section */}
//                     <View className="space-y-3">
//                         <Text className="text-[16px] font-PoppinsSemiBold text-gray-900">
//                             Remarks
//                         </Text>
//                         <FormTextArea
//                             placeholder="Enter detailed remarks about the hearing session, observations, agreements, or any important details..."
//                             value={remarks}
//                             onChangeText={setRemarks}
//                             numberOfLines={6}
//                             className="min-h-[120px] text-[14px] font-PoppinsRegular"
//                         />
//                         {remarks.trim() === "" && (
//                             <Text className="text-[12px] text-amber-600 font-PoppinsRegular">
//                                 Remarks are required
//                             </Text>
//                         )}
//                     </View>

//                     {/* Close Hearing Checkbox */}
//                     <View className="flex-row items-start space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
//                         <Checkbox
//                             value={closeHearing}
//                             onValueChange={handleCheckboxChange}
//                             className="mt-1"
//                         />
//                         <View className="flex-1">
//                             <Text className="text-[14px] font-PoppinsSemiBold text-gray-900 mb-1">
//                                 Close Hearing Schedule
//                             </Text>
//                             <Text className="text-[12px] font-PoppinsRegular text-gray-600">
//                                 Check this box if this hearing session should be marked as completed and closed. The case will proceed to the next stage if applicable.
//                             </Text>
//                         </View>
//                     </View>

//                     {/* Status Information */}
//                     <View className="p-4 bg-blue-50 rounded-lg border border-blue-200">
//                         <Text className="text-[14px] font-PoppinsSemiBold text-blue-800 mb-1">
//                             Current Level: {schedCount > 3 ? "Conciliation" : "Mediation"}
//                         </Text>
//                         <Text className="text-[12px] font-PoppinsRegular text-blue-700">
//                             This is the {schedCount === 1 ? "1st" : schedCount === 2 ? "2nd" : schedCount === 3 ? "3rd" : schedCount + "th"} session
//                         </Text>
//                     </View>

//                     {/* Submit Button */}
//                     <View className="pt-4 pb-8">
//                         <Button
//                             onPress={handleSubmit}
//                             disabled={isSubmitDisabled}
//                             className={`native:h-[56px] w-full rounded-xl shadow-lg ${
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
//                 </View>
//             </ScrollView>

//             <LoadingModal visible={isPending} />
//         </_ScreenLayout>
//     );
// }
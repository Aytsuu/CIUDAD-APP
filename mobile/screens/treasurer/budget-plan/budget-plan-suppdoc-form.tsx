// import PageLayout from '@/screens/_PageLayout';
// import { View, SafeAreaView, TouchableOpacity, Text } from 'react-native';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import z from "zod"
// import { ChevronLeft } from "@/lib/icons/ChevronLeft"
// import { useRouter } from 'expo-router';
// import { useState } from 'react';
// import { Button } from '@/components/ui/button';
// import MediaPicker, {MediaItem} from '@/components/ui/media-picker';
// import { FormTextArea } from '@/components/ui/form/form-text-area';
// import { useAddBudgetPlanSuppDoc } from './queries/budgetPlanInsertQueries';
// import { useLocalSearchParams } from 'expo-router';
// import { LoadingModal } from '@/components/ui/loading-modal';

// const BudgetPlanSuppDocSchema = z.object({
//     description: z.string().min(1, "Description is required"),
// });

// export default function CreateBudgetPlanSuppDocs (){
//     const router = useRouter();
//     const params = useLocalSearchParams();
//     const plan_id = params.plan_id as string;
//     const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
//     const [formError, setFormError] = useState<string | null>(null);
//     const {mutate: addSuppDoc, isPending} = useAddBudgetPlanSuppDoc()

//     const { control,  handleSubmit,   formState: { errors },  setValue } = useForm({
//         resolver: zodResolver(BudgetPlanSuppDocSchema),
//         defaultValues: {
//             description: "",
//         },
//     });

//     const onSubmit = (values: z.infer<typeof BudgetPlanSuppDocSchema>) => {
//         setFormError(null);
//         if (selectedImages.length === 0) {
//             setFormError("Supporting document is required.");
//             return;
//         }else {
            
//             const files = selectedImages.map((media) => ({
//                 name: media.name,
//                 type: media.type,
//                 file: media.file
//             }))
            
//             addSuppDoc({
//                 plan_id: Number(plan_id),
//                 file: files,
//                 description: values.description
//             });
//         }
//     }

//     return (
//         <PageLayout
//             leftAction={
//                 <TouchableOpacity 
//                     onPress={() => router.back()} 
//                     className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
//                 >
//                     <ChevronLeft size={24} className="text-gray-700" />
//                 </TouchableOpacity>
//             }
//             headerTitle={<Text className="text-gray-900 text-[13px]">Upload Supporting Documents</Text>}
//             wrapScroll={false}
//             footer={
//                 <View className="p-6 bg-white border-t border-gray-200">
//                     <Button 
//                         onPress={handleSubmit(onSubmit)} 
//                         className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
//                     >
//                         <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
//                     </Button>
//                 </View>
//             }
//         >
//             <View className="flex-1 bg-gray-50">
//                 <SafeAreaView className="p-6">
//                     <View className="my-3">
//                         <Text className="text-[12px] font-PoppinsRegular pb-1">Add Supporting Documents for the Budget Plan</Text>
//                         <MediaPicker
//                             selectedImages={selectedImages}
//                             setSelectedImages={setSelectedImages}
//                             limit={1}
//                             editable={true}
//                         /> 
//                         {formError && (
//                             <Text className="text-red-500 text-xs">
//                                 {formError}
//                             </Text>
//                         )}
//                     </View>

//                     <FormTextArea
//                         control={control}
//                         name="description"
//                         label='Description'
//                         placeholder='Add description'
//                     />
//                 </SafeAreaView>

//                 <LoadingModal visible={isPending} />
//             </View>
//         </PageLayout>
//     )
// }

import PageLayout from '@/screens/_PageLayout';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from "zod"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import MediaPicker, {MediaItem} from '@/components/ui/media-picker';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { useAddBudgetPlanSuppDoc } from './queries/budgetPlanInsertQueries';
import { useLocalSearchParams } from 'expo-router';
import { LoadingModal } from '@/components/ui/loading-modal';

const BudgetPlanSuppDocSchema = z.object({
    description: z.string().min(1, "Description is required"),
});

export default function CreateBudgetPlanSuppDocs (){
    const router = useRouter();
    const params = useLocalSearchParams();
    const plan_id = params.plan_id as string;
    const [selectedImages, setSelectedImages] = useState<MediaItem[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const {mutate: addSuppDoc, isPending} = useAddBudgetPlanSuppDoc()

    const { control,  handleSubmit,   formState: { errors },  setValue } = useForm({
        resolver: zodResolver(BudgetPlanSuppDocSchema),
        defaultValues: {
            description: "",
        },
    });

    const onSubmit = (values: z.infer<typeof BudgetPlanSuppDocSchema>) => {
        setFormError(null);
        if (selectedImages.length === 0) {
            setFormError("Supporting document is required.");
            return;
        }else {
            
            const files = selectedImages.map((media) => ({
                name: media.name,
                type: media.type,
                file: media.file
            }))
            
            addSuppDoc({
                plan_id: Number(plan_id),
                file: files,
                description: values.description
            });
        }
    }

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
            headerTitle={<Text className="text-gray-900 text-[13px]">Upload Supporting Documents</Text>}
            wrapScroll={false}
            footer={
                <View className="p-6 bg-white">
                    <Button 
                        onPress={handleSubmit(onSubmit)} 
                        className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
                    >
                        <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
                    </Button>
                </View>
            }
        >
            <View className="flex-1 bg-gray-50">
                <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                    <View className="p-6">
                        <View className="my-3">
                            <Text className="text-[12px] font-PoppinsRegular pb-1">Add Supporting Documents for the Budget Plan</Text>
                            <MediaPicker
                                selectedImages={selectedImages}
                                setSelectedImages={setSelectedImages}
                                limit={1}
                                editable={true}
                            /> 
                            {formError && (
                                <Text className="text-red-500 text-xs">
                                    {formError}
                                </Text>
                            )}
                        </View>

                        <FormTextArea
                            control={control}
                            name="description"
                            label='Description'
                            placeholder='Add description'
                        />
                    </View>
                </ScrollView>

                <LoadingModal visible={isPending} />
            </View>
        </PageLayout>
    )
}
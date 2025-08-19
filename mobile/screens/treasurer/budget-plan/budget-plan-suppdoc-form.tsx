import _ScreenLayout from '@/screens/_ScreenLayout';
import { View, SafeAreaView, TouchableOpacity, Text } from 'react-native';
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
        <_ScreenLayout
            customLeftAction={
            <TouchableOpacity onPress={() => router.back()}>
                <ChevronLeft size={30} className="text-black" />
            </TouchableOpacity>
            }
            headerBetweenAction={<Text className="text-[13px]">Upload Supporting Documents</Text>}
            showExitButton={false}
            loading={isPending}
            loadingMessage='Uploading Supporting Documents...'
            stickyFooter={true}
            footer={
                <Button onPress={handleSubmit(onSubmit)} className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"  >
                    <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
                </Button>
            }
        >
            <SafeAreaView>
                <View className="mb-3 mt-3">
                <Text className="text-[12px] font-PoppinsRegular pb-1">Add Supporting Documents for the Budget Plan</Text>
                <MediaPicker
                    selectedImages={selectedImages}
                    setSelectedImages={setSelectedImages}
                    multiple={false}
                    maxImages={1}
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
                
            </SafeAreaView>
        </_ScreenLayout>
    )
}
import '@/global.css'
import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { Button } from '@/components/ui/button'
import { FormInput } from "@/components/ui/form/form-input"
import _ScreenLayout from '@/screens/_ScreenLayout'
import { PurposeAndRatesEditSchema } from '@/form-schema/rates-form-schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft } from 'lucide-react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import z from "zod";
import { useEditPurposeAndRate } from './queries/ratesUpdateQueries'

export default function PurposeAndRateEditForm() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const {pr_id, pr_purpose, pr_amount, category} = params;

    const { control, handleSubmit } = useForm({
        resolver: zodResolver(PurposeAndRatesEditSchema),
        defaultValues: {
            purpose: String(pr_purpose),
            amount: String(pr_amount),
            category: String(category),
        }
    })
    const {mutate: editPurpose, isPending} = useEditPurposeAndRate();

    const onSubmit = (values: z.infer<typeof PurposeAndRatesEditSchema>) => {
         editPurpose({
            ...values,
            pr_id: String(pr_id)
         });
    }

    return (
        <_ScreenLayout 
            customLeftAction={
            <TouchableOpacity onPress={() => router.back()}>
                <ChevronLeft size={30} className="text-black" />
            </TouchableOpacity>
            }
            headerBetweenAction={<Text className="text-[13px]">Add New Purpose And Rate</Text>}
            showExitButton={false}
            loading={isPending}
            loadingMessage='Updating Record...'
        >
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            
                {/* Form Section */}
                <View className="mb-8">

                    <View className="space-y-4 p-6">
                        <FormInput
                            control={control}
                            label="Purpose"
                            name="purpose"
                            placeholder="Enter purpose"
                            editable={false}
                        />

                        <FormInput
                            control={control}
                            label="Amount"
                            name="amount"
                            placeholder="Enter rate"
                            keyboardType="numeric"
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Bottom Button */}
            <View className="pt-4 pb-8 bg-white border-t border-gray-100 px-4">
                <Button 
                    onPress={handleSubmit(onSubmit)}
                    className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
                >
                    <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
                </Button>
            </View>
        </_ScreenLayout>
    )
}
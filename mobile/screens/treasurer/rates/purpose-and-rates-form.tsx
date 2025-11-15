import '@/global.css'
import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { Button } from '@/components/ui/button'
import { FormInput } from "@/components/ui/form/form-input"
import PageLayout from '@/screens/_PageLayout'
import { PurposeAndRatesSchema } from '@/form-schema/rates-form-schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft } from 'lucide-react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useAddPurposeAndRate } from './queries/ratesInsertQueries'
import z from "zod";
import { LoadingModal } from '@/components/ui/loading-modal'

export default function PurposeAndRateCreateForm() {
    const router = useRouter();
    const rawCategory = useLocalSearchParams().category;
    const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory ?? '';
    const { control, handleSubmit } = useForm({
        resolver: zodResolver(PurposeAndRatesSchema),
        defaultValues: {
            purpose: '',
            amount: '',
            category: category,
        }
    })
    const {mutate: createPurposeAndRate, isPending} = useAddPurposeAndRate();

    const onSubmit = (values: z.infer<typeof PurposeAndRatesSchema>) => {
         createPurposeAndRate(values);
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
            headerTitle={<Text className="text-gray-900 text-[13px]">Add New Purpose And Rate</Text>}
            wrapScroll={false}
            footer={
                <View className="pt-4 pb-8 bg-white border-t border-gray-100 px-4">
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
                    {/* Form Section */}
                    <View className="p-6">
                        <View className="space-y-4">
                            <FormInput
                                control={control}
                                label="Purpose"
                                name="purpose"
                                placeholder="Enter purpose"
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
                <LoadingModal visible={isPending}/>
            </View>
        </PageLayout>
    )
}
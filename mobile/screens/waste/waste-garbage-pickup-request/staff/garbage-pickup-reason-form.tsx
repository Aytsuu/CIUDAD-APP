import '@/global.css';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/button';
import { FormInput } from "@/components/ui/form/form-input";
import _ScreenLayout from '@/screens/_ScreenLayout';
import { RejectPickupRequestSchema } from '@/form-schema/waste/garbage-pickup-schema-staff';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import z from "zod";
import { useAddDecision } from './queries/garbagePickupStaffInsertQueries';
import { useAuth } from '@/contexts/AuthContext';

export default function RejectGarbagePickupForm() {
    const {user} = useAuth()
    const params = useLocalSearchParams();
    const garb_id = params.garb_id || '';
    const router = useRouter();
    const {mutate: addReason, isPending} = useAddDecision()

    const { control,  handleSubmit } = useForm({
      resolver: zodResolver(RejectPickupRequestSchema),
      defaultValues: {
        reason: '',
        staff_id: user?.staff?.staff_id
      }
    });
    
    const onSubmit = (values: z.infer<typeof RejectPickupRequestSchema>) => {
        addReason({
            ...values,
            garb_id: String(garb_id)
        })
    };

    return (
        <_ScreenLayout
        customLeftAction={
            <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={30} className="text-black" />
            </TouchableOpacity>
        }
        headerBetweenAction={<Text className="text-[13px]">Reject Garbage Pickup Request</Text>}
        showExitButton={false}
        loading={isPending}
        loadingMessage='Loading...'
        >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="mb-8">
            <View className="space-y-4 p-6">
                <FormInput
                control={control}
                label="Reason"
                name="reason"
                placeholder="Enter reason"
                />


                <View className="pt-4 pb-8 bg-white border-t border-gray-100 px-4">
                <Button
                    onPress={handleSubmit(onSubmit)}
                    className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
                >
                    <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
                </Button>
                </View>
            </View>
            </View>
        </ScrollView>
        </_ScreenLayout>
    );
}
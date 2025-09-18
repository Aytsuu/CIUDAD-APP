import '@/global.css';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/button';
import { FormInput } from "@/components/ui/form/form-input";
import _ScreenLayout from '@/screens/_ScreenLayout';
import { AnnualGrossSalesEditSchema } from '@/form-schema/rates-form-schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import z from "zod";
import { useToastContext } from '@/components/ui/toast';
import { useEditAnnualGrossSales } from './queries/ratesUpdateQueries';

export default function AnnualGrossSalesEdit() {
  const router = useRouter()
  const params = useLocalSearchParams();
  const {ags_id, ags_maximum, ags_minimum, ags_rate} = params;
  

  const { toast } = useToastContext();

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(AnnualGrossSalesEditSchema),
    defaultValues: {
      minRange: String(ags_minimum),
      maxRange: String(ags_maximum),
      amount: String(ags_rate),
    }
  });

  const { mutate: editAnnualSales, isPending } = useEditAnnualGrossSales();

  const onSubmit = (values: z.infer<typeof AnnualGrossSalesEditSchema>) => {
    if (parseFloat(values.maxRange) <= parseFloat(values.minRange)) {
      toast.error("The maximum range must be greater than the minimum range");
      return;
    } else {
      editAnnualSales({
        ...values,
        ags_id: String(ags_id)
      });
    }
  };

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Add New Range and Fee for Business Permit</Text>}
      showExitButton={false}
      loading={isPending}
      loadingMessage='Updating Record...'
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <View className="mb-8">
          <View className="space-y-4 p-4">
            <FormInput
              control={control}
              label="Minimum Annual Gross Sales"
              name="minRange"
              placeholder="Enter minimum amount"
              keyboardType="numeric"
              editable={false}
            />
            <FormInput
              control={control}
              label="Maximum Annual Gross Sales"
              name="maxRange"
              placeholder="Enter maximum amount"
              keyboardType="numeric"
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

      <View className="pt-4 pb-8 bg-white border-t border-gray-100 px-4">
        <Button
          onPress={handleSubmit(onSubmit)}
          className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg"
        >
          <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
        </Button>
      </View>
    </_ScreenLayout>
  );
}

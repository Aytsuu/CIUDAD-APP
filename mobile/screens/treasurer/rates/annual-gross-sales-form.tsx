import '@/global.css';
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '@/components/ui/button';
import { FormInput } from "@/components/ui/form/form-input";
import PageLayout from '@/screens/_PageLayout';
import { AnnualGrossSalesSchema } from '@/form-schema/rates-form-schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAddAnnualGrossSales } from './queries/ratesInsertQueries';
import z from "zod";
import { useToastContext } from '@/components/ui/toast';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingModal } from '@/components/ui/loading-modal';

export default function AnnualGrossSalesCreate() {
  const {user} = useAuth();
  const router = useRouter();
  const rawLastMaxRange = useLocalSearchParams().lastMaxRange;
  const lastMaxRange = Array.isArray(rawLastMaxRange) ? rawLastMaxRange[0] : rawLastMaxRange ?? '';

  const hasValidLastMaxRange = lastMaxRange !== '' && lastMaxRange !== '0';
  const calculatedMinRange = hasValidLastMaxRange ? String(parseFloat(lastMaxRange) + 1) : '';

  const { toast } = useToastContext();

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(AnnualGrossSalesSchema),
    defaultValues: {
      minRange: calculatedMinRange,
      maxRange: '',
      amount: '',
      staff_id: user?.staff?.staff_id
    }
  });

  const { mutate: createAnnualGrossSales, isPending } = useAddAnnualGrossSales();

  const onSubmit = (values: z.infer<typeof AnnualGrossSalesSchema>) => {
    if (parseFloat(values.maxRange) <= parseFloat(values.minRange)) {
      toast.error("The maximum range must be greater than the minimum range");
      return;
    } else {
      createAnnualGrossSales(values);
    }
  };

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Add New Range and Fee</Text>}
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
          <View className="mb-8">
            <View className="space-y-4 p-6">
              <FormInput
                control={control}
                label="Minimum Annual Gross Sales"
                name="minRange"
                placeholder="Enter minimum amount"
                keyboardType="numeric"
              />
              <FormInput
                control={control}
                label="Maximum Annual Gross Sales"
                name="maxRange"
                placeholder="Enter maximum amount"
                keyboardType="numeric"
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

        <LoadingModal visible={isPending} />
      </View>
    </PageLayout>
  );
}
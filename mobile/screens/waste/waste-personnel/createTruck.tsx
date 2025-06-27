import React from 'react';
import { View, TouchableOpacity, ScrollView, KeyboardAvoidingView, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@/components/ui/form/form-input';
import { FormDateInput } from '@/components/ui/form/form-date-input';
import { FormSelect } from '@/components/ui/form/form-select';
import ScreenLayout from "@/screens/_ScreenLayout";
import TruckFormSchema from '@/form-schema/waste-truck-schema';
import { ChevronLeft } from 'lucide-react-native';
import { useAddTruck } from './queries';
import { TruckFormValues } from './requests';

export default function WasteTruckCreate() {
  const router = useRouter();
  const { mutate: addTruck, isLoading: isSubmitting } = useAddTruck(() => router.back()); // Use the mutation hook

  const { control, handleSubmit } = useForm<TruckFormValues>({
    resolver: zodResolver(TruckFormSchema),
    defaultValues: {
      truck_plate_num: '',
      truck_model: '',
      truck_capacity: '',
      truck_status: 'Operational',
      truck_last_maint: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: TruckFormValues) => {
    addTruck(data); // Trigger the mutation
  };

  return (
    <ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Add New Truck</Text>}
      showExitButton={false}
      headerAlign="left"
      scrollable={true}
      keyboardAvoiding={true}
      contentPadding="medium"
      loadingMessage="Creating truck..."
    >
          <View className="space-y-4">
            <View className="mb-4">
              <FormInput
                control={control}
                name="truck_plate_num"
                label="Plate Number"
                placeholder="Plate Number"
              />
            </View>

            <View className="mb-4">
              <FormInput
                control={control}
                name="truck_model"
                label="Model"
                placeholder="Truck Model"
              />
            </View>

            <View className="mb-4">
              <FormInput
                control={control}
                name="truck_capacity"
                label="Capacity (tons)"
                placeholder="Capacity in tons"
                keyboardType="numeric"
              />
            </View>

            <View className="mb-4">
              <FormSelect
                control={control}
                name="truck_status"
                label="Status"
                options={[
                  { label: 'Operational', value: 'Operational' },
                  { label: 'Maintenance', value: 'Maintenance' },
                ]}
              />
            </View>

            <View className="mb-4">
              <FormDateInput
                control={control}
                name="truck_last_maint"
                label="Last Maintenance"
              />
            </View>

            <View className="flex-row justify-end mt-6">
              <TouchableOpacity
                className="px-6 py-3 bg-blue-500 rounded-lg flex-row items-center justify-center min-w-[120px]"
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-lg font-medium">Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
    </ScreenLayout>
  );
}
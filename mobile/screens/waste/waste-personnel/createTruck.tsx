import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@/components/ui/form/form-input';
import { FormDateInput } from '@/components/ui/form/form-date-input';
import { FormSelect } from '@/components/ui/form/form-select';
import ScreenLayout from "@/screens/_ScreenLayout";
import TruckFormSchema from '@/form-schema/waste-truck-schema';
import { ChevronLeft } from 'lucide-react-native';
import { useAddTruck } from './waste-personnel-truck-queries';
import { TruckFormValues } from './waste-personnel-types';

export default function WasteTruckCreate() {
  const router = useRouter();
  const { mutate: addTruck, isPending: isSubmitting } = useAddTruck(() => router.back());
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
    addTruck(data);
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
          <View className="space-y-4 p-4 flex-1">
            <View className="mb-4">
              <FormInput
                control={control}
                name="truck_plate_num"
                label="Plate Number"
                placeholder="Truck's Plate Number"
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

            <View className="mt-auto pt-4 bg-white border-t border-gray-200 px-4 pb-4">
              <TouchableOpacity
                className="bg-primaryBlue py-3 rounded-lg"
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white text-base font-semibold text-center">Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
    </ScreenLayout>
  );
}
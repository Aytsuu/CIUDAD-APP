import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormInput } from '@/components/ui/form/form-input';
import { FormDateInput } from '@/components/ui/form/form-date-input';
import { FormSelect } from '@/components/ui/form/form-select';
import PageLayout from '@/screens/_PageLayout';
import TruckFormSchema from '@/form-schema/waste-truck-schema';
import { ChevronLeft } from 'lucide-react-native';
import { TruckFormValues } from './waste-personnel-types';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { useGetTruckById, useUpdateTruck } from './waste-personnel-truck-queries';
import { Button } from '@/components/ui/button'; 
import { LoadingState } from "@/components/ui/loading-state";
import { LoadingModal } from '@/components/ui/loading-modal';

export default function WasteTruckEdit() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const [isEditing, setIsEditing] = useState(false); 
  const idValue = Array.isArray(id) ? id[0] : id;
  const { data: truck, isLoading: isTruckLoading, error } = useGetTruckById(idValue);
  const { mutate: updateTruck, isPending: isSubmitting } = useUpdateTruck(() => {
    setIsEditing(false); 
    router.back();
  });

  const { control, handleSubmit, reset, formState } = useForm<TruckFormValues>({
    resolver: zodResolver(TruckFormSchema),
    defaultValues: {
      truck_plate_num: '',
      truck_model: '',
      truck_capacity: '',
      truck_status: 'Operational',
      truck_last_maint: new Date().toISOString().split('T')[0],
    },
  });

  // Store initial form values for cancel functionality
  const initialFormValues = {
    truck_plate_num: truck?.truck_plate_num || '',
    truck_model: truck?.truck_model || '',
    truck_capacity: truck?.truck_capacity ? String(truck.truck_capacity) : '',
    truck_status: (truck?.truck_status as 'Operational' | 'Maintenance') || 'Operational',
    truck_last_maint: truck?.truck_last_maint
      ? truck.truck_last_maint.split('T')[0]
      : new Date().toISOString().split('T')[0],
  };

  // Populate form with truck data
  useEffect(() => {
    if (truck) {
      reset({
        truck_plate_num: truck.truck_plate_num || '',
        truck_model: truck.truck_model || '',
        truck_capacity: truck.truck_capacity ? String(truck.truck_capacity) : '',
        truck_status: (truck.truck_status as 'Operational' | 'Maintenance') || 'Operational',
        truck_last_maint: truck.truck_last_maint
          ? truck.truck_last_maint.split('T')[0]
          : new Date().toISOString().split('T')[0],
      });
    }
  }, [truck, reset]);

  const onSubmit = (data: TruckFormValues) => {
    if (id && typeof id === 'string') {
      const parsedData = {
        ...data,
        truck_capacity: data.truck_capacity.replace(/,/g, ''),
      };
      updateTruck({ id, data: parsedData });
    } 
  };

  // Check if truck is archived
  const isArchived = truck?.truck_is_archive === true;

  // Handle loading state
  if (isTruckLoading) {
    return (
      <PageLayout
        leftAction={
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={30} color="black" />
          </TouchableOpacity>
        }
        headerTitle={<Text className="text-[13px]">{isEditing ? "Edit Truck Info" : "View Truck Info"}</Text>}
        rightAction={<View />}
      >
        <View className="flex-1 justify-center items-center">
          <LoadingState/>
        </View>
      </PageLayout>
    );
  }

  // Handle error or no truck found
  if (error || !truck) {
    return (
      <PageLayout
        leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-[13px]">{isEditing ? "Edit Truck Info" : "View Truck Info"}</Text>}
     ><Text>No Truck Data</Text>
     rightAction={<View />}
     </PageLayout>
    );
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">{isEditing ? "Edit Truck Info" : "View Truck Info"}</Text>}
      rightAction={<View />}
      footer={
        <View className="px-4 pb-4">
          {/* Hide Edit button if truck is archived */}
          {!isEditing && !isArchived ? (
            <Button
              onPress={() => setIsEditing(true)}
              className="bg-primaryBlue py-3 rounded-lg"
            >
              <Text className="text-white text-base font-semibold">Edit</Text>
            </Button>
          ) : !isEditing && isArchived ? (
            // Show message if truck is archived (optional)
            <View className="bg-gray-200 py-3 rounded-lg">
              <Text className="text-gray-600 text-base font-semibold text-center">
                Disposed trucks cannot be edited
              </Text>
            </View>
          ) : (
            <View className="flex-row gap-2">
              <Button
                onPress={() => {
                  setIsEditing(false);
                  reset(initialFormValues); // Reset to initial values on cancel
                }}
                className="flex-1 bg-white border border-primaryBlue py-3 rounded-lg"
              >
                <Text className="text-primaryBlue text-base font-semibold text-center">Cancel</Text>
              </Button>
              <ConfirmationModal
                trigger={
                  <Button
                    className="flex-1 bg-primaryBlue py-3 rounded-lg flex-row justify-center items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                       <LoadingModal visible={isSubmitting} />
                    ) : (
                      <Text className="text-white text-base font-semibold">Save</Text>
                    )}
                  </Button>
                }
                title="Confirm Update"
                description="Are you sure you want to update this truck?"
                actionLabel="Update"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                loadingMessage="Updating truck..."
              />
            </View>
          )}
          {!formState.isValid && isEditing && (
            <Text className="text-red-500 text-xs mt-2">
              Please fill out all required fields correctly.
            </Text>
          )}
        </View>
      }
    >
      <View className="flex-1 px-6">
        {/* Show archived badge if truck is archived */}
        {isArchived && (
          <View className="bg-gray-200 px-3 py-2 rounded-lg mb-4">
            <Text className="text-gray-600 text-sm font-semibold text-center">
              This truck is marked as disposed
            </Text>
          </View>
        )}
        
        <View className="space-y-4">
        <View className="relative ">
          <FormInput
            control={control}
            name="truck_plate_num"
            label="Plate Number"
            placeholder="Enter plate number"
            editable={isEditing && !isArchived} // Disable if archived
          />
        </View>

        <View className="relative">
          <FormInput
            control={control}
            name="truck_model"
            label="Model"
            placeholder="Enter truck model"
            editable={isEditing && !isArchived} // Disable if archived
          />
        </View>

        <View className="relative">
          <FormInput
            control={control}
            name="truck_capacity"
            label="Capacity (tons)"
            placeholder="Enter capacity in tons"
            keyboardType="numeric"
            editable={isEditing && !isArchived} // Disable if archived
          />
        </View>

        <View className="relative">
          <FormSelect
            control={control}
            name="truck_status"
            label="Status"
            options={[
              { label: 'Operational', value: 'Operational' },
              { label: 'Maintenance', value: 'Maintenance' },
            ]}
            disabled={!isEditing || isArchived} // Disable if archived
          />
        </View>

        <View className="relative">
          <FormDateInput
            control={control}
            name="truck_last_maint"
            label="Last Maintenance"
            editable={isEditing && !isArchived} // Disable if archived
          />
        </View>
      </View>
      </View>
    </PageLayout>
  );
}
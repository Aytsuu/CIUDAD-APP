import React, { useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { DonorSelect } from '../personalizedCompo/search_input';
import { useRouter } from 'expo-router';
import { useForm} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {  ChevronLeft } from 'lucide-react-native';
import {ClerkDonateCreateSchema} from '@/form-schema/donate-create-form-schema';
import { useAddDonation, useGetPersonalList } from './donation-queries';
import { FormInput } from '@/components/ui/form/form-input';
import { FormSelect } from '@/components/ui/form/form-select';
import { FormDateInput } from '@/components/ui/form/form-date-input';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import PageLayout from '@/screens/_PageLayout';
import { useAuth } from '@/contexts/AuthContext';

const DonationAdd = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, setValue, trigger } = useForm({
    resolver: zodResolver(ClerkDonateCreateSchema),
    defaultValues: {
      don_donor: '',
      per_id: null as number | null,
      don_item_name: '',
      don_qty: '',
      don_description: undefined,
      don_category: '',
      don_date: new Date().toISOString().split('T')[0],
      don_status: "Stashed",
      staff: user?.staff?.staff_id || null,
    },
  });

  const donCategory = watch('don_category');
  const isMonetary = donCategory === 'Monetary Donations';
  const addDonationMutation = useAddDonation();
  const { data: personalList = [], isLoading: isPersonalLoading } = useGetPersonalList();

  useEffect(() => {
    if (donCategory === 'Monetary Donations') {
      setValue('don_item_name', '');
    }
  }, [donCategory, setValue]);

  const onSubmit = async (formData: any) => {
    const isValid = await trigger();
    if (!isValid) {
      console.log('Form Errors:', control._formState.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        don_qty: formData.don_qty.toString(),
      };

      await addDonationMutation.mutateAsync(payload);
      router.back();
    } catch (error) {
      console.error('Error submitting donation', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} color="black" className="text-black" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">Add Donation</Text>}
      rightAction={
        <TouchableOpacity>
          <ChevronLeft size={30} color="black" className="text-white" />
        </TouchableOpacity>
      }
      footer={<View>
          <ConfirmationModal
            trigger={
              <TouchableOpacity
                className="bg-primaryBlue py-3 rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Text className="text-white text-base font-semibold text-center">Saving...</Text>
                  </>
                ) : (
                  <Text className="text-white text-base font-semibold text-center">Save</Text>
                )}
              </TouchableOpacity>
            }
            title="Confirm Donation"
            description="Are you sure you want to save this donation?"
            actionLabel="Save Donation"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            loadingMessage="Saving donation..."
          />
        </View>}
    >
      <View className="space-y-4 p-4 flex-1 px-6">

        {/* Date */}
        <FormDateInput
          control={control}
          name="don_date"
          label="Donation Date"
        />   

        <View className="mb-4">
          <DonorSelect
            placeholder="Select donor or enter name"
            label="Donor Name"
            people={personalList}
            selectedDonor={watch('don_donor')}
            onSelect={(donorName) => {
              setValue('don_donor', donorName);
            }}
          />
        </View>

        {/* Category */}
        <FormSelect
          control={control}
          name="don_category"
          label="Category"
          options={[
            { label: 'Monetary Donations', value: 'Monetary Donations' },
            { label: 'Essential Goods', value: 'Essential Goods' },
            { label: 'Medical Supplies', value: 'Medical Supplies' },
            { label: 'Household Items', value: 'Household Items' },
            { label: 'Educational Supplies', value: 'Educational Supplies' },
            { label: 'Baby & Childcare Items', value: 'Baby & Childcare Items' },
            { label: 'Animal Welfare Items', value: 'Animal Welfare Items' },
            { label: 'Shelter & Homeless Aid', value: 'Shelter & Homeless Aid' },
            { label: 'Disaster Relief Supplies', value: 'Disaster Relief Supplies' },
          ]}
        />

        {/* Item Name - Changes based on category */}
        {isMonetary ? (
          <FormSelect
            control={control}
            name="don_item_name"
            label="Money Type"
            options={[
              { label: 'Cash', value: 'Cash' },
              { label: 'Cheque', value: 'Cheque' },
              { label: 'E-money', value: 'E-money' },
            ]}
          />
        ) : (
          <FormInput
            control={control}
            name="don_item_name"
            label="Item Name"
            placeholder="Enter item name"
          />
        )}

        {/* Quantity/Amount */}
        <FormInput
          control={control}
          name="don_qty"
          label={isMonetary ? 'Amount' : 'Quantity'}
          placeholder={isMonetary ? 'Enter amount' : 'Enter quantity'}
          keyboardType="numeric"
        />

        {/* Description */}
        <FormInput
          control={control}
          name="don_description"
          label="Description"
          placeholder="Enter description"
        />
      </View>
    </PageLayout>
  );
};

export default DonationAdd;
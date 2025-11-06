import React from 'react';
import { ChevronLeft } from 'lucide-react-native';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FormInput } from '@/components/ui/form/form-input';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormDateAndTimeInput } from '@/components/ui/form/form-date-time-input';
import { SelectLayoutWithAdd } from '@/components/ui/select-searchadd-layout';
import { useIncomeParticular } from './queries/income-expense-FetchQueries';
import { useCreateIncome } from './queries/income-expense-AddQueries';
import { useAddParticular } from './request/particular-PostRequest';
import { useDeleteParticular } from './request/particular-DeleteRequest';
import IncomeFormSchema from '@/form-schema/treasurer/treasurer-income-schema';
import { useIncomeExpenseMainCard, type IncomeExpenseCard } from './queries/income-expense-FetchQueries';
import PageLayout from "@/screens/_PageLayout";
import { useAuth } from '@/contexts/AuthContext';


// interface IncomeCreateFormProps {
//   onSuccess?: () => void;
//   year: number;
//   totInc: number;
// }

function IncomeCreateForm() {
  const { user } = useAuth(); 
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.budYear as string;
//   const totInc = params.totIncome as string;

  const { handleAddParticular } = useAddParticular();
  const { handleDeleteConfirmation, ConfirmationDialogs } = useDeleteParticular();

  const form = useForm<z.infer<typeof IncomeFormSchema>>({
    resolver: zodResolver(IncomeFormSchema),
    defaultValues: {
      inc_datetime: '',
      inc_entryType: '',
      inc_particulars: '',
      inc_amount: '',
      inc_additional_notes: '',
    },
  });


  const { mutate: createIncome, isPending } = useCreateIncome(() => {
     router.back();
  });

  const { data: IncomeParticularItems = [] } = useIncomeParticular();
  const { data: fetchedData = { results: [], count: 0 } } = useIncomeExpenseMainCard();

  const matchedYearData = fetchedData.results.find((item: IncomeExpenseCard) => Number(item.ie_main_year) === Number(year));
  const totInc = matchedYearData?.ie_main_inc ?? 0;

  console.log("TOT INC HERE: ", totInc)

  const IncomeParticulars = IncomeParticularItems
    .filter(item => item.id && item.name)
    .map(item => ({
      id: item.id,
      name: item.name,
    }));

  const onSubmit = (values: z.infer<typeof IncomeFormSchema>) => {
    const dateStr = values.inc_datetime?.replace(' ', 'T').replace('+00', 'Z');
    const inputDate = new Date(dateStr);
    const inputYear = inputDate.getFullYear();
    const yearIncome = Number(year);
    let totalIncome = 0.0;

    const totIncome = Number(totInc);
    const inc_amount = Number(values.inc_amount);
    totalIncome = totIncome + inc_amount;

    if (inputYear !== yearIncome) {
      form.setError('inc_datetime', {
        type: 'manual',
        message: `Date must be in the year ${year}`
      });
      return;
    }

    if(!values.inc_additional_notes){
        values.inc_additional_notes = "None";
    }    
    
    const AllValues = {
      ...values,
      totalIncome,
      year: Number(year),
      staff_id: user?.staff?.staff_id    
    }

    // console.log("ALL INCOME: ", AllValues)
    createIncome(AllValues);
  };

  return (
    <PageLayout
      headerTitle={<Text className="text-[13px]">Create Income Entry</Text>}
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft size={24} color="black" />
        </TouchableOpacity>
      }
      footer={
        <TouchableOpacity
          className="bg-primaryBlue py-4 rounded-xl w-full items-center"
          onPress={form.handleSubmit(onSubmit)}
          disabled={isPending}
        >
          <View className="flex-row justify-center items-center gap-2">
              {isPending && (
                  <ActivityIndicator size="small" color="white" className="ml-2" />
              )}                           
              <Text className="text-white text-base font-semibold">
                  {isPending ? "Saving..." : "Save Entry"}
              </Text>                                   
          </View>   
        </TouchableOpacity>
      }
    >
        <View className="w-full px-6 pt-5">

            <FormDateAndTimeInput
              control={form.control}
              name="inc_datetime"
              label={`Date (${year} only)`}
            />

            <View className="pb-3">
                <Controller
                    control={form.control}
                    name="inc_particulars"
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <View>
                          <Text className="text-sm mb-1">Particulars</Text>
                          <SelectLayoutWithAdd
                              placeholder="Select a particular"
                              label="Particulars"
                              options={IncomeParticulars}
                              value={value}
                              onChange={onChange}
                              onAdd={(newParticular) => {
                              handleAddParticular(newParticular, (newId) => {
                                  onChange(newId);
                              });
                              }}
                              onDelete={(id) => handleDeleteConfirmation(Number(id))}
                          />
                          {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
                        </View>
                    )}
                />            
            </View>
        

            <FormInput
                control={form.control}
                name="inc_amount"
                label="Amount"
                keyboardType="numeric"
                placeholder="Enter amount"
            />

            <FormTextArea
                control={form.control}
                name="inc_additional_notes"
                label="Additional Notes"
                placeholder="Add more details (Optional)"
            />
        </View>
      {ConfirmationDialogs()}
    </PageLayout>
  );
}

export default IncomeCreateForm;
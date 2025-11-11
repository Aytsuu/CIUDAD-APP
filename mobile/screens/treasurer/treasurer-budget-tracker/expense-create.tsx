import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useLocalSearchParams } from 'expo-router';
import IncomeExpenseFormSchema from './schema';
import { FormInput } from '@/components/ui/form/form-input';
import { FormTextArea } from '@/components/ui/form/form-text-area';
import { FormSelect } from '@/components/ui/form/form-select';
import { FormDateAndTimeInput } from '@/components/ui/form/form-date-time-input';
// import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input';
// import { FormDateInput } from '@/components/ui/form/form-date-input';
// import { FormTimeInput } from '@/components/ui/form/form-time-input';
import { useIncomeExpenseMainCard, type IncomeExpenseCard } from './queries/income-expense-FetchQueries';
import PageLayout from "@/screens/_PageLayout";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import { useBudgetItems } from './queries/income-expense-FetchQueries';
import { useCreateIncomeExpense } from './queries/income-expense-AddQueries';
import { ChevronLeft, X } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';


function ExpenseCreateForm() {
  const router = useRouter();
  const { user } = useAuth(); 
  const params = useLocalSearchParams();
  const year = params.budYear as string;
  // const totBud = parseFloat(params.totalBud as string) || 0;
  // const totExp = parseFloat(params.totalExp as string) || 0;

  const years = Number(year);


  const [selectedImages, setSelectedImages] = React.useState<MediaItem[]>([])
  const [currentStep, setCurrentStep] = useState(1);
  const { data: budgetItems = [] } = useBudgetItems(years);
  const { data: fetchedData = { results: [], count: 0 } } = useIncomeExpenseMainCard();

  const matchedYearData = fetchedData.results.find((item: IncomeExpenseCard) => Number(item.ie_main_year) === Number(year));
  const totBud = matchedYearData?.ie_remaining_bal ?? 0;
  const totExp = matchedYearData?.ie_main_exp ?? 0;

  console.log("REMAIN BAL: ", totBud)

  const particularSelector = budgetItems.map(item => ({
    label: item.name,
    value: `${item.id} ${item.name}`,
  }));

  const form = useForm<z.infer<typeof IncomeExpenseFormSchema>>({
    resolver: zodResolver(IncomeExpenseFormSchema),
    defaultValues: {
      iet_serial_num: '',
      iet_check_num: '',
      iet_entryType: '',
      // iet_date: '',
      // iet_time: '',
      iet_datetime: '',
      iet_particulars: '',
      iet_amount: '',
      iet_actual_amount: '',
      iet_additional_notes: '',
    },
  });

  const { mutate: createExpense, isPending } = useCreateIncomeExpense(() => {
    router.back();
  });

  const selectedParticularId = form.watch('iet_particulars');
  const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);

  const onSubmit = (values: z.infer<typeof IncomeExpenseFormSchema>) => {
    let totalBudget = 0.00;
    let totalExpense = 0.00;
    let proposedBud = 0.00;
    let returnAmount = 0.00;

    const dateStr = values.iet_datetime?.replace(' ', 'T').replace('+00', 'Z');
    const inputDate = new Date(dateStr);
    const inputYear = inputDate.getFullYear();

    console.log("DATE: ", values.iet_datetime)
    console.log("YEARRRR: ", inputYear)

    if (inputYear !== years) {
      form.setError('iet_datetime', {
        type: 'manual',
        message: `Date must be in the year ${years}`,
      });
      return;
    }

    if(!values.iet_serial_num && !values.iet_check_num){
        form.setError('iet_serial_num', {
            type: 'manual',
            message: "Please enter a data either on this field"
        });

        form.setError('iet_check_num', {
            type: 'manual',
            message: "Please enter a data either on this field"
        });
        return; 
    }    

    if(!values.iet_additional_notes){
        values.iet_additional_notes = "None";
    }

    //proposed budget
    const proposedBudget = selectedParticular?.proposedBudget;
    const propBudget = Number(proposedBudget);

    //amount
    const amount = Number(values.iet_amount);
    const actualAmount = values.iet_actual_amount ? Number(values.iet_actual_amount) : 0;

    //current Expenses and Total Budget
    const totEXP = Number(totExp);
    const totBUDGET = Number(totBud);

    const particularId = Number(selectedParticularId?.split(' ')[0] || 0);

    const files = selectedImages.map((img: any) => ({
      name: img.name,
      type: img.type,
      file: img.file
    }))


    if(amount && actualAmount){
        totalBudget = totBUDGET - actualAmount;
        totalExpense = totEXP + actualAmount;
        proposedBud = propBudget - actualAmount;
        returnAmount = Math.abs(amount - actualAmount);        
    }
    else{
        if(amount){
            console.log("HERRRRRRRRRRRRRREEEEEEEEEEEEEERRRRRRR ONLLLYY AMOUNTTT")
            totalBudget = totBUDGET - amount;
            totalExpense = totEXP + amount;
            proposedBud = propBudget - amount;                
        }
        else{ // incase, if ever makasulosot w/o value sa proposed amount
            totalBudget = totBUDGET - actualAmount;
            totalExpense = totEXP + actualAmount;
            proposedBud = propBudget - actualAmount;                
        }
    }

    const allValues = {
      ...values,
      years,
      returnAmount,
      totalBudget,
      totalExpense,
      proposedBud,
      particularId,
      files,
      staff_id: user?.staff?.staff_id      
    };

    createExpense(allValues);
    // console.log("CREATE EXP: ", allValues)
  };

  const handleProceed = () => {
    const amount = Number(form.getValues('iet_amount'));
    const actual_amount = Number(form.getValues('iet_actual_amount')) || 0;

    if (!amount || amount <= 0) {
      form.setError('iet_amount', {
        type: 'manual',
        message: `Enter a valid amount`,
      });
      return;
    }

    if (actual_amount < 0) {
      form.setError('iet_actual_amount', {
        type: 'manual',
        message: `Enter a valid actual amount`,
      });
      return;
    }

    if (!selectedParticular) {
      form.setError('iet_particulars', {
        type: 'manual',
        message: `Select a valid particular`,
      });
      return;
    }

    const budget = selectedParticular.proposedBudget;
    if (budget - amount < 0) {
      form.setError('iet_amount', {
        type: 'manual',
        message: `Insufficient Balance`,
      });
      return;
    }

    if (budget - actual_amount < 0) {
      form.setError('iet_actual_amount', {
        type: 'manual',
        message: `Insufficient Balance`,
      });
      return;
    }

    setCurrentStep(2);
  };

  return (
    <PageLayout
      // Header Configuration
      headerTitle={currentStep === 1 ? <Text>Step 1: Budget Details</Text> : <Text>Step 2: Transaction Details</Text>}      
      leftAction={
        <TouchableOpacity onPress={() => currentStep === 1 ? router.back() : setCurrentStep(1)}>
          <ChevronLeft size={24} color="black" />
        </TouchableOpacity>
      }    
      // Footer Configuration
      footer={
        <View className="w-full">
          {currentStep === 1 ? (
            <TouchableOpacity
              className="bg-primaryBlue py-4 rounded-xl w-full items-center"
              onPress={handleProceed}
            >
              <Text className="text-white text-base font-semibold">Proceed</Text>
            </TouchableOpacity>
          ) : (

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

          )}
        </View>
      }
    >
      {/* Main Content */}
      <View className="px-6">
        {currentStep === 1 ? (
          <View className="space-y-4">
            <View className="pb-8">
              {selectedParticular && (
                <View className="bg-primaryBlue p-3 rounded-md items-center">
                  <Text className="text-white text-base font-semibold">
                    Accumulated Budget: P{selectedParticular.proposedBudget.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            <FormSelect
              control={form.control}
              name="iet_particulars"
              label="Particulars"
              options={particularSelector}
              placeholder="Select Particulars"
            />

            <FormInput
              control={form.control}
              name="iet_amount"
              label="Proposed Amount"
              keyboardType="numeric"
              placeholder="Enter proposed amount"
            />

            <FormInput
              control={form.control}
              name="iet_actual_amount"
              label="Actual Amount"
              keyboardType="numeric"
              placeholder="Enter actual amount (optional)"
            />
          </View>
        ) : (
          <View className="space-y-4">
            <FormInput
              control={form.control}
              name="iet_serial_num"
              label="Serial Number"
              placeholder="Enter serial number"
            />

            <FormInput
              control={form.control}
              name="iet_check_num"
              label="Check Number"
              placeholder="Enter check number"
            />

            <FormDateAndTimeInput
              control={form.control}
              name="iet_datetime"
              label={`Date (${year} only)`}
            />

            <FormTextArea
              control={form.control}
              name="iet_additional_notes"
              label="Additional Notes"
              placeholder="Add more details (Optional)"
            />

            <View className="mb-6">
              <Text className="text-[12px] font-PoppinsRegular pb-1">Supporting Document</Text>
              <MediaPicker
                selectedImages={selectedImages}
                setSelectedImages={setSelectedImages}
                limit={5}
              />              
            </View>
          </View>
        )}
      </View>
    </PageLayout>
  );
}

export default ExpenseCreateForm;
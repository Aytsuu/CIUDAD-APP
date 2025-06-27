//LATESTTTT
// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
// import { Controller, useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import IncomeExpenseFormSchema from './schema';
// import { FormInput } from '@/components/ui/form/form-input';
// import { FormTextArea } from '@/components/ui/form/form-text-area';
// import { FormSelect } from '@/components/ui/form/form-select';
// import { FormDateInput } from '@/components/ui/form/form-date-input';
// import { FormTimeInput } from '@/components/ui/form/form-time-input';
// import _ScreenLayout from '@/screens/_ScreenLayout'
// import MultiImageUploader, { MediaFileType } from '@/components/ui/multi-media-upload';
// import { useBudgetItems } from './queries/income-expense-FetchQueries';
// import { useCreateIncomeExpense } from './queries/income-expense-AddQueries';



// function ExpenseCreateForm() {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const year = params.budYear as string;
//   const totBud = parseFloat(params.totalBud as string) || 0;
//   const totExp = parseFloat(params.totalExp as string) || 0;

//   const years = Number(year);
//   const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>([]);
//   const [currentStep, setCurrentStep] = useState(1);
//   const { data: budgetItems = [] } = useBudgetItems(years);

//   const particularSelector = budgetItems.map(item => ({
//     label: item.name,
//     value: `${item.id} ${item.name}`,
//   }));

//   const form = useForm<z.infer<typeof IncomeExpenseFormSchema>>({
//     resolver: zodResolver(IncomeExpenseFormSchema),
//     defaultValues: {
//       iet_serial_num: '',
//       iet_entryType: '',
//       iet_date: '',
//       iet_time: '',
//       iet_particulars: '',
//       iet_amount: '',
//       iet_actual_amount: '',
//       iet_additional_notes: '',
//       iet_receipt_image: [],
//     },
//   });


//   const { mutate: createExpense } = useCreateIncomeExpense(() => {
//     router.back();
//   });

//   useEffect(() => {
//     form.setValue('iet_receipt_image', mediaFiles.map(file => ({
//       name: file.name,
//       type: file.type,
//       path: file.path,
//       uri: file.publicUrl || file.uri
//     })));
//   }, [mediaFiles, form]);

//   const selectedParticularId = form.watch('iet_particulars');
//   const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);

//   const onSubmit = (values: z.infer<typeof IncomeExpenseFormSchema>) => {
//     const inputDate = new Date(values.iet_date);
//     const inputYear = inputDate.getFullYear();

//     if (inputYear !== years) {
//       form.setError('iet_date', {
//         type: 'manual',
//         message: `Date must be in the year ${years}`,
//       });
//       return;
//     }

//     const proposedBudget = selectedParticular?.proposedBudget ?? 0;
//     const amount = Number(values.iet_amount);
//     const actualAmount = values.iet_actual_amount ? Number(values.iet_actual_amount) : 0;

//     const totalBudget = totBud - (actualAmount || amount);
//     const totalExpense = totExp + (actualAmount || amount);
//     const proposedBud = proposedBudget - (actualAmount || amount);

//     const particularId = Number(selectedParticularId?.split(' ')[0] || 0);

//     const allValues = {
//       ...values,
//       years,
//       totalBudget,
//       totalExpense,
//       proposedBud,
//       particularId,
//     };

//     createExpense(allValues);
//   };

//   const handleProceed = () => {
//     const amount = Number(form.getValues('iet_amount'));
//     const actual_amount = Number(form.getValues('iet_actual_amount')) || 0;

//     if (!amount || amount <= 0) {
//       form.setError('iet_amount', {
//         type: 'manual',
//         message: `Enter a valid amount`,
//       });
//       return;
//     }

//     if (actual_amount < 0) {
//       form.setError('iet_actual_amount', {
//         type: 'manual',
//         message: `Enter a valid actual amount`,
//       });
//       return;
//     }

//     if (!selectedParticular) {
//       form.setError('iet_particulars', {
//         type: 'manual',
//         message: `Select a valid particular`,
//       });
//       return;
//     }

//     const budget = selectedParticular.proposedBudget;
//     if (budget - amount < 0) {
//       form.setError('iet_amount', {
//         type: 'manual',
//         message: `Insufficient Balance`,
//       });
//       return;
//     }

//     if (budget - actual_amount < 0) {
//       form.setError('iet_actual_amount', {
//         type: 'manual',
//         message: `Insufficient Balance`,
//       });
//       return;
//     }

//     setCurrentStep(2);
//   };

//   return (
//     <SafeAreaView className="flex-1 bg-white pt-12">
//       <View className="flex-1 bg-white">
//         <ScrollView
//           className="flex-1 px-4"
//           contentContainerStyle={{ paddingBottom: 120 }}
//           keyboardShouldPersistTaps="handled"
//         >
//           {currentStep === 1 ? (
//             <>
//               {selectedParticular && (
//                 <View className="bg-blue-600 p-3 rounded-md mb-4 items-center">
//                   <Text className="text-white text-base font-semibold">
//                     Accumulated Budget: P{selectedParticular.proposedBudget.toFixed(2)}
//                   </Text>
//                 </View>
//               )}

//               <FormSelect
//                 control={form.control}
//                 name="iet_particulars"
//                 label="Particulars"
//                 options={particularSelector}
//                 placeholder="Select Particulars"
//               />

//               <FormInput
//                 control={form.control}
//                 name="iet_amount"
//                 label="Proposed Amount"
//                 keyboardType="numeric"
//                 placeholder="Enter proposed amount"
//               />

//               <FormInput
//                 control={form.control}
//                 name="iet_actual_amount"
//                 label="Actual Amount"
//                 keyboardType="numeric"
//                 placeholder="Enter actual amount (optional)"
//               />
//             </>
//           ) : (
//             <>
//               <FormInput
//                 control={form.control}
//                 name="iet_serial_num"
//                 label="Serial Number"
//                 placeholder="Enter serial number"
//               />

//               <FormDateInput
//                 control={form.control}
//                 name="iet_date"
//                 label={`Date (${year} only)`}
//               />

//               <FormTimeInput
//                 control={form.control}
//                 name="iet_time"
//                 label="Time"
//               />

//               <FormTextArea
//                 control={form.control}
//                 name="iet_additional_notes"
//                 label="Additional Notes"
//                 placeholder="Add more details (Optional)"
//               />

//               <View className="mb-6">
//                 <Text className="text-[12px] font-PoppinsRegular pb-1">Supporting Document</Text>
//                 <MultiImageUploader
//                   mediaFiles={mediaFiles}
//                   setMediaFiles={setMediaFiles}
//                   maxFiles={5}
//                 />
//               </View>
//             </>
//           )}
//         </ScrollView>

//         {/* Fixed bottom buttons */}
//         <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
//           {currentStep === 1 ? (
//             <TouchableOpacity
//               className="bg-blue-600 py-3 rounded-md w-full items-center"
//               onPress={handleProceed}
//             >
//               <Text className="text-white text-base font-semibold">Proceed</Text>
//             </TouchableOpacity>
//           ) : (
//             <View className="flex-row justify-between gap-2">
//               <TouchableOpacity
//                 className="border border-blue-600 py-3 rounded-md flex-1 items-center"
//                 onPress={() => setCurrentStep(1)}
//               >
//                 <Text className="text-blue-600 text-base font-semibold">Back</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 className="bg-blue-600 py-3 rounded-md flex-1 items-center"
//                 onPress={form.handleSubmit(onSubmit)}
//               >
//                 <Text className="text-white text-base font-semibold">Save Entry</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// export default ExpenseCreateForm;







import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
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
import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
import _ScreenLayout from '@/screens/_ScreenLayout';
import MultiImageUploader, { MediaFileType } from '@/components/ui/multi-media-upload';
import { useBudgetItems } from './queries/income-expense-FetchQueries';
import { useCreateIncomeExpense } from './queries/income-expense-AddQueries';
import { ChevronLeft, X } from 'lucide-react-native';


function ExpenseCreateForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const year = params.budYear as string;
  // const totBud = parseFloat(params.totalBud as string) || 0;
  // const totExp = parseFloat(params.totalExp as string) || 0;

  const years = Number(year);


  const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const { data: budgetItems = [] } = useBudgetItems(years);
  const {  data: fetchedData = [] } = useIncomeExpenseMainCard();

  const matchedYearData = fetchedData.find(item => Number(item.ie_main_year) === years);
  const totBud = matchedYearData?.ie_remaining_bal ?? 0;
  const totExp = matchedYearData?.ie_main_exp ?? 0;

  const particularSelector = budgetItems.map(item => ({
    label: item.name,
    value: `${item.id} ${item.name}`,
  }));

  const form = useForm<z.infer<typeof IncomeExpenseFormSchema>>({
    resolver: zodResolver(IncomeExpenseFormSchema),
    defaultValues: {
      iet_serial_num: '',
      iet_entryType: '',
      // iet_date: '',
      // iet_time: '',
      iet_datetime: '',
      iet_particulars: '',
      iet_amount: '',
      iet_actual_amount: '',
      iet_additional_notes: '',
      iet_receipt_image: [],
    },
  });

  const { mutate: createExpense, isPending } = useCreateIncomeExpense(() => {
    router.back();
  });

  useEffect(() => {
    form.setValue('iet_receipt_image', mediaFiles.map(file => ({
      name: file.name,
      type: file.type,
      path: file.path,
      uri: file.publicUrl || file.uri
    })));
  }, [mediaFiles, form]);

  const selectedParticularId = form.watch('iet_particulars');
  const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);

  const onSubmit = (values: z.infer<typeof IncomeExpenseFormSchema>) => {
    // const inputDate = new Date(values.iet_datetime);
    // const inputYear = inputDate.getFullYear();
    let totalBudget = 0.00;
    let totalExpense = 0.00;
    let proposedBud = 0.00;

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


    if(amount && actualAmount){
        totalBudget = totBUDGET - actualAmount;
        totalExpense = totEXP + actualAmount;
        proposedBud = propBudget - actualAmount;
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
      totalBudget,
      totalExpense,
      proposedBud,
      particularId,
    };

    createExpense(allValues);
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
    <_ScreenLayout
      // Header Configuration
      header={`${currentStep === 1 ? 'Step 1: Budget Details' : 'Step 2: Transaction Details'}`}
      headerAlign="left"
      
      // Navigation Configuration
      showBackButton={false}
      showExitButton={false}
      customLeftAction={
        <TouchableOpacity onPress={() => currentStep === 1 ? router.back() : setCurrentStep(1)}>
          <ChevronLeft size={24} color="black" />
        </TouchableOpacity>
      }

      // Layout Configuration
      scrollable={true}
      keyboardAvoiding={true}
      contentPadding="medium"
      
      // State Management
      loading={isPending}
      loadingMessage="Creating expense entry..."
      
      // Footer Configuration
      footer={
        <View className="w-full">
          {currentStep === 1 ? (
            <TouchableOpacity
              className="bg-primaryBlue py-3 rounded-md w-full items-center"
              onPress={handleProceed}
            >
              <Text className="text-white text-base font-semibold">Proceed</Text>
            </TouchableOpacity>
          ) : (

            <TouchableOpacity
              className="bg-primaryBlue py-3 rounded-md w-full items-center"
              onPress={form.handleSubmit(onSubmit)}
            >
              <Text className="text-white text-base font-semibold">Save Entry</Text>
            </TouchableOpacity>

          )}
        </View>
      }
      stickyFooter={true}
    >
      {/* Main Content */}
      {currentStep === 1 ? (
        <>
          {selectedParticular && (
            <View className="bg-primaryBlue p-3 rounded-md mb-4 items-center">
              <Text className="text-white text-base font-semibold">
                Accumulated Budget: P{selectedParticular.proposedBudget.toFixed(2)}
              </Text>
            </View>
          )}

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
        </>
      ) : (
        <>
          <FormInput
            control={form.control}
            name="iet_serial_num"
            label="Serial Number"
            placeholder="Enter serial number"
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
            <MultiImageUploader
              mediaFiles={mediaFiles}
              setMediaFiles={setMediaFiles}
              maxFiles={5}
            />
          </View>
        </>
      )}
    </_ScreenLayout>
  );
}

export default ExpenseCreateForm;
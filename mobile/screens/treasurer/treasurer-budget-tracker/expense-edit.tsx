// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { Controller, useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import IncomeExpenseFormSchema from './schema';
// import { FormInput } from '@/components/ui/form/form-input';
// import { FormTextArea } from '@/components/ui/form/form-text-area';
// import { FormSelect } from '@/components/ui/form/form-select';
// import { FormDateInput } from '@/components/ui/form/form-date-input';
// import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input';
// import _ScreenLayout from '@/screens/_ScreenLayout';
// import MultiImageUploader, { MediaFileType } from '@/components/ui/multi-media-upload';
// import { useBudgetItems } from './queries/income-expense-FetchQueries';
// import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
// import { useUpdateIncomeExpense } from './queries/income-expense-UpdateQueries';
// import { ChevronLeft, X } from 'lucide-react-native';
// import { ConfirmationModal } from '../../../components/ui/ConfirmationModal';



// function ExpenseEdit() {

//   const router = useRouter();
//   const params = useLocalSearchParams();
  
//   // Parse all params from the route
//   const {
//     iet_num,
//     iet_serial_num,
//     iet_datetime,
//     iet_entryType,
//     iet_particular_id,
//     iet_particulars_name,
//     iet_amount,
//     iet_actual_amount,
//     iet_additional_notes,
//     iet_receipt_image,
//     inv_num,
//     year,
//     files
//   } = params;

//   // Convert stringified files back to array
//   const parsedFiles = files ? JSON.parse(files as string) : [];

//   const years = Number(year);
//   const [isConfirmOpen, setIsConfirmOpen] = useState(false);
//   const [showConfirmation, setShowConfirmation] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);

//     const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>(
//         parsedFiles.map((file: any) => ({
//         id: `existing-${file.ief_id}`,
//         name: `existing-${file.ief_id}`,
//         type: 'image',
//         uri: file.ief_url,
//         path: '',
//         publicUrl: file.ief_url,
//         status: 'uploaded'
//         })) || []
//     );

//     console.log("PARTICULARRRR ID:", iet_particular_id)
//      console.log("PARTICULARRRR NAME:", iet_particulars_name)   

//   const {  data: fetchedData = [] } = useIncomeExpenseMainCard();

//   const { data: budgetItems = [] } = useBudgetItems(years);

//   const matchedYearData = fetchedData.find(item => Number(item.ie_main_year) === years);
//   const totBud = matchedYearData?.ie_main_tot_budget ?? 0;
//   const totExp = matchedYearData?.ie_main_exp ?? 0;


//   const entrytypeSelector = [
//     { label: "Income", value: "0" },
//     { label: "Expense", value: "1" }
//   ];

//   const particularSelector = budgetItems.map(item => ({
//     label: item.name,
//     value: `${item.id} ${item.name}`,
//     proposedBudget: item.proposedBudget
//   }));

//   const form = useForm<z.infer<typeof IncomeExpenseFormSchema>>({
//     resolver: zodResolver(IncomeExpenseFormSchema),
//     defaultValues: {
//       iet_serial_num: String(iet_serial_num),
//     //   iet_date: '',
//     //   iet_time: '',
//       iet_datetime: String(iet_datetime),
//       iet_entryType: String(iet_entryType),
//       iet_particulars: `${iet_particular_id} ${iet_particulars_name}`,
//       iet_amount: String(iet_amount),
//       iet_actual_amount: String(iet_actual_amount),
//       iet_additional_notes: String(iet_additional_notes),
//       iet_receipt_image: undefined
//     }
//   });

//   const selectedParticularId = form.watch("iet_particulars");
//   const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);


//   const { mutate: updateEntry, isPending } = useUpdateIncomeExpense(Number(iet_num), () => {
//     setIsEditing(false);
//   });

//   const onSubmit = async (values: z.infer<typeof IncomeExpenseFormSchema>) => {
//     let totalBudget = 0.00;
//     let totalExpense = 0.00;
//     let proposedBud = 0.00;

//     // Current Expenses and Total Budget
//     const totEXP = Number(totExp);
//     const totBUDGET = Number(totBud);

//     console.log("TOTAL BUDGET: ", typeof totEXP)
//     console.log("TOTAL EXPENSE: ", typeof totBUDGET)

//     console.log("TOTAL BUDGET: ", totEXP)
//     console.log("TOTAL EXPENSE: ", totBUDGET)

//     // Amount values
//     const prevAmount = Number(iet_amount);
//     const amount = Number(values.iet_amount);
//     const prevActualAmount = Number(iet_actual_amount);
//     const actualAmount = values.iet_actual_amount ? Number(values.iet_actual_amount) : 0;

//     // Proposed budget
//     const proposedBudget = selectedParticular?.proposedBudget;
//     const propBudget = Number(proposedBudget);

//     // Particular ID
//     const particularId = Number(selectedParticularId?.split(' ')[0] || 0);

//     // Validation checks
//     if (!values.iet_amount || !selectedParticularId) {
//       form.setError("iet_particulars", {
//         type: "manual",
//         message: `Particulars are required`,
//       });
//       form.setError("iet_amount", {
//         type: "manual",
//         message: `Amount is required`,
//       });
//       return;
//     }

//     if (!selectedParticular) {
//       form.setError("iet_particulars", {
//         type: "manual",
//         message: `Select a valid particular`,
//       });
//       return;
//     }

//     if (amount < 0 || actualAmount < 0) {
//       if (amount < 0) {
//         form.setError("iet_amount", {
//           type: "manual",
//           message: `Enter valid amount.`,
//         });
//       }
//       if (actualAmount < 0) {
//         form.setError("iet_actual_amount", {
//           type: "manual",
//           message: `Enter valid actual amount.`,
//         });
//       }
//       return;
//     }

//     // Calculate budget changes
//     if (amount) {
//       if (actualAmount) {
//         if (actualAmount != prevActualAmount && prevActualAmount != 0) {
//           totalBudget = (totBUDGET + prevActualAmount) - actualAmount;
//           totalExpense = (totEXP - prevActualAmount) + actualAmount;
//           proposedBud = (propBudget + prevActualAmount) - actualAmount;
//         } else {
//           if (amount != prevAmount) {
//             totalBudget = (totBUDGET + prevAmount) - actualAmount;
//             totalExpense = (totEXP - prevAmount) + actualAmount;
//             proposedBud = (propBudget + prevAmount) - actualAmount;
//           } else {
//             totalBudget = (totBUDGET + amount) - actualAmount;
//             totalExpense = (totEXP - amount) + actualAmount;
//             proposedBud = (propBudget + amount) - actualAmount;
//           }
//         }
//       } else {
//         if (actualAmount != prevActualAmount) {
//           totalBudget = (totBUDGET + prevActualAmount) - actualAmount;
//           totalExpense = (totEXP - prevActualAmount) + actualAmount;
//           proposedBud = (propBudget + prevActualAmount) - actualAmount;
//         } else {
//           if (amount != prevAmount) {
//             totalBudget = (totBUDGET + prevAmount) - amount;
//             totalExpense = (totEXP - prevAmount) + amount;
//             proposedBud = (propBudget + prevAmount) - amount;
//           } else {
//             totalBudget = totBUDGET;
//             totalExpense = totEXP;
//             proposedBud = propBudget;
//           }
//         }
//       }
//     }

//     updateEntry({
//       ...values,
//       mediaFiles,
//       years,
//       totalBudget,
//       totalExpense,
//       proposedBud,
//       particularId
//     });

//     // console.log('FORMMMMM:', values);
//     // console.log('Media Files:', mediaFiles);
//     // console.log('Year:', years);
//     // console.log('Total Budget:', totalBudget);
//     // console.log('Total Expense:', totalExpense);
//     // console.log('Proposed Budget:', proposedBud);
//     // console.log('Particular ID:', particularId);
//   };

//     const handleSubmitClick = async () => {
//         const isValid = await form.trigger();
//         console.log('Form isValid:', isValid);
//         console.log('Form errors:', form.formState.errors);
//         if (isValid) {
//             form.handleSubmit(onSubmit)();
//         }
//     };



//   useEffect(() => {
//     form.setValue('iet_receipt_image', mediaFiles.map(file => ({
//       name: file.name,
//       type: file.type,
//       path: file.path,
//       uri: file.publicUrl || file.uri
//     })));
//   }, [mediaFiles, form]);


//   return (
//     <_ScreenLayout
//       header="Edit Expense Entry"
//       headerAlign="left"
//       showBackButton={false}
//       showExitButton={false}
//       customLeftAction={
//         <TouchableOpacity onPress={() => router.back()}>
//           <ChevronLeft size={24} color="black" />
//         </TouchableOpacity>
//       }
//       scrollable={true}
//       keyboardAvoiding={true}
//       contentPadding="medium"
//       loading={isPending}
//       loadingMessage="Updating expense entry..."
//       footer={
//         <View className="w-full">
//           {!isEditing ? (
//             <TouchableOpacity
//               className="bg-primaryBlue py-3 rounded-md w-full items-center"
//               onPress={() => setIsEditing(true)}
//             >
//               <Text className="text-white text-base font-semibold">Edit</Text>
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity
//               className="bg-primaryBlue py-3 rounded-md w-full items-center"
//               onPress={handleSubmitClick}
//             >
//               <Text className="text-white text-base font-semibold">Save Changes</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       }
//       stickyFooter={true}
//     >
//         {selectedParticular && (
//             <View className="bg-primaryBlue p-3 rounded-md mb-4 items-center">
//                 <Text className="text-white text-base font-semibold">
//                     Accumulated Budget: P{selectedParticular.proposedBudget.toFixed(2)}
//                 </Text>
//             </View>
//         )}

//         <View className="relative">
//             <FormInput
//                 control={form.control}
//                 name="iet_serial_num"
//                 label="Serial No."
//                 placeholder="Enter serial number"
//             />
//             {!isEditing && (
//                 <TouchableOpacity
//                     className="absolute top-0 left-0 right-0 bottom-0"
//                     activeOpacity={1}
//                     onPress={() => {}}
//                     style={{ backgroundColor: 'transparent', zIndex: 10 }}
//                 />
//             )}
//         </View>

//         <View className="relative">
//             <FormDateTimeInput 
//                 control={form.control}
//                 name="iet_datetime"
//                 label={`Date (${year} only)`}            
//             />
//             {!isEditing && (
//                 <TouchableOpacity
//                     className="absolute top-0 left-0 right-0 bottom-0"
//                     activeOpacity={1}
//                     onPress={() => {}}
//                     style={{ backgroundColor: 'transparent', zIndex: 10 }}
//                 />
//             )}
//         </View>

//         <View className="relative">
//             <FormSelect
//                 control={form.control}
//                 name="iet_particulars"
//                 label="Particulars"
//                 options={particularSelector}
//                 placeholder="Select Particulars"
//             />
//             {!isEditing && (
//                 <TouchableOpacity
//                 className="absolute top-0 left-0 right-0 bottom-0"
//                 activeOpacity={1}
//                 onPress={() => {}}
//                 style={{ backgroundColor: 'transparent', zIndex: 10 }}
//                 />
//             )}
//         </View>

//         <View className="relative">
//             <FormInput
//                 control={form.control}
//                 name="iet_amount"
//                 label="Proposed Amount"
//                 keyboardType="numeric"
//                 placeholder="Enter amount"
//             />
//             {!isEditing && (
//                 <TouchableOpacity
//                 className="absolute top-0 left-0 right-0 bottom-0"
//                 activeOpacity={1}
//                 onPress={() => {}}
//                 style={{ backgroundColor: 'transparent', zIndex: 10 }}
//                 />
//             )}
//         </View>

//         <View className="relative">
//             <FormInput
//                 control={form.control}
//                 name="iet_actual_amount"
//                 label="Actual Amount"
//                 keyboardType="numeric"
//                 placeholder="Enter actual amount"
//             />
//             {!isEditing && (
//                 <TouchableOpacity
//                 className="absolute top-0 left-0 right-0 bottom-0"
//                 activeOpacity={1}
//                 onPress={() => {}}
//                 style={{ backgroundColor: 'transparent', zIndex: 10 }}
//                 />
//             )}
//         </View>

//         <View className="relative">
//             <FormTextArea
//                 control={form.control}
//                 name="iet_additional_notes"
//                 label="Additional Notes"
//                 placeholder="Add more details (Optional)"
//             />
//             {!isEditing && (
//                 <TouchableOpacity
//                 className="absolute top-0 left-0 right-0 bottom-0"
//                 activeOpacity={1}
//                 onPress={() => {}}
//                 style={{ backgroundColor: 'transparent', zIndex: 10 }}
//                 />
//             )}
//         </View>

//         <View className="mb-6 relative">
//             <Text className="text-[12px] font-PoppinsRegular pb-1">Supporting Document</Text>
//             <MultiImageUploader
//                 mediaFiles={mediaFiles}
//                 setMediaFiles={setMediaFiles}
//                 maxFiles={5}
//             />
//             {!isEditing && (
//                 <TouchableOpacity
//                 className="absolute top-[20px] left-0 right-0 bottom-0"
//                 activeOpacity={1}
//                 onPress={() => {}}
//                 style={{ backgroundColor: 'transparent', zIndex: 10 }}
//                 />
//             )}
//         </View>

//     </_ScreenLayout>
//   );
// }

// export default ExpenseEdit;









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
import { FormDateInput } from '@/components/ui/form/form-date-input';
import { FormDateAndTimeInput } from '@/components/ui/form/form-date-time-input';
import _ScreenLayout from '@/screens/_ScreenLayout';
import MultiImageUploader, { MediaFileType } from '@/components/ui/multi-media-upload';
import { useBudgetItems } from './queries/income-expense-FetchQueries';
import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
import { useUpdateIncomeExpense } from './queries/income-expense-UpdateQueries';
import { ChevronLeft, X, Loader2  } from 'lucide-react-native';
import { ConfirmationModal } from '@/components/ui/confirmationModal';



function ExpenseEdit() {

  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse all params from the route
  const {
    iet_num,
    iet_serial_num,
    iet_datetime,
    iet_entryType,
    iet_particular_id,
    iet_particulars_name,
    iet_amount,
    iet_actual_amount,
    iet_additional_notes,
    iet_receipt_image,
    inv_num,
    year,
    files
  } = params;

  // Convert stringified files back to array
  const parsedFiles = files ? JSON.parse(files as string) : [];

  const years = Number(year);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

    const [mediaFiles, setMediaFiles] = useState<MediaFileType[]>(
        parsedFiles.map((file: any) => ({
        id: `existing-${file.ief_id}`,
        name: `existing-${file.ief_id}`,
        type: 'image',
        uri: file.ief_url,
        path: '',
        publicUrl: file.ief_url,
        status: 'uploaded'
        })) || []
    );

    console.log("PARTICULARRRR ID:", iet_particular_id)
     console.log("PARTICULARRRR NAME:", iet_particulars_name)   

  const {  data: fetchedData = [] } = useIncomeExpenseMainCard();

  const { data: budgetItems = [] } = useBudgetItems(years);

  const matchedYearData = fetchedData.find(item => Number(item.ie_main_year) === years);
  const totBud = matchedYearData?.ie_remaining_bal ?? 0;
  const totExp = matchedYearData?.ie_main_exp ?? 0;

  console.log("EDIT EXP: ", totBud )


  const entrytypeSelector = [
    { label: "Income", value: "0" },
    { label: "Expense", value: "1" }
  ];

  const particularSelector = budgetItems.map(item => ({
    label: item.name,
    value: `${item.id} ${item.name}`,
    proposedBudget: item.proposedBudget
  }));

  const form = useForm<z.infer<typeof IncomeExpenseFormSchema>>({
    resolver: zodResolver(IncomeExpenseFormSchema),
    defaultValues: {
      iet_serial_num: String(iet_serial_num),
    //   iet_date: '',
    //   iet_time: '',
      iet_datetime: String(iet_datetime),
      iet_entryType: String(iet_entryType),
      iet_particulars: `${iet_particular_id} ${iet_particulars_name}`,
      iet_amount: String(iet_amount),
      iet_actual_amount: String(iet_actual_amount),
      iet_additional_notes: String(iet_additional_notes),
      iet_receipt_image: undefined
    }
  });

  const selectedParticularId = form.watch("iet_particulars");
  const selectedParticular = budgetItems.find(item => item.id === selectedParticularId?.split(' ')[0]);


  const { mutate: updateEntry, isPending } = useUpdateIncomeExpense(Number(iet_num), () => {
    setIsEditing(false);
  });

  const onSubmit = async (values: z.infer<typeof IncomeExpenseFormSchema>) => {
    let totalBudget = 0.00;
    let totalExpense = 0.00;
    let proposedBud = 0.00;

    // Current Expenses and Total Budget
    const totEXP = Number(totExp);
    const totBUDGET = Number(totBud);

    console.log("TOTAL BUDGET: ", typeof totEXP)
    console.log("TOTAL EXPENSE: ", typeof totBUDGET)

    console.log("TOTAL BUDGET: ", totEXP)
    console.log("TOTAL EXPENSE: ", totBUDGET)

    // Amount values
    const prevAmount = Number(iet_amount);
    const amount = Number(values.iet_amount);
    const prevActualAmount = Number(iet_actual_amount);
    const actualAmount = values.iet_actual_amount ? Number(values.iet_actual_amount) : 0;

    // Proposed budget
    const proposedBudget = selectedParticular?.proposedBudget;
    const propBudget = Number(proposedBudget);

    // Particular ID
    const particularId = Number(selectedParticularId?.split(' ')[0] || 0);

    // Validation checks
    if (!values.iet_amount || !selectedParticularId) {
      form.setError("iet_particulars", {
        type: "manual",
        message: `Particulars are required`,
      });
      form.setError("iet_amount", {
        type: "manual",
        message: `Amount is required`,
      });
      return;
    }

    if (!selectedParticular) {
      form.setError("iet_particulars", {
        type: "manual",
        message: `Select a valid particular`,
      });
      return;
    }

    if (amount < 0 || actualAmount < 0) {
      if (amount < 0) {
        form.setError("iet_amount", {
          type: "manual",
          message: `Enter valid amount.`,
        });
      }
      if (actualAmount < 0) {
        form.setError("iet_actual_amount", {
          type: "manual",
          message: `Enter valid actual amount.`,
        });
      }
      return;
    }

    // Calculate budget changes
    if (amount) {
      if (actualAmount) {
        if (actualAmount != prevActualAmount && prevActualAmount != 0.00) {
          totalBudget = (totBUDGET + prevActualAmount) - actualAmount;
          totalExpense = (totEXP - prevActualAmount) + actualAmount;
          proposedBud = (propBudget + prevActualAmount) - actualAmount;
        } else {
          if (amount != prevAmount) {
            totalBudget = (totBUDGET + prevAmount) - actualAmount;
            totalExpense = (totEXP - prevAmount) + actualAmount;
            proposedBud = (propBudget + prevAmount) - actualAmount;
          } else {
            totalBudget = (totBUDGET + amount) - actualAmount;
            totalExpense = (totEXP - amount) + actualAmount;
            proposedBud = (propBudget + amount) - actualAmount;
          }
        }
      } else {
        if (actualAmount != prevActualAmount) {
          totalBudget = (totBUDGET + prevActualAmount) - actualAmount;
          totalExpense = (totEXP - prevActualAmount) + actualAmount;
          proposedBud = (propBudget + prevActualAmount) - actualAmount;
        } else {
          if (amount != prevAmount) {
            totalBudget = (totBUDGET + prevAmount) - amount;
            totalExpense = (totEXP - prevAmount) + amount;
            proposedBud = (propBudget + prevAmount) - amount;
          } else {
            totalBudget = totBUDGET;
            totalExpense = totEXP;
            proposedBud = propBudget;
          }
        }
      }
    }

    updateEntry({
      ...values,
      mediaFiles,
      years,
      totalBudget,
      totalExpense,
      proposedBud,
      particularId
    });

    // console.log('FORMMMMM:', values);
    // console.log('Media Files:', mediaFiles);
    // console.log('Year:', years);
    // console.log('Total Budget:', totalBudget);
    // console.log('Total Expense:', totalExpense);
    // console.log('Proposed Budget:', proposedBud);
    // console.log('Particular ID:', particularId);
  };



  useEffect(() => {
    form.setValue('iet_receipt_image', mediaFiles.map(file => ({
      name: file.name,
      type: file.type,
      path: file.path,
      uri: file.publicUrl || file.uri
    })));
  }, [mediaFiles, form]);


  return (
    <_ScreenLayout
      headerBetweenAction={<Text>Edit Expense Entry</Text>}
      headerAlign="left"
      showBackButton={false}
      showExitButton={false}
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="black" />
        </TouchableOpacity>
      }
      scrollable={true}
      keyboardAvoiding={true}
      contentPadding="medium"
      loading={isPending}
      loadingMessage="Updating expense entry..."
      footer={
        <View className="w-full">
          {!isEditing ? (
            <TouchableOpacity
              className="bg-primaryBlue py-3 rounded-md w-full items-center"
              onPress={() => setIsEditing(true)}
            >
              <Text className="text-white text-base font-semibold">Edit</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-white border border-primaryBlue py-3 rounded-md items-center"
                onPress={() => {
                  setIsEditing(false);
                  form.reset();
                }}
              >
                <Text className="text-primaryBlue text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
              
              <ConfirmationModal
                trigger={
                  <TouchableOpacity
                    className="flex-1 bg-primaryBlue py-3 rounded-md items-center flex-row justify-center"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={20} color="white" className="animate-spin mr-2" />
                        <Text className="text-white text-base font-semibold">Saving...</Text>
                      </>
                    ) : (
                      <Text className="text-white text-base font-semibold">Save</Text>
                    )}
                  </TouchableOpacity>
                }
                title="Confirm Save"
                description="Are you sure you want to save these changes?"
                actionLabel="Confirm"
                onPress={() => form.handleSubmit(onSubmit)()}
              />
            </View>
          )}
        </View>
      }
      stickyFooter={true}
    >
      <View className="px-4">
        {selectedParticular && (
            <View className="bg-primaryBlue p-3 rounded-md mb-6 mt-5 items-center">
                <Text className="text-white text-base font-semibold">
                    Accumulated Budget: P{selectedParticular.proposedBudget.toFixed(2)}
                </Text>
            </View>
        )}

        <View className="relative">
            <FormInput
                control={form.control}
                name="iet_serial_num"
                label="Serial No."
                placeholder="Enter serial number"
            />
            {!isEditing && (
                <TouchableOpacity
                    className="absolute top-0 left-0 right-0 bottom-0"
                    activeOpacity={1}
                    onPress={() => {}}
                    style={{ backgroundColor: 'transparent', zIndex: 10 }}
                />
            )}
        </View>

        <View className="relative">
            <FormDateAndTimeInput
              control={form.control}
              name="iet_datetime"
              label={`Date (${year} only)`}
            />
            {!isEditing && (
                <TouchableOpacity
                    className="absolute top-0 left-0 right-0 bottom-0"
                    activeOpacity={1}
                    onPress={() => {}}
                    style={{ backgroundColor: 'transparent', zIndex: 10 }}
                />
            )}
        </View>

        <View className="relative">
            <FormSelect
                control={form.control}
                name="iet_particulars"
                label="Particulars"
                options={particularSelector}
                placeholder="Select Particulars"
            />
            {!isEditing && (
                <TouchableOpacity
                className="absolute top-0 left-0 right-0 bottom-0"
                activeOpacity={1}
                onPress={() => {}}
                style={{ backgroundColor: 'transparent', zIndex: 10 }}
                />
            )}
        </View>

        <View className="relative">
            <FormInput
                control={form.control}
                name="iet_amount"
                label="Proposed Amount"
                keyboardType="numeric"
                placeholder="Enter amount"
            />
            {!isEditing && (
                <TouchableOpacity
                className="absolute top-0 left-0 right-0 bottom-0"
                activeOpacity={1}
                onPress={() => {}}
                style={{ backgroundColor: 'transparent', zIndex: 10 }}
                />
            )}
        </View>

        <View className="relative">
            <FormInput
                control={form.control}
                name="iet_actual_amount"
                label="Actual Amount"
                keyboardType="numeric"
                placeholder="Enter actual amount"
            />
            {!isEditing && (
                <TouchableOpacity
                className="absolute top-0 left-0 right-0 bottom-0"
                activeOpacity={1}
                onPress={() => {}}
                style={{ backgroundColor: 'transparent', zIndex: 10 }}
                />
            )}
        </View>

        <View className="relative">
            <FormTextArea
                control={form.control}
                name="iet_additional_notes"
                label="Additional Notes"
                placeholder="Add more details (Optional)"
            />
            {!isEditing && (
                <TouchableOpacity
                className="absolute top-0 left-0 right-0 bottom-0"
                activeOpacity={1}
                onPress={() => {}}
                style={{ backgroundColor: 'transparent', zIndex: 10 }}
                />
            )}
        </View>

        <View className="mb-6 relative">
            <Text className="text-[12px] font-PoppinsRegular pb-1">Supporting Document</Text>
            <MultiImageUploader
                mediaFiles={mediaFiles}
                setMediaFiles={setMediaFiles}
                maxFiles={5}
            />
            {!isEditing && (
                <TouchableOpacity
                className="absolute top-[20px] left-0 right-0 bottom-0"
                activeOpacity={1}
                onPress={() => {}}
                style={{ backgroundColor: 'transparent', zIndex: 10 }}
                />
            )}
        </View>        

      </View>

    </_ScreenLayout>
  );
}

export default ExpenseEdit;
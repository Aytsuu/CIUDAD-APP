// import React, { useState } from 'react';
// import { ChevronLeft } from 'lucide-react-native';
// import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { FormInput } from '@/components/ui/form/form-input';
// import { FormTextArea } from '@/components/ui/form/form-text-area';
// import { FormSelect } from '@/components/ui/form/form-select';
// import { FormDateTimeInput } from '@/components/ui/form/form-date-time-input';
// import { SelectLayoutWithAdd } from '@/components/ui/selec-searchadd-layout';
// import { Textarea } from '@/components/ui/textarea';
// import { useIncomeParticular } from './queries/income-expense-FetchQueries';
// import { useCreateIncome } from './queries/income-expense-AddQueries';
// import { useAddParticular } from './request/particular-PostRequest';
// import { useDeleteParticular } from './request/particular-DeleteRequest';
// import IncomeFormSchema from '@/form-schema/treasurer/treasurer-income-schema';
// import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
// import _ScreenLayout from '@/screens/_ScreenLayout';




// function IncomeEditForm() {
//   const router = useRouter();
//   const params = useLocalSearchParams();

//   const {
//     inc_num,
//     inc_datetime,
//     incp_item,
//     incp_id,
//     inc_amount,
//     inc_additional_notes,
//     inc_is_archive,
//     year
//   } = params;

// //   const year = params.budYear as string;

//   const { handleAddParticular } = useAddParticular();
//   const { handleDeleteConfirmation, ConfirmationDialogs } = useDeleteParticular();

//   const form = useForm<z.infer<typeof IncomeFormSchema>>({
//     resolver: zodResolver(IncomeFormSchema),
//     defaultValues: {
//       inc_datetime: String(inc_datetime),
//       inc_entryType: '',
//       inc_particulars: String(incp_id),
//       inc_amount: String(inc_amount),
//       inc_additional_notes: String(inc_additional_notes),
//     },
//   });


//   const { mutate: createIncome, isPending } = useCreateIncome(() => {
//      router.back();
//   });

//   const { data: IncomeParticularItems = [] } = useIncomeParticular();
//   const {  data: fetchedData = [] } = useIncomeExpenseMainCard();

//   const matchedYearData = fetchedData.find(item => Number(item.ie_main_year) === Number(year));
//   const totInc = matchedYearData?.ie_main_inc ?? 0;

//   console.log("TOT INC HERE: ", totInc)

//   const IncomeParticulars = IncomeParticularItems
//     .filter(item => item.id && item.name)
//     .map(item => ({
//       id: item.id,
//       name: item.name,
//     }));

//   const onSubmit = (values: z.infer<typeof IncomeFormSchema>) => {
//     const dateStr = values.inc_datetime?.replace(' ', 'T').replace('+00', 'Z');
//     const inputDate = new Date(dateStr);
//     const inputYear = inputDate.getFullYear();
//     const yearIncome = Number(year);
//     let totalIncome = 0.0;

//     let totIncome = Number(totInc);
//     let inc_amount = Number(values.inc_amount);
//     totalIncome = totIncome + inc_amount;

//     if (inputYear !== yearIncome) {
//       form.setError('inc_datetime', {
//         type: 'manual',
//         message: `Date must be in the year ${year}`
//       });
//       return;
//     }
    
//     const AllValues = {
//       ...values,
//       totalIncome,
//       year: Number(year)
//     }

//     // console.log("ALL INCOME: ", AllValues)
//     createIncome(AllValues);
//   };

//   return (
//     <_ScreenLayout
//       header="Edit Income Entry"
//       headerAlign="left"

//       showBackButton={true}
//       customLeftAction={
//         <TouchableOpacity onPress={() => router.back()}>
//             <ChevronLeft size={24} color="black" />
//         </TouchableOpacity>
//       }

//       scrollable={true}
//       keyboardAvoiding={true}
//       contentPadding="medium"

//       // State Management
//       loading={isPending}
//       loadingMessage="Creating income entry..."

//       footer={
//             <TouchableOpacity
//               className="bg-primaryBlue py-3 rounded-md w-full items-center"
//               onPress={form.handleSubmit(onSubmit)}
//             >
//               <Text className="text-white text-base font-semibold">Save Entry</Text>
//             </TouchableOpacity>
//       }
//       stickyFooter={true}
//     >
//         <View className="w-full">

//             <FormDateTimeInput 
//                 control={form.control}
//                 name="inc_datetime"
//                 label={`Date (${year} only)`}
//             />

//             <View className="pb-3">
//                 <Controller
//                     control={form.control}
//                     name="inc_particulars"
//                     render={({ field: { onChange, value }, fieldState: { error } }) => (
//                         <View>
//                         <Text className="text-sm mb-1">Particulars</Text>
//                         <SelectLayoutWithAdd
//                             placeholder="Select a particular"
//                             label="Particulars"
//                             options={IncomeParticulars}
//                             value={value}
//                             onChange={onChange}
//                             onAdd={(newParticular) => {
//                             handleAddParticular(newParticular, (newId) => {
//                                 onChange(newId);
//                             });
//                             }}
//                             onDelete={(id) => handleDeleteConfirmation(Number(id))}
//                         />
//                         {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
//                         </View>
//                     )}
//                 />            
//             </View>
        

//             <FormInput
//                 control={form.control}
//                 name="inc_amount"
//                 label="Amount"
//                 keyboardType="numeric"
//                 placeholder="Enter amount"
//             />

//             <FormTextArea
//                 control={form.control}
//                 name="inc_additional_notes"
//                 label="Additional Notes"
//                 placeholder="Add more details (Optional)"
//             />
//         </View>
//       {ConfirmationDialogs()}
//     </_ScreenLayout>
//   );
// }

// export default IncomeEditForm;






// import React, { useState } from 'react';
// import { ChevronLeft, Loader2 } from 'lucide-react-native';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { FormInput } from '@/components/ui/form/form-input';
// import { FormTextArea } from '@/components/ui/form/form-text-area';
// import { FormDateAndTimeInput } from '@/components/ui/form/form-date-time-input';
// import { SelectLayoutWithAdd } from '@/components/ui/selec-searchadd-layout';
// import { useIncomeParticular } from './queries/income-expense-FetchQueries';
// import { useCreateIncome } from './queries/income-expense-AddQueries';
// import { useUpdateIncome } from './queries/income-expense-UpdateQueries';
// import { useAddParticular } from './request/particular-PostRequest';
// import { useDeleteParticular } from './request/particular-DeleteRequest';
// import IncomeFormSchema from '@/form-schema/treasurer/treasurer-income-schema';
// import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
// import _ScreenLayout from '@/screens/_ScreenLayout';
// import { ConfirmationModal } from '@/components/ui/confirmationModal';


// function IncomeEditForm() {
//   const router = useRouter();
//   const params = useLocalSearchParams();
//   const [isEditing, setIsEditing] = useState(false);

//   const {
//     inc_num,
//     inc_datetime,
//     incp_item,
//     incp_id,
//     inc_amount,
//     inc_additional_notes,
//     inc_is_archive,
//     year
//   } = params;

//   const { handleAddParticular } = useAddParticular();
//   const { handleDeleteConfirmation, ConfirmationDialogs } = useDeleteParticular();

//   const form = useForm<z.infer<typeof IncomeFormSchema>>({
//     resolver: zodResolver(IncomeFormSchema),
//     defaultValues: {
//       inc_datetime: String(inc_datetime),
//       inc_entryType: '',
//       inc_particulars: String(incp_id),
//       inc_amount: String(inc_amount),
//       inc_additional_notes: String(inc_additional_notes),
//     },
//   });

// //   const { mutate: createIncome, isPending } = useCreateIncome(() => {
// //     router.back();
// //   });

//   const { mutate: updateEntry, isPending } = useUpdateIncome(Number(inc_num), () => {
//     setIsEditing(false);
//   });


//   const { data: IncomeParticularItems = [] } = useIncomeParticular();
//   const { data: fetchedData = [] } = useIncomeExpenseMainCard();

//   const matchedYearData = fetchedData.find(item => Number(item.ie_main_year) === Number(year));
//   const totInc = matchedYearData?.ie_main_inc ?? 0;

//   console.log("TOTAL INCOME: ", totInc)

//   const IncomeParticulars = IncomeParticularItems
//     .filter(item => item.id && item.name)
//     .map(item => ({
//       id: item.id,
//       name: item.name,
//     }));

//   const onSubmit = (values: z.infer<typeof IncomeFormSchema>) => {
//     const dateStr = values.inc_datetime?.replace(' ', 'T').replace('+00', 'Z');
//     const inputDate = new Date(dateStr);
//     const inputYear = inputDate.getFullYear();
//     const yearIncome = Number(year);
//      let totalIncome = 0.0

//         let totIncome = Number(totInc);
//         let prev_amount = Number(inc_amount);
//         let current_amount = Number(values.inc_amount);

//         if (inputYear !== yearIncome) {
//             form.setError('inc_datetime', {
//                 type: 'manual',
//                 message: `Date must be in the year ${year}`
//             });
//             return; 
//         }

//         if(prev_amount != current_amount){
//             totalIncome = (totIncome - prev_amount) + current_amount;           
//         }
//         else{
//             totalIncome = current_amount;
//         }

//         const allValues = {
//             ...values,
//             totalIncome,
//             year: Number(year),
//         }
        
//         updateEntry(allValues);

//         setIsEditing(false);
//   };

//   return (
//     <_ScreenLayout
//       header="Edit Income Entry"
//       headerAlign="left"
//       showExitButton={false}
//       showBackButton={true}
//       customLeftAction={
//         <TouchableOpacity onPress={() => router.back()}>
//           <ChevronLeft size={24} color="black" />
//         </TouchableOpacity>
//       }
//       scrollable={true}
//       keyboardAvoiding={true}
//       contentPadding="medium"
//       loading={isPending}
//       loadingMessage="Updating income entry..."
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
//             <View className="flex-row gap-2">
//               <TouchableOpacity
//                 className="flex-1 bg-white border border-primaryBlue py-3 rounded-md items-center"
//                 onPress={() => {
//                   setIsEditing(false);
//                   form.reset();
//                 }}
//               >
//                 <Text className="text-primaryBlue text-base font-semibold">Cancel</Text>
//               </TouchableOpacity>
              
//               <ConfirmationModal
//                 trigger={
//                   <TouchableOpacity
//                     className="flex-1 bg-primaryBlue py-3 rounded-md items-center flex-row justify-center"
//                     disabled={isPending}
//                   >
//                     {isPending ? (
//                       <>
//                         <Loader2 size={20} color="white" className="animate-spin mr-2" />
//                         <Text className="text-white text-base font-semibold">Saving...</Text>
//                       </>
//                     ) : (
//                       <Text className="text-white text-base font-semibold">Save</Text>
//                     )}
//                   </TouchableOpacity>
//                 }
//                 title="Confirm Save"
//                 description="Are you sure you want to save these changes?"
//                 actionLabel="Confirm"
//                 onPress={() => form.handleSubmit(onSubmit)()}
//               />
//             </View>
//           )}
//         </View>
//       }
//       stickyFooter={true}
//     >
//       <View className="w-full">
//         {/* Date Input */}
//         <View className="relative">
//           <FormDateAndTimeInput
//             control={form.control}
//             name="inc_datetime"
//             label={`Date (${year} only)`}
//           />
//           {!isEditing && (
//             <TouchableOpacity
//               className="absolute top-0 left-0 right-0 bottom-0"
//               activeOpacity={1}
//               onPress={() => {}}
//               style={{ backgroundColor: 'transparent', zIndex: 10 }}
//             />
//           )}
//         </View>

//         {/* Particulars Selector */}
//         <View className="pb-3 relative">
//           <Controller
//             control={form.control}
//             name="inc_particulars"
//             render={({ field: { onChange, value }, fieldState: { error } }) => (
//               <View>
//                 <Text className="text-sm mb-1">Particulars</Text>
//                 <SelectLayoutWithAdd
//                   placeholder="Select a particular"
//                   label="Particulars"
//                   options={IncomeParticulars}
//                   value={value}
//                   onChange={onChange}
//                   onAdd={(newParticular) => {
//                     handleAddParticular(newParticular, (newId) => {
//                       onChange(newId);
//                     });
//                   }}
//                   onDelete={(id) => handleDeleteConfirmation(Number(id))}
//                 />
//                 {error && <Text className="text-red-500 text-xs mt-1">{error.message}</Text>}
//               </View>
//             )}
//           />
//           {!isEditing && (
//             <TouchableOpacity
//               className="absolute top-0 left-0 right-0 bottom-0"
//               activeOpacity={1}
//               onPress={() => {}}
//               style={{ backgroundColor: 'transparent', zIndex: 10 }}
//             />
//           )}
//         </View>

//         {/* Amount Input */}
//         <View className="relative">
//           <FormInput
//             control={form.control}
//             name="inc_amount"
//             label="Amount"
//             keyboardType="numeric"
//             placeholder="Enter amount"
//           />
//           {!isEditing && (
//             <TouchableOpacity
//               className="absolute top-0 left-0 right-0 bottom-0"
//               activeOpacity={1}
//               onPress={() => {}}
//               style={{ backgroundColor: 'transparent', zIndex: 10 }}
//             />
//           )}
//         </View>

//         {/* Additional Notes */}
//         <View className="relative">
//           <FormTextArea
//             control={form.control}
//             name="inc_additional_notes"
//             label="Additional Notes"
//             placeholder="Add more details (Optional)"
//           />
//           {!isEditing && (
//             <TouchableOpacity
//               className="absolute top-0 left-0 right-0 bottom-0"
//               activeOpacity={1}
//               onPress={() => {}}
//               style={{ backgroundColor: 'transparent', zIndex: 10 }}
//             />
//           )}
//         </View>
//       </View>
//       {ConfirmationDialogs()}
//     </_ScreenLayout>
//   );
// }

// export default IncomeEditForm;







import React, { useState } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react-native';
import { View, Text, TouchableOpacity } from 'react-native';
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
import { useUpdateIncome } from './queries/income-expense-UpdateQueries';
import { useAddParticular } from './request/particular-PostRequest';
import { useDeleteParticular } from './request/particular-DeleteRequest';
import IncomeFormSchema from '@/form-schema/treasurer/treasurer-income-schema';
import { useIncomeExpenseMainCard } from './queries/income-expense-FetchQueries';
import _ScreenLayout from '@/screens/_ScreenLayout';
import { ConfirmationModal } from '@/components/ui/confirmationModal';


function IncomeEditForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(false);

  const {
    inc_num,
    inc_datetime,
    incp_item,
    incp_id,
    inc_amount,
    inc_additional_notes,
    inc_is_archive,
    year
  } = params;

  const { handleAddParticular } = useAddParticular();
  const { handleDeleteConfirmation, ConfirmationDialogs } = useDeleteParticular();

  const form = useForm<z.infer<typeof IncomeFormSchema>>({
    resolver: zodResolver(IncomeFormSchema),
    defaultValues: {
      inc_datetime: String(inc_datetime),
      inc_entryType: '',
      inc_particulars: String(incp_id),
      inc_amount: String(inc_amount),
      inc_additional_notes: String(inc_additional_notes),
    },
  });

//   const { mutate: createIncome, isPending } = useCreateIncome(() => {
//     router.back();
//   });

  const { mutate: updateEntry, isPending } = useUpdateIncome(Number(inc_num), () => {
    setIsEditing(false);
  });


  const { data: IncomeParticularItems = [] } = useIncomeParticular();
  const { data: fetchedData = [] } = useIncomeExpenseMainCard();

  const matchedYearData = fetchedData.find(item => Number(item.ie_main_year) === Number(year));
  const totInc = matchedYearData?.ie_main_inc ?? 0;

  console.log("TOTAL INCOME: ", totInc)

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
     let totalIncome = 0.0

        let totIncome = Number(totInc);
        let prev_amount = Number(inc_amount);
        let current_amount = Number(values.inc_amount);

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

        if(prev_amount != current_amount){
            totalIncome = (totIncome - prev_amount) + current_amount;           
        }
        else{
            totalIncome = totIncome;
        }

        const allValues = {
            ...values,
            totalIncome,
            year: Number(year),
        }
        
        updateEntry(allValues);

        setIsEditing(false);
  };

  return (
    <_ScreenLayout
      headerBetweenAction={<Text className="text-[13px]">Edit Income Entry</Text>}
      headerAlign="left"
      showExitButton={false}
      showBackButton={true}
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="black" />
        </TouchableOpacity>
      }
      scrollable={true}
      keyboardAvoiding={true}
      contentPadding="medium"
      loading={isPending}
      loadingMessage="Updating income entry..."
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
      <View className="w-full px-4 pt-5">
        {/* Date Input */}
        <View className="relative">
          <FormDateAndTimeInput
            control={form.control}
            name="inc_datetime"
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

        {/* Particulars Selector */}
        <View className="pb-3 relative">
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
          {!isEditing && (
            <TouchableOpacity
              className="absolute top-0 left-0 right-0 bottom-0"
              activeOpacity={1}
              onPress={() => {}}
              style={{ backgroundColor: 'transparent', zIndex: 10 }}
            />
          )}
        </View>

        {/* Amount Input */}
        <View className="relative">
          <FormInput
            control={form.control}
            name="inc_amount"
            label="Amount"
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

        {/* Additional Notes */}
        <View className="relative">
          <FormTextArea
            control={form.control}
            name="inc_additional_notes"
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
      </View>
      {ConfirmationDialogs()}
    </_ScreenLayout>
  );
}

export default IncomeEditForm;
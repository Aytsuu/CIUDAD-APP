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
import PageLayout from "@/screens/_PageLayout";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import { useBudgetItems } from './queries/income-expense-FetchQueries';
import { useIncomeExpenseMainCard, type IncomeExpenseCard } from './queries/income-expense-FetchQueries';
import { useUpdateIncomeExpense } from './queries/income-expense-UpdateQueries';
import { ChevronLeft } from 'lucide-react-native';
import { ConfirmationModal } from '@/components/ui/confirmationModal';
import { useAuth } from '@/contexts/AuthContext';



function ExpenseEdit() {
  const { user } = useAuth(); 
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse all params from the route
  const {
    iet_num,
    iet_serial_num,
    iet_check_num,
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

  const [selectedImages, setSelectedImages] = useState<MediaItem[]>(
    parsedFiles.map((file: any) => ({
      id: `existing-${file.ief_id}`,
      name: file.ief_name || `file-${file.ief_id}`,
      type: 'image/jpeg',
      uri: file.ief_url
    }))
  );

  const { data: fetchedMain = { results: [], count: 0 } } = useIncomeExpenseMainCard();

  const { data: budgetItems = [] } = useBudgetItems(years);

  const matchedYearData = fetchedMain.results.find((item: IncomeExpenseCard) => Number(item.ie_main_year) === Number(year));
  const totBud = matchedYearData?.ie_remaining_bal ?? 0;
  const totExp = matchedYearData?.ie_main_exp ?? 0;


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
      iet_check_num: String(iet_check_num),
      iet_datetime: String(iet_datetime),
      iet_entryType: String(iet_entryType),
      iet_particulars: `${iet_particular_id} ${iet_particulars_name}`,
      iet_amount: String(iet_amount),
      iet_actual_amount: String(iet_actual_amount),
      iet_additional_notes: String(iet_additional_notes),
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
    let returnAmount = 0.00;    

    // Current Expenses and Total Budget
    const totEXP = Number(totExp);
    const totBUDGET = Number(totBud);

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

    const files = selectedImages.map((img: any) => ({
      id: img.id,
      name: img.name,
      type: img.type,
      file: img.file
    }))    

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

    if(!values.iet_additional_notes){
        values.iet_additional_notes = "None";
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

    const particularAccBudget = selectedParticular.proposedBudget;

    //trap if the entered amount/actual expense is greater than the budget
    if(Number(values.iet_actual_amount) > 0){

      if(prevActualAmount == 0){ // if bag o pa mag add og actual expense
          let budget = prevAmount + particularAccBudget;
          let subtractedActualAMT = budget - Number(values.iet_actual_amount);

          if (subtractedActualAMT < 0) {
              form.setError("iet_actual_amount", {
                  type: "manual",
                  message: `Insufficient Balance`,
              });
              return
          }  
      }            
      else{ // if mo update/edit ra sa actual expense
          let budget = prevActualAmount + particularAccBudget;                
          let subtractedActualAMT = budget - Number(values.iet_actual_amount);            
          
          if (subtractedActualAMT < 0) {
              form.setError("iet_actual_amount", {
                  type: "manual",
                  message: `Insufficient Balance`,
              });
              return
          }              
      }
    }
    else{
        let budget = prevAmount + particularAccBudget;
        let subtractAMT = budget - parseFloat(values.iet_amount);

        if (subtractAMT < 0) {
            form.setError("iet_amount", {
                type: "manual",
                message: `Insufficient Balance`,
            });
            return
        }
    }

    // Calculate budget changes
    if (amount) {
      if (actualAmount) {
        if(actualAmount == prevActualAmount)
        {
          if(amount != prevAmount){
              totalBudget = totBUDGET;      
              totalExpense = totEXP;   
              proposedBud = propBudget;  

              returnAmount = Math.abs(amount - actualAmount);  
          }else{
              totalBudget = totBUDGET;      
              totalExpense = totEXP;   
              proposedBud = propBudget;   
          }                                
        }
        else{
            if(actualAmount != prevActualAmount && prevActualAmount != 0){ // if the user updates the actual amount
                totalBudget = (totBUDGET + prevActualAmount) - actualAmount;
                totalExpense = (totEXP - prevActualAmount) + actualAmount; 
                proposedBud = (propBudget + prevActualAmount) - actualAmount;    
                
                returnAmount = Math.abs(amount - actualAmount);
            }
            else{// if new added actual amount
                if(amount != prevAmount){  // if theres changes in the amount value
                    totalBudget = (totBUDGET + prevAmount) - actualAmount;
                    totalExpense = (totEXP - prevAmount) + actualAmount; 
                    proposedBud = (propBudget + prevAmount) - actualAmount;   

                    returnAmount = Math.abs(amount - actualAmount);                   
                }
                else{ // if no changes in amount value
                    totalBudget = (totBUDGET + amount) - actualAmount;
                    totalExpense = (totEXP - amount) + actualAmount; 
                    proposedBud = (propBudget + amount) - actualAmount;

                    returnAmount = Math.abs(amount - actualAmount);                    
                }
            }                           
        }          
      } else {
        if (actualAmount != prevActualAmount) {
          totalBudget = (totBUDGET + prevActualAmount) - actualAmount;
          totalExpense = (totEXP - prevActualAmount) + actualAmount;
          proposedBud = (propBudget + prevActualAmount) - actualAmount;

          returnAmount = Math.abs(amount - actualAmount);          
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
      files,
      years,
      totalBudget,
      totalExpense,
      proposedBud,
      returnAmount,
      particularId,
      staff_id: user?.staff?.staff_id    
    });
  };




  return (
    <PageLayout
      headerTitle={<Text>Edit Expense Entry</Text>}
      leftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="black" />
        </TouchableOpacity>
      }
      footer={
        <View className="w-full">
          {!isEditing ? (
            <TouchableOpacity
              className="bg-primaryBlue py-4 rounded-xl w-full items-center"
              onPress={() => setIsEditing(true)}
            >
              <Text className="text-white text-base font-semibold">Edit</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="flex-1 bg-white border border-primaryBlue py-4 rounded-xl items-center"
                onPress={() => {
                  setIsEditing(false);
                  form.reset();
                }}
                disabled={isPending}
              >
                <Text className="text-primaryBlue text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
              
              <ConfirmationModal
                trigger={
                  <TouchableOpacity
                    className="flex-1 bg-primaryBlue py-4 rounded-xl items-center flex-row justify-center"
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <ActivityIndicator size="small" color="white" className="mr-2" />
                        <Text className="text-white text-base font-semibold ">Saving...</Text>
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
    >
      <View className="px-6">
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
            <FormInput
                control={form.control}
                name="iet_check_num"
                label="Check No."
                placeholder="Enter check number"
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
            <MediaPicker
              selectedImages={selectedImages}
              setSelectedImages={setSelectedImages}
              limit={5}
              editable={isEditing}
            />    
        </View>        

      </View>

    </PageLayout>
  );
}

export default ExpenseEdit;
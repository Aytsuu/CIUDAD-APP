import "@/global.css";

import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import _ScreenLayout from "@/screens/_ScreenLayout";
import SelectLayout from "@/components/ui/select/select-layout";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Calendar } from '@/lib/icons/Calendar';

const sexOptions: {label: string, value: string}[] = [
  {label: 'Male', value: 'male'},
  {label: 'Female', value: 'female'},
]

const civilStatusOptions: {label: string, value: string}[] = [
  {label: 'Single', value: 'single'},
  {label: 'Married', value: 'married'},
  {label: 'Widowed', value: 'widowed'},
]

export default function AddDependent() {
  const router = useRouter();
  const [show, setShow] = React.useState(false);
  const [form, setForm] = React.useState({
    FirstName: '',
    LastName: '',
    MiddleName: '',
    Suffix: '',
    DOB: new Date(0),
    Sex: null,
    CivilStatus: null,
    EducAttain: '',
    Employment: '',
  });

  const handleChange = (field: string , value: any) => {
    setForm({ ...form, [field]: value });
  };
  
  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
        setShow(false)
        handleChange('DOB', selectedDate);
    }
  };

  const handleProceed = () => {
    router.back();
  };


  return (
    <_ScreenLayout
      header={'Add a Dependent'}
      description={''}
    >
      <View className="flex-1">

        <View className="flex-1 gap-3">
          {/* Input Fields */}
          <Input 
            className="h-[57px] font-PoppinsRegular"
            placeholder="First Name" 
            value={form.FirstName} 
            onChangeText={(value) => handleChange('FirstName', value)} />
          <Input 
            className="h-[57px] font-PoppinsRegular"
            placeholder="Last Name" 
            value={form.LastName} 
            onChangeText={(value) => handleChange('LastName', value)} />
          <Input 
            className="h-[57px] font-PoppinsRegular"
            placeholder="Middle Name" 
            value={form.MiddleName} 
            onChangeText={(value) => handleChange('MiddleName', value)} />
          <Input 
            className="h-[57px] font-PoppinsRegular"
            placeholder="Suffix (e.g., Jr, Sr)" 
            value={form.Suffix} 
            onChangeText={(value) => handleChange('Suffix', value)} />

          <View className="flex">
            <Text className="text-[15px] font-PoppinsRegular">Date of Birth</Text>
            <View className="relative">
              <Button onPress={() => {setShow(true)}} className="bg-white border border-gray-300 native:h-[57px] items-start">
                  <Text className="text-[16px]">{form.DOB.toLocaleDateString()}</Text>
              </Button>
              {show && (
                  <RNDateTimePicker
                  testID="datePicker"
                  value={form.DOB}
                  mode="date"
                  is24Hour={true}
                  onChange={onChange}
                  />
                )}
                <View className="absolute right-5 top-1/2 transform -translate-y-1/2">
                  <Calendar className="text-gray-700" />
                </View>
            </View>
          </View>

          {/* Sex and Civil Status */}
          <View className="flex-row justify-between">
            <SelectLayout 
              className="min-w-[45%]"
              contentClassName="min-w-[41%]"
              options={sexOptions}
              selected={form.Sex || {value: 'select', label: 'Sex'}}
              onValueChange={(value) => handleChange('Sex', value || null)}
            />
            <SelectLayout 
              className="min-w-[53%]"
              contentClassName="min-w-[48%]"
              options={civilStatusOptions}
              selected={form.CivilStatus || {value: 'select', label: 'Civil Status'}}
              onValueChange={(value) => handleChange('CivilStatus', value || null)}
            />
          </View>

          <Input 
            className="h-[57px] font-PoppinsRegular"
            placeholder="Educational Attainment" 
            value={form.EducAttain} 
            onChangeText={(value) => handleChange('EducAttain', value)} />
          <Input 
            className="h-[57px] font-PoppinsRegular"
            placeholder="Employment" 
            value={form.Employment} 
            onChangeText={(value) => handleChange('Employment', value)} />
        </View>

        {/* Add Button*/}
        <View>
          <Button onPress={handleProceed} className="bg-primaryBlue native:h-[57px]">
            <Text className="text-white font-bold text-[16px]">Add</Text>
          </Button>
        </View>
      </View>
    </_ScreenLayout>
  );
};

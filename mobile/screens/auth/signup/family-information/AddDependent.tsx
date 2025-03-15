import "@/global.css";

import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "../_layout";
import SelectLayout from "@/components/ui/select/select-layout";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Calendar } from '@/lib/icons/Calendar';
import { useForm } from "@/app/(auth)/FormContext"; // Import the form context
import { DependentInfo } from "@/form-schema/registration-schema"; // Import the DependentInfo type

const sexOptions: {label: string, value: string}[] = [
  {label: 'Male', value: 'male'},
  {label: 'Female', value: 'female'},
];

const civilStatusOptions: {label: string, value: string}[] = [
  {label: 'Single', value: 'single'},
  {label: 'Married', value: 'married'},
  {label: 'Widowed', value: 'widowed'},
];

export default function AddDependent() {
  const router = useRouter();
  const { formData, setFormData } = useForm(); // Access form data and setFormData from context
  const [show, setShow] = React.useState(false);
  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: '',
    dob: new Date(0),
    sex: undefined,
    civilStatus: undefined,
    educAtt: '',
    employment: '',
  });

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setShow(false);
      handleChange('dob', selectedDate);
    }
  };

  const handleAddDependent = () => {
    // Create a new dependent object
    const newDependent: DependentInfo = {
      firstName: form.firstName,
      lastName: form.lastName,
      middleName: form.middleName,
      suffix: form.suffix,
      dob: form.dob.toISOString().split('T')[0], // Convert Date to string
      sex: form.sex,
      civilStatus: form.civilStatus,
      educAtt: form.educAtt,
      employment: form.employment,
    };

    // Add the new dependent to the dependentInformation array
    const updatedDependents = [...formData.dependentInformation, newDependent];
    setFormData({
      ...formData,
      dependentInformation: updatedDependents,
    });

    // Navigate back to the Dependents screen
    router.back();
  };

  return (
    <Layout
      header={'Add a Dependent'}
      description={''}
    >
      <View className="flex-1">
        <View className="flex-1 gap-3">
          {/* Input Fields */}
          <Input 
            className="h-[57px] font-PoppinsRegular"
            placeholder="First Name" 
            value={form.firstName} 
            onChangeText={(value) => handleChange('firstName', value)} />
          <Input 
            className="h-[57px] font-PoppinsRegular"
            placeholder="Last Name" 
            value={form.lastName} 
            onChangeText={(value) => handleChange('lastName', value)} />
          <Input 
            className="h-[57px] font-PoppinsRegular"
            placeholder="Middle Name" 
            value={form.middleName} 
            onChangeText={(value) => handleChange('middleName', value)} />
          <Input 
            className="h-[57px] font-PoppinsRegular"
            placeholder="Suffix (e.g., Jr, Sr)" 
            value={form.suffix} 
            onChangeText={(value) => handleChange('suffix', value)} />

          {/* Date of Birth Picker */}
          <View className="flex">
            <Text className="text-[15px] font-PoppinsRegular">Date of Birth</Text>
            <View className="relative">
              <Button onPress={() => {setShow(true)}} className="bg-white border border-gray-300 native:h-[57px] items-start">
                <Text className="text-[16px]">{form.dob.toLocaleDateString()}</Text>
              </Button>
              {show && (
                <RNDateTimePicker
                  testID="datePicker"
                  value={form.dob}
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
              selected={form.sex || {value: 'select', label: 'Sex'}}
              onValueChange={(value) => handleChange('sex', value || null)}
            />
            <SelectLayout 
              className="min-w-[53%]"
              contentClassName="min-w-[48%]"
              options={civilStatusOptions}
              selected={form.civilStatus || {value: 'select', label: 'Civil Status'}}
              onValueChange={(value) => handleChange('civilStatus', value || null)}
            />
          </View>

          {/* Educational Attainment and Employment */}
          <Input 
            className="h-[57px] font-PoppinsRegular"
            placeholder="Educational Attainment" 
            value={form.educAtt} 
            onChangeText={(value) => handleChange('educAtt', value)} />
          <Input 
            className="h-[57px] font-PoppinsRegular"
            placeholder="Employment" 
            value={form.employment} 
            onChangeText={(value) => handleChange('employment', value)} />
        </View>

        {/* Add Button */}
        <View>
          <Button onPress={handleAddDependent} className="bg-primaryBlue native:h-[57px]">
            <Text className="text-white font-bold text-[16px]">Add</Text>
          </Button>
        </View>
      </View>
    </Layout>
  );
}
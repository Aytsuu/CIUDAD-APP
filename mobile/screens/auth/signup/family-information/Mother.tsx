import "@/global.css";

import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "../_layout";
import SelectLayout from "@/components/ui/select/select-layout";
import { Option } from "@rn-primitives/select";
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from '@/lib/icons/Calendar';

const civilStatusOptions: {label: string, value: string}[] = [
    {label: 'Single', value: 'single'},
    {label: 'Married', value: 'married'},
    {label: 'Widowed', value: 'widowed'},
]
  

export default function Mother (){
  const router = useRouter();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [middleName, setMiddleName] = React.useState('');
  const [suffix, setSuffix] = React.useState('');
  const [civilStatus, setCivilStatus] = React.useState<Option | null>(null);
  const [dateOfBirth, setDateOfBirth] = React.useState<Date>(new Date(0));
  const [showCalendar, setShowCalendar] = React.useState(false);
  
  const showDatepicker = () => {
      setShowCalendar(true);
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (selectedDate) {
          setShowCalendar(false)
          setDateOfBirth(selectedDate);
      }
  };

  const handleProceed = () => {
      router.push('/father-information');
  };

  return (
    <Layout
        header={'Mother Information'}
        description={'Optional Fields'}
    >
        <View className="flex-1 flex-col gap-3">
          {/* Input Fields */}
          <Input className="h-[57px] font-PoppinsRegular" placeholder="First Name" value={firstName} onChangeText={setFirstName} />
          <Input className="h-[57px] font-PoppinsRegular" placeholder="Last Name" value={lastName} onChangeText={setLastName} />
          <Input className="h-[57px] font-PoppinsRegular" placeholder="Middle Name" value={middleName} onChangeText={setMiddleName} />
          <Input className="h-[57px] font-PoppinsRegular" placeholder="Suffix (e.g., Jr, Sr)" value={suffix} onChangeText={setSuffix} />
          <View className="flex">
            <Text className="text-[16px] font-PoppinsRegular">Date of Birth</Text>
            <View className="flex relative">
                <Button onPress={showDatepicker} className="bg-white border border-gray-300 native:h-[57px] items-start">
                    <Text className="text-[16px]">{dateOfBirth.toLocaleDateString()}</Text>
                </Button>
                {showCalendar && (
                    <RNDateTimePicker
                    testID="datePicker"
                    value={dateOfBirth}
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

          {/* Civil Status Dropdown */}
          <View>
            <SelectLayout 
                className="min-w-[53%]"
                contentClassName="w-[48%]"
                options={civilStatusOptions}
                selected={civilStatus || {value: 'select', label: 'Civil Status'}}
                onValueChange={(value) => setCivilStatus(value || null)}
            />
            </View>
        </View>

        {/* Next Button Inside ScrollView at the Bottom */}
        <View>
          <Button onPress={handleProceed} className="bg-primaryBlue native:h-[57px]">
            <Text className="text-white font-PoppinsMedium text-[16px]">Next</Text>
          </Button>
        </View>
    </Layout>
  );
};

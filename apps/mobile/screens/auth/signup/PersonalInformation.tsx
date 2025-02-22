import "@/global.css";

import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "./_layout";
import SelectLayout from "@/components/ui/select/select-layout";
import { Option } from "@rn-primitives/select";
import RNDateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Calendar } from "@/lib/icons/Calendar";

const sexOptions: {label: string, value: string}[] = [
  {label: 'Male', value: 'male'},
  {label: 'Female', value: 'female'},
]

const civilStatusOptions: {label: string, value: string}[] = [
  {label: 'Single', value: 'single'},
  {label: 'Married', value: 'married'},
  {label: 'Widowed', value: 'widowed'},
]

export default function PersonalInformation() {
  const router = useRouter();
  const [FirstName, setFirstName] = React.useState('');
  const [LastName, setLastName] = React.useState('');
  const [MiddleName, setMiddleName] = React.useState('');
  const [Suffix, setSuffix] = React.useState('');
  const [Sex, setSex] = React.useState<Option | null>(null);
  const [CivilStatus, setCivilStatus] = React.useState<Option | null>(null);
  const [POB, setPOB] = React.useState('');
  const [Citizenship, setCitizenship] = React.useState('');
  const [Religion, setReligion] = React.useState('');
  const [Address, setAddress] = React.useState('');
  const [Contact, setContact] = React.useState('');
  const [Occupation, setOccupation] = React.useState('');
  const [DateResidency, setDateResidency] = React.useState<Date>(new Date(0));
  const [showCalendar, setShowCalendar] = React.useState(false);
  
  const showDatepicker = () => {
    setShowCalendar(true);
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (selectedDate) {
        setShowCalendar(false)
        setDateResidency(selectedDate);
      }
  };

  const handleProceed = () => {
    router.push('/mother-information');
  };


  return (
    <Layout
      header={'Personal Information'}
      description={'Please fill out all required fields.'}
    >
      <View className="flex-1 justify-between gap-7">
        <View className="flex-1 flex-col gap-3">
          <Input className="h-[57px] font-PoppinsRegular" placeholder="First Name" value={FirstName} onChangeText={setFirstName} />
          <Input className="h-[57px] font-PoppinsRegular" placeholder="Last Name" value={LastName} onChangeText={setLastName} />
          <Input className="h-[57px] font-PoppinsRegular" placeholder="Middle Name" value={MiddleName} onChangeText={setMiddleName} />
          <Input className="h-[57px] font-PoppinsRegular" placeholder="Suffix (e.g., Jr, Sr)" value={Suffix} onChangeText={setSuffix} />

          <View className="flex-row justify-between">
            <SelectLayout 
              className="min-w-[45%]"
              contentClassName="w-[41%]"
              options={sexOptions}
              selected={Sex || {value: 'select', label: 'Sex'}}
              onValueChange={(value) => setSex(value || null)}
            />
            <SelectLayout 
              className="min-w-[53%]"
              contentClassName="w-[48%]"
              options={civilStatusOptions}
              selected={CivilStatus || {value: 'select', label: 'Civil Status'}}
              onValueChange={(value) => setCivilStatus(value || null)}
            />
          </View>

          <Input className="h-[57px] font-PoppinsRegular" placeholder="Place of Birth" value={POB} onChangeText={setPOB} />
          <Input className="h-[57px] font-PoppinsRegular" placeholder="Citizenship" value={Citizenship} onChangeText={setCitizenship} />
          <Input className="h-[57px] font-PoppinsRegular" placeholder="Religion" value={Religion} onChangeText={setReligion} />
          <Input className="h-[57px] font-PoppinsRegular" placeholder="Address" value={Address} onChangeText={setAddress} />
          <Input className="h-[57px] font-PoppinsRegular" placeholder="Contact No." value={Contact} onChangeText={setContact} />
          <Input className="h-[57px] font-PoppinsRegular" placeholder="Occupation" value={Occupation} onChangeText={setOccupation} />
          <View className="flex">
              <Text className="text-[15px] font-PoppinsRegular">Date of Residency</Text>
              <View className="flex relative">
                  <Button onPress={showDatepicker} className="bg-white border border-gray-300 native:h-[57px] items-start">
                      <Text className="text-[16px]">{DateResidency.toLocaleDateString()}</Text>
                  </Button>
                  {showCalendar && (
                      <RNDateTimePicker
                      testID="datePicker"
                      value={DateResidency}
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
        </View>

        <View className="pb-[3rem]">
          <Button onPress={handleProceed} className="bg-primaryBlue native:h-[57px] w-full">
            <Text className="text-white font-PoppinsMedium text-[16px]">Next</Text>
          </Button>
        </View>
      </View>
    </Layout>
  );
}
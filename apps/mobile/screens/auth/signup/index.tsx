import "@/global.css";

import React from "react";
import { useRouter } from "expo-router";
import Layout from "./_layout";
import { View, Text } from "react-native";
import { Button } from "@/components/ui/button";
import RNDateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { RadioGroup } from '@/components/ui/radio-button/radio-group';
import RadioButton  from '@/components/ui/radio-button/radio-button';
import { Calendar } from '@/lib/icons/Calendar';

export default () => {
    const router = useRouter();
    const [dob, setDob] = React.useState(new Date(0));
    const [residency, setResidency] = React.useState('');
    const [showCalendar, setShowCalendar] = React.useState(false);

    const showDatepicker = () => {
        setShowCalendar(true);
    };

    const handleNext = () => {
        // if (dob && residency) {
            router.push('/demographic-data');
        // } else {
        //     alert('Please complete all fields');
        // }
    };

    const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (selectedDate) {
            setShowCalendar(false)
            setDob(selectedDate);
        }
    };

    return (
        <Layout
            header={'Verifying Identity'}
            description={'Please enter your date of birth and residency to continue:'}
        >
            {/* Scrollable Content */}
            <View className="flex-1">
                <View className="flex-1 flex-col gap-5">
                    <View className="flex">
                        <Text className="text-[16px] font-PoppinsRegular">Date of Birth</Text>
                        <View className="flex relative">
                            <Button onPress={showDatepicker} className="bg-white border border-gray-300 native:h-[57px] items-start">
                                <Text className="text-[16px]">{dob.toLocaleDateString()}</Text>
                            </Button>
                            {showCalendar && (
                                <RNDateTimePicker
                                testID="datePicker"
                                value={dob}
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

                    {/* Residency Selection */}
                    <View>
                        <Text className="text-black font-PoppinsRegular text-[16px] mb-5">Residency</Text>
                        <RadioGroup value={residency} onValueChange={setResidency} className='gap-3'>
                            <RadioButton 
                                value='Permanent: long-term resident' 
                                onLabelPress={()=>{setResidency('Permanent')}} 
                            />
                            <RadioButton 
                                value='Temporary: short-term stay' 
                                onLabelPress={()=>{setResidency('Temporary')}} 
                            />
                        </RadioGroup>
                    </View>
                </View>
            
                {/* Fixed Next Button at the Bottom */}
                <View>
                    <Button onPress={handleNext} className="bg-primaryBlue native:h-[57px]">
                        <Text className="text-white font-PoppinsMedium text-[16px]">Next</Text>
                    </Button>
                </View>  
            </View>
        </Layout>
    )
}
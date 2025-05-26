import "@/global.css";
import React from 'react';
import { View, Text, TouchableWithoutFeedback, Image} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from "@/components/ui/button";
import Layout from "./_layout";
import * as ImagePicker from 'expo-image-picker';
import { Camera } from '@/lib/icons/Camera';
import { addPersonal, addRequest } from "./restful-api/signupPostAPI";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";

export default function TakeAPhoto() {
  const router = useRouter();
  const { control, trigger, getValues} = useRegistrationFormContext()
  const [photo, setPhoto] = React.useState(null);

  const handleSubmit = async () => {  

    const values = getValues()

    const personalId = await addPersonal(values)
    const res = await addRequest(personalId)

    // if (photo) {
    //   console.log('Photo:', photo);
    //   router.push('./ConfirmRegister');
    // } else {
    //   alert('Please fill out all fields before submitting.');
    // }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

  };

  return (
    <Layout
        header={'Take A Photo'}
        description={''}
    >
        <View className="flex-1 justify-between gap-7">
            <View className="flex-1 gap-7">
                <View className="flex-1 gap-3">
                    <View className="flex bg-lightBlue-2 rounded-md gap-3 p-4">
                        <Text className="text-black/80  font-PoppinsRegular text-[15px]">Please ensure the photo is clear.</Text>
                        <TouchableWithoutFeedback onPress={takePhoto}>
                            <View className="flex h-[200px] rounded-md bg-white border border-gray-200 items-center justify-center">
                                {photo ? (
                                <Image source={{ uri: photo }} style={{ width: 100, height: 100 }} />
                                ) : (
                                <>
                                    <Camera className="text-black/30 stroke-1" size={50}/>
                                    <Text className="text-black/50 font-PoppinsRegular text-[14px]">Click to open camera </Text>
                                </>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </View>
            </View>

            {/* Submit Button */}
            <View>
                <Button
                    onPress={handleSubmit}
                    className="bg-primaryBlue native:h-[57px]"
                >
                    <Text className="text-white font-bold text-[16px]">Submit</Text>
                </Button>
            </View>
        </View>
    </Layout>
  );
};

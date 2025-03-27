import "@/global.css";

import React from 'react';
import { View, Text, TouchableWithoutFeedback, Image} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from "@/components/ui/button";
import Layout from "./_layout";
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus } from '@/lib/icons/ImagePlus';
import { FormSelect } from "@/components/ui/form/form-select";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";


const idOptions: {label: string, value: string}[] = [
  {label: "Driver's License", value: "driverLicense"},
  {label: "UMID", value: "umid"},
  {label: "Philhealth ID", value: "philhealthID"},
  {label: "Passport", value: "passportID"},
  {label: "SSS ID", value: "sssID"},
  {label: "Voter's ID", value: "votersID"},
  {label: "National ID", value: "nationalID"},
  {label: "HDMF (Pag-ibig ID)", value: "pagibigID"},
  {label: "Other", value: "other"}
]


export default function UploadID() {
  const router = useRouter();
  const {control, trigger, getValues, setValue} = useRegistrationFormContext()

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setValue('uploadIdSchema.imageURI', result.assets[0].uri);
      trigger('uploadIdSchema.imageURI');
    }

  };

  const handleSubmit = () => {

    console.log(getValues().uploadIdSchema)
    // router.push('/(auth)/take-a-photo')
  } 

  return (
    <Layout
        header={'Upload Valid ID'}
        description={'Choose from recommended IDs (Select other if not available)'}
    >
        <View className="flex-1 justify-between gap-7">
            <View className="flex-1 gap-7">
                <View className="flex-1 gap-3">

                    <FormSelect 
                      control={control}
                      name="uploadIdSchema.selected"
                      options={idOptions}
                      label="Recommended IDs"
                      placeholder=""
                    />

                    {/* Upload ID Section */}
                    <View className="flex bg-lightBlue-2 rounded-md gap-3 p-4">
                        <Text className="text-black/80 font-PoppinsRegular text-[15px] text-justify">
                            Upload valid ID or government issued document (e.g., birth certificate).
                        </Text>
                        <TouchableWithoutFeedback onPress={pickImage}>
                          <View className="flex h-[200px] rounded-md bg-white border border-gray-200 items-center justify-center">
                            {/* {uploadedID ? 
                              <Image source={{ uri: uploadedID }} className=""/>
                            :  */}
                            <>
                                <ImagePlus className="text-black/30 stroke-1" size={50}/>
                                <Text className="text-black/50 font-PoppinsRegular text-[14px]">Upload your ID here  </Text>
                            </>
                            {/* } */}
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

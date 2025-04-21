<<<<<<< HEAD
import "@/global.css";

import React from 'react';
import { View, Text, TouchableWithoutFeedback, Image} from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from "@/components/ui/button";
import Layout from "./_layout";
import SelectLayout from "@/components/ui/select/select-layout";
import * as ImagePicker from 'expo-image-picker';
import { ImagePlus } from '@/lib/icons/ImagePlus';
import { Camera } from '@/lib/icons/Camera';
import { Option } from "@rn-primitives/select";

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


export default function RegisterCompletion() {
  const router = useRouter();
  const [selectedID, setSelectedID] = React.useState<Option | null>(null);
  const [uploadedID, setUploadedID] = React.useState(null);
  const [photo, setPhoto] = React.useState(null);

  const handleSubmit = () => {
    if (selectedID && (uploadedID || photo)) {
      console.log('ID:', selectedID, 'Uploaded ID:', uploadedID, 'Photo:', photo);
      router.push('./ConfirmRegister');
    } else {
      alert('Please fill out all fields before submitting.');
    }
  };

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

    // if (!result.canceled) {
    //   setUploadedID(result.assets[0].uri);
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

    // if (!result.canceled) {
    //   setPhoto(result.assets[0].uri);
    // }
  };

  return (
    <Layout
        header={'Complete Your Registration'}
        description={''}
    >
        <View className="flex-1 justify-between gap-7">
            <View className="flex-1 gap-7">
                <View className="flex-1 gap-3">
                    {/* Header */}
                    <View className="flex">
                        <Text className="text-black/ text-[20px] font-PoppinsMedium">Recommended IDs</Text>
                        <Text className="text-black/80  font-PoppinsRegular text-[15px]">
                            Choose an ID for account registration (Other, if not available)
                        </Text>
                    </View>
      
                    <SelectLayout
                      className="font-PoppinsRegular"
                      contentClassName="w-[90%]"
                      options={idOptions}
                      selected={selectedID || {value: 'select', label: 'Select an ID'}}
                      onValueChange={(value) => {setSelectedID(value)}}
                    />


                    {/* Upload ID Section */}
                    <View className="flex bg-lightBlue-2 rounded-md gap-3 p-4">
                        <Text className="text-black/80 font-PoppinsRegular text-[15px]">
                            Upload ID or government issued document (e.g., birth certificate).
                        </Text>
                        <View className="flex h-[200px] rounded-md bg-white border border-gray-200 items-center justify-center">
                          <TouchableWithoutFeedback onPress={pickImage}>

                              {uploadedID ? 
                                <Image source={{ uri: uploadedID }} className=""/>
                              : 
                              <>
                                  <ImagePlus className="text-black/30 stroke-1" size={50}/>
                                  <Text className="text-black/50 font-PoppinsRegular text-[14px]">Upload your ID here  </Text>
                              </>
                              }

                          </TouchableWithoutFeedback>
                        </View>
                    </View>
                </View>

                <View className="flex-1 gap-3">
                    {/* Header */}
                    <View className="flex">
                        <Text className="text-black  text-[20px] font-PoppinsMedium">Take a photo</Text>
                    </View>

                    <View className="flex bg-lightBlue-2 rounded-md gap-3 p-4">
                        <Text className="text-black/80  font-PoppinsRegular text-[15px]">Please ensure the photo is clear.</Text>
                        <View className="flex h-[200px] rounded-md bg-white border border-gray-200 items-center justify-center">
                          <TouchableWithoutFeedback onPress={takePhoto}>
                              {photo ? (
                              <Image source={{ uri: photo }} style={{ width: 100, height: 100 }} />
                              ) : (
                              <>
                                  <Camera className="text-black/30 stroke-1" size={50}/>
                                  <Text className="text-black/50 font-PoppinsRegular text-[14px]">Click to open camera </Text>
                              </>
                              )}
                          </TouchableWithoutFeedback>
                        </View>
                    </View>
                </View>

            </View>
            {/* Submit Button */}
            <View className="pb-[3rem]">
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
=======
import { Confirmation } from "@/components/ui/confirmation";
import { supabase } from "@/lib/supabase";
import { v4 as uuid4 } from "uuid";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import {
  useAddPersonal,
  useAddRequest,
  useAddFile,
  useAddRequestFile,
} from "./queries/signupAddQueries";
import React from "react";
import { FeedbackScreen } from "@/components/ui/feedback-screen";
import { useRouter } from "expo-router";

export default function RegisterCompletion({ photo, setPhoto }: {
  photo: Uint8Array,
  setPhoto: React.Dispatch<React.SetStateAction<Uint8Array | null>>
}) {
  const router = useRouter();
  const [showFeedback, setShowFeedback] = React.useState(false)
  const [status, setStatus] = React.useState<"success" | "failure">("success")
  const { getValues } = useRegistrationFormContext();
  const { mutateAsync: addPersonal } = useAddPersonal();
  const { mutateAsync: addRequest } = useAddRequest();
  const { mutateAsync: addFile } = useAddFile();
  const { mutateAsync: addRequestFile } = useAddRequestFile();

  const cancel = () => {
    setPhoto(null);
  };

  const submit = async () => {
    try {
      const fileName = `${uuid4()}.jpg`;
      const filePath = `uploads/${fileName}`;
      const { error } = await supabase.storage
        .from("image-bucket")
        .upload(filePath, photo as Uint8Array, {
          contentType: "image/jpeg",
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("image-bucket").getPublicUrl(filePath);

      console.log("Upload successful!", publicUrl);

      const values = getValues();
      const personal = await addPersonal(values);
      const request = await addRequest(personal.per_id);
      const file = await addFile({
        name: fileName,
        type: "image/jpeg",
        path: filePath,
        url: publicUrl,
      });
      const requestFile = await addRequestFile({
        requestId: request.req_id,
        fileId: file.file_id,
      });

      if (requestFile) {
        setStatus("success");
        setShowFeedback(true);
      }

    } catch (error) {
      setStatus("failure");
        setShowFeedback(true);
    }
  };

  if (showFeedback) {
    return (
      <FeedbackScreen
        status={status}
        onRetry={() => {
          // Simulate a retry that might succeed
          const willSucceed = Math.random() > 0.5
          setTimeout(() => {
            setStatus(willSucceed ? "success" : "failure")
          }, 1500)
        }}
        onOk={() => router.push('/')}
      />
    )
  }

  return (
    <Confirmation
      title="Are you sure you want to register?"
      description="Please confirm that all the information you provided is correct."
      onConfirm={submit}
      onCancel={cancel}
    />
  );
}
>>>>>>> mobile-register

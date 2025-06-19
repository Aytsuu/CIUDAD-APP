import "@/global.css";

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from "@/components/ui/button";
import _ScreenLayout from "@/screens/_ScreenLayout";
import { FormSelect } from "@/components/ui/form/form-select";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import MediaPicker from "@/components/ui/media-picker";
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { X } from "@/lib/icons/X"
import { useToastContext } from "@/components/ui/toast";
import { useFieldArray } from "react-hook-form";

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
];

export default function UploadID() {
  const router = useRouter();
  const { toast } = useToastContext();
  const {control, trigger, getValues, setValue} = useRegistrationFormContext();
  const [selectedImage, setSelectedImage] = React.useState<Record<string, any>>({});

  const { append } = useFieldArray({
    control: control,
    name: "photoSchema.list",
  });

  React.useEffect(() => {
    if(selectedImage.rf_type) {
      append({
        rf_name: selectedImage.rf_name,
        rf_type: selectedImage.rf_type,
        rf_path: selectedImage.rf_path,
        rf_url: selectedImage.rf_url,
        rf_is_id: true,
        rf_id_type: getValues("uploadIdSchema.selected")
      })
    }
  }, [selectedImage])

  const handleSubmit = async () => {
    const formIsValid = await trigger([
      "uploadIdSchema.selected"
    ]);

    if(!formIsValid) {
      return;
    }

    if(!selectedImage.rf_type) {
      toast.error("Upload a photo of your valid ID")
      return;
    }

    router.push("/(auth)/take-a-photo")
  };

  console.log("Selected Image:", selectedImage);

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">ID Verification</Text>}
      customRightAction={
        <TouchableOpacity onPress={() => router.replace("/(auth)")}>
          <X className="text-black" />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 justify-between gap-6">
        <View className="flex-1 gap-6">
          
          {/* ID Type Selection */}
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <View className="w-full mb-4 pb-2 border-b border-gray-200">
                <Text className="text-lg font-PoppinsSemiBold text-gray-800">Upload ID</Text>
                <Text className="text-sm text-gray-600 font-PoppinsRegular">It is required to upload a valid ID.</Text>
              </View>
            </View>
            
            <FormSelect 
              control={control}
              name="uploadIdSchema.selected"
              options={idOptions}
              placeholder="Choose your ID type..."
              label="Select ID Type"
            />
          </View>

          {/* Upload ID Section */}
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-lg font-semibold text-gray-900">Upload ID Photo</Text>
            </View>
            
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <MediaPicker 
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
              />
              
              {/* Upload Tips */}
              <View className="mt-4 p-3 bg-blue-50 rounded-lg">
                <Text className="text-sm font-medium text-blue-900 mb-1">
                  📸 Photo Tips:
                </Text>
                <Text className="text-sm text-blue-800">
                  • Ensure all text is clearly readable{'\n'}
                  • Avoid glare and shadows{'\n'}
                  • Include all four corners of the ID
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Fixed Bottom Button */}
        <View className="pt-4 pb-8 bg-white border-t border-gray-100">
          <Button onPress={handleSubmit} className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg">
            <Text className="text-white font-PoppinsSemiBold text-[16px]">Continue to Photo</Text>
          </Button>

          {/* Helper Text */}
          <Text className="text-center text-xs text-gray-500 font-PoppinsRegular mt-3">
            All information will be kept secure and confidential
          </Text>
        </View>
      </View>
    </_ScreenLayout>
  );
}
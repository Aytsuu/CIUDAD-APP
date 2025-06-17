import "@/global.css";

import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from "@/components/ui/button";
import _ScreenLayout from "@/screens/_ScreenLayout";
import { FormSelect } from "@/components/ui/form/form-select";
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext";
import MediaPicker from "@/components/ui/media-picker";
import { AlertCircle, CheckCircle, ChevronLeft, X } from "lucide-react-native";

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
  const {control, trigger, getValues, setValue} = useRegistrationFormContext();
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if(selectedImage) {
      setValue("uploadIdSchema.imageURI", selectedImage)
    }
  }, [selectedImage])

  const handleSubmit = async () => {
    const formIsValid = await trigger([
      "uploadIdSchema.imageURI",
      "uploadIdSchema.selected"
    ]);

    if(!formIsValid) {
      return;
    }

    if(!selectedImage) {
      return;
    }
  };

  // Check if form is complete
  const isFormComplete = () => {
    const formData = getValues().uploadIdSchema;
    return formData?.selected && selectedImage;
  };

  return (
    <_ScreenLayout
      customLeftAction={
        <View className="flex-row items-center">
          <ChevronLeft size={30} className="text-black" />
          <Text className="text-[13px]">Personal Information</Text>
        </View>
      }
      customRightAction={<X className="text-black" />}
    >
      <View className="flex-1 justify-between gap-6">
        <View className="flex-1 gap-6">
          
          {/* ID Type Selection */}
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <View className="w-full mb-4 pb-2 border-b border-gray-200">
                <Text className="text-lg font-PoppinsSemiBold text-gray-800">ID Validation</Text>
                <Text className="text-sm text-gray-600 font-PoppinsRegular">It is required to upload a valid ID.</Text>
              </View>

              {getValues().uploadIdSchema?.selected && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
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
              {selectedImage && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
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

          {/* Form Completion Status */}
          {isFormComplete() && (
            <View className="bg-green-50 border border-green-200 rounded-lg p-4">
              <View className="flex-row items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <Text className="font-medium text-green-900">Ready to proceed!</Text>
              </View>
              <Text className="text-green-700 text-sm mt-1">
                Your ID information has been captured successfully.
              </Text>
            </View>
          )}
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
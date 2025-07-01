import "@/global.css";
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from "@/components/ui/button";
import _ScreenLayout from "@/screens/_ScreenLayout";
import { FormSelect } from "@/components/ui/form/form-select";
import MediaPicker from "@/components/ui/media-picker";
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { X } from "@/lib/icons/X"
import { useToastContext } from "@/components/ui/toast";
import { complaintFormSchema } from "@/form-schema/complaint-schema";
import { z } from "zod";
import { FormTextArea } from "@/components/ui/form/form-text-area";
import { Plus } from "@/lib/icons/Plus";
import { AccusedDrawer } from "./AccusedDrawer";
import { useComplaintFormContext } from "@/contexts/ComplaintFormContext";

type Complaint = z.infer<typeof complaintFormSchema>;

export default function ComplaintForm() {
  const router = useRouter();
  const [accusedList, setAccusedList] = React.useState<any[]>([]);
  const [accusedDrawerVisible, setAccusedDrawerVisible] = React.useState<boolean>(false);
  const [accusedError, setAccusedError] = React.useState<boolean>(false);
  const { toast } = useToastContext();
  const {control, trigger, getValues, watch, setValue, resetField} = useComplaintFormContext();
  const [selectedImage, setSelectedImage] = React.useState<Record<string, any>>({});

  React.useEffect(() => {
    // const addList =  watch('accused.list')
    if (watch('accused.list')) {
      setAccusedList(watch('accused.list'));
      setAccusedError(false);
    }
  }, [watch('accused.list')])

  const handleSubmit = async () => {
    const formIsValid = await trigger([
      "comp_incident_type",
      "comp_datetime",
      "comp_allegation",
    ]);

    if(!formIsValid) {
      return;
    }

    if(!selectedImage?.type) {
      toast.error("Upload a photo of your valid ID")
      return;
    }

  };

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Blotter Complaint</Text>}
      customRightAction={
        <TouchableOpacity
          onPress={() => router.replace("/(auth)")}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <X size={20} className="text-gray-700" />
        </TouchableOpacity>
      }
    >
      <View className="flex-1 justify-between gap-6">
        <View className="flex-1 gap-6">
          
          {/* ID Type Selection */}
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <View className="w-full mb-4 pb-2 border-b border-gray-200">
                <Text className="text-lg font-PoppinsSemiBold text-gray-800">Complaint Form</Text>
                <Text className="text-sm text-gray-600 font-PoppinsRegular">Fill out all required fields. Submit a photo to support your complaint</Text>
              </View>
            </View>
            
            <FormSelect 
              control={control}
              name="comp_incident_type"
              options={[]}
              placeholder="Select"
              label="Incident Type"
            />

            <FormTextArea control={control} name="comp_allegation" label="Allegation"/>
            <View className="mb-4">
              <Text className="text-sm font-PoppinsRegular mb-2">Accused</Text>
              <View className={`border rounded-lg p-3 ${accusedError ? "border-red-500" : "border-gray-200"}`}>
                {/* Existing Addresses */}
                {accusedList.length > 0 && (
                  <View className="mb-3">
                    {accusedList.map((accused, index) => (
                      <View key={index} className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                        <View className="flex-1">
                          <Text className="text-sm font-PoppinsMedium text-gray-800">
                            {accused.accusedName}
                          </Text>
                        </View>
                        
                        <TouchableOpacity
                          onPress={() => {
                            const updatedAccused = accusedList.filter((_, i) => i !== index);
                            setValue("accused.list", updatedAccused)
                            setAccusedList(updatedAccused);
                          }}
                          className="ml-3 p-2"
                        >
                          <X size={14} className="text-gray-400" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                {/* Add Address Button */}
                <TouchableOpacity
                  className="flex flex-col justify-center items-center bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300"
                  onPress={() => setAccusedDrawerVisible(true)}
                >
                  <Plus size={20} className="text-gray-600 mb-1" />
                  <Text className="text-sm font-PoppinsRegular text-gray-600">Add Accused</Text>
                </TouchableOpacity>
              </View>
              {accusedError && <Text className="text-red-500 text-xs mt-1">At least one accused is required</Text>}
            </View>
          </View>

          {/* Upload photo Section */}
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <Text className="text-md font-semibold text-gray-900">Photo of the incident</Text>
            </View>
            
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <MediaPicker 
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
              />
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

        <AccusedDrawer 
          control={control}
          visible={accusedDrawerVisible}
          trigger={trigger}
          getValues={getValues}
          resetField={resetField}
          onClose={() => setAccusedDrawerVisible(false)} 
        />
      </View>
    </_ScreenLayout>
  );
}
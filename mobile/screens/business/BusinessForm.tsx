import { ScrollView, TouchableOpacity, View, Text } from "react-native";
import PageLayout from "../_PageLayout";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { router } from "expo-router";
import { FormInput } from "@/components/ui/form/form-input";
import React from "react";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import { Button } from "@/components/ui/button";
import { Control } from "react-hook-form";
import { SubmitButton } from "@/components/ui/button/submit-button";

export default function BusinessForm({
  header,
  control,
  selectedImages,
  setSelectedImages,
  submit,
} : {
  header: string
  control: Control <any>
  formattedSitio: any
  selectedImages: MediaItem[]
  setSelectedImages: React.Dispatch<React.SetStateAction<MediaItem[]>>
  submit: () => void
}) {
  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={<Text className="text-gray-900 text-[13px]">{header}</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <View className="flex-1 px-6 py-2">
        {/* Form Section Header */}
        {/* <View className="mb-6">
          <Text className="text-sm text-gray-900">
            Please provide accurate information about your business
          </Text>
        </View> */}

        {/* Form Fields */}
        <View className="grid gap-2">
          <FormInput control={control} name="bus_name" label="Business Name" placeholder="Enter your business name" returnKeyType="next" />
          <FormInput control={control} name="bus_gross_sales" label="Annual Gross Sales (₱)" placeholder="0.00" keyboardType="phone-pad" returnKeyType="next"/>
          <FormInput  control={control}  name="bus_location"  label="Business Address" placeholder="Enter complete address" returnKeyType="done"/>
        </View>

        {/* Document Upload Section */}
        <View className="mt-6 mb-6">
          <View className="mb-6">
            <Text className="text-[14px] font-medium text-gray-700">
              Supporting Documents
            </Text>
            <Text className="text-sm text-gray-600">
              Upload an image of your business permit
            </Text>
          </View>
          
          <MediaPicker
            selectedImages={selectedImages}
            setSelectedImages={setSelectedImages}
            multiple={true}
            maxImages={2}
          />
          
          {selectedImages?.length < 1 && (
            <Text className="text-red-500 text-xs font-PoppinsRegular mt-2">
              At least one supporting document is required
            </Text>
          )}
        </View>

        <View className="pt-4 pb-8 bg-white border-t border-gray-100">
          <SubmitButton 
            handleSubmit={submit}
            buttonLabel="Submit Registration"
          />
  
          <Text className="text-center text-xs text-gray-500 font-PoppinsRegular mt-3">
            All information will be kept secure and confidential
          </Text>
        </View>
      </View>
    </PageLayout>
  )
}
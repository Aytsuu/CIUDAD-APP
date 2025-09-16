import { ScrollView, TouchableOpacity, View, Text } from "react-native";
import PageLayout from "../_PageLayout";
import { ChevronLeft } from "@/lib/icons/ChevronLeft";
import { router } from "expo-router";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import React from "react";
import MediaPicker, { MediaItem } from "@/components/ui/media-picker";
import { Button } from "@/components/ui/button/button";
import { LoadingModal } from "@/components/ui/loading-modal";
import { Control } from "react-hook-form";

export default function BusinessForm({
  header,
  control,
  formattedSitio,
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
      <ScrollView className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-5">
          {/* Form Section Header */}
          <View className="mb-6">
            <Text className="text-sm font-PoppinsMedium text-gray-900">
              Please provide accurate information about your business
            </Text>
          </View>

          {/* Form Fields */}
          <View className="space-y-4">
            <FormInput control={control} name="bus_name" label="Business Name" placeholder="Enter your business name" returnKeyType="next" />
            <FormInput control={control} name="bus_gross_sales" label="Business Gross Sales (₱)" placeholder="0.00" keyboardType="phone-pad" returnKeyType="next"/>
            <FormSelect control={control} name="sitio" label="Sitio" options={formattedSitio} placeholder="Select your sitio"/>
            <FormInput  control={control}  name="bus_street"  label="Business Street Address" placeholder="Enter complete street address" returnKeyType="done"/>
          </View>

          {/* Document Upload Section */}
          <View className="mt-8 mb-6">
            <View className="mb-4">
              <Text className="text-base font-PoppinsSemiBold text-gray-900 mb-1">
                Supporting Documents *
              </Text>
              <Text className="text-sm font-PoppinsRegular text-gray-600">
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
            <Button onPress={submit} className="bg-primaryBlue native:h-[56px] w-full rounded-xl shadow-lg">
              <Text className="text-white font-PoppinsSemiBold text-[16px]">Submit</Text>
            </Button>
    
            <Text className="text-center text-xs text-gray-500 font-PoppinsRegular mt-3">
              All information will be kept secure and confidential
            </Text>
          </View>
        </View>
      </ScrollView>
    </PageLayout>
  )
}
import "@/global.css"
import React from "react"
import { View, Text, ScrollView, TouchableOpacity, Modal, Animated, Dimensions } from "react-native"
import { useRouter } from "expo-router"
import { Button } from "@/components/ui/button"
import _ScreenLayout from "@/screens/_ScreenLayout"
import { FormInput } from "@/components/ui/form/form-input"
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext"
import { FormSelect } from "@/components/ui/form/form-select"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { X } from "@/lib/icons/X"
import { Plus } from "@/lib/icons/Plus"
import { AddressDrawer } from "./AddressDrawer"


const sexOptions: { label: string; value: string }[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
]

const civilStatusOptions: { label: string; value: string }[] = [
  { label: "Single", value: "single" },
  { label: "Married", value: "married" },
  { label: "Widowed", value: "widowed" },
]

export default function PersonalInformation() {
  const router = useRouter();
  const { control, trigger, watch, getValues, setValue } = useRegistrationFormContext();
  const [showAddressDrawer, setShowAddressDrawer] = React.useState(false);
  const [addresses, setAddresses] = React.useState<any[]>([]);
  const [addressError, setAddressesError] = React.useState<boolean>(false);

  React.useEffect(() => {
    const addList =  watch('personalInfoSchema.per_addresses.list')
    if (addList) {
      setAddresses(addList);
      setAddressesError(false);
    }

  }, [watch('personalInfoSchema.per_addresses.list')])

  const handleSubmit = async () => {

    const formIsValid = await trigger([
      "personalInfoSchema.per_lname",
      "personalInfoSchema.per_fname",
      "personalInfoSchema.per_mname",
      "personalInfoSchema.per_suffix",
      "personalInfoSchema.per_sex",
      "personalInfoSchema.per_status",
      "personalInfoSchema.per_edAttainment",
      "personalInfoSchema.per_religion",
      "personalInfoSchema.per_contact",
      "personalInfoSchema.per_occupation",
    ])

    if (!formIsValid) {
      addresses.length === 0 && setAddressesError(true);
      return;
    }

    if(addresses.length === 0) {
      setAddressesError(true);
      return;
    }
    router.push("/(auth)/upload-id")
  }

  return (
    <_ScreenLayout
      customLeftAction={
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={30} className="text-black" />
        </TouchableOpacity>
      }
      headerBetweenAction={<Text className="text-[13px]">Personal Information</Text>}
      customRightAction={
        <TouchableOpacity onPress={() => router.replace("/(auth)")}>
          <X className="text-black" />
        </TouchableOpacity>
      }
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Full Name Section */}
        <View className="mb-8">
          <View className="w-full mb-4 pb-2 border-b border-gray-200">
            <Text className="text-lg font-PoppinsSemiBold text-gray-800">Full Name</Text>
            <Text className="text-sm text-gray-600 font-PoppinsRegular">Enter your complete legal name</Text>
          </View>

          <View className="space-y-4">
            <View className="grid space-x-3">
              <View className="flex-1">
                <FormInput control={control} label="First Name" name="personalInfoSchema.per_fname" />
              </View>
              <View className="flex-1">
                <FormInput control={control} label="Last Name" name="personalInfoSchema.per_lname" />
              </View>
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1">
                <FormInput control={control} label="Middle Name" name="personalInfoSchema.per_mname" />
              </View>
              <View className="w-24">
                <FormInput control={control} label="Suffix" name="personalInfoSchema.per_suffix" placeholder="Jr, Sr" />
              </View>
            </View>
          </View>
        </View>

        {/* Demographics Section */}
        <View className="mb-8">
          <View className="mb-4 pb-2 border-b border-gray-200">
            <Text className="text-lg font-PoppinsSemiBold text-gray-800">Demographics</Text>
            <Text className="text-sm text-gray-600 font-PoppinsRegular">Basic demographic information</Text>
          </View>

          <View className="space-y-4">
            <View className="flex-row gap-2">
              <View className="flex-1">
                <FormSelect
                  control={control}
                  name="personalInfoSchema.per_sex"
                  options={sexOptions}
                  label="Sex"
                />
              </View>
              <View className="flex-1 z-100">
                <FormSelect
                  control={control}
                  name="personalInfoSchema.per_status"
                  options={civilStatusOptions}
                  label="Marital Status"
                />
              </View>
            </View>

            <FormInput control={control} label="Religion" name="personalInfoSchema.per_religion" />
          </View>
        </View>

        {/* Education & Professional Section */}
        <View className="mb-8">
          <View className="mb-4 pb-2 border-b border-gray-200">
            <Text className="text-lg font-PoppinsSemiBold text-gray-800">Education & Professional</Text>
            <Text className="text-sm text-gray-600 font-PoppinsRegular">Educational and professional background</Text>
          </View>

          <View className="space-y-4">
            <FormInput control={control} label="Educational Attainment" name="personalInfoSchema.per_edAttainment" />
            <FormInput control={control} label="Occupation" name="personalInfoSchema.per_occupation" />
          </View>
        </View>

        {/* Contact Information Section */}
        <View className="mb-8">
          <View className="mb-4 pb-2 border-b border-gray-200">
            <Text className="text-lg font-PoppinsSemiBold text-gray-800">Contact Information</Text>
            <Text className="text-sm text-gray-600 font-PoppinsRegular">How we can reach you</Text>
          </View>

          <FormInput
            control={control}
            label="Contact Number"
            name="personalInfoSchema.per_contact"
            keyboardType="phone-pad"
          />

          <View className="mt-4">
            <Text className="text-[14px] font-PoppinsRegular mb-2">Addresses</Text>
            <View className={`border rounded-lg p-3 ${addressError ? "border-red-500" : "border-gray-200"}`}>
              {/* Existing Addresses */}
              {addresses.length > 0 && (
                <View className="mb-3">
                  {addresses.map((address, index) => (
                    <View key={index} className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2">
                      <View className="flex-1">
                        <Text className="text-sm font-PoppinsMedium text-gray-800">
                          {address.add_street}, {address.add_barangay}
                        </Text>
                        <Text className="text-xs text-gray-500 font-PoppinsRegular">
                          {address.add_city}, {address.add_province}
                          {address.sitio && ` • ${address.sitio}`}
                        </Text>
                      </View>
                      
                      <TouchableOpacity
                        onPress={() => {
                          const updatedAddresses = addresses.filter((_, i) => i !== index);
                          setValue("personalInfoSchema.per_addresses.list", updatedAddresses)
                          setAddresses(updatedAddresses);
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
                onPress={() => setShowAddressDrawer(true)}
              >
                <Plus size={20} className="text-gray-600 mb-1" />
                <Text className="text-sm font-PoppinsRegular text-gray-600">Add Address</Text>
              </TouchableOpacity>
            </View>
            {addressError && <Text className="text-red-500 text-xs mt-1">At least one address is required</Text>}
          </View>
        </View>
      </ScrollView>

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

      {/* Address Drawer */}
      <AddressDrawer
        visible={showAddressDrawer}
        onClose={() => {
          setShowAddressDrawer(false)
        }}
      />
    </_ScreenLayout>
  )
}

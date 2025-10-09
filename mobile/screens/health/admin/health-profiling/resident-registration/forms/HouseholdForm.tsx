import "@/global.css";
import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { FormSelect } from "@/components/ui/form/form-select";
import { SubmitButton } from "@/components/ui/button/submit-button";
import { Plus } from "@/lib/icons/Plus";
import { X } from "@/lib/icons/X";
import { HousePlus } from "lucide-react-native";
import { Card } from "@/components/ui/card";

interface HouseholdFormProps {
  form: UseFormReturn<any>;
  onNext: (stepId: number, isComplete: boolean) => void;
}

export default function HouseholdForm({ form, onNext }: HouseholdFormProps) {
  const { control, trigger, watch, getValues, setValue, resetField } = form;
  const [houseList, setHouseList] = React.useState<any[]>([]);

  const houseInfo = watch("houseSchema.info");
  const personalAddresses = watch("personalSchema.per_addresses.list") || [];

  // Format addresses for the dropdown
  const formattedAddresses = React.useMemo(() => {
    return personalAddresses.map((address: any, index: number) => ({
      label: `${address.sitio ? address.sitio + ', ' : ''}${address.add_street}, ${address.add_barangay}`,
      value: `${index}-${address.sitio || address.add_external_sitio}-${address.add_street}`
    }));
  }, [personalAddresses]);

  React.useEffect(() => {
    const list = getValues("houseSchema.list") || [];
    setHouseList(list);
  }, []);

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name?.startsWith('houseSchema.list')) {
        const list = value.houseSchema?.list || [];
        setHouseList(list);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleAddHouse = async () => {
    const formIsValid = await trigger([
      "houseSchema.info.nhts",
      "houseSchema.info.address",
    ]);

    if (!formIsValid) {
      return;
    }

    const currentList = getValues("houseSchema.list") || [];
    const newHouse = {
      nhts: houseInfo.nhts,
      address: houseInfo.address,
    };

    setValue("houseSchema.list", [...currentList, newHouse]);
    resetField("houseSchema.info");
  };

  const handleRemoveHouse = (index: number) => {
    const currentList = getValues("houseSchema.list") || [];
    const updatedList = currentList.filter((_: any, idx: number) => idx !== index);
    setValue("houseSchema.list", updatedList);
    setHouseList(updatedList);
  };

  const handleContinue = () => {
    const hasHouse = houseList.length > 0;
    onNext(3, hasHouse);
  };

  const handleSkip = () => {
    setValue("houseSchema.list", []);
    setValue("houseSchema.info", {
      nhts: "",
      address: ""
    });
    onNext(3, false);
  };

  return (
    <ScrollView 
      className="flex-1" 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <View className="px-5">
        {/* Header Section */}
        <View className="mb-6">
          <View className="flex-row items-center mb-3">
            <View className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <HousePlus size={28} color="#2563EB" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-PoppinsSemiBold text-gray-900">Household Details</Text>
              <Text className="text-sm text-gray-600 font-PoppinsRegular">Housing information</Text>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <Text className="text-blue-900 font-PoppinsSemiBold mb-1">House Registration</Text>
          <Text className="text-sm text-blue-700 font-PoppinsRegular leading-5">
            Is this resident a house owner? If yes, please add the house information below to proceed.
          </Text>
        </View>

        {/* House Form Section */}
        <View className="border border-gray-200 rounded-xl p-5 mb-6 bg-white">
          <View className="mb-5 pb-3 border-b border-gray-100">
            <Text className="text-base font-PoppinsSemiBold text-gray-800">House Information</Text>
            <Text className="text-sm text-gray-600 font-PoppinsRegular">Fill all required fields</Text>
          </View>

          <View className="space-y-4">
            {/* NHTS Status */}
            <View>
              <FormSelect
                control={control}
                name="houseSchema.info.nhts"
                label="Select NHTS status"
                options={[
                  { label: "NO", value: "no" },
                  { label: "YES", value: "yes" },
                ]}
              />
              <Text className="text-xs text-gray-500 font-PoppinsRegular mt-1 ml-1">
                NHTS (National Household Targeting System)
              </Text>
            </View>

            {/* Address Selection */}
            <View>
              <FormSelect
                control={control}
                name="houseSchema.info.address"
                label="Select household address"
                options={formattedAddresses}
              />
              <Text className="text-xs text-gray-500 font-PoppinsRegular mt-1 ml-1">
                This reflects the addresses entered in the resident personal information.
              </Text>
            </View>
          </View>

          {/* Add Button */}
          <View className="mt-6">
            <TouchableOpacity
              onPress={handleAddHouse}
              className="bg-blue-600 rounded-xl py-3.5 flex-row items-center justify-center"
            >
              <Plus size={20} className="text-white mr-2" />
              <Text className="text-white font-PoppinsSemiBold text-base">Add Household</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* House List Section */}
        <View className="border border-gray-200 rounded-xl p-5 mb-6 bg-white">
          <View className="mb-4 pb-3 border-b border-gray-100">
            <Text className="text-base font-PoppinsSemiBold text-gray-800">Owned Houses</Text>
            <Text className="text-sm text-gray-600 font-PoppinsRegular">
              {houseList.length === 0 ? "No houses added yet" : `${houseList.length} house(s) registered`}
            </Text>
          </View>

          <View className="space-y-3">
            {houseList.length === 0 ? (
              <View className="py-12 items-center">
                <View className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <HousePlus size={32} color="#9CA3AF" />
                </View>
                <Text className="text-gray-400 text-sm font-PoppinsRegular">No houses added yet</Text>
                <Text className="text-gray-400 text-xs font-PoppinsRegular mt-1">Add a house using the form above</Text>
              </View>
            ) : (
              houseList.map((house: any, index: number) => {
                const sitio = house?.address.split("-")[1];
                const street = house?.address.split("-")[2];

                return (
                  <View
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text className="font-PoppinsSemiBold text-base text-gray-900 mb-1">
                          HOUSE {index + 1}
                        </Text>
                        <Text className="text-gray-700 font-PoppinsRegular text-sm leading-5">
                          SITIO {sitio}
                        </Text>
                        <Text className="text-gray-600 font-PoppinsRegular text-sm">
                          {street}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleRemoveHouse(index)} 
                        className="bg-red-50 p-2 rounded-lg ml-3"
                      >
                        <X size={18} className="text-red-500" />
                      </TouchableOpacity>
                    </View>
                    <View className="mt-2">
                      <View className={`self-start px-3 py-1.5 rounded-full ${house.nhts === "yes" ? "bg-green-100" : "bg-gray-200"}`}>
                        <Text className={`text-xs font-PoppinsSemiBold ${house.nhts === "yes" ? "text-green-700" : "text-gray-600"}`}>
                          {house.nhts === "yes" ? "NHTS Household" : "Not an NHTS Household"}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="space-y-3 mb-6">
          <SubmitButton
            handleSubmit={handleContinue}
            buttonLabel="Next"
          />
          
          <TouchableOpacity
            onPress={handleSkip}
            className="py-3.5 items-center bg-gray-100 rounded-xl"
          >
            <Text className="text-gray-700 font-PoppinsSemiBold">Skip for Now</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View className="pt-4 border-t border-gray-200">
          <Text className="text-center text-xs text-gray-500 font-PoppinsRegular leading-5">
            Need help? Contact your administrator or skip this step and register the household later.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

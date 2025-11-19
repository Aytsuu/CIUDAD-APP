import "@/global.css";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { FormSelect } from "@/components/ui/form/form-select";
import { SubmitButton } from "@/components/ui/button/submit-button";
import { Plus } from "@/lib/icons/Plus";
import { X } from "@/lib/icons/X";
import { HousePlus } from "lucide-react-native";
import { ResponsiveFormContainer, useResponsiveForm, FormContentWrapper } from "../../../../../../components/healthcomponents/ResponsiveFormContainer";

interface HouseholdFormProps {
  form: UseFormReturn<any>;
  onNext: (stepId: number, isComplete: boolean) => void;
}

export default function HouseholdForm({ form, onNext }: HouseholdFormProps) {
  const { control, trigger, watch, getValues, setValue, resetField } = form;
  const [houseList, setHouseList] = React.useState<any[]>([]);

  const {
    headingSize,
    bodyTextSize,
    smallTextSize,
    sectionMargin,
    cardPadding,
    iconSize,
    minButtonHeight,
    buttonPadding
  } = useResponsiveForm();

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
    <ResponsiveFormContainer>
      <FormContentWrapper>
        

        {/* Info Card */}
        <View 
          className="bg-blue-50 border border-blue-200 rounded-xl mb-6" 
          style={{ padding: cardPadding }}
        >
          <Text 
            className="text-blue-900 font-PoppinsSemiBold mb-1" 
            style={{ fontSize: headingSize }}
          >
            House Registration
          </Text>
          <Text 
            className="text-blue-700 font-PoppinsRegular leading-5" 
            style={{ fontSize: bodyTextSize }}
          >
            Is this resident a house owner? If yes, please add the house information below to proceed.
          </Text>
        </View>

        {/* House Form Section */}
        <View 
          className="border border-gray-200 rounded-xl mb-6 bg-white" 
          style={{ padding: cardPadding + 4 }}
        >
          <View className="mb-5 pb-3 border-b border-gray-100">
            <Text 
              className="text-gray-800 font-PoppinsSemiBold" 
              style={{ fontSize: headingSize }}
            >
              House Information
            </Text>
            <Text 
              className="text-gray-600 font-PoppinsRegular" 
              style={{ fontSize: bodyTextSize }}
            >
              Fill all required fields
            </Text>
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
              <Text 
                className="text-gray-500 font-PoppinsRegular mt-1 ml-1" 
                style={{ fontSize: smallTextSize }}
              >
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
              <Text 
                className="text-gray-500 font-PoppinsRegular mt-1 ml-1" 
                style={{ fontSize: smallTextSize }}
              >
                This reflects the addresses entered in the resident personal information.
              </Text>
            </View>
          </View>

          {/* Add Button */}
          <View className="mt-6">
            <TouchableOpacity
              onPress={handleAddHouse}
              className="bg-blue-600 rounded-xl flex-row items-center justify-center"
              style={{ paddingVertical: buttonPadding, minHeight: minButtonHeight }}
            >
              <Plus size={iconSize} className="text-white mr-2" />
              <Text 
                className="text-white font-PoppinsSemiBold" 
                style={{ fontSize: headingSize }}
              >
                Add Household
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* House List Section */}
        <View 
          className="border border-gray-200 rounded-xl mb-6 bg-white" 
          style={{ padding: cardPadding + 4 }}
        >
          <View className="mb-4 pb-3 border-b border-gray-100">
            <Text 
              className="text-gray-800 font-PoppinsSemiBold" 
              style={{ fontSize: headingSize }}
            >
              Owned Houses
            </Text>
            <Text 
              className="text-gray-600 font-PoppinsRegular" 
              style={{ fontSize: bodyTextSize }}
            >
              {houseList.length === 0 ? "No houses added yet" : `${houseList.length} house(s) registered`}
            </Text>
          </View>

          <View className="space-y-3">
            {houseList.length === 0 ? (
              <View className="py-12 items-center">
                <View className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <HousePlus size={32} color="#9CA3AF" />
                </View>
                <Text 
                  className="text-gray-400 font-PoppinsRegular" 
                  style={{ fontSize: bodyTextSize }}
                >
                  No houses added yet
                </Text>
                <Text 
                  className="text-gray-400 font-PoppinsRegular mt-1" 
                  style={{ fontSize: smallTextSize }}
                >
                  Add a house using the form above
                </Text>
              </View>
            ) : (
              houseList.map((house: any, index: number) => {
                const sitio = house?.address.split("-")[1];
                const street = house?.address.split("-")[2];

                return (
                  <View
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-xl"
                    style={{ padding: cardPadding }}
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <View className="flex-1">
                        <Text 
                          className="font-PoppinsSemiBold text-gray-900 mb-1" 
                          style={{ fontSize: headingSize }}
                        >
                          HOUSE {index + 1}
                        </Text>
                        <Text 
                          className="text-gray-700 font-PoppinsRegular leading-5" 
                          style={{ fontSize: bodyTextSize }}
                        >
                          SITIO {sitio}
                        </Text>
                        <Text 
                          className="text-gray-600 font-PoppinsRegular" 
                          style={{ fontSize: bodyTextSize }}
                        >
                          {street}
                        </Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleRemoveHouse(index)} 
                        className="bg-red-50 p-2 rounded-lg ml-3"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <X size={iconSize - 2} className="text-red-500" />
                      </TouchableOpacity>
                    </View>
                    <View className="mt-2">
                      <View className={`self-start px-3 py-1.5 rounded-full ${house.nhts === "yes" ? "bg-green-100" : "bg-gray-200"}`}>
                        <Text 
                          className={`font-PoppinsSemiBold ${house.nhts === "yes" ? "text-green-700" : "text-gray-600"}`}
                          style={{ fontSize: smallTextSize }}
                        >
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
        <View 
          style={{ 
            flexDirection: 'row',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            onPress={handleSkip}
            className="items-center bg-gray-100 rounded-xl"
            style={{ 
              flex: 1,
              paddingVertical: buttonPadding, 
              minHeight: minButtonHeight 
            }}
          >
            <Text 
              className="text-gray-700 font-PoppinsSemiBold" 
              style={{ fontSize: headingSize }}
            >
              Skip for Now
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContinue}
            className="items-center bg-blue-600 rounded-xl"
            style={{ 
              flex: 1,
              paddingVertical: buttonPadding, 
              minHeight: minButtonHeight 
            }}
          >
            <Text 
              className="text-white font-PoppinsSemiBold" 
              style={{ fontSize: headingSize }}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View className="pt-4 border-t border-gray-200">
          <Text 
            className="text-center text-gray-500 font-PoppinsRegular leading-5" 
            style={{ fontSize: smallTextSize }}
          >
            Need help? Contact your administrator or skip this step and register the household later.
          </Text>
        </View>
      </FormContentWrapper>
    </ResponsiveFormContainer>
  );
}

import "@/global.css";
import React, { useState } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "../_layout";
import SelectLayout from "@/components/ui/select/select-layout";
import RNDateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Calendar } from "@/lib/icons/Calendar";
import { useForm } from "@/app/(auth)/FormContext";

const civilStatusOptions = [
  { label: "Single", value: "single" },
  { label: "Married", value: "married" },
  { label: "Widowed", value: "widowed" },
];

export default function Father() {
  const router = useRouter();
  const { formData, setFormData } = useForm();
  const [showCalendar, setShowCalendar] = useState(false);

  const showDatepicker = () => setShowCalendar(true);

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setShowCalendar(false);
      setFormData({
        ...formData,
        fatherInformation: {
          ...formData.fatherInformation,
          dob: selectedDate.toISOString().split("T")[0],
        },
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      fatherInformation: {
        ...formData.fatherInformation,
        [field]: value,
      },
    });
  };

  const handleProceed = () => {
    alert(JSON.stringify(formData, null, 2));
    router.push("/dependents");
  };
  return (
    <Layout header={"Father Information"} description={"Optional Fields"}>
      <View className="flex-1 flex-col gap-3">
        <Input
          className="h-[57px] font-PoppinsRegular"
          placeholder="First Name"
          value={formData.fatherInformation.firstName}
          onChangeText={(text) => handleInputChange("firstName", text)}
        />
        <Input
          className="h-[57px] font-PoppinsRegular"
          placeholder="Last Name"
          value={formData.fatherInformation.lastName}
          onChangeText={(text) => handleInputChange("lastName", text)}
        />
        <Input
          className="h-[57px] font-PoppinsRegular"
          placeholder="Middle Name"
          value={formData.fatherInformation.middleName}
          onChangeText={(text) => handleInputChange("middleName", text)}
        />
        <Input
          className="h-[57px] font-PoppinsRegular"
          placeholder="Suffix (e.g., Jr, Sr)"
          value={formData.fatherInformation.suffix}
          onChangeText={(text) => handleInputChange("suffix", text)}
        />

        <View className="flex">
          <Text className="text-[16px] font-PoppinsRegular">Date of Birth</Text>
          <View className="flex relative">
            <Button
              onPress={showDatepicker}
              className="bg-white border border-gray-300 native:h-[57px] items-start"
            >
              <Text className="text-[16px]">
                {formData.fatherInformation.dob || "Select Date"}
              </Text>
            </Button>
            {showCalendar && (
              <RNDateTimePicker
                testID="datePicker"
                value={new Date(formData.fatherInformation.dob || "2000-01-01")}
                mode="date"
                is24Hour={true}
                onChange={onChange}
              />
            )}
            <View className="absolute right-5 top-1/2 transform -translate-y-1/2">
              <Calendar className="text-gray-700" />
            </View>
          </View>
        </View>

        <View>
          <SelectLayout
            className="min-w-[53%]"
            contentClassName="w-[48%]"
            options={civilStatusOptions}
            selected={
              civilStatusOptions.find(
                (opt) => opt.value === formData.fatherInformation.civilStatus
              ) || { value: "select", label: "Civil Status" }
            }
            onValueChange={(value) =>
              handleInputChange("civilStatus", value?.value || "")
            }
          />
        </View>
      </View>
      <View>
        <Button
          onPress={handleProceed}
          className="bg-primaryBlue native:h-[57px]"
        >
          <Text className="text-white font-PoppinsMedium text-[16px]">
            Next
          </Text>
        </Button>
      </View>
    </Layout>
  );
}

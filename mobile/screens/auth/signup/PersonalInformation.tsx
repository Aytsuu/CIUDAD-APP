import "@/global.css";

import React from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "./_layout";
import SelectLayout from "@/components/ui/select/select-layout";
import { Option } from "@rn-primitives/select";
import RNDateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Calendar } from "@/lib/icons/Calendar";
import { FormDataSchema } from "@/form-schema/registration-schema";
import { useForm } from "@/app/(auth)/FormContext";
import { z } from "zod";

const sexOptions: { label: string; value: string }[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

const civilStatusOptions: { label: string; value: string }[] = [
  { label: "Single", value: "single" },
  { label: "Married", value: "married" },
  { label: "Widowed", value: "widowed" },
];

export default function PersonalInformation() {
  const router = useRouter();

  const [showCalendar, setShowCalendar] = React.useState(false);
  const { formData, setFormData } = useForm();
  const [errors, setErrors] = React.useState<z.ZodError | null>(null);

  // Handlers for input fields
  const handleFirstNameChange = (value: string) => {
    setFormData({
      ...formData,
      personalInformation: {
        ...formData.personalInformation,
        firstName: value,
      },
    });
  };

  const handleLastNameChange = (value: string) => {
    setFormData({
      ...formData,
      personalInformation: {
        ...formData.personalInformation,
        lastName: value,
      },
    });
  };

  const handleMiddleNameChange = (value: string) => {
    setFormData({
      ...formData,
      personalInformation: {
        ...formData.personalInformation,
        middleName: value,
      },
    });
  };

  const handleSuffixChange = (value: string) => {
    setFormData({
      ...formData,
      personalInformation: {
        ...formData.personalInformation,
        suffix: value,
      },
    });
  };

  const handlePlaceOfBirthChange = (value: string) => {
    setFormData({
      ...formData,
      personalInformation: {
        ...formData.personalInformation,
        placeOfBrith: value,
      },
    });
  };

  const handleCitizenshipChange = (value: string) => {
    setFormData({
      ...formData,
      personalInformation: {
        ...formData.personalInformation,
        citizenship: value,
      },
    });
  };

  const handleReligionChange = (value: string) => {
    setFormData({
      ...formData,
      personalInformation: {
        ...formData.personalInformation,
        religion: value,
      },
    });
  };

  const handleAddressChange = (value: string) => {
    setFormData({
      ...formData,
      personalInformation: {
        ...formData.personalInformation,
        address: value,
      },
    });
  };

  const handleContactChange = (value: string) => {
    setFormData({
      ...formData,
      personalInformation: {
        ...formData.personalInformation,
        contactNo: value,
      },
    });
  };

  const handleOccupationChange = (value: string) => {
    setFormData({
      ...formData,
      personalInformation: {
        ...formData.personalInformation,
        occupation: value,
      },
    });
  };

  // Handle date picker changes
  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      setShowCalendar(false);
      setFormData({
        ...formData,
        personalInformation: {
          ...formData.personalInformation,
          dateOfResidency: selectedDate.toISOString(), // Store as ISO string
        },
      });
    }
  };

  // Handle form submission
  const handleProceed = () => {
    const validationResult = FormDataSchema.pick({
      personalInformation: true,
    }).safeParse(formData);

    if (validationResult.success) {
      setErrors(null);
      router.push("/mother-information");
    } else {
      setErrors(validationResult.error);
      alert("Please complete all required fields correctly!");
    }
  };

  // Helper function to get error message for a specific field
  const getErrorMessage = (field: string): string | null => {
    if (!errors) return null;
    const error = errors.errors.find((err) => err.path.includes(field));
    return error ? error.message : null;
  };

  return (
    <Layout
      header={"Personal Information"}
      description={"Please fill out all required fields."}
    >
      <View className="flex-1 justify-between gap-7">
        <View className="flex-1 flex-col gap-3">
          {/* First Name */}
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="First Name"
            value={formData.personalInformation.firstName || ""}
            onChangeText={handleFirstNameChange}
          />
          {getErrorMessage("personalInformation.firstName") && (
            <Text className="text-red-500 text-sm">
              {getErrorMessage("personalInformation.firstName")}
            </Text>
          )}

          {/* Last Name */}
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Last Name"
            value={formData.personalInformation.lastName || ""}
            onChangeText={handleLastNameChange}
          />
          {getErrorMessage("personalInformation.lastName") && (
            <Text className="text-red-500 text-sm">
              {getErrorMessage("personalInformation.lastName")}
            </Text>
          )}

          {/* Middle Name */}
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Middle Name"
            value={formData.personalInformation.middleName || ""}
            onChangeText={handleMiddleNameChange}
          />
          {getErrorMessage("personalInformation.middleName") && (
            <Text className="text-red-500 text-sm">
              {getErrorMessage("personalInformation.middleName")}
            </Text>
          )}

          {/* Suffix */}
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Suffix (e.g., Jr, Sr)"
            value={formData.personalInformation.suffix || ""}
            onChangeText={handleSuffixChange}
          />
          {getErrorMessage("personalInformation.suffix") && (
            <Text className="text-red-500 text-sm">
              {getErrorMessage("personalInformation.suffix")}
            </Text>
          )}

          {/* Sex and Civil Status */}
          <View className="flex-row justify-between">
            <SelectLayout
              className="min-w-[45%]"
              contentClassName="w-[41%]"
              options={sexOptions}
              selected={
                formData.personalInformation.sex
                  ? { label: formData.personalInformation.sex, value: formData.personalInformation.sex }
                  : { value: "select", label: "Sex" }
              }
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  personalInformation: {
                    ...formData.personalInformation,
                    sex: value?.value || "",
                  },
                })
              }
            />
            <SelectLayout
              className="min-w-[53%]"
              contentClassName="w-[48%]"
              options={civilStatusOptions}
              selected={
                formData.personalInformation.civilStatus
                  ? { label: formData.personalInformation.civilStatus, value: formData.personalInformation.civilStatus }
                  : { value: "select", label: "Civil Status" }
              }
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  personalInformation: {
                    ...formData.personalInformation,
                    civilStatus: value?.value || "",
                  },
                })
              }
            />
          </View>

          {/* Place of Birth */}
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Place of Birth"
            value={formData.personalInformation.placeOfBrith || ""}
            onChangeText={handlePlaceOfBirthChange}
          />
          {getErrorMessage("personalInformation.placeOfBirth") && (
            <Text className="text-red-500 text-sm">
              {getErrorMessage("personalInformation.placeOfBirth")}
            </Text>
          )}

          {/* Citizenship */}
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Citizenship"
            value={formData.personalInformation.citizenship || ""}
            onChangeText={handleCitizenshipChange}
          />
          {getErrorMessage("personalInformation.citizenship") && (
            <Text className="text-red-500 text-sm">
              {getErrorMessage("personalInformation.citizenship")}
            </Text>
          )}

          {/* Religion */}
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Religion"
            value={formData.personalInformation.religion || ""}
            onChangeText={handleReligionChange}
          />
          {getErrorMessage("personalInformation.religion") && (
            <Text className="text-red-500 text-sm">
              {getErrorMessage("personalInformation.religion")}
            </Text>
          )}

          {/* Address */}
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Address"
            value={formData.personalInformation.address || ""}
            onChangeText={handleAddressChange}
          />
          {getErrorMessage("personalInformation.address") && (
            <Text className="text-red-500 text-sm">
              {getErrorMessage("personalInformation.address")}
            </Text>
          )}

          {/* Contact No. */}
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Contact No."
            value={formData.personalInformation.contactNo || ""}
            onChangeText={handleContactChange}
          />
          {getErrorMessage("personalInformation.contactNo") && (
            <Text className="text-red-500 text-sm">
              {getErrorMessage("personalInformation.contactNo")}
            </Text>
          )}

          {/* Occupation */}
          <Input
            className="h-[57px] font-PoppinsRegular"
            placeholder="Occupation"
            value={formData.personalInformation.occupation || ""}
            onChangeText={handleOccupationChange}
          />
          {getErrorMessage("personalInformation.occupation") && (
            <Text className="text-red-500 text-sm">
              {getErrorMessage("personalInformation.occupation")}
            </Text>
          )}

          {/* Date of Residency */}
          <View className="flex">
            <Text className="text-[15px] font-PoppinsRegular">
              Date of Residency
            </Text>
            <View className="flex relative">
              <Button
                onPress={() => setShowCalendar(true)}
                className="bg-white border border-gray-300 native:h-[57px] items-start"
              >
                <Text className="text-[16px]">
                  {formData.personalInformation.dateOfResidency
                    ? new Date(formData.personalInformation.dateOfResidency).toLocaleDateString()
                    : "Select Date"}
                </Text>
              </Button>
              {showCalendar && (
                <RNDateTimePicker
                  testID="datePicker"
                  value={new Date(formData.personalInformation.dateOfResidency || new Date())}
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
          {getErrorMessage("personalInformation.dateOfResidency") && (
            <Text className="text-red-500 text-sm">
              {getErrorMessage("personalInformation.dateOfResidency")}
            </Text>
          )}
        </View>

        {/* Next Button */}
        <View className="pb-[3rem]">
          <Button
            onPress={handleProceed}
            className="bg-primaryBlue native:h-[57px] w-full"
          >
            <Text className="text-white font-PoppinsMedium text-[16px]">
              Next
            </Text>
          </Button>
        </View>
      </View>
    </Layout>
  );
}
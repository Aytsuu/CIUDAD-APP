import { Button } from "@/components/ui/button"
import { ConfirmationModal } from "@/components/ui/confirmationModal"
import { FormInput } from "@/components/ui/form/form-input"
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { X } from "@/lib/icons/X"
import PageLayout from "@/screens/_PageLayout"
import { useRouter } from "expo-router"
import { useState } from "react"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { useVerifyBusinessRespondent } from "../../queries/authPostQueries"
import { FormDateInput } from "@/components/ui/form/form-date-input"
import { capitalizeAllFields } from "@/helpers/capitalize";
import { UserSearch } from "@/lib/icons/UserSearch"
import { Ionicons } from "@expo/vector-icons"

export default function BusinessRespondent() {
  const router = useRouter()
  const { control, trigger, getValues, setValue, clearErrors} = useRegistrationFormContext()
  const { mutateAsync: verifyRespondent } = useVerifyBusinessRespondent();
  const [inputMethod, setInputMethod] = useState<"id" | "manual" | null>(null)

  const handleSubmit = async () => {
    if (inputMethod === "id") {
      if (await trigger("linkAccountSchema.id")) {
        const br_id = getValues('linkAccountSchema.id');
        verifyRespondent({
          br_id: br_id
        }, {
          onSuccess: () => {
            router.push({
            pathname: "/registration/business/account-registration",
            params: {
              br_id: br_id
            }
          });
          }
        })
      }
    } else if (inputMethod === "manual") {
      if (await trigger([
        "linkAccountSchema.lname",
        "linkAccountSchema.fname",
        "linkAccountSchema.dob",
        "linkAccountSchema.contact",
      ])) {
        const {id, ...personal_info} = getValues('linkAccountSchema')
        verifyRespondent({
          personal_info: capitalizeAllFields(personal_info)
        }, {
          onSuccess: (result) => {
            router.push({
            pathname: "/registration/business/account-registration",
            params: {
              br_id: result?.br_id
            }
          });
          }
        })
      }
    }
  }

  const handleClose = () => {
    router.replace("/(auth)")
  }

  const handleMethodSelect = (method: "id" | "manual") => {
    setInputMethod(method)
    // Clear other method's fields when switching
    if (method === "id") {
      setValue("linkAccountSchema.lname", "")
      setValue("linkAccountSchema.fname", "")
      setValue("linkAccountSchema.dob", "")
      setValue("linkAccountSchema.contact", "")
    } else {
      setValue("linkAccountSchema.id", "")
    }
  }

  const canSubmit = inputMethod !== null

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
      headerTitle={
        <Text className="text-gray-900 text-[13px]">
          Business Respondent
        </Text>
      }
      rightAction={
        <ConfirmationModal
          title="Exit Registration"
          description="Are you sure you want to exit? Your progress will be lost."
          trigger={
            <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
              <X size={20} className="text-gray-700" />
            </TouchableOpacity>
          }
          variant="destructive"
          onPress={handleClose}
        />
      }
    >
      <ScrollView className="flex-1"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5">
          {/* Header Section */}
          <View className="mb-6 border-b border-gray-100 pb-4">
            <View className="items-center">
              <View className="w-16 h-16 bg-blue-50 rounded-full items-center justify-center mb-4">
                <UserSearch size={32} className="text-primaryBlue" />
              </View>
            </View>
            <Text className="text-gray-600 text-sm font-PoppinsRegular text-center leading-6">
              Choose one of the options below to verify your business respondent information.
            </Text>
          </View>

          {/* Option Selection */}
          {inputMethod === null && (
            <View className="grid gap-4 mb-6">
              {/* Option 1: Respondent ID */}
              <TouchableOpacity
                onPress={() => handleMethodSelect("id")}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-900 text-base font-PoppinsSemiBold mb-1">I have my Respondent ID</Text>
                    <Text className="text-gray-600 text-sm font-PoppinsRegular">
                      Quick verification using your existing ID
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Option 2: Manual Entry */}
              <TouchableOpacity
                onPress={() => handleMethodSelect("manual")}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-gray-900 text-base font-PoppinsSemiBold mb-1">
                      I don't have my Respondent ID
                    </Text>
                    <Text className="text-gray-600 text-sm font-PoppinsRegular">
                      Enter your personal details manually
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}
          

          {/* Respondent ID Form */}
          {inputMethod === "id" && (
            <View className="mb-6">
              <View className="flex-row items-center justify-end mb-4">
                <TouchableOpacity onPress={() => {
                  clearErrors('linkAccountSchema');
                  setInputMethod(null);
                }} className="px-3 py-1 bg-gray-100 rounded-full">
                  <Text className="text-gray-600 text-xs font-PoppinsRegular">Change</Text>
                </TouchableOpacity>
              </View>

              <FormInput
                control={control}
                name="linkAccountSchema.id"
                label="Respondent ID"
                placeholder="Enter your respondent ID"
                keyboardType="phone-pad"
              />

              <View className="bg-blue-50 rounded-xl p-4 mb-8">
                <View className="flex-row items-start gap-3">
                  <View className="w-6 h-6 items-center justify-center mt-0.5">
                    <Ionicons name="information-circle" size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-PoppinsMedium text-blue-900 mb-1">
                      Don't know your respondent ID?
                    </Text>
                    <Text className="text-xs font-PoppinsRegular text-blue-700 leading-4">
                      Go to the barangay office to obtain your respondent ID.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Manual Entry Form */}
          {inputMethod === "manual" && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-900 text-base font-PoppinsSemiBold">Personal Information</Text>
                <TouchableOpacity onPress={() => {
                  clearErrors('linkAccountSchema');
                  setInputMethod(null);
                }} className="px-3 py-1 bg-gray-100 rounded-full">
                  <Text className="text-gray-600 text-xs font-PoppinsRegular">Change</Text>
                </TouchableOpacity>
              </View>

              <View className="space-y-4">
                <FormInput
                  control={control}
                  name="linkAccountSchema.lname"
                  label="Last Name"
                  placeholder="Enter your last name"
                />
                <FormInput
                  control={control}
                  name="linkAccountSchema.fname"
                  label="First Name"
                  placeholder="Enter your first name"
                />
                <FormDateInput 
                  control={control}
                  name="linkAccountSchema.dob"
                  label="Date of Birth"
                />
                <FormInput
                  control={control}
                  name="linkAccountSchema.contact"
                  label="Contact Number"
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View className="mt-4 p-3 bg-amber-50 rounded-lg">
                <Text className="text-amber-800 text-xs font-PoppinsRegular">
                  Please ensure all information matches your official records exactly.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      {/* Bottom Action Section */}
        {canSubmit && <View className="p-5 bg-white border-t border-gray-100 mt-auto">
          <Button
            onPress={handleSubmit}
            className={`native:h-[56px] w-full rounded-xl shadow-lg bg-primaryBlue`}
          >
            <Text className={`font-PoppinsSemiBold text-[16px] text-white`}>
              Continue
            </Text>
          </Button>

          <Text className="text-center text-xs text-gray-500 font-PoppinsRegular mt-3 leading-4">
            By continuing, you confirm that the information provided is accurate and matches your official records.
          </Text>
        </View>}
    </PageLayout>
  )
}

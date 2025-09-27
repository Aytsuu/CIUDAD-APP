import "@/global.css"
import React from "react"
import { View, Text, ScrollView, TouchableOpacity, Modal, Animated, Dimensions } from "react-native"
import { useRouter } from "expo-router"
import { Button } from "@/components/ui/button"
import _ScreenLayout from "@/screens/_ScreenLayout"
import { FormInput } from "@/components/ui/form/form-input"
import { useRegistrationFormContext } from "@/contexts/RegistrationFormContext"
import { FormSelect } from "@/components/ui/form/form-select"
import { X } from "@/lib/icons/X"
import { Plus } from "@/lib/icons/Plus"
import { AddressDrawer } from "./AddressDrawer"
import { FormDateInput } from "@/components/ui/form/form-date-input"
import { useToastContext } from "@/components/ui/toast"
import { SubmitButton } from "@/components/ui/button/submit-button"


const sexOptions: { label: string; value: string }[] = [
  { label: "MALE", value: "MALE" },
  { label: "FEMALE", value: "FEMALE" },
];

const civilStatusOptions: { label: string; value: string }[] = [
  { label: "SINGLE", value: "SINGLE" },
  { label: "MARRIED", value: "MARRIED" },
  { label: "WIDOWED", value: "WIDOWED" },
];

const religionOptions: { label: string; value: string }[] = [
  { label: "ROMAN CATHOLIC", value: "ROMAN CATHOLIC" },
  { label: "MUSLIM", value: "MUSLIM" },
  { label: "IGLESIA NI CRISTO", value: "IGLESIA NI CRISTO" },
  { label: "BORN AGAIN", value: "BORN AGAIN" },
];

const edAttainmentOptions: { label: string; value: string }[] = [
  { label: "NO FORMAL EDUCATION", value: "NO FORMAL EDUCATION" },
  { label: "ELEMENTARY", value: "ELEMENTARY" },
  { label: "HIGH SCHOOL", value: "HIGH SCHOOL" },
  { label: "VOCATIONAL / TECHNICAL", value: "VOCATIONAL / TECHNICAL" },
  { label: "COLLEGE LEVEL", value: "COLLEGE LEVEL" },
  { label: "BACHELOR'S DEGREE", value: "BACHELOR'S DEGREE" },
  { label: "MASTER'S DEGREE", value: "MASTER'S DEGREE" },
  { label: "DOCTORATE DEGREE", value: "DOCTORATE DEGREE" },
];

const pwdOptions: { label: string; value: string }[] = [
  { label: "VISUAL DISABILITY", value: "VISUAL DISABILITY" },
  { label: "HEARING DISABILITY", value: "HEARING DISABILITY" },
  { label: "SPEECH IMPAIRMENT", value: "SPEECH IMPAIRMENT" },
  { label: "LEARNING DISABILITY", value: "LEARNING DISABILITY" },
  { label: "INTELLECTUAL DISABILITY", value: "INTELLECTUAL DISABILITY" },
  { label: "MENTAL DISABILITY", value: "MENTAL DISABILITY" },
  { label: "PSYCHOSOCIAL DISABILITY", value: "PSYCHOSOCIAL DISABILITY" },
  { label: "PHYSICAL DISABILITY", value: "PHYSICAL DISABILITY" },
  { label: "CANCER", value: "CANCER" },
  { label: "RARE DISEASE", value: "RARE DISEASE" },
  { label: "MULTIPLE DISABILITIES", value: "MULTIPLE DISABILITIES" },
];

const PersonalInformation = React.memo(({ params } : {params: Record<string, any>}) => {
  const router = useRouter();
  const { toast } = useToastContext()
  const { control, trigger, watch, getValues, setValue,  reset } = useRegistrationFormContext();
  const [showAddressDrawer, setShowAddressDrawer] = React.useState(false);
  const [addresses, setAddresses] = React.useState<any[]>([]);
  const [addressError, setAddressesError] = React.useState<boolean>(false);

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'personalInfoSchema.per_addresses.list') {
        const addList = value.personalInfoSchema?.per_addresses?.list;
        if (addList) {
          setAddresses(addList);
          setAddressesError(false);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  React.useEffect(() => {
    const addList = getValues('personalInfoSchema.per_addresses.list')
    setValue(`${params?.name}.per_addresses.list` as any, addList)
    setAddresses(addList)
  }, [])

  const handleSubmit = async () => {

    const formIsValid = await trigger([
      `${params.name}.per_fname`,
      `${params.name}.per_lname`,
      `${params.name}.per_mname`,
      `${params.name}.per_suffix`,
      `${params.name}.per_dob`,
      `${params.name}.per_sex`,
      `${params.name}.per_status`,
      `${params.name}.per_religion`,
      `${params.name}.per_edAttainment`,
      `${params.name}.per_contact`,
      `${params.name}.per_disability`,
    ] as any)

    if (!formIsValid) {
      addresses.length === 0 && setAddressesError(true);
      toast.error("Please fill out all required fields.")
      return;
    }

    // if(addresses.length === 0) {
    //   setAddressesError(true);
    //   return;
    // }
    
    params?.submit();
  }

  return (
    <View className="flex-1 px-5">
      {/* Full Name Section */}
      <View className="mb-8">
        <View className="w-full mb-4 pb-2 border-b border-gray-200">
          <Text className="text-lg font-PoppinsSemiBold text-gray-800">Full Name</Text>
          <Text className="text-sm text-gray-600 font-PoppinsRegular">Enter your complete legal name</Text>
        </View>

        <View className="space-y-4">
          <View className="grid space-x-3">
            <View className="flex-1">
              <FormInput control={control} label="First Name" name={`${params.name}.per_fname`} upper={true}/>
            </View>
            <View className="flex-1">
              <FormInput control={control} label="Last Name" name={`${params.name}.per_lname`} upper={true}/>
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1">
              <FormInput control={control} label="Middle Name" name={`${params.name}.per_mname`} upper={true}/>
            </View>
            <View className="w-24">
              <FormInput control={control} label="Suffix" name={`${params.name}.per_suffix`} placeholder="Jr, Sr" upper={true}/>
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
          <FormDateInput control={control} name={`${params.name}.per_dob`} label="Date of Birth"/>
          <FormSelect control={control} name={`${params.name}.per_sex`} options={sexOptions} label="Sex"/>
          <FormSelect control={control} name={`${params.name}.per_status`} options={civilStatusOptions} label="Marital Status"/>
          <FormSelect control={control} label="Religion" name={`${params.name}.per_religion`} options={religionOptions}/>
          <FormSelect control={control} label="Disability (if applicable)" name={`${params.name}.per_disability`} options={pwdOptions}/>
        </View>
      </View>

      {/* Education & Professional Section */}
      <View className="mb-8">
        <View className="mb-4 pb-2 border-b border-gray-200">
          <Text className="text-lg font-PoppinsSemiBold text-gray-800">Education</Text>
          <Text className="text-sm text-gray-600 font-PoppinsRegular">Educational and professional background</Text>
        </View>

        <View className="space-y-4">
          <FormSelect control={control} label="Attainment" name={`${params.name}.per_edAttainment`} options={edAttainmentOptions}/>
        </View>
      </View>

      {/* Contact Information Section */}
      <View className="mb-8">
        <View className="mb-4 pb-2 border-b border-gray-200">
          <Text className="text-lg font-PoppinsSemiBold text-gray-800">Contact Information</Text>
          <Text className="text-sm text-gray-600 font-PoppinsRegular">How we can reach you</Text>
        </View>

        <FormInput control={control} label="Contact Number" name={`${params.name}.per_contact`} keyboardType="phone-pad" />

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

      <View className="pt-4 pb-8 bg-white border-t border-gray-100">
        <SubmitButton
            handleSubmit={handleSubmit}
            buttonLabel="Save and Continue"
        />

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
    </View>
  )
  })

  export default PersonalInformation;
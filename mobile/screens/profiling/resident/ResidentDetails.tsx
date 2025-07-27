import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
import { ChevronLeft } from "@/lib/icons/ChevronLeft"
import { useRouter, useLocalSearchParams } from "expo-router"
import React from "react"
import { Card } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { UserRound } from "@/lib/icons/UserRound"
import { Home } from "@/lib/icons/Home"
import { Calendar } from "@/lib/icons/Calendar"
import { MapPin } from "@/lib/icons/MapPin"
import { Phone } from "@/lib/icons/Phone"
import { UsersRound } from "@/lib/icons/UsersRound"
import PageLayout from "../../_PageLayout"
import { useGetFamilyMembers, useGetPersonalInfo } from "../queries/profilingGetQueries"
import { capitalize } from "@/helpers/capitalize"

export default function ResidentDetails() {
  const router = useRouter()
  const params = useLocalSearchParams()

  // Parse the resident data from params
  const resident = React.useMemo(() => {
    try {
      return JSON.parse(params.resident as string)
    } catch (error) {
      console.error("Error parsing resident data:", error)
      return null
    }
  }, [params.resident])

  const { data: personalInfo, isLoading: loadingPersonalInfo } = useGetPersonalInfo(resident?.rp_id)
  const { data: familyMembers, isLoading: loadingFam } = useGetFamilyMembers(resident?.family_no)

  const members = familyMembers?.results || []
  const totalCount = familyMembers?.count || 0

  React.useEffect(() => {
    if (!resident) {
      Alert.alert("Error", "Resident data not found", 
        [{ text: "OK", onPress: () => router.back() }])
    }
  }, [resident])

  const fullName = `${resident?.fname} ${resident?.mname ? resident.mname + " " : ""}${resident?.lname}`

  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any
    label: string
    value: string | number
  }) => (
    <View className="flex-row items-center py-3 border-t border-gray-100">
      <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
        <Icon size={18} className="text-gray-600" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-sm">{label}</Text>
        <Text className="text-gray-900 text-base font-medium">{value}</Text>
      </View>
    </View>
  )

  const FamilyMemberCard = ({ member }: { member: any }) => (
    <View className="bg-gray-50 rounded-lg p-4 mb-3">
      <View className="flex-row items-center mb-2">
        <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
          <Text className="text-blue-600 font-bold text-lg">
            {member.name?.split(",")[0]?.charAt(0)?.toUpperCase() || "N"}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-semibold text-base">{member.name}</Text>
          <Text className="text-blue-600 text-sm font-medium">{member.fc_role}</Text>
        </View>
      </View>
      <View className="ml-15">
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500 text-sm">ID:</Text>
          <Text className="text-gray-700 text-sm">{member.rp_id}</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500 text-sm">Gender:</Text>
          <Text className="text-gray-700 text-sm">{member.sex}</Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-gray-500 text-sm">Status:</Text>
          <Text className="text-gray-700 text-sm">{member.status}</Text>
        </View>
        {member.dob && (
          <View className="flex-row justify-between">
            <Text className="text-gray-500 text-sm">Birth Date:</Text>
            <Text className="text-gray-700 text-sm">{member.dob}</Text>
          </View>
        )}
      </View>
    </View>
  )

  const formatAddress = (address: any) => {
    const parts = [
      address.add_street,
      address.sitio ? "Sitio " + capitalize(address.sitio) : "",
      "Sitio " + address.add_external_sitio,
      address.add_barangay,
      address.add_city,
      address.add_province,
    ].filter((part) => part && part.trim() !== "")

    return parts.join(", ")
  }

  const AddressCard = ({ address, index }: { address: any; index: number }) => (
    <View className="bg-gray-50 rounded-lg p-3 mb-2">
      <View className="flex-row items-start">
        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3 mt-1">
          <MapPin size={14} className="text-blue-600" />
        </View>
        <View className="flex-1">
          <Text className="text-gray-500 text-xs mb-1">Address {index + 1}</Text>
          <Text className="text-gray-900 text-sm font-medium leading-5">{formatAddress(address)}</Text>
        </View>
      </View>
    </View>
  )

  if (!resident) {
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
        headerTitle={<Text className="text-gray-900 text-[13px]">Resident Details</Text>}
      >
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-2">Loading...</Text>
        </View>
      </PageLayout>
    )
  }

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
      headerTitle={<Text className="text-gray-900 text-[13px]">Resident Details</Text>}
      rightAction={<View className="w-10 h-10" />}
    >
      <ScrollView className="flex-1" 
        overScrollMode="never"
        showsHorizontalScrollIndicator={false} 
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="mx-5 mb-4">
          <View className="items-center">
            <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Text className="text-blue-600 font-bold text-3xl">{resident.fname?.charAt(0).toUpperCase()}</Text>
            </View>
            <Text className="text-gray-500 text-sm text-center mb-2">Full Name</Text>
            <Text className="text-gray-900 font-bold text-xl text-center mb-2">{fullName}</Text>
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-600 font-medium text-sm">ID: {resident.rp_id}</Text>
            </View>
          </View>
        </View>

        {/* Basic Information */}
        {loadingPersonalInfo ? (
          <Card className="mx-5 mt-4 p-4">
            <Text className="text-gray-900 font-semibold text-lg mb-4">Basic Information</Text>
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-gray-500 text-sm mt-2">Loading basic information...</Text>
            </View>
          </Card>
        ) : (
          <Card className="mx-5 mt-4 p-4">
            <Text className="text-gray-900 font-semibold text-lg mb-4">Basic Information</Text>
            <InfoRow icon={Calendar} label="Age" value={`${personalInfo?.per_age || "N/A"} years old`} />
            <InfoRow icon={UserRound} label="Gender" value={personalInfo?.per_sex || "N/A"} />
            {personalInfo?.per_status && (
              <InfoRow icon={UserRound} label="Civil Status" value={personalInfo.per_status} />
            )}
            {personalInfo?.per_dob && <InfoRow icon={Calendar} label="Birth Date" value={personalInfo.per_dob} />}
          </Card>
        )}

        {/* Contact Information */}
        {(personalInfo?.per_contact || (personalInfo?.per_addresses && personalInfo.per_addresses.length > 0)) && (
          <Card className="mx-5 mt-4 p-4">
            <Text className="text-gray-900 font-semibold text-lg mb-4">Contact Information</Text>
            {personalInfo.per_contact && <InfoRow icon={Phone} label="Phone Number" value={personalInfo.per_contact} />}
            {personalInfo?.per_addresses && personalInfo.per_addresses.length > 0 && (
              <View className={personalInfo.per_contact ? "border-t border-gray-100 pt-3" : ""}>
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-500 text-sm">
                    {personalInfo.per_addresses.length === 1 ? "Address" : "Addresses"}
                  </Text>
                  {personalInfo.per_addresses.length > 1 && (
                    <View className="bg-gray-100 px-2 py-1 rounded-full">
                      <Text className="text-gray-600 text-xs font-medium">
                        {personalInfo.per_addresses.length} addresses
                      </Text>
                    </View>
                  )}
                </View>
                {personalInfo.per_addresses.map((address: any, index: number) => (
                  <AddressCard key={address.add_id || index} address={address} index={index} />
                ))}
              </View>
            )}
          </Card>
        )}

        {/* Additional Information */}
        <Card className="mx-5 mt-4 p-4">
          <Text className="text-gray-900 font-semibold text-lg mb-4">Additional Information</Text>
          {resident.family_no && <InfoRow icon={UsersRound} label="Family ID" value={resident.family_no} />}
          {resident.household_no && <InfoRow icon={Home} label="Household ID" value={resident.household_no} />}
          {resident.rp_date_registered && (
            <InfoRow icon={Calendar} label="Date Registered" value={resident.rp_date_registered} />
          )}
        </Card>

        {/* Family Members with Accordion */}
        {members.length > 0 &&  (<View className="px-5 mt-4 mb-6">
          <Accordion type="single" className="border-0">
            <AccordionItem value="family-members" className="border-0">
              <AccordionTrigger className="px-2 py-4">
                <View className="flex-row justify-between items-center flex-1">
                  <Text className="text-gray-900 font-semibold text-lg">Family Members</Text>
                  {!loadingFam && totalCount > 0 && (
                    <View className="bg-blue-100 px-2 py-1 rounded-full mr-4">
                      <Text className="text-blue-600 text-xs font-medium">
                        {totalCount} member{totalCount !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  )}
                </View>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-4">
                {loadingFam ? (
                  <View className="items-center py-8">
                    <ActivityIndicator size="small" color="#3B82F6" />
                    <Text className="text-gray-500 text-sm mt-2">Loading family members...</Text>
                  </View>
                ) : members.length > 0 ? (
                  <ScrollView className="max-h-96" 
                    showsVerticalScrollIndicator={false} 
                    overScrollMode="never"
                    nestedScrollEnabled={true}
                  >
                    {members.map((member: any, index: number) => (
                      <FamilyMemberCard key={member.rp_id || index} member={member} />
                    ))}
                  </ScrollView>
                ) : (
                  <View className="items-center py-8">
                    <UsersRound size={48} className="text-gray-300 mb-2" />
                    <Text className="text-gray-500 text-sm">No family members found</Text>
                  </View>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </View>)}
      </ScrollView>
    </PageLayout>
  )
}
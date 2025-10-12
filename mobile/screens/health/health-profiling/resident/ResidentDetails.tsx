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
import PageLayout from "@/screens/_PageLayout"
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

  const { data: personalInfo, isLoading: loadingPersonalInfo } = useGetPersonalInfo(resident?.rp_id, resident?.per_id)
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
    <View className="flex-row items-center py-4 border-b border-gray-50">
      <View className="w-11 h-11 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl items-center justify-center mr-4 shadow-sm">
        <Icon size={20} className="text-blue-600" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-500 text-xs font-medium mb-1 uppercase tracking-wide">{label}</Text>
        <Text className="text-gray-900 text-base font-semibold">{value}</Text>
      </View>
    </View>
  )

  const FamilyMemberCard = ({ member }: { member: any }) => (
    <View className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm">
      <View className="flex-row items-center mb-3">
        <View className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full items-center justify-center mr-4 shadow-md">
          <Text className="text-white font-bold text-xl">
            {member.name?.split(",")[0]?.charAt(0)?.toUpperCase() || "N"}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 font-bold text-base mb-1">{member.name}</Text>
          <View className="bg-blue-50 px-3 py-1 rounded-full self-start">
            <Text className="text-blue-600 text-xs font-semibold">{member.fc_role}</Text>
          </View>
        </View>
      </View>
      <View className="ml-0 bg-gray-50 rounded-lg p-3">
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-500 text-sm font-medium">ID:</Text>
          <Text className="text-gray-900 text-sm font-semibold">{member.rp_id}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-500 text-sm font-medium">Gender:</Text>
          <Text className="text-gray-900 text-sm font-semibold">{member.sex}</Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-gray-500 text-sm font-medium">Status:</Text>
          <Text className="text-gray-900 text-sm font-semibold">{member.status}</Text>
        </View>
        {member.dob && (
          <View className="flex-row justify-between">
            <Text className="text-gray-500 text-sm font-medium">Birth Date:</Text>
            <Text className="text-gray-900 text-sm font-semibold">{member.dob}</Text>
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
    <View className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-3 border border-gray-200">
      <View className="flex-row items-start">
        <View className="w-10 h-10 bg-blue-500 rounded-lg items-center justify-center mr-3 mt-1 shadow-sm">
          <MapPin size={18} className="text-white" />
        </View>
        <View className="flex-1">
          <Text className="text-blue-600 text-xs font-bold mb-2 uppercase tracking-wide">Address {index + 1}</Text>
          <Text className="text-gray-900 text-sm font-medium leading-6">{formatAddress(address)}</Text>
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
        <View className="mx-5 mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg">
          <View className="items-center">
            <View className="w-28 h-28 bg-white rounded-full items-center justify-center mb-4 shadow-xl border-4 border-blue-200">
              <Text className="text-blue-600 font-bold text-4xl">{resident.fname?.charAt(0).toUpperCase()}</Text>
            </View>
            <Text className="text-blue-100 text-xs font-semibold text-center mb-2 uppercase tracking-widest">Full Name</Text>
            <Text className="text-white font-bold text-2xl text-center mb-3">{fullName}</Text>
            <View className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
              <Text className="text-white font-semibold text-sm">ID: {resident.rp_id}</Text>
            </View>
          </View>
        </View>

        {/* Basic Information */}
        {loadingPersonalInfo ? (
          <Card className="mx-5 mt-4 p-5 shadow-md rounded-xl">
            <Text className="text-gray-900 font-bold text-xl mb-4">Basic Information</Text>
            <View className="items-center py-8">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-gray-500 text-sm mt-2">Loading basic information...</Text>
            </View>
          </Card>
        ) : (
          <Card className="mx-5 mt-4 p-5 shadow-md rounded-xl bg-white">
            <View className="flex-row items-center mb-4">
              <View className="w-1 h-6 bg-blue-500 rounded-full mr-3" />
              <Text className="text-gray-900 font-bold text-xl">Basic Information</Text>
            </View>
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
          <Card className="mx-5 mt-4 p-5 shadow-md rounded-xl bg-white">
            <View className="flex-row items-center mb-4">
              <View className="w-1 h-6 bg-green-500 rounded-full mr-3" />
              <Text className="text-gray-900 font-bold text-xl">Contact Information</Text>
            </View>
            {personalInfo.per_contact && <InfoRow icon={Phone} label="Phone Number" value={personalInfo.per_contact} />}
            {personalInfo?.per_addresses && personalInfo.per_addresses.length > 0 && (
              <View className={personalInfo.per_contact ? "pt-4" : ""}>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-gray-700 text-sm font-bold uppercase tracking-wide">
                    {personalInfo.per_addresses.length === 1 ? "Address" : "Addresses"}
                  </Text>
                  {personalInfo.per_addresses.length > 1 && (
                    <View className="bg-blue-500 px-3 py-1 rounded-full shadow-sm">
                      <Text className="text-white text-xs font-bold">
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
        <Card className="mx-5 mt-4 p-5 shadow-md rounded-xl bg-white">
          <View className="flex-row items-center mb-4">
            <View className="w-1 h-6 bg-purple-500 rounded-full mr-3" />
            <Text className="text-gray-900 font-bold text-xl">Additional Information</Text>
          </View>
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
              <AccordionTrigger className="px-4 py-5 bg-white rounded-xl shadow-md">
                <View className="flex-row justify-between items-center flex-1">
                  <View className="flex-row items-center">
                    <View className="w-1 h-6 bg-orange-500 rounded-full mr-3" />
                    <Text className="text-gray-900 font-bold text-xl">Family Members</Text>
                  </View>
                  {!loadingFam && totalCount > 0 && (
                    <View className="bg-orange-500 px-3 py-1 rounded-full mr-4 shadow-sm">
                      <Text className="text-white text-xs font-bold">
                        {totalCount} member{totalCount !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  )}
                </View>
              </AccordionTrigger>
              <AccordionContent className="px-2 pb-4 pt-4">
                {loadingFam ? (
                  <View className="items-center py-8 bg-white rounded-xl">
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
                  <View className="items-center py-12 bg-white rounded-xl">
                    <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                      <UsersRound size={40} className="text-gray-300" />
                    </View>
                    <Text className="text-gray-500 text-base font-medium">No family members found</Text>
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
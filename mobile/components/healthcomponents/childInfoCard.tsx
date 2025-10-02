import type React from "react"
import { View, Text } from "react-native"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, HeartPulse, Baby, Home, Milk, MapPin as Location, UserRound } from "lucide-react-native"




const formatFullName = (child: any | null) => {
  if (!child) return "Not provided"
  return `${child.lname}, ${child.fname} ${child.mname ? child.mname : ""}`.trim() || "Not provided"
}

const formatDateOfBirth = (dob?: string) => {
  if (!dob) return "Not provided"
  try {
    return new Date(dob).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
  } catch {
    return "Invalid date"
  }
}

const getSexColor = (sex: string | undefined | null) => {
  if (!sex || typeof sex !== "string" || sex.trim() === "") {
    return "text-gray-600"
  }

  const lowerSex = sex.toLowerCase().trim()
  return lowerSex === "male" ? "text-blue-600" : "text-pink-600"
}

const getSexDisplayText = (sex: string | undefined | null) => {
  if (!sex || typeof sex !== "string" || sex.trim() === "") {
    return "Not specified"
  }
  return sex.trim()
}

const getAgeDisplayText = (age: string | undefined | null) => {
  if (!age || typeof age !== "string" || age.trim() === "") {
    return "Age not specified"
  }
  return `${age.trim()}y`
}

const getBirthOrderDisplay = (birthOrder: string | undefined | null) => {
  if (!birthOrder || typeof birthOrder !== "string" || birthOrder.trim() === "") {
    return null
  }
  return `${birthOrder.trim()} Born`
}

const getPatientIdDisplay = (patId: string | undefined | null) => {
  if (!patId || typeof patId !== "string" || patId.trim() === "") {
    return "ID: Not provided"
  }
  return `ID: ${patId.trim()}`
}

const getFeedingTypeDisplay = (feedingType: string | undefined | null) => {
  if (!feedingType || typeof feedingType !== "string" || feedingType.trim() === "") {
    return null
  }
  return feedingType.trim()
}

const getAddressDisplay = (address: string | undefined | null) => {
  if (!address || typeof address !== "string" || address.trim() === "") {
    return "No address provided"
  }
  return address.trim()
}

const getLandmarksDisplay = (landmarks: string | undefined | null) => {
  if (!landmarks || typeof landmarks !== "string" || landmarks.trim() === "") {
    return null
  }
  return landmarks.trim()
}

const formatParentName = (fname?: string, mname?: string, lname?: string, fallback = "Not provided") => {
  const name = `${lname || ""}, ${fname || ""} ${mname ? mname : ""}`.trim()
  return name.replace(/^,\s*/, "") || fallback
}

const getOccupationDisplay = (occupation: string | undefined | null) => {
  if (!occupation || typeof occupation !== "string" || occupation.trim() === "") {
    return null
  }
  return occupation.trim()
}

const getParentAgeDisplay = (age: string | undefined | null) => {
  if (!age || typeof age !== "string" || age.trim() === "") {
    return null
  }
  return `${age.trim()}y`
}

const getMedicalDetailDisplay = (detail: string | undefined | null) => {
  if (!detail || typeof detail !== "string" || detail.trim() === "") {
    return null
  }
  return detail.trim()
}

const EmptyChildState = () => (
  <Card className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl">
    <CardContent className="py-8 items-center">
      <Baby size={40} className="text-gray-300 mb-3" />
      <Text className="text-base font-semibold text-gray-600 mb-1">No Child Selected</Text>
      <Text className="text-sm text-gray-500 text-center">Select a child to view their information</Text>
    </CardContent>
  </Card>
)

export const ChildHealthRecordCard: React.FC<any> = ({ child }) => {
  if (!child) return <EmptyChildState />

  const fullName = formatFullName(child)
  const dob = formatDateOfBirth(child.dob)
  const motherName = formatParentName(child.mother_fname, child.mother_mname, child.mother_lname, "Mother not provided")
  const fatherName = formatParentName(child.father_fname, child.father_mname, child.father_lname, "Father not provided")

  const sexDisplay = getSexDisplayText(child.sex)
  const ageDisplay = getAgeDisplayText(child.age)
  const birthOrder = getBirthOrderDisplay(child.birth_order)
  const patientId = getPatientIdDisplay(child.pat_id)
  const feedingType = getFeedingTypeDisplay(child.type_of_feeding)
  const address = getAddressDisplay(child.address)
  const landmarks = getLandmarksDisplay(child.landmarks)
  const motherOccupation = getOccupationDisplay(child.mother_occupation)
  const fatherOccupation = getOccupationDisplay(child.father_occupation)
  // const motherAge = getParentAgeDisplay(child.mother_age)
  // const fatherAge = getParentAgeDisplay(child.father_age)
  const deliveryType = getMedicalDetailDisplay(child.delivery_type)
  const birthLocation = getMedicalDetailDisplay(child.pod_location)
  const ttStatus = getMedicalDetailDisplay(child.tt_status)

  const hasMedicalDetails = deliveryType || birthLocation || ttStatus

  return (
    <View className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Compact Header - Following PatientInfoCard pattern */}
      <View className="bg-blue-600 p-3">
        <View className="flex-row items-center">
          {/* Small Avatar */}
          <View className="w-10 h-10 bg-white/20 rounded-lg items-center justify-center mr-3 border border-white/30">
            <Baby color="white" size={20} />
          </View>

          {/* Name and Basic Info */}
          <View className="flex-1">
            <Text className="font-semibold text-white text-base" numberOfLines={1}>
              {fullName}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Text className="text-blue-100 text-xs">{patientId}</Text>
              <View className="w-1 h-1 bg-blue-200 rounded-full mx-2" />
              <Text className="text-blue-100 text-xs">
                {ageDisplay}, {sexDisplay}
              </Text>
              {birthOrder && (
                <>
                  <View className="w-1 h-1 bg-blue-200 rounded-full mx-2" />
                  <Text className="text-blue-100 text-xs">{birthOrder}</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* Compact Content */}
      <View className="p-3">
        {/* Essential Info Grid */}
        <View className="space-y-2">
          {/* Date of Birth */}
          <View className="flex-row items-center">
            <View className="w-6 h-6 bg-blue-50 rounded-md items-center justify-center mr-2">
              <Calendar size={12} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Date of Birth</Text>
              <Text className="text-sm font-medium text-gray-900">{dob}</Text>
            </View>
          </View>

          {/* Feeding Type */}
          {feedingType && (
            <View className="flex-row items-center">
              <View className="w-6 h-6 bg-green-50 rounded-md items-center justify-center mr-2">
                <Milk size={12} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500">Feeding Type</Text>
                <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                  {feedingType}
                </Text>
              </View>
            </View>
          )}

          {/* Address */}
          <View className="flex-row items-start">
            <View className="w-6 h-6 bg-orange-50 rounded-md items-center justify-center mr-2 mt-0.5">
              <Home size={12} color="#EA580C" />
            </View>
            <View className="flex-1">
              <Text className="text-xs text-gray-500">Address</Text>
              <Text className="text-sm font-medium text-gray-900 leading-4" numberOfLines={2}>
                {address}
              </Text>
              {landmarks && (
                <View className="flex-row items-center mt-1">
                  <Location size={10} color="#F59E0B" />
                  <Text className="text-xs text-gray-500 ml-1" numberOfLines={1}>
                    {landmarks}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Parents Info - Compact */}
          <View className="bg-gray-50 rounded-lg p-2 mt-1">
            <View className="flex-row items-center mb-1">
              <UserRound size={12} color="#6B7280" />
              <Text className="text-xs font-medium text-gray-700 ml-1">Parents</Text>
            </View>

            <View className="space-y-1">
              {/* Mother */}
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-xs font-medium text-gray-800" numberOfLines={1}>
                    M: {motherName}
                  </Text>
                  {motherOccupation && <Text className="text-xs text-gray-500">{motherOccupation}</Text>}
                </View>
                {/* {motherAge && <Text className="text-xs text-gray-500 ml-2">{motherAge}</Text>} */}
              </View>

              {/* Father */}
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-xs font-medium text-gray-800" numberOfLines={1}>
                    F: {fatherName}
                  </Text>
                  {fatherOccupation && <Text className="text-xs text-gray-500">{fatherOccupation}</Text>}
                </View>
                {/* {fatherAge && <Text className="text-xs text-gray-500 ml-2">{fatherAge}</Text>} */}
              </View>
            </View>
          </View>

          {/* Medical Details - Compact */}
          {hasMedicalDetails && (
            <View className="bg-green-50 rounded-lg p-2 mt-1">
              <View className="flex-row items-center mb-1">
                <HeartPulse size={12} color="#059669" />
                <Text className="text-xs font-medium text-green-700 ml-1">Medical Info</Text>
              </View>

              <View className="space-y-0.5">
                {deliveryType && (
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-600">Delivery:</Text>
                    <Text className="text-xs font-medium text-gray-800">{deliveryType}</Text>
                  </View>
                )}
                {birthLocation && (
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-600">Birth Location:</Text>
                    <Text className="text-xs font-medium text-gray-800" numberOfLines={1}>
                      {birthLocation}
                    </Text>
                  </View>
                )}
                {ttStatus && (
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-gray-600">TT Status:</Text>
                    <Text className="text-xs font-medium text-gray-800">{ttStatus}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

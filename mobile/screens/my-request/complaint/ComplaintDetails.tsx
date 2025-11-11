import type React from "react"
import { useState } from "react"
import { TouchableOpacity, View, Text, ScrollView } from "react-native"
import { FileText, User,} from "lucide-react-native"
import type { ComplaintData, PersonType, ComplaintFile } from "./types"

interface ComplaintDetailsProps {
  data: ComplaintData
}

interface TabButtonProps {
  title: string
  isActive: boolean
  onPress: () => void
  count?: number
}

interface FileCardProps {
  file: ComplaintFile
  index: number
}

type ComplaintStatus = "pending" | "raised" | "accepted" |"cancelled" | "resolved" | "rejected"

const ComplaintDetails: React.FC<ComplaintDetailsProps> = ({ data }) => {
  const [activeComplainantTab, setActiveComplainantTab] = useState<number>(0)
  const [activeAccusedTab, setActiveAccusedTab] = useState<number>(0)
  const [isSummonRequested, setIsSummonRequested] = useState<boolean>(false)

  const canRequestSummon = (status?: string) => status?.toLowerCase() === "accepted"

  const handleRequestSummon = () => {
    if (!data?.comp_id || isSummonRequested) return
  }

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return "Not specified"
    try {
      const date = new Date(dateString)
      return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
    } catch {
      return dateString
    }
  }

  const getStatusColor = (status?: string): string => {
    if (!status) return "text-slate-600 bg-slate-50 border-slate-200"
    switch (status.toLowerCase() as ComplaintStatus) {
      case "pending":
        return "text-amber-600 bg-amber-50 border-amber-200"
      case "raised":
        return "text-blue-500 bg-blue-50 border-blue-200"
      case "accepted":
        return "text-teal-600 bg-teal-50 border-teal-200"
      case "cancelled":
        return "text-rose-600 bg-rose-50 border-rose-200"
      case "resolved":
        return "text-emerald-600 bg-emerald-50 border-emerald-200"
      case "rejected":
        return "text-slate-600 bg-slate-50 border-slate-200"
      default:
        return "text-slate-600 bg-slate-50 border-slate-200"
    }
  }

  const TabButton: React.FC<TabButtonProps> = ({ title, isActive, onPress, count = 0 }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2.5 rounded-lg mr-2 ${
        isActive ? "bg-blue-500" : "bg-slate-100 border border-slate-200"
      }`}
    >
      <Text className={`font-semibold text-sm ${isActive ? "text-white" : "text-slate-700"}`}>
        {title} {count > 0 && `(${count})`}
      </Text>
    </TouchableOpacity>
  )

  const FileCard: React.FC<FileCardProps> = ({ file, index }) => (
    <View className="bg-slate-50 rounded-xl p-4 mb-3 border border-slate-200">
      <Text className="font-bold mb-2">File {index + 1}</Text>
      {file.file_name && <Text>Name: {file.file_name}</Text>}
      {file.file_type && <Text>Type: {file.file_type}</Text>}
      {file.file_url && <Text className="text-teal-600 font-semibold">URL: {file.file_url}</Text>}
      {file.uploaded_at && <Text>Uploaded: {formatDateTime(file.uploaded_at)}</Text>}
    </View>
  )

const renderPerson = (person: PersonType) => {
  const name = person.res_profile?.full_name || person.cpnt_name || person.acsd_name || "Unknown"
  const address = person.res_profile?.address || person.cpnt_address || person.acsd_address
  const contact = person.res_profile?.contact_number || person.cpnt_contact || person.acsd_contact
  
  return (
    <View className="mb-4 bg-white p-1 rounded-lg border border-gray-200">
      <View className="flex-row items-start bg-blue-500 rounded-lg p-2 mb-3">
        <View className="bg-white rounded-full p-3">
          <User size={24} color="#3b82f6" />
        </View>
        <View className="flex-1 pl-4">
          <Text className="font-semibold text-white text-base">{name}</Text>
          {data.rp_id ? (
            <View className="bg-green-100 px-2 py-1 rounded mt-1 self-start">
              <Text className="text-xs text-green-700 font-medium">Resident</Text>
            </View>
          ) : (
            <View className="bg-purple-100 px-2 py-1 rounded mt-1 self-start">
              <Text className="text-xs text-green-700 font-medium">Resident</Text>
            </View>
          )}
        </View>
      </View>
      
      <View className="px-4">
        {(person.acsd_age || person.cpnt_gender || person.acsd_gender) && (
          <View className="flex-row mb-2">
            {person.acsd_age && (
              <Text className="text-sm text-gray-600 pr-8">
                <Text className="font-medium">Age:</Text> {person.acsd_age}
              </Text>
            )}
            {(person.cpnt_gender || person.acsd_gender) && (
              <Text className="text-sm text-gray-600">
                <Text className="font-medium">Gender:</Text> {person.cpnt_gender || person.acsd_gender}
              </Text>
            )}
          </View>
        )}
        {contact && (
          <Text className="text-sm text-gray-600 mb-2">
            <Text className="font-medium">Contact:</Text> {contact}
          </Text>
        )}
        
        {person.cpnt_number && (
          <Text className="text-sm text-gray-600 mb-2">
            <Text className="font-medium">Contact Number:</Text> {person.cpnt_number}
          </Text>
        )}
        
        {address && (
          <Text className="text-sm text-gray-600 mb-2">
            <Text className="font-medium">Address:</Text> {address}
          </Text>
        )}
        
        {person.cpnt_relation_to_respondent && (
          <Text className="text-sm text-gray-600 mb-2">
            <Text className="font-medium">Relationship:</Text> {person.cpnt_relation_to_respondent}
          </Text>
        )}
        
        {person.acsd_description && (
          <Text className="text-sm text-gray-600 mb-2">
            <Text className="font-medium">Description:</Text> {person.acsd_description}
          </Text>
        )}
      </View>
    </View>
  )
}

  return (
    <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
      <View className="p-4">
        {/* Header */}
        <View className="bg-blue-500 rounded-xl p-2 mb-5">
          <View className="flex-col items-start">
            <View className={`px-4 py-2 rounded-lg border w-full items-center ${getStatusColor(data.comp_status)} mb-2`}>
              <Text className={`text-lg font-bold ${getStatusColor(data.comp_status).split(" ")[0]}`}>
                {data.comp_status?.toUpperCase() || "UNKNOWN"}
              </Text>
            </View>
            <View>
              <Text className="text-white text-sm">Date Filed: {formatDateTime(data.comp_created_at)}</Text>
              <Text className="text-white text-sm">Confirmed by: {data.staff}</Text>
            </View>
          </View>

          {canRequestSummon(data.comp_status) && (
            <TouchableOpacity
              onPress={handleRequestSummon}
              activeOpacity={0.7}
              className="bg-teal-600 rounded-lg p-4 flex-row items-center justify-center mt-4"
            >
              <FileText size={20} color="#ffffff" />
              <Text className="text-white font-bold pl-2">
                {isSummonRequested ? "Summon Requested" : "Request Summon"}
              </Text>
            </TouchableOpacity>
          )}

          {data.comp_status?.toLowerCase() === "pending" && (
            <View className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <Text className="text-amber-700 text-sm font-medium text-center">
                Complaint is still pending for review. Summon request will be available once confirmed.
              </Text>
            </View>
          )}

          {(data.comp_status?.toLowerCase() === "resolved" || data.comp_status?.toLowerCase() === "closed") && (
            <View className="bg-slate-100 border border-slate-200 rounded-lg p-3 mt-4">
              <Text className="text-slate-600 text-sm font-medium text-center">
                Summon request unavailable for {data.comp_status?.toLowerCase()} complaints
              </Text>
            </View>
          )}
        </View>

        <View className="bg-white">
          {/* Complaint Details */}
          <View className="bg-white rounded-xl p-4 w-full my-4">
            <Text className="text-base font-semibold text-slate-900">Allegation</Text>
            <Text className="text-sm font-normal text-slate-900 mb-5">Details about the incident or wrongdoing being reported</Text>

            <View className="w-full bg-blue-500 rounded-md py-2 mb-2 px-2">
              <Text className="text-white text-sm">Type of Incident</Text>
              <Text className="text-center font-semibold text-white">{data.comp_incident_type}</Text>
            </View>
            <View className="w-full bg-gray-100 rounded-md py-2 mb-2 px-2">
              <Text className="text-gray-600 text-sm mb-2">Location of Incident</Text>
              <Text className="text-center font-normal text-sm text-gray-500">{data.comp_location}</Text>
            </View>
            <View className="w-full bg-gray-100 rounded-md py-2 mb-2 px-2">
              <Text className="text-gray-600 text-sm mb-2">Date of Incident</Text>
              <Text className="text-center font-normal text-sm text-gray-500">{formatDateTime(data.comp_datetime)}</Text>
            </View>

            {data.comp_allegation && (
              <View className="w-full bg-gray-100 rounded-md py-2 mb-2 px-2">
                <Text className="text-gray-600 text-sm mb-2">Incident Details</Text>
                <Text className="text-center font-normal text-sm text-gray-500">{data.comp_allegation}</Text>
              </View>
            )}
          </View>

          {/* Complainants */}
          <View className="bg-white rounded-xl p-4 w-full my-4">
            <Text className="text-base font-semibold text-slate-900">Complainant</Text>
            <Text className="text-sm font-normal text-slate-900 mb-5">Person who lodged or initiated the complaint</Text>

            {data.complainant?.length ? (
              <>
                {data.complainant.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                    <View className="flex-row">
                      {data.complainant.map((_, index) => (
                        <TabButton
                          key={index}
                          title={`Person ${index + 1}`}
                          isActive={activeComplainantTab === index}
                          onPress={() => setActiveComplainantTab(index)}
                        />
                      ))}
                    </View>
                  </ScrollView>
                )}
                {renderPerson(data.complainant[activeComplainantTab])}
              </>
            ) : (
              <Text>No complainants listed</Text>
            )}
          </View>

          {/* Accused */}
          <View className="bg-white rounded-xl p-4 w-full my-4">
            <Text className="text-base font-semibold text-slate-900">Respondent</Text>
            <Text className="text-sm font-normal text-slate-900 mb-5">The person being reported or accused in the incident</Text>

            {data.accused?.length ? (
              <>
                {data.accused.length > 1 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                    <View className="flex-row">
                      {data.accused.map((_, index) => (
                        <TabButton
                          key={index}
                          title={`Person ${index + 1}`}
                          isActive={activeAccusedTab === index}
                          onPress={() => setActiveAccusedTab(index)}
                        />
                      ))}
                    </View>
                  </ScrollView>
                )}
                {renderPerson(data.accused[activeAccusedTab])}
              </>
            ) : (
              <Text>No accused persons listed</Text>
            )}
          </View>

          {/* Files */}
          <View className="bg-white rounded-xl p-4 w-full my-4">
            <Text className="text-base font-semibold text-slate-900">Attached Files</Text>
            <Text className="text-sm font-normal text-slate-900 mb-5">Uploaded photos, files, or proof related to the incident.</Text>

            {data.complaint_files?.length ? (
              data.complaint_files.map((file, index) => <FileCard key={index} file={file} index={index} />)
            ) : (
              <Text>No files attached</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default ComplaintDetails

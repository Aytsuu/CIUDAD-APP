import type React from "react"
import { useState } from "react"
import { TouchableOpacity, View, Text, ScrollView } from "react-native"
import {
  Calendar,
  MapPin,
  User,
  Users,
  FileText,
  Clock,
  Hash,
  Gavel,
  AlertCircle,
  Heart,
  Phone,
  Mail,
  Home,
} from "lucide-react-native"
import type { ComplaintData, PersonType, ComplaintFile } from "./types"

interface ComplaintDetailsProps {
  data: ComplaintData
}

interface InfoRowProps {
  icon: React.ComponentType<any>
  label: string
  value?: string | number
  valueClass?: string
}

interface PersonCardProps {
  person: PersonType
  type?: string
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

type ComplaintStatus = "pending" | "filed" | "cancelled" | "resolved" | "rejected"

const ComplaintDetails: React.FC<ComplaintDetailsProps> = ({ data }) => {
  const [activeComplainantTab, setActiveComplainantTab] = useState<number>(0)
  const [activeAccusedTab, setActiveAccusedTab] = useState<number>(0)
  const [isRequestingSummon, setIsRequestingSummon] = useState<boolean>(false)
  const [isSummonRequested, setIsSummonRequested] = useState<boolean>(false)

  console.log(JSON.stringify(data, null, 2))

  const canRequestSummon = (status?: string) => {
    return status?.toLowerCase() === "filed"
  }

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
      case "filed":
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

  const getStatusIcon = (status?: string): React.JSX.Element => {
    if (!status) return <FileText size={16} className="text-slate-600" />

    switch (status.toLowerCase() as ComplaintStatus) {
      case "pending":
        return <Clock size={16} className="text-amber-600" />
      case "filed":
        return <FileText size={16} className="text-teal-600" />
      case "cancelled":
        return <AlertCircle size={16} className="text-rose-600" />
      case "resolved":
        return <FileText size={16} className="text-emerald-600" />
      default:
        return <FileText size={16} className="text-slate-600" />
    }
  }

  const InfoRow: React.FC<InfoRowProps> = ({ icon: Icon, label, value, valueClass = "text-slate-900" }) => (
    <View className="mb-3">
      <View className="flex-row items-center mb-1.5">
        <Icon size={16} className="text-teal-600 mr-2" />
        <Text className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</Text>
      </View>
      <Text className={`text-sm ml-6 font-medium ${valueClass}`}>{value?.toString() || "Not specified"}</Text>
    </View>
  )

  const TabButton: React.FC<TabButtonProps> = ({ title, isActive, onPress, count = 0 }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2.5 rounded-lg mr-2 transition-all ${
        isActive ? "bg-teal-600 shadow-md" : "bg-slate-100 border border-slate-200"
      }`}
    >
      <Text className={`font-semibold text-sm ${isActive ? "text-white" : "text-slate-700"}`}>
        {title} {count > 0 && `(${count})`}
      </Text>
    </TouchableOpacity>
  )

  const PersonCard: React.FC<PersonCardProps> = ({ person, type = "person" }) => {
    const displayName = person.res_profile?.full_name || person.cpnt_name || person.acsd_name || "Unknown"

    const displayAddress = person.res_profile?.address || person.cpnt_address || person.acsd_address

    const displayContact = person.res_profile?.contact_number || person.cpnt_contact || person.acsd_contact

    return (
      <View className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        {/* Header */}
        <View className="flex-row items-center mb-5 pb-4 border-b border-slate-100">
          <View className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-100 to-teal-50 items-center justify-center mr-3">
            <User size={24} className="text-teal-600" />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-slate-900 text-base">{displayName}</Text>
            {person.res_profile && (
              <Text className="text-xs text-emerald-600 font-semibold mt-0.5">✓ Registered Resident</Text>
            )}
          </View>
        </View>

        {/* Details */}
        <View>
          {person.res_profile?.first_name && (
            <InfoRow icon={User} label="First Name" value={person.res_profile.first_name} />
          )}
          {person.res_profile?.middle_name && (
            <InfoRow icon={User} label="Middle Name" value={person.res_profile.middle_name} />
          )}
          {person.res_profile?.last_name && (
            <InfoRow icon={User} label="Last Name" value={person.res_profile.last_name} />
          )}

          {(person.cpnt_gender || person.acsd_gender) && (
            <InfoRow icon={User} label="Gender" value={person.cpnt_gender || person.acsd_gender} />
          )}

          {person.acsd_age && <InfoRow icon={User} label="Age" value={person.acsd_age} />}

          {displayAddress && <InfoRow icon={Home} label="Address" value={displayAddress} />}
          {displayContact && <InfoRow icon={Phone} label="Contact" value={displayContact} />}
          {person.res_profile?.email && <InfoRow icon={Mail} label="Email" value={person.res_profile.email} />}

          {person.acsd_description && (
            <InfoRow icon={FileText} label="Description" value={person.acsd_description} valueClass="text-slate-700" />
          )}

          {person.cpnt_relation_to_respondent && (
            <InfoRow
              icon={Heart}
              label="Relationship"
              value={person.cpnt_relation_to_respondent}
              valueClass="text-teal-600 font-semibold"
            />
          )}

          {person.cpnt_number && <InfoRow icon={Phone} label="Contact Number" value={person.cpnt_number} />}
        </View>
      </View>
    )
  }

  const FileCard: React.FC<FileCardProps> = ({ file, index }) => (
    <View className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 mb-3 border border-slate-200">
      <View className="flex-row items-center mb-4">
        <View className="w-10 h-10 rounded-lg bg-teal-100 items-center justify-center mr-3">
          <FileText size={20} className="text-teal-600" />
        </View>
        <Text className="font-bold text-slate-900">File {index + 1}</Text>
      </View>

      <View>
        {file.file_name && <InfoRow icon={FileText} label="Name" value={file.file_name} />}
        {file.file_type && <InfoRow icon={FileText} label="Type" value={file.file_type} />}
        {file.file_url && (
          <InfoRow icon={FileText} label="URL" value={file.file_url} valueClass="text-teal-600 font-semibold" />
        )}
        {file.uploaded_at && <InfoRow icon={Clock} label="Uploaded" value={formatDateTime(file.uploaded_at)} />}
      </View>
    </View>
  )

  // Main Render
  return (
    <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
      <View className="p-4 space-y-5">
        {/* Header Section */}
        <View className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <View className="mb-5">
            <Text className="text-2xl font-bold text-slate-900 mb-3">{data.comp_incident_type || "Incident"}</Text>

            <View className="flex-row items-center mb-4">
              {getStatusIcon(data.comp_status)}
              <View className={`ml-3 px-4 py-2 rounded-lg border ${getStatusColor(data.comp_status)}`}>
                <Text className={`text-xs font-bold ${getStatusColor(data.comp_status).split(" ")[0]}`}>
                  {data.comp_status?.toUpperCase() || "UNKNOWN"}
                </Text>
              </View>
            </View>

            {data.comp_id && (
              <Text className="text-sm text-slate-500 font-medium">
                Complaint ID: <Text className="text-slate-700 font-semibold">{data.comp_id}</Text>
              </Text>
            )}
          </View>

          {/* Summon Button */}
          {canRequestSummon(data.comp_status) && (
            <TouchableOpacity
              onPress={handleRequestSummon}
              className={`bg-teal-600 rounded-lg p-4 flex-row items-center justify-center mt-4 shadow-md ${isSummonRequested ? "opacity-60" : ""}`}
            >
              <Gavel size={20} className="text-white mr-2" />
              <Text className="text-white font-bold">{isSummonRequested ? "Summon Requested" : "Request Summon"}</Text>
            </TouchableOpacity>
          )}

          {/* Status Messages */}
          {data.comp_status?.toLowerCase() === "pending" && (
            <View className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <Text className="text-amber-700 text-sm font-medium text-center">
                Complaint is still pending review. Summon request will be available once filed.
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

        {/* Complaint Details */}
        <View className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <Text className="text-lg font-bold text-slate-900 mb-5">Details</Text>

          <View>
            <InfoRow icon={MapPin} label="Location" value={data.comp_location} />
            <InfoRow icon={Calendar} label="Incident Date" value={formatDateTime(data.comp_datetime)} />
            <InfoRow icon={Clock} label="Filed Date" value={formatDateTime(data.comp_created_at)} />
          </View>

          {data.comp_allegation && (
            <View className="mt-5 pt-5 border-t border-slate-100">
              <Text className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Allegation</Text>
              <Text className="text-sm text-slate-700 leading-relaxed font-medium">{data.comp_allegation}</Text>
            </View>
          )}
        </View>

        {/* Complainants Section */}
        <View className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <View className="flex-row items-center mb-5">
            <View className="w-10 h-10 rounded-lg bg-teal-100 items-center justify-center mr-3">
              <Users size={20} className="text-teal-600" />
            </View>
            <Text className="text-lg font-bold text-slate-900">Complainants ({data.complainant?.length || 0})</Text>
          </View>

          {data.complainant?.length ? (
            <>
              {data.complainant.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
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
              <PersonCard person={data.complainant[activeComplainantTab]} type="Complainant" />
            </>
          ) : (
            <View className="py-8 items-center">
              <Users size={32} className="text-slate-300 mb-2" />
              <Text className="text-slate-500 font-medium">No complainants listed</Text>
            </View>
          )}
        </View>

        {/* Accused Persons Section */}
        <View className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <View className="flex-row items-center mb-5">
            <View className="w-10 h-10 rounded-lg bg-rose-100 items-center justify-center mr-3">
              <Users size={20} className="text-rose-600" />
            </View>
            <Text className="text-lg font-bold text-slate-900">Accused Persons ({data.accused?.length || 0})</Text>
          </View>

          {data.accused?.length ? (
            <>
              {data.accused.length > 1 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
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
              <PersonCard person={data.accused[activeAccusedTab]} type="Accused" />
            </>
          ) : (
            <View className="py-8 items-center">
              <Users size={32} className="text-slate-300 mb-2" />
              <Text className="text-slate-500 font-medium">No accused persons listed</Text>
            </View>
          )}
        </View>

        {/* Files Section */}
        <View className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
          <View className="flex-row items-center mb-5">
            <View className="w-10 h-10 rounded-lg bg-teal-100 items-center justify-center mr-3">
              <FileText size={20} className="text-teal-600" />
            </View>
            <Text className="text-lg font-bold text-slate-900">Files ({data.complaint_files?.length || 0})</Text>
          </View>

          {data.complaint_files?.length ? (
            data.complaint_files.map((file, index) => <FileCard key={index} file={file} index={index} />)
          ) : (
            <View className="py-8 items-center">
              <FileText size={32} className="text-slate-300 mb-2" />
              <Text className="text-slate-500 font-medium">No files attached</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

export default ComplaintDetails

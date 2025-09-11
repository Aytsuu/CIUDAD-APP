import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import {
  ChevronLeft,
  Calendar,
  Clock,
  Mail,
  MessageSquare,
  Users,
  Info,
  FileText,
} from "lucide-react-native"
import { useGetAnnouncement, useGetAnnouncementRecipient } from "./queries"
import PageLayout from "@/screens/_PageLayout"

function formatDate(dateString?: string | null) {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleString()
}

export default function AnnouncementViewPage() {
  const router = useRouter()
  const { ann_id } = useLocalSearchParams()
  const annIdNum = Number(ann_id)

  // Fetch announcement list
  const { data: announcements = [] } = useGetAnnouncement()
  const announcement = announcements.find((a) => a.ann_id === annIdNum)

  // Fetch recipients separately
  const {
    data: recipients = [],
    isLoading: recipientsLoading,
    isError: recipientsError,
  } = useGetAnnouncementRecipient(annIdNum)

  if (!announcement) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <View className="bg-white rounded-2xl p-8 mx-6 shadow-lg">
          <Info size={48} className="text-gray-400 self-center mb-4" />
          <Text className="text-gray-600 text-lg text-center font-medium">Announcement not found</Text>
          <Text className="text-gray-400 text-sm text-center mt-2">
            The requested announcement could not be located.
          </Text>
        </View>
      </View>
    )
  }

  const getTypeBadgeStyle = (type: string) => {
    switch (type?.toLowerCase()) {
      case "event":
        return "bg-blue-100 text-blue-800"
      case "announcement":
        return "bg-green-100 text-green-800"
      case "alert":
        return "bg-red-100 text-red-800"
      case "news":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <PageLayout
      leftAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 rounded-xl bg-white items-center justify-center shadow-sm border border-gray-100"
        >
          <ChevronLeft size={22} className="text-gray-700" />
        </TouchableOpacity>
      }
      headerTitle={
        <View className="flex-1 items-center -ml-8">
          <Text className="text-gray-900 text-lg font-semibold">Announcement Details</Text>
        </View>
      }
    >
      <ScrollView
        className="flex-1 bg-gray-50"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* BASIC INFO */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-3">
              <Info size={20} className="text-blue-600" />
            </View>
            <Text className="text-xl font-bold text-gray-900">Basic Information</Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Title</Text>
            <Text className="text-lg font-semibold text-gray-900 leading-relaxed">{announcement.ann_title}</Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">Details</Text>
            <Text className="text-base text-gray-700 leading-relaxed">{announcement.ann_details}</Text>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Type</Text>
            <View className={`self-start px-4 py-2 rounded-full ${getTypeBadgeStyle(announcement.ann_type)}`}>
              <Text className="text-sm font-semibold capitalize">{announcement.ann_type}</Text>
            </View>
          </View>
        </View>

        {/* SCHEDULE */}
        {(announcement.ann_start_at ||
          announcement.ann_end_at ||
          announcement.ann_event_start ||
          announcement.ann_event_end) && (
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 bg-green-100 rounded-xl items-center justify-center mr-3">
                <Calendar size={20} className="text-green-600" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Schedule</Text>
            </View>

            <View className="space-y-5">
              {announcement.ann_start_at && (
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center mr-3">
                    <Clock size={16} className="text-blue-600" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-500">Start</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      {formatDate(announcement.ann_start_at)}
                    </Text>
                  </View>
                </View>
              )}

              {announcement.ann_end_at && (
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-red-50 rounded-lg items-center justify-center mr-3">
                    <Clock size={16} className="text-red-600" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-500">End</Text>
                    <Text className="text-base font-semibold text-gray-900">{formatDate(announcement.ann_end_at)}</Text>
                  </View>
                </View>
              )}

              {announcement.ann_event_start && (
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-purple-50 rounded-lg items-center justify-center mr-3">
                    <Calendar size={16} className="text-purple-600" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-500">Event Start</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      {formatDate(announcement.ann_event_start)}
                    </Text>
                  </View>
                </View>
              )}

              {announcement.ann_event_end && (
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-orange-50 rounded-lg items-center justify-center mr-3">
                    <Calendar size={16} className="text-orange-600" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-500">Event End</Text>
                    <Text className="text-base font-semibold text-gray-900">
                      {formatDate(announcement.ann_event_end)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* DELIVERY OPTIONS */}
        {(announcement.ann_to_sms || announcement.ann_to_email) && (
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mr-3">
                <Mail size={20} className="text-purple-600" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Delivery Options</Text>
            </View>

            <View className="space-y-4">
              {announcement.ann_to_sms && (
                <View className="flex-row items-center p-4 bg-gray-50 rounded-xl">
                  <MessageSquare size={20} className="text-gray-600 mr-3" />
                  <Text className="text-base font-medium text-gray-900">SMS Delivery</Text>
                </View>
              )}

              {announcement.ann_to_email && (
                <View className="flex-row items-center p-4 bg-gray-50 rounded-xl">
                  <Mail size={20} className="text-gray-600 mr-3" />
                  <Text className="text-base font-medium text-gray-900">Email Delivery</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* RECIPIENT */}
        {/* <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 bg-orange-100 rounded-xl items-center justify-center mr-3">
              <Users size={20} className="text-orange-600" />
            </View>
            <Text className="text-xl font-bold text-gray-900">Recipients</Text>
          </View>

          {recipientsLoading ? (
            <ActivityIndicator size="small" color="#666" />
          ) : recipientsError ? (
            <Text className="text-red-500">Failed to load recipients</Text>
          ) : recipients.length === 0 ? (
            <Text className="text-gray-500">No recipients assigned</Text>
          ) : (
            <View className="space-y-3">
              {recipients.map((recipient: any, index: number) => (
                <View key={recipient.ar_id || index} className="flex-row items-center p-3 bg-gray-50 rounded-xl">
                  <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-3">
                    <Text className="text-xs font-bold text-blue-600">{index + 1}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">{recipient.ar_category}</Text>
                    {recipient.ar_type && <Text className="text-sm text-gray-600 mt-1">{recipient.ar_type}</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View> */}

        {/* FILES */}
        {announcement.files?.length > 0 && (
          <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 bg-indigo-100 rounded-xl items-center justify-center mr-3">
                <FileText size={20} className="text-indigo-600" />
              </View>
              <Text className="text-xl font-bold text-gray-900">Files</Text>
            </View>

            <View className="space-y-3">
              {announcement.files.map((file: any, index: number) => (
                <View key={file.id || index} className="flex-row items-center p-3 bg-gray-50 rounded-xl">
                  <FileText size={18} className="text-gray-600 mr-3" />
                  <Text className="text-base text-gray-900">{file.file_name || `File ${index + 1}`}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </PageLayout>
  )
}
